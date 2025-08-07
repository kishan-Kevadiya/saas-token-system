"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyTokenManager = exports.TokenStatus = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
function createDummyToken(index) {
    return {
        token_id: `tok_00${index}`,
        token_abbreviation: index % 2 === 0 ? "A" : "B",
        series_id: 1,
        token_number: 100 + index,
        token_date: new Date(),
        priority: index,
        token_status: TokenStatus.PENDING,
        token_series_number: index % 2 === 0 ? "A" : "B",
        token_calling_time: null,
        token_out_time: null,
        language_id: 1,
        company_id: index === 10 ? 5 : 50,
        customer_name: `Customer ${index}`,
        customer_mobile_number: `98765432${10 + index}`,
        token_generate_time: new Date()
    };
}
var TokenStatus;
(function (TokenStatus) {
    TokenStatus["PENDING"] = "PENDING";
    TokenStatus["CALLED"] = "CALLED";
    TokenStatus["COMPLETED"] = "COMPLETED";
    TokenStatus["CANCELLED"] = "CANCELLED";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
class TokenStore {
    tokens = [];
    addToken(token) {
        this.tokens.push(token);
    }
    getTokens() {
        return [...this.tokens];
    }
    clearTokens() {
        this.tokens = [];
    }
    isEmpty() {
        return this.tokens.length === 0;
    }
    count() {
        return this.tokens.length;
    }
}
class CompanyTokenManager {
    static instances = new Map();
    store;
    param;
    constructor(companyId, counterId) {
        this.param = {
            company_id: companyId,
            counter_id: counterId
        };
        // if (!CompanyTokenManager.instances.has(companyId)) {
        //   CompanyTokenManager.instances.set(companyId, new TokenStore());
        // }
        // this.store = CompanyTokenManager.instances.get(companyId)!;
    }
    addToken(token) {
        this.store.addToken(token);
    }
    getTokens() {
        return this.store.getTokens();
    }
    clearTokens() {
        this.store.clearTokens();
    }
    isEmpty() {
        return this.store.isEmpty();
    }
    count() {
        return this.store.count();
    }
    static getAllCompanyIds() {
        return Array.from(CompanyTokenManager.instances.keys());
    }
    static getStore(companyId) {
        return CompanyTokenManager.instances.get(companyId);
    }
    static clearCompany(companyId) {
        CompanyTokenManager.instances.delete(companyId);
    }
    static clearAll() {
        CompanyTokenManager.instances.clear();
    }
    async priorityTokens() {
        const seriesOfCounter = await prisma_1.default.ht_counter_filter.findUniqueOrThrow({
            where: {
                id: this.param.counter_id,
                deleted_at: null,
            },
            select: {
                series: true
            }
        });
        const seriesListOfCounter = seriesOfCounter.series.split(",").map(Number);
        const seriesList = await prisma_1.default.ht_series.findMany({
            where: {
                id: {
                    in: seriesListOfCounter
                },
                comapany_id: this.param.company_id,
                deleted_at: null
            },
            select: {
                abbreviation: true,
                priority: true
            }
        });
        // for (let i = 1; i <= 10; i++) {
        //   const token = createDummyToken(i);
        //   this.addToken(token);
        // }
        const tokenListData = this.getTokens();
        // console.log('tokenListData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', tokenListData)
        const filteredToken = tokenListData.filter((token) => {
            // console.log('token :>> ', token);
            if (token.company_id === this.param.company_id) {
                return token;
            }
        });
        console.log('filteredToken', filteredToken);
    }
}
exports.CompanyTokenManager = CompanyTokenManager;
//# sourceMappingURL=global-store.js.map