export interface IUserValidationGateway {
  validateUsers(userIds: string[]): Promise<boolean>;
  updateUserBalance({
    senderUserId,
    receiverUserId,
    amount,
  }: {
    senderUserId: string;
    receiverUserId: string;
    amount: number;
  }): Promise<void>;
}
