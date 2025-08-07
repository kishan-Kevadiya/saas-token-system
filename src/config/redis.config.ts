import { type RedisOptions } from 'ioredis';
import { SCHEMA_FIELD_TYPE } from 'redis';

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_MAX_RETRIES = Number(process.env.REDIS_MAX_RETRIES) ?? 3;

if (!REDIS_HOST || !REDIS_PORT) {
  throw new Error('Missing REDIS_HOST or REDIS_PORT environment variables');
}

export const redisOptions: RedisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: REDIS_MAX_RETRIES,
};

export const redisTokenSchema = {
  '$.token_id': {
    type: SCHEMA_FIELD_TYPE.NUMERIC,
    SORTABLE: true,
    AS: 'token_id',
  },
  '$.series_id': {
    type: SCHEMA_FIELD_TYPE.NUMERIC,
    AS: 'series_id',
  },
  '$.priority': {
    type: SCHEMA_FIELD_TYPE.NUMERIC,
    AS: 'priority',
  },
  '$.company_id': {
    type: SCHEMA_FIELD_TYPE.NUMERIC,
    AS: 'company_id',
  },
};
