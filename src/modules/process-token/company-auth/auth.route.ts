import { Router } from "express";
import AuthController from "./auth.controller";
import RequestValidator from "@/middlewares/request-validator";
import { LoginInputDto } from "./dto/login.input.dto";
import { validateProcessTokenUser } from "@/middlewares/validate-process-token-user";

const auth: Router = Router();
const controller = new AuthController();

/**
 * processTokenUserLoginBody
 * @typedef {object} processTokenUserLoginBody
 * @property {string} asccode.required - asccode of user
 * @property {string} password.required - password of user
 */

/**
 * processTokenUserCity
 * @typedef {object} processTokenUserCity
 * @property {string} id - Unique identifier of the city
 * @property {string} name - Name of the city
 */

/**
 * processTokenUserState
 * @typedef {object} processTokenUserState
 * @property {string} id - Unique identifier of the state
 * @property {string} name - Name of the state
 */

/**
 * processTokenUserMainCompany
 * @typedef {object} processTokenUserMainCompany
 * @property {string} id - Unique identifier of the main company
 * @property {string} company_name - Name of the main company
 */

/**
 * processTokenCurrentUser
 * @typedef {object} processTokenCurrentUser
 * @property {string} id - Unique identifier of the user
 * @property {string} company_name - Name of the user's company
 * @property {string} fullname - Full name of the user
 * @property {string} email - Email address of the user
 * @property {string} contact_no - Contact number of the user
 * @property {string} username - Username of the user
 * @property {string} latitude - Latitude coordinate of the user's location
 * @property {string} longitude - Longitude coordinate of the user's location
 * @property {processTokenUserCity} city - City information
 * @property {processTokenUserState} state - State information
 * @property {processTokenUserMainCompany} main_company - Main company information
 * @property {number} appointment_Process - Indicates if appointment generation is enabled
 * @property {number} saturday_off - Indicates if Saturday is a non-working day
 * @property {number} sunday_off - Indicates if Sunday is a non-working day
 * @property {number} is_Process_token_sms - Indicates if token generation SMS is enabled
 * @property {number} is_print_token - Indicates if token printing is enabled
 * @property {number} is_download_token - Indicates if token download is enabled
 * @property {string} created_at - Account creation timestamp (ISO 8601 format)
 * @property {string} updated_at - Last update timestamp (ISO 8601 format)
 */

/**
 * processTokenUserLoginReponse
 * @typedef {object} processTokenUserLoginReponse
 * @property {string} token - Auth token
 * @property {processTokenCurrentUser} user - user detail
 */

/**
 * POST /process-token/auth/login
 * @summary Login customer
 * @tags Process token company auth
 * @param {processTokenUserLoginBody} request.body.required
 * @return {processTokenUserLoginReponse} 200 - loging successfully
 * @return 500 - Internal server error
 * @return 400 - Bad request - Validation errors
 */

auth.post('/login', RequestValidator.validate(LoginInputDto), controller.login);

/**
 * GET /process-token/auth/me
 * @security Authorization
 * @summary Get process token user details by token
 * @tags Process token company auth
 * @return {processTokenCurrentUser} 200 - User details fetched successfully
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 */
auth.get('/me', validateProcessTokenUser, controller.getUserDetailsByToken);

export default auth;
