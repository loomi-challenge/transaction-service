import amqp from "amqplib";
import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";

export class RabbitUserValidationGateway implements IUserValidationGateway {
  private connection!: any;
  private channel!: any;

  constructor(private readonly rpcQueue = "validate-users") {}

  async connect() {
    this.connection = await amqp.connect("amqp://localhost");
    this.channel = await this.connection.createChannel();
  }

  async validateUsers(senderId: string, receiverId: string): Promise<boolean> {
    const corrId = crypto.randomUUID();
    const responseQueue = await this.channel.assertQueue("", {
      exclusive: true,
    });

    return new Promise((resolve) => {
      this.channel.consume(
        responseQueue.queue,
        (msg: any | null) => {
          if (msg?.properties.correlationId === corrId) {
            const content = JSON.parse(msg.content.toString());
            resolve(content.valid);
          }
        },
        { noAck: true }
      );

      this.channel.sendToQueue(this.rpcQueue, Buffer.from(JSON.stringify({
        senderUserId: senderId,
        receiverUserId: receiverId,
      })), {
        correlationId: corrId,
        replyTo: responseQueue.queue,
      });
    });
  }
}
