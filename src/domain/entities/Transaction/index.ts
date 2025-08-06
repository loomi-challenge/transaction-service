import { ITransaction } from "./interfaces/transaction.interface";

export class Transaction implements ITransaction {
  private readonly _id: string;
  private readonly _senderUserId: string;
  private readonly _receiverUserId: string;
  private readonly _amount: number;
  private readonly _description: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(transaction: ITransaction) {
    this._id = transaction.id;
    this._senderUserId = transaction.senderUserId;
    this._receiverUserId = transaction.receiverUserId;
    this._amount = transaction.amount;
    this._description = transaction.description;
    this._createdAt = transaction.createdAt;
    this._updatedAt = transaction.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get senderUserId(): string {
    return this._senderUserId;
  }

  get receiverUserId(): string {
    return this._receiverUserId;
  }

  get amount(): number {
    return this._amount;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
