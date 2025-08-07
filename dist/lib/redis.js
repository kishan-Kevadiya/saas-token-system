"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redis_1 = require("redis");
class RedisClient {
    static instance;
    static MAX_RETRY_ATTEMPTS = 5;
    static RETRY_DELAY_BASE = 50;
    static MAX_RETRY_DELAY = 5000;
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new ioredis_1.default({
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
    static pubClient = (0, redis_1.createClient)({
        url: process.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > RedisClient.MAX_RETRY_ATTEMPTS) {
                    return new Error('Max retry attempts exceeded');
                }
                return Math.min(retries * RedisClient.RETRY_DELAY_BASE, RedisClient.MAX_RETRY_DELAY);
            },
            connectTimeout: 10000,
        },
    });
    static async disconnect() {
        if (RedisClient.instance) {
            await RedisClient.instance.quit();
        }
    }
}
exports.default = RedisClient;
//# sourceMappingURL=redis.js.map