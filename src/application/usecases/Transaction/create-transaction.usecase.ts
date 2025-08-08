import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { IUseCase } from "../IUsecase";
import { Transaction } from "@/domain/entities/Transaction";
import { randomUUID } from "crypto";
import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";
import { inject, injectable } from "tsyringe";

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

@injectable()
export class CreateTransactionUseCase
  implements IUseCase<CreateTransactionInput, CreateTransactionOutput>
{
  constructor(
    @inject("TransactionRepository")
    private readonly transactionGateway: ITransactionGateway,
    @inject("UserValidationGateway")
    private readonly userValidationGateway: IUserValidationGateway,
  ) {}

  async execute(
    input: CreateTransactionInput
  ): Promise<CreateTransactionOutput> {
    const now = new Date();
    const isValid = await this.validateUsers(
      input.senderUserId,
      input.receiverUserId
    );
    if (!isValid) {
      throw new Error("Invalid users");
    }
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

    await this.userValidationGateway.updateUserBalance({
      senderUserId: input.senderUserId,
      receiverUserId: input.receiverUserId,
      amount: input.amount,
    });

    return transaction;
  }

  async validateUsers(
    senderUserId: string,
    receiverUserId: string
  ): Promise<boolean> {
    if (senderUserId === receiverUserId) {
      return false;
    }

    try {
      const isValid = await this.userValidationGateway.validateUsers([
        senderUserId,
        receiverUserId,
      ]);
      return isValid;
    } catch (error) {
      return false;
    }
  }
}
