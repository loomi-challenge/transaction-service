import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { IUseCase } from "../IUsecase";
import { Transaction } from "@/domain/entities/Transaction";
import { randomUUID } from "crypto";
import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";

interface CreateTransactionInput {
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

interface CreateTransactionOutput {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

export class CreateTransactionUseCase
  implements IUseCase<CreateTransactionInput, CreateTransactionOutput>
{
  constructor(
    private readonly transactionGateway: ITransactionGateway,
    private readonly userValidationGateway: IUserValidationGateway
  ) {}

  async execute(
    input: CreateTransactionInput
  ): Promise<CreateTransactionOutput> {
    const now = new Date();
    const transaction = new Transaction({
      id: randomUUID(),
      senderUserId: input.senderUserId,
      receiverUserId: input.receiverUserId,
      amount: input.amount,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    });
    await this.transactionGateway.createTransaction(transaction);
    return transaction;
  }
}
