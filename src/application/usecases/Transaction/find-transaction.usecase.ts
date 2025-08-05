import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { IUseCase } from "../IUsecase";

interface FindTransactionOutput {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

export class FindTransactionUseCase
  implements IUseCase<string, FindTransactionOutput | null>
{
  constructor(private readonly transactionGateway: ITransactionGateway) {}

  async execute(id: string): Promise<FindTransactionOutput | null> {
    const transaction = await this.transactionGateway.findTransactionById(id);
    if (!transaction) {
      return null;
    }
    return {
      id: transaction.id,
      senderUserId: transaction.senderUserId,
      receiverUserId: transaction.receiverUserId,
      amount: transaction.amount,
      description: transaction.description,
    };
  }
}
