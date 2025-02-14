import express from 'express';
import { accountService } from '../services/accountService';
import { errorHandler } from '../middleware/errorHandler';
import catchAsync from '@app/utils/catchAsync';

const router = express.Router();

router.post(
  '/register',
  catchAsync(async (req, res) => {
    const account = await accountService.registerAccount();
    res.status(201).json(account);
  })
);

router.get(
  '/:accountId',
  catchAsync(async (req, res) => {
    const { accountId } = req.params;
    const account = await accountService.getAccount(accountId);
    res.status(200).json({ account });
  })
);

export default router;
