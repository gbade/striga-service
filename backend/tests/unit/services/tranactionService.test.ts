import { TransactionRepository } from '@db/repositories/transactionRepository';
import { wsManager } from '@app/handlers/internal/websocket/server';
import { TransactionService } from '@api/services/transactionService';

jest.mock('@db/repositories/transactionRepository');
jest.mock('@app/handlers/internal/websocket/server', () => ({
  wsManager: {
    sendAccountUpdate: jest.fn(),
  },
}));

describe('TransactionService', () => {
  let service: TransactionService;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionRepository = {
      createTransaction: jest.fn(),
    } as any;

    (TransactionRepository as jest.Mock).mockImplementation(
      () => mockTransactionRepository
    );

    service = new TransactionService();
  });

  describe('deposit', () => {
    it('should successfully process a deposit and send websocket update', async () => {
      const accountId = 'acc123';
      const amount = '500';
      const mockAccount = { id: accountId, balance: '1500', toJSON: jest.fn() };
      const mockResult = {
        transaction: { id: 'tx123', amount },
        account: mockAccount,
      };

      //   @ts-ignore
      mockTransactionRepository.createTransaction.mockResolvedValue(mockResult);

      const result = await service.deposit(accountId, amount);

      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        accountId,
        'credit',
        amount
      );
      expect(wsManager.sendAccountUpdate).toHaveBeenCalledWith(
        mockAccount.toJSON(),
        'credit'
      );
      expect(result).toBe(mockResult);
    });

    it('should handle deposit without account update', async () => {
      const accountId = 'acc123';
      const amount = '500';
      const mockResult = {
        transaction: { id: 'tx123', amount },
        account: null,
      };

      //   @ts-ignore
      mockTransactionRepository.createTransaction.mockResolvedValue(mockResult);

      const result = await service.deposit(accountId, amount);

      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        accountId,
        'credit',
        amount
      );
      expect(wsManager.sendAccountUpdate).not.toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should propagate repository errors during deposit', async () => {
      const accountId = 'acc123';
      const amount = '500';
      const error = new Error('Repository error');

      mockTransactionRepository.createTransaction.mockRejectedValue(error);

      await expect(service.deposit(accountId, amount)).rejects.toThrow(error);
      expect(wsManager.sendAccountUpdate).not.toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should successfully process a withdrawal and send websocket update', async () => {
      const accountId = 'acc123';
      const amount = '500';
      const mockAccount = { id: accountId, balance: '500', toJSON: jest.fn() };
      const mockResult = {
        transaction: { id: 'tx123', amount },
        account: mockAccount,
      };

      //   @ts-ignore
      mockTransactionRepository.createTransaction.mockResolvedValue(mockResult);

      const result = await service.withdraw(accountId, amount);

      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        accountId,
        'debit',
        amount
      );
      expect(wsManager.sendAccountUpdate).toHaveBeenCalledWith(
        mockAccount.toJSON(),
        'debit'
      );
      expect(result).toBe(mockResult);
    });

    it('should handle withdrawal without account update', async () => {
      const accountId = 'acc123';
      const amount = '500';
      const mockResult = {
        transaction: { id: 'tx123', amount },
        account: null,
      };

      //   @ts-ignore
      mockTransactionRepository.createTransaction.mockResolvedValue(mockResult);

      const result = await service.withdraw(accountId, amount);

      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        accountId,
        'debit',
        amount
      );
      expect(wsManager.sendAccountUpdate).not.toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should propagate repository errors during withdrawal', async () => {
      const accountId = 'acc123';
      const amount = '500';
      const error = new Error('Repository error');

      mockTransactionRepository.createTransaction.mockRejectedValue(error);

      await expect(service.withdraw(accountId, amount)).rejects.toThrow(error);
      expect(wsManager.sendAccountUpdate).not.toHaveBeenCalled();
    });
  });
});
