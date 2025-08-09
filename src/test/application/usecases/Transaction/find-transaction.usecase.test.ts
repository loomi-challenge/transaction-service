import 'reflect-metadata';
import { FindTransactionUseCase } from "@/application/usecases/Transaction/find-transaction.usecase";
import { TransactionGatewayMock } from "./mocks/transaction-gateway.mock";
import { AppError } from "@/domain/errors/app-error";
import { ITransaction } from "@/domain/entities/Transaction/interfaces/transaction.interface";

describe("FindTransactionUseCase", () => {
  let findTransactionUseCase: FindTransactionUseCase;
  let transactionGatewayMock: TransactionGatewayMock;

  beforeEach(() => {
    transactionGatewayMock = new TransactionGatewayMock();
    findTransactionUseCase = new FindTransactionUseCase(transactionGatewayMock);
  });

  afterEach(() => {
    transactionGatewayMock.clear();
  });

  describe("execute", () => {
    const mockTransaction: ITransaction = {
      id: "transaction-123",
      senderUserId: "sender-456",
      receiverUserId: "receiver-789",
      amount: 150,
      description: "Test transaction",
      createdAt: new Date("2024-01-01T10:00:00Z"),
      updatedAt: new Date("2024-01-01T10:00:00Z"),
    };

    it("should return transaction when found and user is sender", async () => {
      // Arrange
      transactionGatewayMock.addTransaction(mockTransaction);
      const input = {
        id: mockTransaction.id,
        userId: mockTransaction.senderUserId,
      };

      // Act
      const result = await findTransactionUseCase.execute(input);

      // Assert
      expect(result).toEqual({
        id: mockTransaction.id,
        senderUserId: mockTransaction.senderUserId,
        receiverUserId: mockTransaction.receiverUserId,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
      });
    });

    it("should return transaction when found and user is receiver", async () => {
      // Arrange
      transactionGatewayMock.addTransaction(mockTransaction);
      const input = {
        id: mockTransaction.id,
        userId: mockTransaction.receiverUserId,
      };

      // Act
      const result = await findTransactionUseCase.execute(input);

      // Assert
      expect(result).toEqual({
        id: mockTransaction.id,
        senderUserId: mockTransaction.senderUserId,
        receiverUserId: mockTransaction.receiverUserId,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
      });
    });

    it("should throw AppError when transaction is not found", async () => {
      // Arrange
      const input = {
        id: "non-existent-transaction",
        userId: "any-user-123",
      };

      // Act & Assert
      await expect(findTransactionUseCase.execute(input)).rejects.toThrow(
        new AppError("Transação não encontrada", 404)
      );
    });

    it("should throw AppError when transaction exists but user is not involved", async () => {
      // Arrange
      transactionGatewayMock.addTransaction(mockTransaction);
      const input = {
        id: mockTransaction.id,
        userId: "other-user-999", // User not involved in the transaction
      };

      // Act & Assert
      await expect(findTransactionUseCase.execute(input)).rejects.toThrow(
        new AppError("Transação não encontrada", 404)
      );
    });

    it("should throw AppError when transaction id is empty", async () => {
      // Arrange
      const input = {
        id: "",
        userId: "user-123",
      };

      // Act & Assert
      await expect(findTransactionUseCase.execute(input)).rejects.toThrow(
        new AppError("Transação não encontrada", 404)
      );
    });

    it("should throw AppError when userId is empty", async () => {
      // Arrange
      transactionGatewayMock.addTransaction(mockTransaction);
      const input = {
        id: mockTransaction.id,
        userId: "",
      };

      // Act & Assert
      await expect(findTransactionUseCase.execute(input)).rejects.toThrow(
        new AppError("Transação não encontrada", 404)
      );
    });

    it("should handle multiple transactions and return only the correct one", async () => {
      // Arrange
      const transaction1: ITransaction = {
        id: "transaction-1",
        senderUserId: "user-1",
        receiverUserId: "user-2",
        amount: 100,
        description: "Transaction 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const transaction2: ITransaction = {
        id: "transaction-2",
        senderUserId: "user-3",
        receiverUserId: "user-4",
        amount: 200,
        description: "Transaction 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionGatewayMock.addTransaction(transaction1);
      transactionGatewayMock.addTransaction(transaction2);

      const input = {
        id: transaction2.id,
        userId: transaction2.senderUserId,
      };

      // Act
      const result = await findTransactionUseCase.execute(input);

      // Assert
      expect(result).toEqual({
        id: transaction2.id,
        senderUserId: transaction2.senderUserId,
        receiverUserId: transaction2.receiverUserId,
        amount: transaction2.amount,
        description: transaction2.description,
      });
      expect(result!.id).not.toBe(transaction1.id);
    });

    it("should return correct transaction format without dates", async () => {
      // Arrange
      const transactionWithDates: ITransaction = {
        id: "transaction-with-dates",
        senderUserId: "sender-123",
        receiverUserId: "receiver-456",
        amount: 75,
        description: "Transaction with dates",
        createdAt: new Date("2024-01-15T14:30:00Z"),
        updatedAt: new Date("2024-01-15T14:35:00Z"),
      };

      transactionGatewayMock.addTransaction(transactionWithDates);
      const input = {
        id: transactionWithDates.id,
        userId: transactionWithDates.senderUserId,
      };

      // Act
      const result = await findTransactionUseCase.execute(input);

      // Assert
      expect(result).toEqual({
        id: transactionWithDates.id,
        senderUserId: transactionWithDates.senderUserId,
        receiverUserId: transactionWithDates.receiverUserId,
        amount: transactionWithDates.amount,
        description: transactionWithDates.description,
      });

      // Verify that dates are not included in the output
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });
  });
});
