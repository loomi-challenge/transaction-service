import 'reflect-metadata';
import { CreateTransactionUseCase } from "@/application/usecases/Transaction/create-transaction.usecase";
import { TransactionGatewayMock } from "./mocks/transaction-gateway.mock";
import { UserValidationGatewayMock } from "./mocks/user-validation-gateway.mock";
import { AppError } from "@/domain/errors/app-error";

describe("CreateTransactionUseCase", () => {
  let createTransactionUseCase: CreateTransactionUseCase;
  let transactionGatewayMock: TransactionGatewayMock;
  let userValidationGatewayMock: UserValidationGatewayMock;

  beforeEach(() => {
    transactionGatewayMock = new TransactionGatewayMock();
    userValidationGatewayMock = new UserValidationGatewayMock();
    createTransactionUseCase = new CreateTransactionUseCase(
      transactionGatewayMock,
      userValidationGatewayMock
    );
  });

  afterEach(() => {
    transactionGatewayMock.clear();
    userValidationGatewayMock.clear();
  });

  describe("execute", () => {
    const validInput = {
      senderUserId: "sender-123",
      receiverUserId: "receiver-456",
      amount: 100,
      description: "Test transaction",
    };

    it("should create a transaction successfully when all validations pass", async () => {
      // Arrange
      userValidationGatewayMock.addValidUser(validInput.senderUserId);
      userValidationGatewayMock.addValidUser(validInput.receiverUserId);
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, 500);

      // Act
      const result = await createTransactionUseCase.execute(validInput);

      // Assert
      expect(result).toEqual({
        id: expect.any(String),
        senderUserId: validInput.senderUserId,
        receiverUserId: validInput.receiverUserId,
        amount: validInput.amount,
        description: validInput.description,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const createdTransactions = transactionGatewayMock.getAll();
      expect(createdTransactions).toHaveLength(1);
      expect(createdTransactions[0].senderUserId).toBe(validInput.senderUserId);
      expect(createdTransactions[0].receiverUserId).toBe(validInput.receiverUserId);
      expect(createdTransactions[0].amount).toBe(validInput.amount);
    });

    it("should update user balances after creating transaction", async () => {
      // Arrange
      const initialSenderBalance = 500;
      const initialReceiverBalance = 200;
      
      userValidationGatewayMock.addValidUser(validInput.senderUserId);
      userValidationGatewayMock.addValidUser(validInput.receiverUserId);
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, initialSenderBalance);
      userValidationGatewayMock.setUserBalance(validInput.receiverUserId, initialReceiverBalance);

      // Act
      await createTransactionUseCase.execute(validInput);

      // Assert
      const finalSenderBalance = userValidationGatewayMock.getUserBalance(validInput.senderUserId);
      const finalReceiverBalance = userValidationGatewayMock.getUserBalance(validInput.receiverUserId);

      expect(finalSenderBalance).toBe(initialSenderBalance - validInput.amount);
      expect(finalReceiverBalance).toBe(initialReceiverBalance + validInput.amount);
    });

    it("should throw AppError when sender has insufficient balance", async () => {
      // Arrange
      userValidationGatewayMock.addValidUser(validInput.senderUserId);
      userValidationGatewayMock.addValidUser(validInput.receiverUserId);
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, 50); // Less than transaction amount

      // Act & Assert
      await expect(createTransactionUseCase.execute(validInput)).rejects.toThrow(
        new AppError("Saldo insuficiente para realizar a transação", 400)
      );

      // Verify no transaction was created
      expect(transactionGatewayMock.getAll()).toHaveLength(0);
    });

    it("should throw AppError when users are invalid", async () => {
      // Arrange
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, 500);
      // Don't add users to valid users list

      // Act & Assert
      await expect(createTransactionUseCase.execute(validInput)).rejects.toThrow(
        new AppError("Usuários inválidos para realizar a transação", 400)
      );

      // Verify no transaction was created
      expect(transactionGatewayMock.getAll()).toHaveLength(0);
    });

    it("should throw AppError when sender and receiver are the same user", async () => {
      // Arrange
      const sameUserInput = {
        ...validInput,
        receiverUserId: validInput.senderUserId,
      };
      userValidationGatewayMock.addValidUser(validInput.senderUserId);
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, 500);

      // Act & Assert
      await expect(createTransactionUseCase.execute(sameUserInput)).rejects.toThrow(
        new AppError("Usuários inválidos para realizar a transação", 400)
      );

      // Verify no transaction was created
      expect(transactionGatewayMock.getAll()).toHaveLength(0);
    });

    it("should throw AppError when only sender is valid", async () => {
      // Arrange
      userValidationGatewayMock.addValidUser(validInput.senderUserId);
      // Don't add receiver to valid users
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, 500);

      // Act & Assert
      await expect(createTransactionUseCase.execute(validInput)).rejects.toThrow(
        new AppError("Usuários inválidos para realizar a transação", 400)
      );

      // Verify no transaction was created
      expect(transactionGatewayMock.getAll()).toHaveLength(0);
    });

    it("should throw AppError when only receiver is valid", async () => {
      // Arrange
      userValidationGatewayMock.addValidUser(validInput.receiverUserId);
      // Don't add sender to valid users
      userValidationGatewayMock.setUserBalance(validInput.senderUserId, 500);

      // Act & Assert
      await expect(createTransactionUseCase.execute(validInput)).rejects.toThrow(
        new AppError("Usuários inválidos para realizar a transação", 400)
      );

      // Verify no transaction was created
      expect(transactionGatewayMock.getAll()).toHaveLength(0);
    });
  });

  describe("validateUsers", () => {
    it("should return false when sender and receiver are the same", async () => {
      // Arrange
      const userId = "same-user-123";

      // Act
      const result = await createTransactionUseCase.validateUsers(userId, userId);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when both users are valid and different", async () => {
      // Arrange
      const senderUserId = "sender-123";
      const receiverUserId = "receiver-456";
      userValidationGatewayMock.addValidUser(senderUserId);
      userValidationGatewayMock.addValidUser(receiverUserId);

      // Act
      const result = await createTransactionUseCase.validateUsers(senderUserId, receiverUserId);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when user validation throws an error", async () => {
      // Arrange
      const senderUserId = "sender-123";
      const receiverUserId = "receiver-456";
      // Mock the gateway to throw an error
      jest.spyOn(userValidationGatewayMock, 'validateUsers').mockRejectedValueOnce(new Error("Validation error"));

      // Act
      const result = await createTransactionUseCase.validateUsers(senderUserId, receiverUserId);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when users don't exist", async () => {
      // Arrange
      const senderUserId = "non-existent-sender";
      const receiverUserId = "non-existent-receiver";
      // Don't add users to valid users list

      // Act
      const result = await createTransactionUseCase.validateUsers(senderUserId, receiverUserId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
