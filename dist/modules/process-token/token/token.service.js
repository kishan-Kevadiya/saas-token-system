"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_service_1 = __importDefault(require("../../../socket/socket.service"));
const redis_token_manager_1 = require("../../../utils/redis-token-manager");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../lib/prisma"));
const email_notifications_service_1 = __importDefault(require("../email-notifications/email-notifications.service"));
const errors_1 = require("../../../lib/errors");
class TokenService {
    emailNotificationService;
    constructor(emailNotificationService) {
        this.emailNotificationService =
            emailNotificationService ?? new email_notifications_service_1.default();
    }
    async transferToken(tokenId, transferCounterId, transferDepartmentId, tokenManager, currentUser) {
        const { counter: { hash_id: counterHashId }, company: { hash_id: companyHashId } } = currentUser;
        // Fetch counter settings, token, department, and counter details in parallel
        const [counterSettings, tokenDetails, departmentDetails, transferCounterDetails] = await Promise.all([
            prisma_1.default.ht_counter_filter.findFirst({
                where: { hash_id: counterHashId, deleted_at: null },
                select: {
                    transfer_token_wise: true,
                    transfer_token_method: true,
                    transfer_counter_id: true,
                    transfer_department_id: true,
                }
            }),
            prisma_1.default.tokens.findUniqueOrThrow({
                where: { hash_id: tokenId, deleted_at: null },
                select: {
                    id: true,
                    token_series: {
                        select: { hash_id: true }
                    }
                }
            }),
            transferDepartmentId
                ? prisma_1.default.ht_department.findUniqueOrThrow({
                    where: { hash_id: transferDepartmentId, deleted_at: null },
                    select: { id: true }
                })
                : Promise.resolve(null),
            prisma_1.default.ht_counter_filter.findUniqueOrThrow({
                where: { hash_id: transferCounterId, deleted_at: null },
                select: { id: true, hash_id: true, counter_no: true }
            })
        ]);
        if (!counterSettings) {
            throw new Error("Counter settings not found.");
        }
        const tokenUpdateData = {
            token_status: client_1.TokenStatus.TRANSFER,
            updated_at: new Date()
        };
        if (counterSettings.transfer_token_wise === client_1.TransferTokenWise.COUNTER) {
            if (counterSettings.transfer_token_method === client_1.TransferTokenMethod.DIRECT) {
                tokenUpdateData.token_transfer_counter_id = counterSettings.transfer_counter_id;
            }
            else {
                if (!transferCounterDetails) {
                    throw new errors_1.HttpBadRequestError("Transfer counter details not found.");
                }
                tokenUpdateData.token_transfer_counter_id = transferCounterDetails.id;
            }
        }
        else if (counterSettings.transfer_token_wise === client_1.TransferTokenWise.DEPARTMENT) {
            if (counterSettings.transfer_token_method === client_1.TransferTokenMethod.DIRECT) {
                tokenUpdateData.token_transfer_department_id = counterSettings.transfer_department_id;
            }
            else {
                if (!departmentDetails) {
                    throw new errors_1.HttpBadRequestError("Transfer department details not found.");
                }
                tokenUpdateData.token_transfer_department_id = departmentDetails?.id;
            }
        }
        else {
            throw new Error("Invalid transfer_token_wise setting.");
        }
        await prisma_1.default.tokens.update({
            where: { id: tokenDetails.id },
            data: {
                ...tokenUpdateData,
            }
        });
        await tokenManager.updateToken(tokenId, {
            token_id: tokenId,
            token_status: client_1.TokenStatus.TRANSFER,
            transfer_counter: {
                id: transferCounterDetails.id,
                hash_id: transferCounterDetails.hash_id,
                counter_no: transferCounterDetails.counter_no
            }
        });
        const roomName = `company:${companyHashId}:series:${tokenDetails.token_series.hash_id}`;
        this.emitRoomRefresh(tokenId, roomName);
    }
    emitRoomRefresh(tokenId, roomName, message = 'add token') {
        socket_service_1.default.emitToRoom(roomName, 'refresh', {
            token_id: tokenId,
            message,
        });
    }
    async updateTokenStatus(tokenId, data, currentUser) {
        const tokenManager = new redis_token_manager_1.CompanyTokenManager(currentUser.company.hash_id, currentUser.counter.hash_id);
        switch (data.status) {
            case 'NEXT':
                const counterDetail = await prisma_1.default.ht_counter_filter.findUniqueOrThrow({
                    where: {
                        hash_id: currentUser.counter.hash_id,
                        deleted_at: null
                    },
                    select: {
                        id: true,
                        transfer_token_next_click: true,
                        company: {
                            select: {
                                logo_url: true,
                                ht_button_settings: {
                                    select: {
                                        minutes_of_calling_before: true
                                    }
                                }
                            }
                        }
                    }
                });
                if (!counterDetail.transfer_token_next_click) {
                    if (tokenId) {
                        const tokenDetails = await prisma_1.default.tokens.findUniqueOrThrow({
                            where: {
                                hash_id: tokenId,
                                deleted_at: null
                            },
                            select: {
                                id: true
                            }
                        });
                        await prisma_1.default.tokens.update({
                            where: {
                                id: tokenDetails.id
                            },
                            data: {
                                token_status: client_1.TokenStatus.COMPLETED,
                                updated_at: new Date(),
                            }
                        });
                    }
                    const tokenData = await tokenManager.priorityTokens();
                    if (tokenData.length === 0) {
                        return tokenData;
                    }
                    const priorityToken = tokenData[0];
                    let nextPriorityToken = null;
                    if (tokenData.length > 1) {
                        nextPriorityToken = tokenData[1];
                    }
                    let clonePriorityToken = structuredClone(priorityToken);
                    clonePriorityToken.token_status = client_1.TokenStatus.ACTIVE;
                    await tokenManager.updateToken(clonePriorityToken.token_id, clonePriorityToken);
                    await prisma_1.default.tokens.update({
                        where: {
                            hash_id: priorityToken.token_id
                        },
                        data: {
                            token_status: client_1.TokenStatus.ACTIVE,
                            token_calling_time: new Date(),
                            updated_at: new Date(),
                        }
                    });
                    const roomName = `company:${priorityToken.company.hash_id}:series:${priorityToken.series.hash_id}`;
                    this.emitRoomRefresh(tokenId, roomName);
                    const formData = JSON.parse(priorityToken.form_data || '{}');
                    // await this.emailNotificationService.sendTokenNextNotification(
                    //   formData.email,
                    //   priorityToken.customer_name ?? 'user',
                    //   priorityToken.token_series_number,
                    //   Number(counterDetail.company.ht_button_settings[0].minutes_of_calling_before ?? 10),
                    //   currentUser.company.company_name,
                    //   counterDetail.company.logo_url ?? ''
                    // );
                    // if (nextPriorityToken) {
                    //   this.emailNotificationService.sendTokenNextNotification(
                    //     formData.email,
                    //     nextPriorityToken.customer_name ?? 'user',
                    //     nextPriorityToken.token_series_number,
                    //     Number(counterDetail.company.ht_button_settings[0].minutes_of_calling_before ?? 10),
                    //     currentUser.company.company_name,
                    //     counterDetail.company.logo_url ?? ''
                    //   );
                    // }
                    return {
                        token: clonePriorityToken,
                    };
                }
                else {
                    if (!data.transfer_counter_id) {
                        throw new errors_1.HttpBadRequestError('Transfer counter ID is required');
                    }
                    await this.transferToken(tokenId, data.transfer_counter_id, data.transfer_department_id, tokenManager, currentUser);
                }
                break;
            case 'TRANSFER':
                if (!data.transfer_counter_id) {
                    throw new errors_1.HttpBadRequestError('Transfer counter ID is required');
                }
                await this.transferToken(tokenId, data.transfer_counter_id, data.transfer_department_id, tokenManager, currentUser);
                break;
        }
    }
}
exports.default = TokenService;
//# sourceMappingURL=token.service.js.map