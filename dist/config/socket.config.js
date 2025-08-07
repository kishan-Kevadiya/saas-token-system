"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketConfig = void 0;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
const maxDisconnectMs = Number(process.env.SOCKET_MAX_DISCONNECT_DURATION) ?? 2 * 60 * 1000;
exports.socketConfig = {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    connectionStateRecovery: {
        maxDisconnectionDuration: maxDisconnectMs,
        skipMiddlewares: true,
    },
};
//# sourceMappingURL=socket.config.js.map