import * as amqp from "amqplib";
import { IUserValidationGateway } from "@/domain/gateways/user-validation.gateway";
import crypto from "crypto";

export class RabbitUserValidationGateway implements IUserValidationGateway {
  private connection: any = null;
  private channel: any = null;

  constructor() {
    console.log("[RabbitUserValidationGateway] Gateway instance created");
  }

  private async getChannel(): Promise<any> {
    const startTime = Date.now();
    
    if (!this.connection) {
      const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost";
      console.log(`[RabbitUserValidationGateway] Connecting to RabbitMQ at: ${rabbitmqUrl}`);
      
      this.connection = await amqp.connect(rabbitmqUrl);
      console.log("[RabbitUserValidationGateway] Successfully connected to RabbitMQ");
    }

    if (!this.channel && this.connection) {
      console.log("[RabbitUserValidationGateway] Creating new channel");
      this.channel = await this.connection.createChannel();
      console.log("[RabbitUserValidationGateway] Channel created successfully");
    }

    if (!this.channel) {
      const error = "Failed to create RabbitMQ channel";
      console.error(`[RabbitUserValidationGateway] ERROR: ${error}`);
      throw new Error(error);
    }

    const duration = Date.now() - startTime;
    console.log(`[RabbitUserValidationGateway] Channel ready (took ${duration}ms)`);

    return this.channel;
  }

  async validateUsers(userIds: string[]): Promise<boolean> {
    const correlationId = crypto.randomUUID();
    console.log(`[RabbitUserValidationGateway] Starting user validation for ${userIds.length} users`, {
      userIds,
      correlationId
    });

    try {
      const channel = await this.getChannel();
      const queue = "validate-users";
      const replyQueue = await channel.assertQueue("", { exclusive: true });
      const replyQueueName = replyQueue.queue;

      console.log(`[RabbitUserValidationGateway] Asserting queue: ${queue} and temporary reply queue: ${replyQueueName}`);
      
      await channel.assertQueue(queue, { durable: true });

      const message = {
        userIds,
      };

      console.log(`[RabbitUserValidationGateway] Sending validation message to queue: ${queue}`, {
        correlationId,
        userCount: userIds.length,
        replyTo: replyQueueName
      });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: replyQueueName,
      });

