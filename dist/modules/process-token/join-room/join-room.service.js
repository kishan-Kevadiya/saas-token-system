"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../../lib/prisma"));
class JoinRoomService {
    async getCouterService(hashId) {
        const counter = await prisma_1.default.ht_counter_filter.findUnique({
            where: {
                hash_id: hashId,
                deleted_at: null,
            },
            select: {
                company_id: true,
                series: true,
                id: true,
            },
        });
        if (!counter)
            throw Error('Counter not found!');
        return {
            id: counter.id,
            series_ids: counter.series.split(','),
            company_id: counter.company_id,
        };
    }
}
exports.default = JoinRoomService;
//# sourceMappingURL=join-room.service.js.map