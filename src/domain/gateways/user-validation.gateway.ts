export interface IUserValidationGateway {
  validateUsers(senderId: string, receiverId: string): Promise<boolean>;
}
