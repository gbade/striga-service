import mongoose from 'mongoose';
import Account from '@db/models/account';
import Transaction from '@db/models/transaction';
import { generateId } from '@app/utils/generateId';

export const accountIdOne = generateId();
export const accountIdTwo = generateId();
export const accountIdThree = generateId();
export const accountIdFour = generateId();
export const accountIdFive = generateId();

const accountOne = new Account({
  accountId: accountIdOne,
  balance: '1000',
});

const accountTwo = new Account({
  accountId: accountIdTwo,
  balance: '500',
});

const accountThree = new Account({
  accountId: accountIdThree,
  balance: '10000000000000000000000',
});

const accountFour = new Account({
  accountId: accountIdFour,
  balance: '1',
});

const accountFive = new Account({
  accountId: accountIdFive,
  balance: '10000000000000000000000',
});

export const mockData = {
  accounts: {
    accountOne,
    accountTwo,
    accountThree,
    accountFour,
    accountFive,
  },
  accountIds: {
    accountIdOne,
    accountIdTwo,
    accountIdThree,
    accountIdFour,
    accountIdFive,
  },
};

export const seedDatabase = async () => {
  try {
    await Account.deleteMany({});
    await Transaction.deleteMany({});

    await Account.insertMany([
      accountOne,
      accountTwo,
      accountThree,
      accountFour,
      accountFive,
    ]);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    await Account.deleteMany({});
    await Transaction.deleteMany({});
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};
