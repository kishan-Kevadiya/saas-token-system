"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counter_controller_1 = __importDefault(require("./counter.controller"));
const counter = (0, express_1.Router)();
const controller = new counter_controller_1.default();
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
counter.get('/:id', controller.getCounterByCompanyId);
exports.default = counter;
//# sourceMappingURL=counter.route.js.map