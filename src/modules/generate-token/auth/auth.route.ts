import { Router } from "express";
import AuthController from "./auth.controller";
import RequestValidator from "@/middlewares/request-validator";
import { LoginInputDto } from "./dto/login.input.dto";
import { validateGenerateTokenUser } from "@/middlewares/validate-generate-token-user";

const auth: Router = Router();
const controller = new AuthController();

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

auth.post('/login', RequestValidator.validate(LoginInputDto), controller.login);

/**
 * GET /generate-token/auth/me
 * @security Authorization
 * @summary Get generate token user details by token
 * @tags generate token company auth
 * @return {TokenGenerateCurrentUser} 200 - User details fetched successfully
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 */
auth.get('/me', validateGenerateTokenUser, controller.getUserDetailsByToken);

export default auth;
