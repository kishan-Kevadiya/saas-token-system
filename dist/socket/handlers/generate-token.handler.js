"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenSocketHandlers = generateTokenSocketHandlers;
function generateTokenSocketHandlers(nsp, io, socket) {
    socket.on('message', async (data, callback) => {
        console.log('data', data);
    });
}
//# sourceMappingURL=generate-token.handler.js.map