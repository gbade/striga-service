import Transaction from '@db/models/transaction';
import Account from '@db/models/account';
import { BadRequestError } from '@app/utils/errors';
import { logger } from '@app/utils/logger';
import { TransactionRepository } from '@app/database/repositories/transactionRepository';

jest.mock('@db/models/transaction');
jest.mock('@db/models/account');
jest.mock('@app/utils/logger');

describe('TransactionRepository', () => {
  let repository: TransactionRepository;
  let mockSession: any;

  beforeEach(() => {
    repository = new TransactionRepository();

    jest.clearAllMocks();

    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    (Transaction.startSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('createTransaction', () => {
    it('should successfully create a credit transaction', async () => {
      const accountId = 'acc123';
      const mockAccount = {
        accountId,
        balance: '1000',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTransaction = {
        save: jest.fn().mockResolvedValue(true),
      };

      (Transaction as any).mockImplementation(() => mockTransaction);
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.createTransaction(
        accountId,
        'credit',
        '500'
      );

      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(Transaction).toHaveBeenCalledWith({
        accountId,
        type: 'credit',
        amount: '500',
      });
      expect(mockTransaction.save).toHaveBeenCalledWith({
        session: mockSession,
      });
      expect(mockAccount.save).toHaveBeenCalledWith({ session: mockSession });
      expect(mockAccount.balance).toBe('1500');
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual({
        transaction: mockTransaction,
        account: mockAccount,
      });
    });

    it('should successfully create a debit transaction', async () => {
      const accountId = 'acc123';
      const mockAccount = {
        accountId,
        balance: '1000',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTransaction = {
        save: jest.fn().mockResolvedValue(true),
      };

      (Transaction as any).mockImplementation(() => mockTransaction);
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.createTransaction(
        accountId,
        'debit',
        '500'
      );

      expect(mockAccount.balance).toBe('500');
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual({
        transaction: mockTransaction,
        account: mockAccount,
      });
    });

    it('should throw BadRequestError for insufficient balance', async () => {
      const accountId = 'acc123';
      const mockAccount = {
        accountId,
        balance: '100',
        save: jest.fn(),
      };

      const mockTransaction = {
        save: jest.fn().mockResolvedValue(true),
      };

      (Transaction as any).mockImplementation(() => mockTransaction);
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAccount),
      });

      await expect(
        repository.createTransaction(accountId, 'debit', '500')
      ).rejects.toThrow(BadRequestError);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw error when account not found', async () => {
      const accountId = 'acc123';
      const mockTransaction = {
        save: jest.fn().mockResolvedValue(true),
      };

      (Transaction as any).mockImplementation(() => mockTransaction);
      (Account.findOne as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });

      await expect(
        repository.createTransaction(accountId, 'credit', '500')
      ).rejects.toThrow(BadRequestError);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle transaction save error', async () => {
      const accountId = 'acc123';
      const mockTransaction = {
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      (Transaction as any).mockImplementation(() => mockTransaction);

      await expect(
        repository.createTransaction(accountId, 'credit', '500')
      ).rejects.toThrow(BadRequestError);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getTransactionsByAccountId', () => {
    it('should return transactions sorted by createdAt', async () => {
      const accountId = 'acc123';
      const mockTransactions = [
        { id: 1, amount: '100' },
        { id: 2, amount: '200' },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockTransactions);
      (Transaction.find as jest.Mock).mockReturnValue({
        sort: mockSort,
      });

      const result = await repository.getTransactionsByAccountId(accountId);

      expect(Transaction.find).toHaveBeenCalledWith({ accountId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockTransactions);
    });
  });
});
