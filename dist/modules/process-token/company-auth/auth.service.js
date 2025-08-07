"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../../lib/prisma"));
const log_message_decorator_1 = __importDefault(require("../../../decorators/log-message.decorator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generate_jwt_token_1 = require("../../../utils/generate-jwt-token");
const errors_1 = require("../../../lib/errors");
class AuthService {
    async fetchUserInfo(whereClause) {
        return await prisma_1.default.ht_company.findFirst({
            where: whereClause,
            include: {
                main_company: true,
                city: true,
                state: true
            }
        });
    }
    mapUserResponse(user) {
        return {
            id: user.id,
            hash_id: user.hash_id,
            company_name: user.company_name,
            fullname: user.fullname,
            email: user.email,
            contact_no: user.contact_no,
            username: user.username,
            latitude: user.latitude,
            longitude: user.longitude,
            city: user.city ?
                {
                    id: user.city.hash_id,
                    name: user.city.name
                }
                : null,
            state: user.state ?
                {
                    id: user.state.hash_id,
                    name: user.state.name
                }
                : null,
            main_company: user.main_company ?
                {
                    id: user.main_company.hash_id,
                    company_name: user.main_company.company_name
                }
                : null,
            appointment_generate: user.appointment_generate,
            saturday_off: user.saturday_off,
            sunday_off: user.sunday_off,
            is_generate_token_sms: user.is_generate_token_sms,
            is_print_token: user.is_print_token,
            is_download_token: user.is_download_token,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }
    async login(data) {
        const userInfo = await this.fetchUserInfo({
            asccode: data.asccode,
            deleted_at: null,
        });
        if (!userInfo) {
            throw new errors_1.HttpBadRequestError('Invalid credential!');
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, userInfo.password);
        if (!isPasswordValid) {
            throw new errors_1.HttpBadRequestError('Invalid credentials!');
        }
        const token = (0, generate_jwt_token_1.generateJWTToken)({
            sub: userInfo.hash_id,
            asccode: userInfo.asccode,
        });
        return {
            token,
            user: this.mapUserResponse(userInfo),
        };
    }
    async getUserDetailsByHashId(userId) {
        const userInfo = await this.fetchUserInfo({
            hash_id: userId,
            deleted_at: null
        });
        console.log('userInfo', userInfo);
        if (!userInfo) {
            return null;
        }
        return this.mapUserResponse(userInfo);
    }
}
exports.default = AuthService;
__decorate([
    (0, log_message_decorator_1.default)({
        message: 'Inside login method of AuthService',
    })
], AuthService.prototype, "login", null);
//# sourceMappingURL=auth.service.js.map