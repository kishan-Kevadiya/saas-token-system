import { Router } from 'express';
import RequestValidator from '@/middlewares/request-validator';
import TokenController from './token.controller';
import { TokenStatusUpdateDto } from './dto/token-update-status-input.dto';

const token: Router = Router();
const controller = new TokenController();



/**
 * TokenResponse
 * @typedef {object} TokenResponse
 * @property {string} token_id - Hash id of the token
 * @property {string} token_abbreviation - Abbreviation of the token
 * @property {string} series_id - Hash id of the series
 * @property {number} token_number - Sequential token number
 * @property {string} token_date - Date of the token (ISO string)
 * @property {number} priority - Priority of the token
 * @property {string} counter_id - Hash id of the counter
 * @property {string} user_id - Hash id of the user
 * @property {string} token_series_number - Series number of the token
 * @property {string} token_calling_time - Token calling timestamp (ISO string)
 * @property {string} token_out_time - Token out timestamp (ISO string)
 * @property {string} language_id - Language id
 * @property {string} company_id - Company id
 * @property {('PENDING' | 'HOLD' | 'ACTIVE' | 'TRANSFER' | 'WAITING' | 'COMPLETED')} token_status - Token status
 * @property {string} transfer_counter_id - Hash id of transfer counter
 * @property {string} transfer_department_id - Hash id of transfer department
 * @property {string} customer_mobile_number - Customer mobile number
 * @property {string} customer_name - Customer name
 * @property {string} token_generate_time - Token generation timestamp (ISO string)
 * @property {string} form_data - Form data in JSON string
 * @property {string} hold_in_time - Hold in timestamp (ISO string)
 * @property {string} hold_out_time - Hold out timestamp (ISO string)
 * @property {string} time_taken - Time taken in HH:MM:SS format
 */

/**
 * TokenStatusInputBody
 * @typedef {object} TokenStatusInputBody
 * @property {('PENDING' | 'HOLD' | 'ACTIVE' | 'TRANSFER' | 'WAITING' | 'COMPLETED')} status.required - token status
 * @property {string} transfer_counter_id - hash id of the transfer counter
 * @property {string} transfered_token_id - hash id of the transfet token 
 * @property {string} transfer_department_id - hash id of the transfer department 
 * @property {string} filter_series_id - hash id of series id
 * @property {string} reason - reason for holding the token
 */

/**
 * POST /process-token/token-status
 * @summary Update token status
 * @tags token-status
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
