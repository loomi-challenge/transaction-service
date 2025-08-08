import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";
import { IUseCase } from "../IUsecase";
import { ITransactionGateway } from "@/domain/gateways/transaction.gateway";
import { inject, injectable } from "tsyringe";
import { AppError } from "@/domain/errors/app-error";

interface ListUserTransactionsOutput {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

@injectable()
export class ListUserTransactionsUseCase
  implements IUseCase<string, ListUserTransactionsOutput[]>
{
  constructor(
    @inject("TransactionRepository")
    private readonly transactionGateway: ITransactionGateway,
    @inject("UserValidationGateway")
    private readonly userGateway: IUserValidationGateway
  ) {}

  async execute(userId: string): Promise<ListUserTransactionsOutput[]> {
    const isValid = await this.validateUser(userId);
    if (!isValid) {
      throw new AppError("Usuário não encontrado", 404);
    }
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

  private async validateUser(userId: string): Promise<boolean> {
    try {
      const isValid = await this.userGateway.validateUsers([userId]);
      return isValid;
    } catch (error) {
      return false;
    }
  }
}
