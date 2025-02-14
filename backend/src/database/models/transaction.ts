import mongoose, { Schema, Document } from 'mongoose';

interface ITransaction extends Document {
  accountId: string;
  type: 'credit' | 'debit';
  amount: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  accountId: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

TransactionSchema.methods.toJSON = function () {
  const transaction = this.toObject();
  transaction.id = transaction._id.toString();
  delete transaction._id;
  delete transaction.__v;
  return transaction;
};

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
