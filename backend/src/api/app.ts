import express from 'express';
import accountRoutes from '@api/routes/accountRoutes';
import transactionRoutes from '@api/routes/transactionRoutes';
import { errorHandler } from '@api/middleware/errorHandler';
import { RecordNotFoundError } from '@app/utils/errors';

const app = express();

app.use(express.json());
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);

app.use('*', (req, res) => {
  throw new RecordNotFoundError('Route not found');
});

app.use(errorHandler);

export { app };
