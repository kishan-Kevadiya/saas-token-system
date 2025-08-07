import { Router } from 'express';
import DepartmentController from './department.controller';

const departments: Router = Router();
const controller = new DepartmentController();

/**
 * Departments
 * @typedef {object} Departments
 * @property {string} id - hash id of the department
 * @property {string} name - department name
 */

/**
 * GET /process-token/departments/
 * @summary Get department
 * @tags departments
 * @security Authorization
 * @return {Departments[]} 200 - departments retrieved
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 * @return 404 - Not found
 */
departments.get('/', controller.getDepartment);

export default departments;
