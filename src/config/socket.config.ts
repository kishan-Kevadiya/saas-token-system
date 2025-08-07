import { type ServerOptions } from 'socket.io';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

const maxDisconnectMs =
  Number(process.env.SOCKET_MAX_DISCONNECT_DURATION) ?? 2 * 60 * 1000;

export const socketConfig: Partial<ServerOptions> = {
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
