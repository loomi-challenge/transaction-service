import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";
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
  constructor(
    private readonly transactionGateway: ITransactionGateway,
    private readonly userGateway: IUserValidationGateway
  ) {}

  async execute(userId: string): Promise<ListUserTransactionsOutput[]> {
    const isValid = await this.validateUser(userId);
    if (!isValid) {
      throw new Error("Usuário não encontrado");
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
