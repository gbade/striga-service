import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  accountId: string;
  createdAt: Date;
  balance: string;
}

const AccountSchema = new Schema<IAccount>({
  accountId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  balance: { type: String, default: '0' },
});

AccountSchema.methods.toJSON = function () {
  const account = this.toObject();
  account.id = account._id.toString();
  delete account._id;
  delete account.__v;
  return account;
};

export default mongoose.model<IAccount>('Account', AccountSchema);
