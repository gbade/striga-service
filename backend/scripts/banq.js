
const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

const registerAccount = async () => {
  const response = await axios.post(`${BASE_URL}/accounts/register`);
  return response.data;
};

const sendDeposit = async (accountId, amount) => {
  await axios.post(`${BASE_URL}/transactions/deposit`, { accountId, amount });
};

const sendWithdraw = async (accountId, amount) => {
  await axios.post(`${BASE_URL}/transactions/withdraw`, { accountId, amount });
};

const listenForUpdates = (accountId) => {
  const ws = new WebSocket(`${WS_URL}?accountId=${accountId}`, ['striga-ws-protocol']);

  ws.on('open', () => {
    console.log('WebSocket connection opened');
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    if (message.type === 'ACCOUNT_UPDATE') {
      console.log('Account update:', message.data.wallet);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

const main = async () => {
  try {
    const account = await registerAccount();
    const accountId = account.accountId;

    console.log('Registered account:', accountId);

    listenForUpdates(accountId);

    const requests = [];
    for (let i = 0; i < 13; i++) {
      // requests.push(sendDeposit(accountId, '100'));
      // requests.push(sendWithdraw(accountId, '50'));
      await sendDeposit(accountId, '100');
      await sendWithdraw(accountId, '50');
    }

    // await Promise.all(requests);

    console.log('Concurrent requests sent');
  } catch (error) {
    console.error('Error:', error);
  }
};

main();