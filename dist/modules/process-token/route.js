"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./company-auth/auth.route"));
const counter_route_1 = __importDefault(require("./counter/counter.route"));
const validate_process_token_user_1 = require("../../middlewares/validate-process-token-user");
const user_auth_route_1 = __importDefault(require("./user-auth/user-auth.route"));
const processTokenRoutes = (0, express_1.Router)();
processTokenRoutes.use('/auth', auth_route_1.default);
processTokenRoutes.use('/user-auth', user_auth_route_1.default);
processTokenRoutes.use('/counter', validate_process_token_user_1.validateProcessTokenUser, counter_route_1.default);
exports.default = processTokenRoutes;
//# sourceMappingURL=route.js.map