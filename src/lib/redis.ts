import Redis from 'ioredis';
import { createClient } from 'redis';

class RedisClient {
  private static instance: Redis;
  private static readonly MAX_RETRY_ATTEMPTS = 5;
  private static readonly RETRY_DELAY_BASE = 50;
  private static readonly MAX_RETRY_DELAY = 5000;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB ?? '0'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      RedisClient.instance.on('connect', () => {
        console.log('Redis connected successfully');
      });

      RedisClient.instance.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      RedisClient.instance.on('close', () => {
        console.log('Redis connection closed');
      });
    }

    return RedisClient.instance;
  }

  public static pubClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > RedisClient.MAX_RETRY_ATTEMPTS) {
          return new Error('Max retry attempts exceeded');
        }
        return Math.min(
          retries * RedisClient.RETRY_DELAY_BASE,
          RedisClient.MAX_RETRY_DELAY
        );
      },
      connectTimeout: 10000,
    },
  });

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
    }
  }
}

export default RedisClient;
