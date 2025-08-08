import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { IUseCase } from "../IUsecase";
import { inject, injectable } from "tsyringe";
import { AppError } from "@/domain/errors/app-error";

interface FindTransactionOutput {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

@injectable()
export class FindTransactionUseCase
  implements
    IUseCase<{ id: string; userId: string }, FindTransactionOutput | null>
{
  constructor(
    @inject("TransactionRepository")
    private readonly transactionGateway: ITransactionGateway
  ) {}

  async execute({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<FindTransactionOutput | null> {
    const transaction = await this.transactionGateway.findTransactionById({
      id,
      userId,
    });
    if (!transaction) {
      throw new AppError("Transação não encontrada", 404);
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
