"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisTokenSchema = exports.redisOptions = void 0;
const redis_1 = require("redis");
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_MAX_RETRIES = Number(process.env.REDIS_MAX_RETRIES) ?? 3;
if (!REDIS_HOST || !REDIS_PORT) {
    throw new Error('Missing REDIS_HOST or REDIS_PORT environment variables');
}
exports.redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: REDIS_MAX_RETRIES,
};
exports.redisTokenSchema = {
    '$.token_id': {
        type: redis_1.SCHEMA_FIELD_TYPE.NUMERIC,
        SORTABLE: true,
        AS: 'token_id',
    },
    '$.series_id': {
        type: redis_1.SCHEMA_FIELD_TYPE.NUMERIC,
        AS: 'series_id',
    },
    '$.priority': {
        type: redis_1.SCHEMA_FIELD_TYPE.NUMERIC,
        AS: 'priority',
    },
    '$.company_id': {
        type: redis_1.SCHEMA_FIELD_TYPE.NUMERIC,
        AS: 'company_id',
    },
};
//# sourceMappingURL=redis.config.js.map