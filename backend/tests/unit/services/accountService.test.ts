import { AccountRepository } from '@db/repositories/accountRepository';
import { AccountService } from '@api/services/accountService';

jest.mock('@db/repositories/accountRepository');

describe('AccountService', () => {
  const mockRepository = new AccountRepository();
  const accountService = new AccountService(mockRepository);

  it('should register a new account', async () => {
    mockRepository.createAccount = jest
      .fn()
      .mockResolvedValue({ accountId: 'test-id' });

    const account = await accountService.registerAccount();
    expect(account.accountId).toBeDefined();
  });
});
