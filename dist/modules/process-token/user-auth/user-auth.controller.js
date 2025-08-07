"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../../../lib/api"));
const user_auth_service_1 = __importDefault(require("./user-auth.service"));
const axios_1 = require("axios");
const redis_token_manager_1 = require("../../../utils/redis-token-manager");
class UserAuthController extends api_1.default {
    userAuthService;
    constructor(userAuthService) {
        super();
        this.userAuthService = userAuthService ?? new user_auth_service_1.default();
    }
    login = async (req, res, next) => {
        try {
            const manager = new redis_token_manager_1.CompanyTokenManager("728af3db-b272-43ed-9883-919f79019a65", "24b82329-87f2-42e1-904b-6d9fd9023923");
            const result = await manager.priorityTokens();
            console.log('result', result);
            // const user = await this.userAuthService.login(req.body, res.locals.currentUser);
            this.send(res, result, axios_1.HttpStatusCode.Ok, 'Login successfully');
        }
        catch (e) {
            next(e);
        }
    };
    getUserDetailsByToken = async (_req, res, next) => {
        try {
            const currentUser = res.locals.currentUser;
            const userResponse = this.userAuthService.mapUserResponse(currentUser);
            return this.send(res, userResponse, axios_1.HttpStatusCode.Ok);
        }
        catch (e) {
            next(e);
        }
    };
}
exports.default = UserAuthController;
//# sourceMappingURL=user-auth.controller.js.map