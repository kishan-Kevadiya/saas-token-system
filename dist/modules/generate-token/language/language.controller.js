"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const language_service_1 = __importDefault(require("./language.service"));
const api_1 = __importDefault(require("../../../lib/api"));
class LanguageController extends api_1.default {
    languageService;
    constructor(languageService) {
        super();
        this.languageService = languageService ?? new language_service_1.default();
    }
    getLanguages = async (req, res, next) => {
        try {
            const languages = await this.languageService.getLanguagesByCompanyId(req.params.company_id);
            this.send(res, languages, axios_1.HttpStatusCode.Ok, 'Languages retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = LanguageController;
//# sourceMappingURL=language.controller.js.map