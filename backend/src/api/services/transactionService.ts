import { wsManager } from '@app/handlers/internal/websocket/server';
import { TransactionRepository } from '@db/repositories/transactionRepository';

export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async deposit(accountId: string, amount: string) {
    const action = 'credit';
    const result = await this.transactionRepository.createTransaction(
      accountId,
      action,
      amount
    );

    if (result.account) {
      await wsManager?.sendAccountUpdate(result.account.toJSON(), action);
    }

    return result;
  }

  async withdraw(accountId: string, amount: string) {
    const action = 'debit';
    const result = await this.transactionRepository.createTransaction(
      accountId,
      action,
      amount
    );

    if (result.account) {
      await wsManager?.sendAccountUpdate(result.account.toJSON(), action);
    }

    return result;
  }
}
