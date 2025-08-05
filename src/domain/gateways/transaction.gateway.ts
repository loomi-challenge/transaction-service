import { Transaction } from "../entities/Transaction";

export interface TransactionGateway {
  createTransaction(transaction: Transaction): Promise<void>;
  findTransactionById(id: string): Promise<Transaction>;
  getListUserTransactions(userId: string): Promise<Transaction[]>;
}
