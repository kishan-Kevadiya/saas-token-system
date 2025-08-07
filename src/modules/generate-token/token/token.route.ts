// token.routes.ts
import { Router } from 'express';
import TokenController from './token.controller';
import { GenerateTokenCreateInputDto } from './dto/token.dto';
import RequestValidator from '@/middlewares/request-validator';

const token: Router = Router();
const controller = new TokenController();

/**
 * Token Response
 * @typedef {object} TokenResponse
 * @property {string} id - hash id of token
 * @property {string} hash_id - hash id of token
 * @property {string} token_series_number - full token series number (e.g., "A-001")
 * @property {string} token_series - token series abbreviation
 * @property {number} token_number - token number
 * @property {string} token_status - token status (PENDING, CALLED, COMPLETED, CANCELLED)
 * @property {string} generate_token_time - token generation timestamp
 */

/**
 * Token List Response
 * @typedef {object} TokenListResponse
 * @property {string} id - hash id of token
 * @property {string} hash_id - hash id of token
 * @property {string} token_series_number - full token series number
 * @property {string} token_series - token series abbreviation
 * @property {number} token_number - token number
 * @property {string} token_status - token status
 * @property {string} customer_name - customer name
 * @property {string} customer_moblie_number - customer mobile number
 * @property {string} language_id - language hash id
 * @property {number} priority - token priority
 * @property {string} token_date - token date
 * @property {string} generate_token_time - token generation timestamp
 * @property {object|null} ht_appointment_token_form_data - form data associated with token
 * @property {object} ht_appointment_token_form_data.form_data - actual form data
 */

/**
 * Generate Token Request
 * @typedef {object} GenerateTokenRequest
 * @property {string} series_id.required - hash id of series
 * @property {string} company_id.required - hash id of company
 * @property {string} language_id.required - hash id of language
 * @property {string} name - customer name
 * @property {string} mobile_number - customer mobile number
 * @property {object} form_data - form data object
 */

/**
 * POST /generate-token/token
 * @summary Generate a new token
 * @tags token
 * @security Authorization
 * @param {GenerateTokenRequest} request.body.required - Token generation data
 * @return {TokenResponse} 200 - Token generated successfully
 * @return 400 - Bad request (validation error, business hours, token limit exceeded)
 * @return 401 - Unauthorized
 * @return 404 - Company, series, or language not found
 * @return 500 - Internal server error
 */
token.post(
  '/',
  RequestValidator.validate(GenerateTokenCreateInputDto),
  controller.generateToken
);

/**
 * GET /generate-token/token/{company_id}
 * @summary Get all tokens for a company
 * @tags token
 * @security Authorization
 * @param {string} company_id.path.required - hash id of company
 * @param {string} date.query - date filter (YYYY-MM-DD format)
 * @return {TokenListResponse[]} 200 - Tokens retrieved successfully
 * @return 401 - Unauthorized
 * @return 404 - Company not found
 * @return 500 - Internal server error
 */
token.get('/:company_id', controller.getTokensByCompany);

export default token;
