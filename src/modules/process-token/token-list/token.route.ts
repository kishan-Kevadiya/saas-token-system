import { Router } from 'express';
import TokenController from './token.controller';

const tokenList: Router = Router();
const controller = new TokenController();

/**
 * Token Data Object
 * @typedef {object} TokenData
 * @property {number} series_id - series id of the token
 * @property {string} token_status - current status of the token
 * @property {number} priority - priority level of the token
 * @property {string} token_generate_time - ISO string of when token was generated
 * @property {string} token_date - ISO string of token date
 */

/**
 * Status Counts Object
 * @typedef {object} StatusCounts
 * @property {number} WAITING - waiting tokens count
 * @property {number} PENDING - pending tokens count
 * @property {number} HOLD - hold tokens count
 * @property {number} COMPLETED - completed tokens count
 * @property {number} TRANSFER - transfer tokens count
 * @property {number} ACTIVE - active tokens count
 */

/**
 * Status Group Object
 * @typedef {object} StatusGroup
 * @property {number} count - count of tokens in this status
 * @property {TokenData[]} tokens - array of token data objects
 */

/**
 * Series Statistics Object
 * @typedef {object} SeriesStatistics
 * @property {number} series_id - series id
 * @property {string} series_abbreviation - series abbreviation
 * @property {StatusCounts} status_counts - counts by status
 * @property {number} total - total tokens for this series
 */

/**
 * Overall Totals Object
 * @typedef {object} OverallTotals
 * @property {StatusGroup} WAITING - waiting status group
 * @property {StatusGroup} PENDING - pending status group
 * @property {StatusGroup} HOLD - hold status group
 * @property {StatusGroup} COMPLETED - completed status group
 * @property {StatusGroup} TRANSFER - transfer status group
 * @property {StatusGroup} ACTIVE - active status group
 * @property {number} total - grand total of all tokens
 */

/**
 * Company Info Object
 * @typedef {object} CompanyInfo
 * @property {number} company_id - company id
 */

/**
 * Counter Info Object
 * @typedef {object} CounterInfo
 * @property {number} counter_id - counter id
 */

/**
 * Token Statistics Response
 * @typedef {object} TokenStatisticsResponse
 * @property {SeriesStatistics[]} series_data - statistics by series
 * @property {OverallTotals} overall_totals - overall totals across all series with detailed token data
 * @property {CompanyInfo} company_info - company information
 * @property {CounterInfo} counter_info - counter information
 */

/**
 * GET /process-token/token/statistics/{company_id}/{counter_id}
 * @summary Get token statistics by status for a specific counter
 * @tags token
 * @security Authorization
 * @param {string} company_id.path.required - hash id of company
 * @param {string} counter_id.path.required - hash id of counter
 * @param {string} date.query - date filter (YYYY-MM-DD format, defaults to today)
 * @return {TokenStatisticsResponse} 200 - Token statistics retrieved successfully
 * @return 401 - Unauthorized
 * @return 404 - Company or counter not found
 * @return 500 - Internal server error
 */
tokenList.get('/statistics/:company_id/:counter_id', controller.getTokenStatistics);

export default tokenList;
