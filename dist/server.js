"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const app = new app_1.default();
const server = app.httpServer;
app.connections().catch((e) => {
    throw e;
});
exports.default = server;
//# sourceMappingURL=server.js.map