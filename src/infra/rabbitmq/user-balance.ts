import amqp from "amqplib";
import { IUserBalanceGateway } from "@/domain/gateways/user-balance.gateway";

export class RabbitUserBalanceGateway implements IUserBalanceGateway {
  private connection!: any;
  private channel!: any;

  constructor(private readonly queue = "new-transactions") {}

  async connect() {
    this.connection = await amqp.connect("amqp://localhost");
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queue);
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
    if (!this.channel) {
      await this.connect();
    }

    const message = {
      senderid: senderUserId,
      receiverid: receiverUserId,
      amount: amount,
    };

    console.log(`🐰 Enviando transação para queue '${this.queue}':`, message);
    
    await this.channel.sendToQueue(
      this.queue,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log("✅ Transação enviada com sucesso!");
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
