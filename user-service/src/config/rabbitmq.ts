// user-service/src/config/rabbitmq.ts

import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('[user-service] Connected to RabbitMQ');

    await setupQueues(); // Настраиваем exchange

  } catch (error) {
    console.error('[user-service] Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
};

export const getChannel = (): amqp.Channel | null => {
    return channel;
};

const setupQueues = async () => {
    if (!channel) return;

    // Обмен для событий пользователей
    await channel.assertExchange('user_events', 'topic', { durable: true });
};

export const publishToQueue = async (exchange: string, routingKey: string, message: any): Promise<boolean> => {
  if (!channel) {
    console.error('[user-service] RabbitMQ channel not initialized');
    return false;
  }
  try {
    const messageString = JSON.stringify(message); // Сериализуем сообщение в JSON
    channel.publish(exchange, routingKey, Buffer.from(messageString));
    console.log(`[user-service] Published message to ${exchange} with routing key ${routingKey}`);
    return true;
  } catch (err) {
    console.error("[user-service] publishToQueue error: ", err);
    return false;
  }
};