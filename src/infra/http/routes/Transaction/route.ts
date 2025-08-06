import { Router } from "express";
import { CreateTransactionController } from "../../controllers/Transaction/create-transaction.controller";
import { CreateTransactionUseCase } from "@/application/usecases/Transaction/create-transaction.usecase";
import { TransactionRepository } from "@/infra/repositories/prisma/Transaction/transaction.repository";
import { expressAdaptRoute } from "../../adapters/express";
import { FindTransactionController } from "../../controllers/Transaction/find-transaction.controller";
import { FindTransactionUseCase } from "@/application/usecases/Transaction/find-transaction.usecase";
import { ListUserTransactionsController } from "../../controllers/Transaction/list-user-transactions.controller";
import { ListUserTransactionsUseCase } from "@/application/usecases/Transaction/list-user-transactions.usecase";
import { RabbitUserValidationGateway } from "@/infra/rabbitmq/user-validation";

export const transactionRouter = Router();
const transactionRepository = new TransactionRepository();
const userValidationGateway = new RabbitUserValidationGateway();
const createTransactionUseCase = new CreateTransactionUseCase(
  transactionRepository,
  userValidationGateway
);
const createTransactionController = new CreateTransactionController(
  createTransactionUseCase
);

const findTransactionUseCase = new FindTransactionUseCase(
  transactionRepository
);
const findTransactionController = new FindTransactionController(
  findTransactionUseCase
);

const listUserTransactionsUseCase = new ListUserTransactionsUseCase(
  transactionRepository,
  userValidationGateway
);
const listUserTransactionsController = new ListUserTransactionsController(
  listUserTransactionsUseCase
);

transactionRouter.post("/", expressAdaptRoute(createTransactionController));
transactionRouter.get("/:id", expressAdaptRoute(findTransactionController));
transactionRouter.get(
  "/user/:userId",
  expressAdaptRoute(listUserTransactionsController)
);
