import { createClient } from 'redis';

export const redis = createClient({
  url: 'redis://192.168.11.55:6380',
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

void (async () => {
  await redis.connect();
})();
