export declare global {
  type RequestAccount = {
    accountId: string;
    balance: string;
  };

  namespace Express {
    interface Request {
      account?: RequestAccount;
    }
  }
}
