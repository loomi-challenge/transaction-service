import { container } from "tsyringe";
import { TransactionRepository } from "../repositories/prisma/Transaction/transaction.repository";
import { RabbitUserValidationGateway } from "../rabbitmq/user-validation";
import { RabbitUserBalanceGateway } from "../rabbitmq/user-balance";
import { CreateTransactionUseCase } from "@/application/usecases/Transaction/create-transaction.usecase";
import { FindTransactionUseCase } from "@/application/usecases/Transaction/find-transaction.usecase";
import { ListUserTransactionsUseCase } from "@/application/usecases/Transaction/list-user-transactions.usecase";

container.register("TransactionRepository", {
  useClass: TransactionRepository,
});

container.register("UserValidationGateway", {
  useClass: RabbitUserValidationGateway,
});

container.register("UserBalanceGateway", {
  useClass: RabbitUserBalanceGateway,
});

container.register("CreateTransactionUseCase", {
  useClass: CreateTransactionUseCase,
});

container.register("FindTransactionUseCase", {
  useClass: FindTransactionUseCase,
});

container.register("ListUserTransactionsUseCase", {
  useClass: ListUserTransactionsUseCase,
});

export { container };
