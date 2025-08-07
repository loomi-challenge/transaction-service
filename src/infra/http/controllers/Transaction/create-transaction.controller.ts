import { CreateTransactionUseCase } from "@/application/usecases/Transaction/create-transaction.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";

type CreateTransactionBody = {
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
};

type CreateTransactionControllerInput =
  ControllerInput<CreateTransactionBody> & {
    body: CreateTransactionBody;
  };

export class CreateTransactionController
  implements IController<CreateTransactionControllerInput, ControllerOutput>
{
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase
  ) {}

  async handle(input: ControllerInput): Promise<ControllerOutput> {
    const userId = input.headers["x-user-id"] as string;
    const { receiverUserId, amount, description } = input.body;
    const transaction = await this.createTransactionUseCase.execute({
      senderUserId: userId,
      receiverUserId,
      amount,
      description,
    });
    return {
      statusCode: 201,
      data: transaction,
      message: "Transação criada com sucesso",
    };
  }
}
