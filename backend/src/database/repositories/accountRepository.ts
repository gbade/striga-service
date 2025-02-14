import Account from '@db/models/account';

export class AccountRepository {
  async createAccount(accountId: string) {
    const account = new Account({ accountId });
    return account.save();
  }

  async findAccountById(accountId: string) {
    return Account.findOne({ accountId });
  }
}

export const accountRepository = new AccountRepository();
