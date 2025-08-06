import { ITransaction } from "@/domain/entities/Transaction/interfaces/transaction.interface";
import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { prisma } from "@/package/prisma";

export class TransactionRepository implements ITransactionGateway {
  async createTransaction(data: ITransaction): Promise<void> {
    await prisma.transaction.create({
      data: {
        senderUserId: data.senderUserId,
        receiverUserId: data.receiverUserId,
        amount: data.amount,
        description: data.description,
      },
    });
  }
  async findTransactionById(id: string): Promise<ITransaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });
    return transaction;
  }
  async getListUserTransactions(userId: string): Promise<ITransaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderUserId: userId }, { receiverUserId: userId }],
      },
    });
    return transactions;
  }
}
