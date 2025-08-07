import { Router } from "express";
import CounterController from "./counter.controller";
import { validateProcessTokenAuthUser } from "@/middlewares/validate-process-token-auth-user";
import { validateProcessTokenUser } from "@/middlewares/validate-process-token-user";

const counter: Router = Router();
const controller = new CounterController();

/**
 * CounterListForDropDownList
 * @typedef {object} CounterListForDropDownList
 * @property {string} hash_id - hash id of the counter filter
 * @property {number} counter_no - number of the counter filter
 * @property {string} counter_name - name of the counter filter
 */

/**
 * GET /process-token/counter/dropdown-list
 * @summary Get counter drop down list
 * @tags counter
 * @security Authorization
 * @return {CounterListForDropDownList[]} 200 - counter filter dropdown list
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 * @return 404 - Not found
 */
counter.get('/dropdown-list',validateProcessTokenAuthUser, controller.counterListForDropDown);

/**
 * CounterFilterDetail
 * @typedef {object} CounterFilterDetail
 * @property {string} id - hash id of counter filter
 * @property {number} counter_no - number if counter filter
 * @property {string} counter_name - name of counter filter
 */

/**
 * CounterFilterResponseBody
 * @typedef {object} CounterFilterResponseBody
 * @property {CounterFilterDetail} counter - counter filter detail
 */

/**
 * GET /process-token/counter/{id}
 * @summary Get counter by id
 * @tags counter
 * @security Authorization
 * @param {string} id.path.required - Hash id of city
 * @return {CounterFilterResponseBody} 200 - counter by company id
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 * @return 404 - Not found
 */
counter.get('/:id', validateProcessTokenUser, controller.getCounterByCompanyId);



export default counter;
