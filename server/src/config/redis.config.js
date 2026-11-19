// server/src/config/redis.config.js
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error('REDIS_URL is not configured');
    process.exit(1);
}

const redis = new Redis(redisUrl, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 10000,
});

redis.on('connect', () => {
    console.log('Redis Cloud Connected');
});

redis.on('ready', () => {
    console.log('Redis Cloud Ready');
});

redis.on('error', (error) => {
    console.error('Redis Cloud Error:', error.message);
});

redis.on('close', () => {
    console.log('Redis Cloud Connection Closed');
});

redis.on('reconnecting', () => {
    console.log('Redis Cloud Reconnecting...');
});

export default redis;