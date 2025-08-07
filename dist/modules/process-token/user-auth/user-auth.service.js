"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../../lib/errors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generate_jwt_token_1 = require("../../../utils/generate-jwt-token");
const prisma_1 = __importDefault(require("../../../lib/prisma"));
class UserAuthService {
    async fetchUserInfo(whereClause) {
        return await prisma_1.default.ht_users.findFirst({
            where: whereClause,
            include: {
                ht_company: {
                    select: {
                        ht_counter_filter: true,
                    },
                },
                ht_department: true,
            },
        });
    }
    mapUserResponse(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            contact_no: user.contact_no,
            username: user.username,
            data: user.data ?? null,
            counter: user.counter ?? null,
            ip: user.ip ?? null,
            is_active: user.is_active ?? 1,
            counter_id: user.counter_id,
            counter_details: {
                id: user.counter_details.id,
                hash_id: user.counter_details.hash_id,
                counter_name: user.counter_details.counter_name,
            },
            company: user.ht_company
                ? {
                    id: user.ht_company.id,
                    hash_id: user.ht_company.hash_id,
                    company_name: user.ht_company.company_name,
                }
                : null,
            department: user.ht_department
                ? {
                    id: user.ht_department.hash_id,
                    english_name: user.ht_department.english_name,
                    dept_hindi_name: user.ht_department.dept_hindi_name,
                    dept_regional_name: user.ht_department.dept_regional_name,
                }
                : null,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
    async login(data, currentUser) {
        const userInfo = await this.fetchUserInfo({
            username: data.username,
            company_id: currentUser.id,
            deleted_at: null,
        });
        const counterResult = await prisma_1.default.ht_counter_filter.findUniqueOrThrow({
            where: {
                hash_id: data.counter_id,
                company_id: currentUser.id,
                deleted_at: null,
            },
            select: {
                id: true,
                hash_id: true,
                counter_name: true
            },
        });
        if (!userInfo) {
            throw new errors_1.HttpBadRequestError("Invalid credentials!");
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, userInfo.password);
        if (!isPasswordValid) {
            throw new errors_1.HttpBadRequestError("Invalid credentials!");
        }
        const token = (0, generate_jwt_token_1.generateJWTToken)({
            sub: userInfo.hash_id,
            username: userInfo.username,
            counter_id: counterResult.hash_id,
        });
        return {
            token,
            user: this.mapUserResponse({ ...userInfo, counter_details: counterResult }),
        };
    }
    async getUserDetailsByHashId(userId, counterId) {
        const userInfo = await this.fetchUserInfo({
            hash_id: userId,
            deleted_at: null,
        });
        let counterResult;
        if (counterId) {
            counterResult = await prisma_1.default.ht_counter_filter.findUniqueOrThrow({
                where: {
                    hash_id: counterId,
                    deleted_at: null,
                },
                select: {
                    id: true,
                    hash_id: true,
                    counter_name: true,
                },
            });
        }
        if (!userInfo) {
            return null;
        }
        return this.mapUserResponse({ ...userInfo, counter_details: counterResult });
    }
}
exports.default = UserAuthService;
//# sourceMappingURL=user-auth.service.js.map