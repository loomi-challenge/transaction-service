import { ListUserTransactionsUseCase } from "@/application/usecases/Transaction/list-user-transactions.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";

type ListUserTransactionsParams = {
  userId: string;
};

type ListUserTransactionsControllerInput =
  ControllerInput<ListUserTransactionsParams> & {
    params: ListUserTransactionsParams;
  };

export class ListUserTransactionsController
  implements IController<ListUserTransactionsControllerInput, ControllerOutput>
{
  constructor(
    private readonly listUserTransactionsUseCase: ListUserTransactionsUseCase
  ) {}

  async handle(input: ControllerInput): Promise<ControllerOutput> {
    const { userId } = input.params;
    const transactions = await this.listUserTransactionsUseCase.execute(userId);
    return {
      statusCode: 200,
      data: transactions,
      message: "Transações listadas com sucesso",
    };
  }
}
