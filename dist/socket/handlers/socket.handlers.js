"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocketHandlers {
    registerHandlers(socket, io) {
        // Join user to their personal room
        // socket.join(`user_${socket.data.userId}`);
        // Handle room joining
        socket.on('joinRoom', async (roomId) => {
            await socket.join(roomId);
            socket.data.rooms.push(roomId);
            socket.to(roomId).emit('userUpdate', {
                userId: socket.data.userId,
                status: 'online',
            });
        });
        // Handle room leaving
        socket.on('leaveRoom', async (roomId) => {
            await socket.leave(roomId);
            socket.data.rooms = socket.data.rooms.filter((room) => room !== roomId);
            socket.to(roomId).emit('userUpdate', {
                userId: socket.data.userId,
                status: 'offline',
            });
            console.log(`User ${socket.data.username} left room ${roomId}`);
        });
        // Handle message sending
        socket.on('sendMessage', (data) => {
            const messageData = {
                id: Date.now().toString(), // In real app, use proper ID generation
                content: data.content,
                sender: socket.data.username,
                room: data.room,
                timestamp: new Date(),
            };
            // Emit to all users in the room
            io.to(data.room).emit('message', messageData);
            console.log(`Message sent by ${socket.data.username} to room ${data.room}`);
        });
    }
}
exports.default = new SocketHandlers();
//# sourceMappingURL=socket.handlers.js.map