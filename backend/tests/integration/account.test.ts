import request from 'supertest';
import mongoose from 'mongoose';
import { config } from '@app/config';
import { app } from '@api/app';

beforeAll(async () => {
  await mongoose.connect(config.db.url);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Account API', () => {
  it('should register an account', async () => {
    const res = await request(app).post('/accounts/register');
    expect(res.status).toBe(201);
    expect(res.body.accountId).toBeDefined();
  });
  it('should get account balance', async () => {
    const accountId = 'someAccountId';
    const res = await request(app).get(`/accounts/${accountId}`);
    expect(res.status).toBe(200);
    expect(res.body.account).toBeDefined();
  });
});
