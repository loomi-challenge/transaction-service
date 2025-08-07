import { ITransaction } from "../entities/Transaction/interfaces/transaction.interface";

export interface ITransactionGateway {
  createTransaction(data: ITransaction): Promise<void>;
  findTransactionById({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<ITransaction | null>;
  getListUserTransactions(userId: string): Promise<ITransaction[]>;
}
