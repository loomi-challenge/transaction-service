import { Router } from "express";
import { CreateTransactionController } from "../../controllers/Transaction/create-transaction.controller";
import { expressAdaptRoute } from "../../adapters/express";
import { FindTransactionController } from "../../controllers/Transaction/find-transaction.controller";
import { ListUserTransactionsController } from "../../controllers/Transaction/list-user-transactions.controller";
import { container } from "@/infra/config/container";

export const transactionRouter = Router();

const createTransactionController = container.resolve(
  CreateTransactionController
);

const findTransactionController = container.resolve(FindTransactionController);

const listUserTransactionsController = container.resolve(
  ListUserTransactionsController
);

transactionRouter.post("/", expressAdaptRoute(createTransactionController));
transactionRouter.get(
  "/user",
  expressAdaptRoute(listUserTransactionsController)
);
transactionRouter.get("/:id", expressAdaptRoute(findTransactionController));
