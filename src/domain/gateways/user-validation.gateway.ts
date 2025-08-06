export interface IUserValidationGateway {
  validateUsers(userIds: string[]): Promise<boolean>;
}
