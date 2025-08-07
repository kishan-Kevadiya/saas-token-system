"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const join_room_service_1 = __importDefault(require("./join-room.service"));
class JoinRoomController {
    socket;
    namespace;
    joinRoomService;
    constructor(socket, namespace, joinRoomService) {
        this.socket = socket;
        this.namespace = namespace;
        this.joinRoomService = joinRoomService ?? new join_room_service_1.default();
    }
    joinRoom = async (data, callback) => {
        try {
            const series = await this.joinRoomService.getCouterService(data.counter_id);
            for (const id of series.series_ids) {
                const roomId = `company:${String(series.company_id)}:series:${String(id)}`;
                await this.socket.join(roomId);
            }
            if (callback) {
                callback(null, {
                    success: true,
                    message: 'Successfully joined rooms',
                    roomsJoined: series.series_ids.map((id) => `company:${String(series.company_id)}:series:${String(id)}`),
                });
            }
        }
        catch (error) {
            console.error('Error joining room:', error);
            if (callback) {
                callback({
                    success: false,
                    error: error.message,
                }, null);
            }
        }
    };
}
exports.default = JoinRoomController;
//# sourceMappingURL=join-room.controller.js.map