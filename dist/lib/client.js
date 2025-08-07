"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
exports.redis = (0, redis_1.createClient)({
    url: 'redis://192.168.11.55:6380',
});
exports.redis.on('error', (err) => {
    console.error('Redis Client Error', err);
});
void (async () => {
    await exports.redis.connect();
})();
//# sourceMappingURL=client.js.map