"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const series_route_1 = __importDefault(require("./series/series.route"));
const language_route_1 = __importDefault(require("./language/language.route"));
// import token from './token/token.route';
const auth_route_1 = __importDefault(require("./auth/auth.route"));
const generateTokenRoutes = (0, express_1.Router)();
generateTokenRoutes.use('/auth', auth_route_1.default);
generateTokenRoutes.use('/language', language_route_1.default);
generateTokenRoutes.use('/series', series_route_1.default);
// generateTokenRoutes.use('/token', token);
exports.default = generateTokenRoutes;
//# sourceMappingURL=route.js.map