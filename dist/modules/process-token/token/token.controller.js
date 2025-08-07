"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../../../lib/api"));
const token_service_1 = __importDefault(require("./token.service"));
const axios_1 = require("axios");
class TokenController extends api_1.default {
    tokenService;
    constructor(tokenService) {
        super();
        this.tokenService = tokenService ?? new token_service_1.default();
    }
    updateTokenStatus = async (req, res, _next) => {
        try {
            await this.tokenService.updateTokenStatus(req.params.id, req.body, res.locals.currentUser);
            this.send(res, null, axios_1.HttpStatusCode.Ok, 'Token status updated successfully.');
        }
        catch (e) {
            _next(e);
        }
    };
}
exports.default = TokenController;
//# sourceMappingURL=token.controller.js.map