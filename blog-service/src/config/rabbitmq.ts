// blog-service/src/config/rabbitmq.ts

import amqp from 'amqplib';
import { AppDataSource } from '../data-source';
import { BlogPost, Theme } from '../models/BlogPost';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('[blog-service] Connected to RabbitMQ');

    await setupQueues();
    await consumeUserEvents();

  } catch (error) {
    console.error('[blog-service] Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
};

export const getChannel = (): amqp.Channel | null => {
  return channel;
};

const setupQueues = async () => {
  if (!channel) return;

  await channel!.assertExchange('user_events', 'topic', { durable: true });
};

const consumeUserEvents = async () => {
  if (!channel) {
    console.error('[blog-service] RabbitMQ channel not initialized');
    return;
  }

  const queueName = 'blog_user_queue';

  try {
    await channel!.assertQueue(queueName, { durable: true });
    await channel!.bindQueue(queueName, 'user_events', 'user.created');

    channel!.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const messageContent = msg.content.toString();
          const message = JSON.parse(messageContent);

          console.log(`[blog-service] Received message: ${messageContent}`);
          await handleUserCreatedEvent(message);

          channel!.ack(msg);
        } catch (error) {
          console.error('[blog-service] Error processing message:', error);
          channel!.nack(msg, false, false);
        }
      }
    });

    console.log(`[blog-service] Consuming messages from queue ${queueName}`);
  } catch (error) {
    console.error('[blog-service] Error consuming messages:', error);
  }
};

const handleUserCreatedEvent = async (message: any) => {
  const { userId, username, email } = message;

  try {
    const blogPostRepository = AppDataSource.getRepository(BlogPost);

    const blogPost = blogPostRepository.create({
      user_id: userId,
      username: username,
      email: email,
      author: username,
      title: 'New User Blog Post',
      theme: Theme.FITNESS, // Используем enum Theme
      content: 'Welcome to the blog!',
    });

    await blogPostRepository.save(blogPost);
    console.log(`[blog-service] Created blog post for user ID: ${userId}`);

  } catch (error) {
    console.error('[blog-service] Error handling user.created event:', error);
  }
};