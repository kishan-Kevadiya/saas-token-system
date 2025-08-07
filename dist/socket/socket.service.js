"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const generate_token_handler_1 = require("./handlers/generate-token.handler");
const process_token_handler_1 = require("./handlers/process-token.handler");
const socket_config_1 = require("../config/socket.config");
const socket_enum_1 = require("../enums/socket.enum");
const socket_auth_validator_1 = require("../middlewares/socket-auth-validator");
const redis_1 = __importDefault(require("../lib/redis"));
class SocketService {
    io;
    static instance;
    pubClient;
    subClient;
    isInitialized = false;
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    static validNamespaces = new Set(Object.values(socket_enum_1.SocketNamespace).map((ns) => `/${ns}`));
    async createRedisClients() {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is required');
        }
        const pubClient = redis_1.default.pubClient;
        const subClient = pubClient.duplicate();
        pubClient.on('error', (err) => {
            console.error('Redis PubClient Error:', err);
        });
        subClient.on('error', (err) => {
            console.error('Redis SubClient Error:', err);
        });
        try {
            await Promise.all([pubClient.connect(), subClient.connect()]);
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
        return { pubClient, subClient };
    }
    async connectAdapter(io) {
        try {
            const { pubClient, subClient } = await this.createRedisClients();
            this.pubClient = pubClient;
            this.subClient = subClient;
            io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
            console.log('Redis adapter connected successfully');
        }
        catch (error) {
            console.error('Failed to connect Redis adapter:', error);
            throw error;
        }
    }
    createNamespace(moduleType) {
        if (!this.io) {
            throw new Error('Socket.IO server not initialized');
        }
        const namespace = this.io.of(`/${moduleType}`);
        namespace.use((0, socket_auth_validator_1.socketAuthMiddleware)(moduleType));
        // Add validation middleware
        // namespace.use(this.validationMiddleware);
        namespace.on('connection', (socket) => {
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
    setupSocketCleanup(socket) {
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
    async initialize(httpServer) {
        if (this.isInitialized) {
            return;
        }
        try {
            this.io = new socket_io_1.Server(httpServer, socket_config_1.socketConfig);
            await this.connectAdapter(this.io);
            // Create namespaces
            Object.values(socket_enum_1.SocketNamespace).forEach((moduleType) => {
                this.createNamespace(moduleType);
            });
            this.setupNamespaceValidation();
            this.isInitialized = true;
            console.log('SocketService initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize SocketService:', error);
            throw error;
        }
    }
    setupNamespaceValidation() {
        if (!this.io)
            return;
        const originalOf = this.io.of.bind(this.io);
        this.io.of = (name) => {
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
    attachEventHandlers(namespace, socket, moduleType) {
        switch (moduleType) {
            case socket_enum_1.SocketNamespace.GENERATE_TOKEN:
                (0, generate_token_handler_1.generateTokenSocketHandlers)(namespace, this.io, socket);
                break;
            case socket_enum_1.SocketNamespace.PROCESS_TOKEN:
                (0, process_token_handler_1.processTokenSocketHandlers)(namespace, this.io, socket);
                break;
            default:
                console.warn(`No handlers defined for namespace: ${moduleType}`);
                break;
        }
    }
    getIO() {
        if (!this.io) {
            throw new Error('Socket.IO not initialized. Call initialize() first.');
        }
        return this.io;
    }
    emitToUser(userId, event, data) {
        if (!this.io) {
            console.error('Socket.IO not initialized');
            return false;
        }
        try {
            this.io.to(`user_${userId}`).emit(event, data);
            return true;
        }
        catch (error) {
            console.error('Error emitting to user:', error);
            return false;
        }
    }
    emitToRoom(roomId, event, data, namespace) {
        if (!this.io) {
            console.error('Socket.IO not initialized');
            return false;
        }
        try {
            console.log('Emitting to room:', roomId, 'event:', event);
            if (namespace) {
                this.io.of(namespace).to(roomId).emit(event, data);
            }
            else {
                this.io.to(roomId).emit(event, data);
            }
            return true;
        }
        catch (error) {
            console.error('Error emitting to room:', error);
            return false;
        }
    }
    emitToAll(event, data) {
        if (!this.io) {
            console.error('Socket.IO not initialized');
            return false;
        }
        try {
            this.io.emit(event, data);
            return true;
        }
        catch (error) {
            console.error('Error emitting to all:', error);
            return false;
        }
    }
    async cleanup() {
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
        }
        catch (error) {
            console.error('Error during SocketService cleanup:', error);
        }
    }
}
exports.default = SocketService.getInstance();
//# sourceMappingURL=socket.service.js.map