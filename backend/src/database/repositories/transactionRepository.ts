import { logger } from '@app/utils/logger';
import Transaction from '@db/models/transaction';
import Account from '@db/models/account';
import { BadRequestError, RecordNotFoundError } from '@app/utils/errors';

export class TransactionRepository {
  async createTransaction(
    accountId: string,
    type: 'credit' | 'debit',
    amount: string
  ) {
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      const transaction = new Transaction({ accountId, type, amount });
      await transaction.save({ session });

      const account = await Account.findOne({ accountId }).session(session);
      if (!account) {
        throw new RecordNotFoundError('Account not found');
      }

      const amountDecimal = parseFloat(amount);
      if (type === 'credit') {
        if (BigInt(account.balance) < BigInt(0)) {
          throw new BadRequestError('Insufficient balance');
        }
        account.balance = (BigInt(account.balance) + BigInt(amount)).toString();
      } else {
        if (BigInt(account.balance) < BigInt(amount)) {
          throw new BadRequestError('Insufficient balance');
        }
        account.balance = (
          parseFloat(account.balance) - amountDecimal
        ).toString();
      }

      await account.save({ session });
      await session.commitTransaction();
      session.endSession();

      return { transaction, account };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(error, 'Error creating transaction:');
      throw new BadRequestError('Error creating transaction');
    }
  }

  async getTransactionsByAccountId(accountId: string) {
    return Transaction.find({ accountId }).sort({ createdAt: -1 });
  }
}
