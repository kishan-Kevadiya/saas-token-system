"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const request_validator_1 = __importDefault(require("../../../middlewares/request-validator"));
const login_input_dto_1 = require("./dto/login.input.dto");
const validate_generate_token_user_1 = require("../../../middlewares/validate-generate-token-user");
const auth = (0, express_1.Router)();
const controller = new auth_controller_1.default();
/**
 * generateTokenUserLoginBody
 * @typedef {object} generateTokenUserLoginBody
 * @property {string} asccode.required - asccode of user
 * @property {string} password.required - password of user
 */
/**
 * GenerateTokenUserCity
 * @typedef {object} GenerateTokenUserCity
 * @property {string} id - Unique identifier of the city
 * @property {string} name - Name of the city
 */
/**
 * GenerateTokenUserState
 * @typedef {object} GenerateTokenUserState
 * @property {string} id - Unique identifier of the state
 * @property {string} name - Name of the state
 */
/**
 * GenerateTokenUserMainCompany
 * @typedef {object} GenerateTokenUserMainCompany
 * @property {string} id - Unique identifier of the main company
 * @property {string} company_name - Name of the main company
 */
/**
 * TokenGenerateCurrentUser
 * @typedef {object} TokenGenerateCurrentUser
 * @property {string} id - Unique identifier of the user
 * @property {string} company_name - Name of the user's company
 * @property {string} fullname - Full name of the user
 * @property {string} email - Email address of the user
 * @property {string} contact_no - Contact number of the user
 * @property {string} username - Username of the user
 * @property {string} latitude - Latitude coordinate of the user's location
 * @property {string} longitude - Longitude coordinate of the user's location
 * @property {GenerateTokenUserCity} city - City information
 * @property {GenerateTokenUserState} state - State information
 * @property {GenerateTokenUserMainCompany} main_company - Main company information
 * @property {number} appointment_generate - Indicates if appointment generation is enabled
 * @property {number} saturday_off - Indicates if Saturday is a non-working day
 * @property {number} sunday_off - Indicates if Sunday is a non-working day
 * @property {number} is_generate_token_sms - Indicates if token generation SMS is enabled
 * @property {number} is_print_token - Indicates if token printing is enabled
 * @property {number} is_download_token - Indicates if token download is enabled
 * @property {string} created_at - Account creation timestamp (ISO 8601 format)
 * @property {string} updated_at - Last update timestamp (ISO 8601 format)
 */
/**
 * GenerateTokenUserLoginResponse
 * @typedef {object} GenerateTokenUserLoginResponse
 * @property {string} token - JWT or authentication token
 * @property {TokenGenerateCurrentUser} user - Authenticated user details
 */
/**
 * generateTokenUserLoginReponse
 * @typedef {object} generateTokenUserLoginReponse
 * @property {string} token - Auth token
 * @property {CompaniesUser} user - user detail
 */
/**
 * POST /generate-token/auth/login
 * @summary Login customer
 * @tags generate token company auth
 * @param {generateTokenUserLoginBody} request.body.required
 * @return {generateTokenUserLoginReponse} 200 - loging successfully
 * @return 500 - Internal server error
 * @return 400 - Bad request - Validation errors
 */
auth.post('/login', request_validator_1.default.validate(login_input_dto_1.LoginInputDto), controller.login);
/**
 * GET /generate-token/auth/me
 * @security Authorization
 * @summary Get generate token user details by token
 * @tags generate token company auth
 * @return {TokenGenerateCurrentUser} 200 - User details fetched successfully
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 */
auth.get('/me', validate_generate_token_user_1.validateGenerateTokenUser, controller.getUserDetailsByToken);
exports.default = auth;
//# sourceMappingURL=auth.route.js.map