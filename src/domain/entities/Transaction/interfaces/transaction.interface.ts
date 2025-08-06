export interface ITransaction {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
