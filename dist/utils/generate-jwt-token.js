"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const generateJWTToken = (payload
// | AppointmentTokenPayload
) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.generateJWTToken = generateJWTToken;
//# sourceMappingURL=generate-jwt-token.js.map