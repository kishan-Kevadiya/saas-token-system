"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../../lib/prisma"));
class CounterService {
    async getCounterByCompanyId(currentUser) {
        console.log('currentUser.id :>> ', currentUser.id);
        const counterResult = await prisma_1.default.ht_counter_filter.findMany({
            where: {
                company_id: currentUser.id,
                deleted_at: null,
            },
            select: {
                hash_id: true,
                counter_no: true,
                counter_name: true,
            },
        });
        console.log('counterResult :>> ', counterResult);
        return {
            counter: counterResult.map((counter) => ({
                id: counter.hash_id,
                counter_no: counter.counter_no,
                counter_name: counter.counter_name,
            })),
        };
    }
}
exports.default = CounterService;
//# sourceMappingURL=counter.service.js.map