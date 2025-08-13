import { Router } from 'express';
import RequestValidator from '@/middlewares/request-validator';
import TokenController from './token.controller';
import { TokenStatusUpdateDto } from './dto/token-update-status-input.dto';

const token: Router = Router();
const controller = new TokenController();

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
token.post('/',
  RequestValidator.validate(TokenStatusUpdateDto),
  controller.updateTokenStatus
);

export default token;
