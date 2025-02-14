import { Request, Response, NextFunction } from 'express';
import { accountRepository } from '@db/repositories/accountRepository';
import { logger } from '@app/utils/logger';

export const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountId = req.body.accountId || req.params.accountId;

    if (!accountId) {
      logger.warn('No accountId provided in request body');
      return res.status(400).json({ error: 'No accountId provided' });
    }

    const account = await accountRepository.findAccountById(accountId);
    if (!account) {
      logger.warn(`No user found for accountId ${accountId}`);
      return res.status(404).json({ error: 'Account not found' });
    }

    req.account = {
      accountId: account.accountId,
      balance: account.balance,
    };

    next();
  } catch (error) {
    logger.error(error, 'Error fetching account:');
    return res.status(500).json({ error: 'Internal server error' });
  }
};
