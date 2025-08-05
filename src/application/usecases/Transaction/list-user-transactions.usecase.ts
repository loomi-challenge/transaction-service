import { IUseCase } from "../IUsecase";
import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";

interface ListUserTransactionsOutput {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

export class ListUserTransactionsUseCase
  implements IUseCase<string, ListUserTransactionsOutput[]>
{
  constructor(private readonly transactionGateway: ITransactionGateway) {}

  async execute(userId: string): Promise<ListUserTransactionsOutput[]> {
    const transactions = await this.transactionGateway.getListUserTransactions(
      userId
    );
    return transactions.map((transaction) => ({
      id: transaction.id,
      senderUserId: transaction.senderUserId,
      receiverUserId: transaction.receiverUserId,
      amount: transaction.amount,
      description: transaction.description,
    }));
  }
}
