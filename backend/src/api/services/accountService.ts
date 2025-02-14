import { AccountRepository } from '../../database/repositories/accountRepository';
import { generateId } from '../../utils/generateId';

export class AccountService {
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository = new AccountRepository()) {
    this.accountRepository = accountRepository;
  }

  async registerAccount() {
    const accountId = generateId();
    return this.accountRepository.createAccount(accountId);
  }

  async getAccount(accountId: string) {
    return this.accountRepository.findAccountById(accountId);
  }
}

export const accountService = new AccountService();
