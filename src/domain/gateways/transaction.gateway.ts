import { ITransaction } from "../entities/Transaction/interfaces/transaction.interface";

export interface ITransactionGateway {
  createTransaction(data: ITransaction): Promise<void>;
  findTransactionById(id: string): Promise<ITransaction | null>;
  getListUserTransactions(userId: string): Promise<ITransaction[]>;
}
