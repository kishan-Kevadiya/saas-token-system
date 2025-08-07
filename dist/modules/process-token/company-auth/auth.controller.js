"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../../../lib/api"));
const auth_service_1 = __importDefault(require("./auth.service"));
const axios_1 = require("axios");
class AuthController extends api_1.default {
    authService;
    constructor(authService) {
        super();
        this.authService = authService ?? new auth_service_1.default();
    }
    login = async (req, res, next) => {
        try {
            const user = await this.authService.login(req.body);
            this.send(res, user, axios_1.HttpStatusCode.Ok, 'Login successfully');
        }
        catch (e) {
            next(e);
        }
    };
    getUserDetailsByToken = async (_req, res, next) => {
        try {
            const currentUser = res.locals.currentUser;
            const userResponse = this.authService.mapUserResponse(currentUser);
            return this.send(res, userResponse, axios_1.HttpStatusCode.Ok, "Authorized user details fetched successfully");
        }
        catch (e) {
            next(e);
        }
    };
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map