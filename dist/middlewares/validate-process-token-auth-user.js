"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProcessTokenAuthUser = void 0;
const verify_jwt_token_1 = require("../utils/verify-jwt-token");
const user_auth_service_1 = __importDefault(require("../modules/process-token/user-auth/user-auth.service"));
const validateProcessTokenAuthUser = async (req, res, next) => {
    try {
        const bearerHeader = req.headers.authorization;
        // Check if bearer is undefined
        if (typeof bearerHeader !== "undefined" && bearerHeader !== "") {
            // Split the space at the bearer
            const bearer = bearerHeader.split(" ");
            // Get token from string
            const bearerToken = bearer[1];
            // Verify the token0000000000
            const decodedToken = (0, verify_jwt_token_1.verifyToken)(bearerToken);
            const decodeTokenWithCounterId = (0, verify_jwt_token_1.verifyToken)(bearerToken);
            if (!decodedToken?.sub) {
                return res.sendStatus(401);
            }
            const authService = new user_auth_service_1.default();
            const loggedInUser = await authService.getUserDetailsByHashId(decodedToken.sub, decodeTokenWithCounterId.counter_id);
            if (!loggedInUser) {
                return res.sendStatus(401); // Unauthorized
            }
            res.locals.currentUser = loggedInUser;
            console.log("Calling next function from auth middleware");
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
exports.validateProcessTokenAuthUser = validateProcessTokenAuthUser;
//# sourceMappingURL=validate-process-token-auth-user.js.map