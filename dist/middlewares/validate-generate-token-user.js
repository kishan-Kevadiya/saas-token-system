"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGenerateSocketTokenUser = exports.validateGenerateTokenUser = void 0;
const auth_service_1 = __importDefault(require("../modules/process-token/company-auth/auth.service"));
const verify_jwt_token_1 = require("../utils/verify-jwt-token");
const validateGenerateTokenUser = async (req, res, next) => {
    try {
        const bearerHeader = req.headers.authorization;
        // Check if bearer is undefined
        if (typeof bearerHeader !== 'undefined' && bearerHeader !== '') {
            // Split the space at the bearer
            const bearer = bearerHeader.split(' ');
            // Get token from string
            const bearerToken = bearer[1];
            // Verify the token
            const decodedToken = (0, verify_jwt_token_1.verifyToken)(bearerToken);
            if (!decodedToken?.sub) {
                return res.sendStatus(401); // Unauthorized
            }
            const authService = new auth_service_1.default();
            const loggedInUser = await authService.getUserDetailsByHashId(decodedToken.sub);
            if (!loggedInUser) {
                return res.sendStatus(401); // Unauthorized
            }
            res.locals.currentUser = loggedInUser;
            console.log('Calling next function from auth middleware');
            next(); // Continue to the next middleware or route handler
        }
        else {
            return res.sendStatus(401); // Unauthorized
        }
    }
    catch (e) {
        console.log(e);
        return res.sendStatus(401); // Unauthorized on error
    }
};
exports.validateGenerateTokenUser = validateGenerateTokenUser;
const validateGenerateSocketTokenUser = async (token) => {
    const decodedToken = (0, verify_jwt_token_1.verifyToken)(token);
    if (!decodedToken?.sub) {
        throw new Error('Unauthorized user');
    }
    const authService = new auth_service_1.default();
    const loggedInUser = await authService.getUserDetailsByHashId(decodedToken.sub);
    if (loggedInUser === null) {
        throw new Error('Unauthorized user');
    }
    return loggedInUser;
};
exports.validateGenerateSocketTokenUser = validateGenerateSocketTokenUser;
//# sourceMappingURL=validate-generate-token-user.js.map