      console.log(`[RabbitUserValidationGateway] Message sent, waiting for response... (correlationId: ${correlationId})`);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const errorMsg = `Timeout waiting for user validation response (correlationId: ${correlationId})`;
          console.error(`[RabbitUserValidationGateway] ERROR: ${errorMsg}`);
          reject(new Error(errorMsg));
        }, 10000); 

        channel.consume(
          replyQueueName,
          (msg: any) => {
            if (msg) {
              const msgCorrelationId = msg.properties.correlationId;
              
              if (msgCorrelationId === correlationId) {
                console.log(`[RabbitUserValidationGateway] Received response for correlationId: ${correlationId}`);
                
                clearTimeout(timeout);
                const response = JSON.parse(msg.content.toString());
                channel.ack(msg);
                
                console.log(`[RabbitUserValidationGateway] User validation completed`, {
                  correlationId,
                  allValid: response.allValid,
                  validUsers: response.validUsers,
                  totalUsers: response.totalUsers,
                  userIds,
                  fullResponse: response
                });
                
                resolve(response.allValid);
              } else {
                console.log(`[RabbitUserValidationGateway] Received message with different correlationId`, {
                  expected: correlationId,
                  received: msgCorrelationId
                });
              }
            }
          },
          { noAck: false }
        );
      });
    } catch (error) {
      console.error(`[RabbitUserValidationGateway] ERROR: Failed to validate users (correlationId: ${correlationId})`, {
        error: error instanceof Error ? error.message : error,
        userIds
      });
      throw new Error("Failed to validate users via RabbitMQ");
    }
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
    const correlationId = crypto.randomUUID();
    console.log(`[RabbitUserValidationGateway] Starting balance update`, {
      senderUserId,
      receiverUserId,
      amount,
      correlationId
    });

    try {
      const channel = await this.getChannel();
      const queue = "new-transactions";

      console.log(`[RabbitUserValidationGateway] Asserting queue: ${queue}`);

      await channel.assertQueue(queue, { durable: true });

      const message = {
        receiverid: receiverUserId,
        senderid: senderUserId,
        amount: amount,
      };

      console.log(`[RabbitUserValidationGateway] Sending balance update message to queue: ${queue}`, {
        correlationId,
        senderUserId,
        receiverUserId,
        amount,
        messageFormat: message
      });

      const sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        correlationId,
      });

      if (sent) {
        console.log(`[RabbitUserValidationGateway] Balance update message sent successfully (fire and forget)`, {
          correlationId,
          senderUserId,
          receiverUserId,
          amount
        });
      } else {
        throw new Error("Failed to send message to queue - queue may be full");
      }

    } catch (error) {
      console.error(`[RabbitUserValidationGateway] ERROR: Failed to send balance update message (correlationId: ${correlationId})`, {
        error: error instanceof Error ? error.message : error,
        senderUserId,
        receiverUserId,
        amount
      });
      throw new Error("Failed to send balance update via RabbitMQ");
    }
  }

  async checkSenderBalance({
    senderUserId,
    amount,
  }: {
    senderUserId: string;
    amount: number;
  }): Promise<boolean> {
    const correlationId = crypto.randomUUID();
    console.log(`[RabbitUserValidationGateway] Starting balance check for sender`, {
      senderUserId,
      amount,
      correlationId
    });

    try {
      const channel = await this.getChannel();
      const queue = "check-balance";
      const replyQueue = await channel.assertQueue("", { exclusive: true });
      const replyQueueName = replyQueue.queue;

      console.log(`[RabbitUserValidationGateway] Asserting queue: ${queue} and temporary reply queue: ${replyQueueName}`);
      
      await channel.assertQueue(queue, { durable: true });

      const message = {
        senderUserId,
        amount,
      };

      console.log(`[RabbitUserValidationGateway] Sending balance check message to queue: ${queue}`, {
        correlationId,
        senderUserId,
        amount,
        replyTo: replyQueueName
      });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: replyQueueName,
      });

      console.log(`[RabbitUserValidationGateway] Balance check message sent, waiting for response... (correlationId: ${correlationId})`);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const errorMsg = `Timeout waiting for balance check response (correlationId: ${correlationId})`;
          console.error(`[RabbitUserValidationGateway] ERROR: ${errorMsg}`);
          reject(new Error(errorMsg));
        }, 10000); 

        channel.consume(
          replyQueueName,
          (msg: any) => {
            if (msg) {
              const msgCorrelationId = msg.properties.correlationId;
              
              if (msgCorrelationId === correlationId) {
                console.log(`[RabbitUserValidationGateway] Received balance check response for correlationId: ${correlationId}`);
                
                clearTimeout(timeout);
                const response = JSON.parse(msg.content.toString());
                channel.ack(msg);
                
                console.log(`[RabbitUserValidationGateway] Balance check completed`, {
                  correlationId,
                  hasSufficientBalance: response.hasSufficientBalance,
                  senderUserId,
                  amount,
                  currentBalance: response.currentBalance,
                  fullResponse: response
                });
                
                resolve(response.hasSufficientBalance);
              } else {
                console.log(`[RabbitUserValidationGateway] Received balance check message with different correlationId`, {
                  expected: correlationId,
                  received: msgCorrelationId
                });
              }
            }
          },
          { noAck: false }
        );
      });
    } catch (error) {
      console.error(`[RabbitUserValidationGateway] ERROR: Failed to check sender balance (correlationId: ${correlationId})`, {
        error: error instanceof Error ? error.message : error,
        senderUserId,
        amount
      });
      throw new Error("Failed to check sender balance via RabbitMQ");
    }
  }

  async disconnect(): Promise<void> {
    console.log("[RabbitUserValidationGateway] Starting disconnect process");
    
    try {
      if (this.channel) {
        console.log("[RabbitUserValidationGateway] Closing channel");
        await this.channel.close();
        this.channel = null;
        console.log("[RabbitUserValidationGateway] Channel closed successfully");
      }
      
      if (this.connection) {
        console.log("[RabbitUserValidationGateway] Closing connection");
        await this.connection.close();
        this.connection = null;
        console.log("[RabbitUserValidationGateway] Connection closed successfully");
      }
      
      console.log("[RabbitUserValidationGateway] Disconnect completed successfully");
    } catch (error) {
      console.error("[RabbitUserValidationGateway] ERROR: Failed to disconnect properly", {
        error: error instanceof Error ? error.message : error
      });
      this.channel = null;
      this.connection = null;
      throw error;
    }
  }
}

