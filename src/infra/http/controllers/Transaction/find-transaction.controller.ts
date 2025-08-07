import { FindTransactionUseCase } from "@/application/usecases/Transaction/find-transaction.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";

type FindTransactionParams = {
  id: string;
};

type FindTransactionControllerInput = ControllerInput<FindTransactionParams> & {
  params: FindTransactionParams;
};

export class FindTransactionController
  implements IController<FindTransactionControllerInput, ControllerOutput>
{
  constructor(
    private readonly findTransactionUseCase: FindTransactionUseCase
  ) {}

  async handle(input: ControllerInput): Promise<ControllerOutput> {
    const { id } = input.params;
    const userId = input.headers["x-user-id"] as string;
    const transaction = await this.findTransactionUseCase.execute({
      id,
      userId,
    });

    return {
      statusCode: 200,
      data: transaction,
      message: "Transação encontrada com sucesso",
    };
  }
}
