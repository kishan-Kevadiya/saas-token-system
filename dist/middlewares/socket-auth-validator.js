"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = exports.SocketUserValidators = void 0;
const validate_generate_token_user_1 = require("./validate-generate-token-user");
const socket_enum_1 = require("../enums/socket.enum");
exports.SocketUserValidators = {
    [socket_enum_1.SocketNamespace.GENERATE_TOKEN]: validate_generate_token_user_1.validateGenerateSocketTokenUser,
    [socket_enum_1.SocketNamespace.PROCESS_TOKEN]: validate_generate_token_user_1.validateGenerateSocketTokenUser,
};
const socketAuthMiddleware = (authModuleType) => {
    return async (socket, next) => {
        try {
            const token = socket.handshake.auth.token ?? socket.handshake.query.token;
            console.log('token', token);
            if (!token) {
                throw new Error('Authentication token missing');
            }
            console.log(authModuleType);
            const user = await exports.SocketUserValidators[authModuleType](token);
            socket.data.user = user;
            next();
        }
        catch (error) {
            next(new Error('Authentication failed'));
        }
    };
};
exports.socketAuthMiddleware = socketAuthMiddleware;
//# sourceMappingURL=socket-auth-validator.js.map