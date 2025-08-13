import { type NextFunction } from 'express';
import { type Socket } from 'socket.io';
import { validateGenerateSocketTokenUser } from './validate-generate-token-user';
import { SocketNamespace } from '@/enums/socket.enum';
import { validateProcessTokenAuthSocketUser } from './validate-process-token-auth-user';

export const SocketUserValidators: Record<
  SocketNamespace,
  (token: string) => Promise<any>
> = {
  [SocketNamespace.GENERATE_TOKEN]: validateGenerateSocketTokenUser,
  [SocketNamespace.PROCESS_TOKEN]: validateProcessTokenAuthSocketUser,
};

export const socketAuthMiddleware = (authModuleType) => {
  return async (socket: Socket, next: NextFunction) => {
    try {
      const token = socket.handshake.auth.token ?? socket.handshake.query.token;
      if (!token) {
        throw new Error('Authentication token missing');
      }
      const user = await SocketUserValidators[authModuleType](token);
      socket.data.user = user;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  };
};
