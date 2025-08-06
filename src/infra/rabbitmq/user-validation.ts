import amqp from "amqplib";
import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";
import crypto from "crypto";

export class RabbitUserValidationGateway implements IUserValidationGateway {
  private connection!: any;
  private channel!: any;

  constructor(private readonly rpcQueue = "validate-users") {}

  async connect() {
    this.connection = await amqp.connect("amqp://localhost");
    this.channel = await this.connection.createChannel();
  }

  async validateUsers(userIds: string[]): Promise<boolean> {
    console.log("🔍 Starting user validation for:", { userIds });
    
    if (!this.channel) {
      console.log("📡 Connecting to RabbitMQ...");
      await this.connect();
    }

    const corrId = crypto.randomUUID();
    const responseQueue = await this.channel.assertQueue("", {
      exclusive: true,
    });

    console.log("📤 Sending validation request with correlationId:", corrId);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error("⏰ Timeout waiting for RabbitMQ response");
        resolve(false);
      }, 5000);

      this.channel.consume(
        responseQueue.queue,
        (msg: any | null) => {
          console.log("📥 Received message:", msg ? "Yes" : "No");
          
          if (msg?.properties.correlationId === corrId) {
            clearTimeout(timeout);
            try {
              const content = JSON.parse(msg.content.toString());
              console.log("📋 RabbitMQ response content:", content);
              
              const isValid = Boolean(content?.allValid);
              console.log("✅ Validation result:", isValid);
              resolve(isValid);
            } catch (error) {
              console.error("❌ Error parsing RabbitMQ response:", error);
              resolve(false);
            }
          } else if (msg) {
            console.log("🔄 Message with different correlationId received:", msg.properties.correlationId);
          }
        },
        { noAck: true }
      );

      this.channel.sendToQueue(
        this.rpcQueue,
        Buffer.from(
          JSON.stringify({
            userIds,
          })
        ),
        {
          correlationId: corrId,
          replyTo: responseQueue.queue,
        }
      );
      
      console.log("📬 Message sent to queue:", this.rpcQueue);
    });
  }
}
