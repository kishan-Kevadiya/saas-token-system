import { type Server as HTTPServer } from 'http';
import {
  type Namespace,
  type Socket,
  Server as SocketIOServer,
} from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { generateTokenSocketHandlers } from './handlers/generate-token.handler';
import { processTokenSocketHandlers } from './handlers/process-token.handler';
import {
  type ServerToClientEvents,
  type ClientToServerEvents,
  type InterServerEvents,
  type SocketData,
} from '@/types/socket.types';

import { socketConfig } from '@/config/socket.config';
import { SocketNamespace } from '@/enums/socket.enum';
import { socketAuthMiddleware } from '@/middlewares/socket-auth-validator';
import RedisClient from '@/lib/redis';

class SocketService {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  private static instance: SocketService;
  private pubClient;
  private subClient;
  private isInitialized = false;

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private static readonly validNamespaces = new Set(
    Object.values(SocketNamespace).map((ns) => `/${ns}`)
  );

  private async createRedisClients(): Promise<{
    pubClient;
    subClient;
  }> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    const pubClient = RedisClient.pubClient;
    const subClient = pubClient.duplicate();
    pubClient.on('error', (err) => {
      console.error('Redis PubClient Error:', err);
    });

    subClient.on('error', (err) => {
      console.error('Redis SubClient Error:', err);
    });

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }

    return { pubClient, subClient };
  }

  private async connectAdapter(io: SocketIOServer): Promise<void> {
    try {
      const { pubClient, subClient } = await this.createRedisClients();
      this.pubClient = pubClient;
      this.subClient = subClient;

      io.adapter(createAdapter(pubClient, subClient));
      console.log('Redis adapter connected successfully');
    } catch (error) {
      console.error('Failed to connect Redis adapter:', error);
      throw error;
    }
  }

  private createNamespace(moduleType: SocketNamespace): void {
    if (!this.io) {
      throw new Error('Socket.IO server not initialized');
    }

    const namespace = this.io.of(`/${moduleType}`);

    namespace.use(socketAuthMiddleware(moduleType));

    // Add validation middleware
    // namespace.use(this.validationMiddleware);

    namespace.on('connection', (socket: Socket) => {
      console.log(`Socket connected to namespace /${moduleType}: ${socket.id}`);

      socket.data.connectedAt = new Date();
      socket.data.lastActivity = new Date();
      socket.data.rooms = [];

      this.attachEventHandlers(namespace, socket, moduleType);
      this.setupSocketCleanup(socket);
    });
  }

  // private readonly validationMiddleware = (
  //   socket: Socket,
  //   next: (err?: Error) => void
  // ) => {
  //   if (!socket.data.userId || !socket.data.username) {
  //     next(new Error('Invalid socket data'));
  //     return;
  //   }
  //   next();
  // };

  private setupSocketCleanup(socket: Socket): void {
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);

      if (socket.data.rooms) {
        socket.data.rooms.forEach((room) => {
          void socket.leave(room);
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
      socket.emit('error', {
        code: 'SOCKET_ERROR',
        message: 'An error occurred',
        timestamp: new Date(),
      });
    });
  }

  public async initialize(httpServer: HTTPServer): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.io = new SocketIOServer(httpServer, socketConfig);

      await this.connectAdapter(this.io);

      // Create namespaces
      Object.values(SocketNamespace).forEach((moduleType) => {
        this.createNamespace(moduleType);
      });

      this.setupNamespaceValidation();

      this.isInitialized = true;
      console.log('SocketService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SocketService:', error);
      throw error;
    }
  }

  private setupNamespaceValidation(): void {
    if (!this.io) return;

    const originalOf = this.io.of.bind(this.io);
    this.io.of = (name: string) => {
      const namespace = originalOf(name);
      console.log('Namespace accessed:', name);

      if (!SocketService.validNamespaces.has(name)) {
        console.warn(`Invalid namespace accessed: ${name}`);
        namespace.on('connection', (socket) => {
          socket.emit('error', {
            code: 'INVALID_NAMESPACE',
            message: 'Invalid namespace',
            timestamp: new Date(),
          });
          socket.disconnect(true);
        });
      }

      return namespace;
    };
  }

  private attachEventHandlers(
    namespace: Namespace,
    socket: Socket,
    moduleType: SocketNamespace
  ): void {
    switch (moduleType) {
      case SocketNamespace.GENERATE_TOKEN:
        generateTokenSocketHandlers(namespace, this.io, socket);
        break;
      case SocketNamespace.PROCESS_TOKEN:
        processTokenSocketHandlers(namespace, this.io, socket);
        break;
      default:
        console.warn(
          `No handlers defined for namespace: ${moduleType as string}`
        );
        break;
    }
  }

  public getIO(): SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > {
    if (!this.io) {
      throw new Error('Socket.IO not initialized. Call initialize() first.');
    }
    return this.io;
  }

  public emitToUser(
    userId: string,
    event: keyof ServerToClientEvents,
    data: any
  ): boolean {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return false;
    }

    try {
      this.io.to(`user_${userId}`).emit(event, data);
      return true;
    } catch (error) {
      console.error('Error emitting to user:', error);
      return false;
    }
  }

  public emitToRoom(
    roomId: string,
    event: keyof ServerToClientEvents,
    data: any,
    namespace?: string
  ): boolean {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return false;
    }
    try {
      console.log('Emitting to room:', roomId, 'event:', event);

      if (namespace) {
        this.io.of(namespace).to(roomId).emit(event, data);
      } else {
        this.io.to(roomId).emit(event, data);
      }
      return true;
    } catch (error) {
      console.error('Error emitting to room:', error);
      return false;
    }
  }

  public emitToAll(event: keyof ServerToClientEvents, data: any): boolean {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return false;
    }

    try {
      this.io.emit(event, data);
      return true;
    } catch (error) {
      console.error('Error emitting to all:', error);
      return false;
    }
  }

  public async cleanup(): Promise<void> {
    try {
      if (this.pubClient) {
        await this.pubClient.quit();
        this.pubClient = null;
      }
      if (this.subClient) {
        await this.subClient.quit();
        this.subClient = null;
      }
      if (this.io) {
        await this.io.close();
      }
      this.isInitialized = false;
      console.log('SocketService cleanup completed');
    } catch (error) {
      console.error('Error during SocketService cleanup:', error);
    }
  }
}

export default SocketService.getInstance();
