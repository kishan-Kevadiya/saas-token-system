"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_auth_controller_1 = __importDefault(require("./user-auth.controller"));
const request_validator_1 = __importDefault(require("../../../middlewares/request-validator"));
const login_input_dto_1 = require("./dto/login.input.dto");
const validate_process_token_auth_user_1 = require("../../../middlewares/validate-process-token-auth-user");
const userAuth = (0, express_1.Router)();
const controller = new user_auth_controller_1.default();
/**
 * processTokenUserAuthLoginBody
 * @typedef {object} processTokenUserAuthLoginBody
 * @property {string} username.required - asccode of user
 * @property {string} password.required - password of user
 * @property {string} counter_id.required - counter id of counter
 */
/**
 * processTokenUserCompany
 * @typedef {object} processTokenUserCompany
 * @property {string} id - Unique identifier of the main company
 * @property {string} company_name - Name of the main company
 */
/**
 * processTokenUserDepartment
 * @typedef {object} processTokenUserDepartment
 * @property {string} id - Unique identifier of the main company
 * @property {string} dept_english_name - Name of the main company
 * @property {string} dept_hindi_name - Name of the main company
 * @property {string} dept_regional_name - Name of the main company
 */
/**
 * processTokenCurrentUserAuth
 * @typedef {object} processTokenCurrentUserAuth
 * @property {string} id - Unique identifier of the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address of the user
 * @property {string} contact_no - Contact number of the user
 * @property {string} username - Username of the user
 * @property {string} data - date of the user
 * @property {string} counter - counter of the user
 * @property {string} ip - ip of the user
 * @property {number} is_active - ip of the user
 * @property {processTokenUserCompany} company - company information
 * @property {processTokenUserDepartment} department - department information
 * @property {string} created_at - Account creation timestamp (ISO 8601 format)
 * @property {string} updated_at - Last update timestamp (ISO 8601 format)
 */
/**
 * processTokenUserAuthLoginReponse
 * @typedef {object} processTokenUserAuthLoginReponse
 * @property {string} token - Auth token
 * @property {processTokenCurrentUserAuth} user - user detail
 */
/**
 * POST /process-token/user-auth/login
 * @security Authorization
 * @summary Login customer
 * @tags User auth login
 * @param {processTokenUserAuthLoginBody} request.body.required
 * @return {processTokenUserAuthLoginReponse} 200 - loging successfully
 * @return 500 - Internal server error
 * @return 400 - Bad request - Validation errors
 */
userAuth.post('/login', 
// validateProcessTokenUser,
request_validator_1.default.validate(login_input_dto_1.LoginInputDto), controller.login);
/**
 * GET /process-token/user-auth/me
 * @security Authorization
 * @summary Get process token user details by token
 * @tags User auth login
 * @return {processTokenUserAuthLoginReponse} 200 - User details fetched successfully
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 */
userAuth.get('/me', validate_process_token_auth_user_1.validateProcessTokenAuthUser, controller.getUserDetailsByToken);
exports.default = userAuth;
//# sourceMappingURL=user-auth.route.js.map