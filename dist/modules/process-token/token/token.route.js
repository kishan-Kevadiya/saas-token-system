"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_validator_1 = __importDefault(require("../../../middlewares/request-validator"));
const token_controller_1 = __importDefault(require("./token.controller"));
const token_update_status_input_dto_1 = require("./dto/token-update-status-input.dto");
const token = (0, express_1.Router)();
const controller = new token_controller_1.default();
/**
 * TokenResponse
 * @typedef {object} TokenResponse
 * @property {string} hash_id - hash id of the token
 * @property {string} counter_id - hash id of the counter
 * @property {('PENDING' | 'HOLD' | 'ACTIVE' | 'TRANSFER' | 'WAITING' | 'COMPLETED')} token_status - token status
 */
/**
 * TokenStatusInputBody
 * @typedef {object} TokenStatusInputBody
 * @property {('PENDING' | 'HOLD' | 'ACTIVE' | 'TRANSFER' | 'WAITING' | 'COMPLETED')} status - token status
 * @property {string} counter_id - hash id of the counter
 * @property {string} reason - reason for holding the token
 */
/**
 * POST /process-token/token-status/{id}
 * @summary Update token status
 * @tags token-status
 * @param {string} id.path.required - hash id of the token
 * @param {TokenStatusInputBody} request.body.required
 * @return {TokenResponse} 200 - Token status updated successfully
 * @return 400 - Bad request
 * @return 401 - Unauthorized
 * @return 404 - Not found
 * @return 500 - Internal server error
 */
token.post('/:id', request_validator_1.default.validate(token_update_status_input_dto_1.tokenStatusUpdateDto), controller.updateTokenStatus);
exports.default = token;
//# sourceMappingURL=token.route.js.map