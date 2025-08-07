import { ListUserTransactionsUseCase } from "@/application/usecases/Transaction/list-user-transactions.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";
import { inject, injectable } from "tsyringe";

type ListUserTransactionsControllerInput = ControllerInput<{}>;

@injectable()
export class ListUserTransactionsController
  implements IController<ListUserTransactionsControllerInput, ControllerOutput>
{
  constructor(
    @inject("ListUserTransactionsUseCase")
    private readonly listUserTransactionsUseCase: ListUserTransactionsUseCase
  ) {}

  async handle(input: ControllerInput): Promise<ControllerOutput> {
    const userId = input.headers["x-user-id"] as string;
    const transactions = await this.listUserTransactionsUseCase.execute(userId);
    return {
      statusCode: 200,
      data: transactions,
      message: "Transações listadas com sucesso",
    };
  }
}
