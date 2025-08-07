"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../../lib/errors");
const prisma_1 = __importDefault(require("../../../lib/prisma"));
class LanguageService {
    async getLanguagesByCompanyId(hashId) {
        const company = await prisma_1.default.ht_company.findUnique({
            where: {
                hash_id: hashId,
                deleted_at: null,
            },
            select: {
                id: true,
            },
        });
        if (!company) {
            throw new errors_1.HttpNotFoundError('Company not found');
        }
        const languages = await prisma_1.default.ht_company_languages.findMany({
            where: {
                company_id: company.id,
                deleted_at: null,
            },
            select: {
                hash_id: true,
                languages: {
                    select: {
                        hash_id: true,
                        name: true,
                        code: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                languages: {
                    name: 'asc',
                },
            },
        });
        if (languages.length === 0) {
            throw new errors_1.HttpNotFoundError('No languages found for this company');
        }
        return this.mapLanguagesToDto(languages);
    }
    mapLanguagesToDto(languages) {
        return languages.map((language) => ({
            id: language.languages.hash_id,
            name: language.languages.name,
            code: language.languages.code,
            title: language.languages.title,
        }));
    }
}
exports.default = LanguageService;
//# sourceMappingURL=language.service.js.map