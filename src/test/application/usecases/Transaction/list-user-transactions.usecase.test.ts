import 'reflect-metadata';
import { ListUserTransactionsUseCase } from "@/application/usecases/Transaction/list-user-transactions.usecase";
import { TransactionGatewayMock } from "./mocks/transaction-gateway.mock";
import { UserValidationGatewayMock } from "./mocks/user-validation-gateway.mock";
import { AppError } from "@/domain/errors/app-error";
import { ITransaction } from "@/domain/entities/Transaction/interfaces/transaction.interface";

describe("ListUserTransactionsUseCase", () => {
  let listUserTransactionsUseCase: ListUserTransactionsUseCase;
  let transactionGatewayMock: TransactionGatewayMock;
  let userValidationGatewayMock: UserValidationGatewayMock;

  beforeEach(() => {
    transactionGatewayMock = new TransactionGatewayMock();
    userValidationGatewayMock = new UserValidationGatewayMock();
    listUserTransactionsUseCase = new ListUserTransactionsUseCase(
      transactionGatewayMock,
      userValidationGatewayMock
    );
  });

  afterEach(() => {
    transactionGatewayMock.clear();
    userValidationGatewayMock.clear();
  });

  describe("execute", () => {
    const validUserId = "user-123";

    const mockTransactions: ITransaction[] = [
      {
        id: "transaction-1",
        senderUserId: validUserId,
        receiverUserId: "receiver-1",
        amount: 100,
        description: "Payment to receiver 1",
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
      },
      {
        id: "transaction-2",
        senderUserId: "sender-2",
        receiverUserId: validUserId,
        amount: 200,
        description: "Payment from sender 2",
        createdAt: new Date("2024-01-02T10:00:00Z"),
        updatedAt: new Date("2024-01-02T10:00:00Z"),
      },
      {
        id: "transaction-3",
        senderUserId: validUserId,
        receiverUserId: "receiver-3",
        amount: 150,
        description: "Payment to receiver 3",
        createdAt: new Date("2024-01-03T10:00:00Z"),
        updatedAt: new Date("2024-01-03T10:00:00Z"),
      },
    ];

    it("should return all user transactions when user is valid", async () => {
      // Arrange
      userValidationGatewayMock.addValidUser(validUserId);
      mockTransactions.forEach((transaction) => {
        transactionGatewayMock.addTransaction(transaction);
      });

      // Act
      const result = await listUserTransactionsUseCase.execute(validUserId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          id: "transaction-1",
          senderUserId: validUserId,
          receiverUserId: "receiver-1",
          amount: 100,
          description: "Payment to receiver 1",
        },
        {
          id: "transaction-2",
          senderUserId: "sender-2",
          receiverUserId: validUserId,
          amount: 200,
          description: "Payment from sender 2",
        },
        {
          id: "transaction-3",
          senderUserId: validUserId,
          receiverUserId: "receiver-3",
          amount: 150,
          description: "Payment to receiver 3",
        },
      ]);
    });

    it("should return empty array when user has no transactions", async () => {
      // Arrange
      const userWithNoTransactions = "user-with-no-transactions";
      userValidationGatewayMock.addValidUser(userWithNoTransactions);

      // Act
      const result = await listUserTransactionsUseCase.execute(userWithNoTransactions);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should throw AppError when user is not found", async () => {
      // Arrange
      const invalidUserId = "invalid-user-123";
      // Don't add user to valid users list

      // Act & Assert
      await expect(listUserTransactionsUseCase.execute(invalidUserId)).rejects.toThrow(
        new AppError("Usuário não encontrado", 404)
      );
    });

    it("should return only transactions where user is involved", async () => {
      // Arrange
      const otherUserTransaction: ITransaction = {
        id: "other-transaction",
        senderUserId: "other-sender",
        receiverUserId: "other-receiver",
        amount: 500,
        description: "Other user transaction",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userValidationGatewayMock.addValidUser(validUserId);
      
      // Add transactions for valid user and other users
      mockTransactions.forEach((transaction) => {
        transactionGatewayMock.addTransaction(transaction);
      });
      transactionGatewayMock.addTransaction(otherUserTransaction);

      // Act
      const result = await listUserTransactionsUseCase.execute(validUserId);

      // Assert
      expect(result).toHaveLength(3); // Only the transactions involving validUserId
      result.forEach((transaction) => {
        expect(
          transaction.senderUserId === validUserId || transaction.receiverUserId === validUserId
        ).toBe(true);
      });

      // Verify that other user transaction is not included
      const otherTransactionIncluded = result.some((t) => t.id === "other-transaction");
      expect(otherTransactionIncluded).toBe(false);
    });

    it("should return transactions in correct format without dates", async () => {
      // Arrange
      userValidationGatewayMock.addValidUser(validUserId);
      transactionGatewayMock.addTransaction(mockTransactions[0]);

      // Act
      const result = await listUserTransactionsUseCase.execute(validUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockTransactions[0].id,
        senderUserId: mockTransactions[0].senderUserId,
        receiverUserId: mockTransactions[0].receiverUserId,
        amount: mockTransactions[0].amount,
        description: mockTransactions[0].description,
      });

      // Verify that dates are not included in the output
      expect(result[0]).not.toHaveProperty("createdAt");
      expect(result[0]).not.toHaveProperty("updatedAt");
    });

    it("should return transactions when user is only sender", async () => {
      // Arrange
      const senderOnlyTransaction: ITransaction = {
        id: "sender-only-transaction",
        senderUserId: validUserId,
        receiverUserId: "receiver-only",
        amount: 300,
        description: "Sender only transaction",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userValidationGatewayMock.addValidUser(validUserId);
      transactionGatewayMock.addTransaction(senderOnlyTransaction);

      // Act
      const result = await listUserTransactionsUseCase.execute(validUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "sender-only-transaction",
        senderUserId: validUserId,
        receiverUserId: "receiver-only",
        amount: 300,
        description: "Sender only transaction",
      });
    });

    it("should return transactions when user is only receiver", async () => {
      // Arrange
      const receiverOnlyTransaction: ITransaction = {
        id: "receiver-only-transaction",
        senderUserId: "sender-only",
        receiverUserId: validUserId,
        amount: 400,
        description: "Receiver only transaction",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userValidationGatewayMock.addValidUser(validUserId);
      transactionGatewayMock.addTransaction(receiverOnlyTransaction);

      // Act
      const result = await listUserTransactionsUseCase.execute(validUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "receiver-only-transaction",
        senderUserId: "sender-only",
        receiverUserId: validUserId,
        amount: 400,
        description: "Receiver only transaction",
      });
    });

    it("should throw AppError when user validation fails with error", async () => {
      // Arrange
      const userId = "user-causing-error";
      jest.spyOn(userValidationGatewayMock, 'validateUsers').mockRejectedValueOnce(new Error("Validation error"));

      // Act & Assert
      await expect(listUserTransactionsUseCase.execute(userId)).rejects.toThrow(
        new AppError("Usuário não encontrado", 404)
      );
    });

    it("should handle empty string userId", async () => {
      // Arrange
      const emptyUserId = "";

      // Act & Assert
      await expect(listUserTransactionsUseCase.execute(emptyUserId)).rejects.toThrow(
        new AppError("Usuário não encontrado", 404)
      );
    });
  });
});
