import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { ITransaction } from "@/domain/entities/Transaction/interfaces/transaction.interface";

export class TransactionGatewayMock implements ITransactionGateway {
  private transactions: ITransaction[] = [];

  async createTransaction(data: ITransaction): Promise<void> {
    this.transactions.push(data);
  }

  async findTransactionById({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<ITransaction | null> {
    const transaction = this.transactions.find(
      (t) => t.id === id && (t.senderUserId === userId || t.receiverUserId === userId)
    );
    return transaction || null;
  }

  async getListUserTransactions(userId: string): Promise<ITransaction[]> {
    return this.transactions.filter(
      (t) => t.senderUserId === userId || t.receiverUserId === userId
    );
  }

  // Helper methods for tests
  clear(): void {
    this.transactions = [];
  }

  addTransaction(transaction: ITransaction): void {
    this.transactions.push(transaction);
  }

  getAll(): ITransaction[] {
    return this.transactions;
  }
} 