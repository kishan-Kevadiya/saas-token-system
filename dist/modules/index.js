"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route_1 = __importDefault(require("./generate-token/route"));
const route_2 = __importDefault(require("./process-token/route"));
const router = (0, express_1.Router)();
router.use('/generate-token', route_1.default);
router.use('/process-token', route_2.default);
exports.default = router;
//# sourceMappingURL=index.js.map