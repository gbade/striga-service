import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '@api/app';
import { config } from '@app/config';
import { wsManager } from '@app/handlers/internal/websocket/server';
import { clearDatabase, mockData, seedDatabase } from '@tests/fixtures/data';
import { resourceLimits } from 'worker_threads';

jest.mock('@app/handlers/internal/websocket/server', () => ({
  wsManager: {
    sendAccountUpdate: jest.fn(),
  },
}));

beforeAll(async () => {
  await mongoose.connect(config.db.url);
  await seedDatabase();
});

afterAll(async () => {
  await clearDatabase();
  // await mongoose.disconnect();
});

describe('Transaction API', () => {
  it('should deposit to an account', async () => {
    const amount = '100';
    const res = await request(app).post('/transactions/deposit').send({
      accountId: mockData.accountIds.accountIdOne,
      amount,
    });

    expect(res.status).toBe(201);
    expect(res.body.transaction.id).toBeDefined();
    expect(res.body.account.accountId).toEqual(
      mockData.accountIds.accountIdOne
    );
    res.body.account.createdAt = new Date(res.body.account.createdAt);
    expect(wsManager.sendAccountUpdate).toHaveBeenCalledWith(
      res.body.account,
      'credit'
    );
    expect(res.body.account.balance).toBe(
      (BigInt(mockData.accounts.accountOne.balance) + BigInt(amount)).toString()
    );
  });

  it('should not deposit with invalid amount', async () => {
    const res = await request(app).post('/transactions/deposit').send({
      accountId: 'someAccountId',
      amount: '-100',
    });
    expect(res.status).toBe(400);
  });

  it('should withdraw from an account', async () => {
    const amount = '50';
    const res = await request(app).post('/transactions/withdraw').send({
      accountId: mockData.accountIds.accountIdTwo,
      amount,
    });

    res.body.account.createdAt = new Date(res.body.account.createdAt);
    expect(res.status).toBe(201);
    expect(res.body.transaction.id).toBeDefined();
    expect(wsManager.sendAccountUpdate).toHaveBeenCalledWith(
      res.body.account,
      'debit'
    );
    expect(res.body.account.balance).toBe(
      (BigInt(mockData.accounts.accountTwo.balance) - BigInt(amount)).toString()
    );
  });

  it('should not withdraw with invalid amount', async () => {
    const res = await request(app).post('/transactions/withdraw').send({
      accountId: 'someAccountId',
      amount: '-50',
    });
    expect(res.status).toBe(400);
  });

  it('should not withdraw more than the balance', async () => {
    const res = await request(app).post('/transactions/withdraw').send({
      accountId: mockData.accountIds.accountIdFour,
      amount: '1000',
    });
    expect(res.status).toBe(400);
  });

  describe('Big Numbers', () => {
    const amount = '10000000000000000000000';
    it('should handle big numbers deposit', async () => {
      const res = await request(app).post('/transactions/deposit').send({
        accountId: mockData.accountIds.accountIdFive,
        amount,
      });
      res.body.account.createdAt = new Date(res.body.account.createdAt);
      expect(res.status).toBe(201);
      expect(res.body.transaction.id).toBeDefined();
      expect(wsManager.sendAccountUpdate).toHaveBeenCalledWith(
        res.body.account,
        'credit'
      );
      expect(res.body.account.balance).toBe(
        (
          BigInt(mockData.accounts.accountFive.balance) + BigInt(amount)
        ).toString()
      );
    });

    it('should handle big numbers withdraw', async () => {
      const res = await request(app).post('/transactions/withdraw').send({
        accountId: mockData.accountIds.accountIdThree,
        amount,
      });
      res.body.account.createdAt = new Date(res.body.account.createdAt);
      expect(res.status).toBe(201);
      expect(res.body.transaction.id).toBeDefined();
      expect(wsManager.sendAccountUpdate).toHaveBeenCalledWith(
        res.body.account,
        'debit'
      );
      expect(res.body.account.balance).toBe(
        (
          BigInt(mockData.accounts.accountThree.balance) - BigInt(amount)
        ).toString()
      );
    });

    it('should not withdraw more than the balance', async () => {
      const res = await request(app).post('/transactions/withdraw').send({
        accountId: mockData.accountIds.accountIdFour,
        amount: '10000000000000000000000',
      });
      expect(res.status).toBe(400);
    });
  });
});
