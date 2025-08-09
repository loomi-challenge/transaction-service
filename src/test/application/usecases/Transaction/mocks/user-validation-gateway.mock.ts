import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";

export class UserValidationGatewayMock implements IUserValidationGateway {
  private validUsers: string[] = [];
  private userBalances: Map<string, number> = new Map();

  async validateUsers(userIds: string[]): Promise<boolean> {
    return userIds.every((userId) => this.validUsers.includes(userId));
  }

  async updateUserBalance({
    senderUserId,
    receiverUserId,
    amount,
  }: {
    senderUserId: string;
    receiverUserId: string;
    amount: number;
  }): Promise<void> {
    const senderBalance = this.userBalances.get(senderUserId) || 0;
    const receiverBalance = this.userBalances.get(receiverUserId) || 0;

    this.userBalances.set(senderUserId, senderBalance - amount);
    this.userBalances.set(receiverUserId, receiverBalance + amount);
  }

  async checkSenderBalance({
    senderUserId,
    amount,
  }: {
    senderUserId: string;
    amount: number;
  }): Promise<boolean> {
    const balance = this.userBalances.get(senderUserId) || 0;
    return balance >= amount;
  }

  // Helper methods for tests
  addValidUser(userId: string): void {
    if (!this.validUsers.includes(userId)) {
      this.validUsers.push(userId);
    }
  }

  setUserBalance(userId: string, balance: number): void {
    this.userBalances.set(userId, balance);
  }

  getUserBalance(userId: string): number {
    return this.userBalances.get(userId) || 0;
  }

  clear(): void {
    this.validUsers = [];
    this.userBalances.clear();
  }

  removeValidUser(userId: string): void {
    this.validUsers = this.validUsers.filter((id) => id !== userId);
  }
} 