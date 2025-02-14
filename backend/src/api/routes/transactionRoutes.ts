import express from 'express';
import { TransactionService } from '../services/transactionService';
import { errorHandler } from '../middleware/errorHandler';
import catchAsync from '@app/utils/catchAsync';

const router = express.Router();
const transactionService = new TransactionService();

router.post(
  '/deposit',
  catchAsync(async (req, res) => {
    const { accountId, amount } = req.body;
    const transaction = await transactionService.deposit(accountId, amount);
    res.status(201).json(transaction);
  })
);

router.post(
  '/withdraw',
  catchAsync(async (req, res) => {
    const { accountId, amount } = req.body;
    const transaction = await transactionService.withdraw(accountId, amount);
    res.status(201).json(transaction);
  })
);

export default router;
