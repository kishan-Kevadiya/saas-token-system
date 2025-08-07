import { Router } from 'express';
import SeriesController from './series.controller';

const series: Router = Router();
const controller = new SeriesController();

/**
 * Series Response
 * @typedef {object} SeriesResponse
 * @property {string} id - hash id of series
 * @property {string} series_name - English name of series
 * @property {string} series_image - Image URL of series
 */

/**
 * Form Field Response
 * @typedef {object} FormFieldResponse
 * @property {string} id - hash id of form field
 * @property {string} field_name - English name of field
 * @property {string} field_type - Type of field
 * @property {number} is_required - Whether field is required (0 or 1)
 */

/**
 * Sub Series Response
 * @typedef {object} SubSeriesResponse
 * @property {string} id - hash id of parent series
 * @property {boolean} sub_series_present - Whether sub-series are present
 * @property {number} display_form - Whether to display form (0 or 1)
 * @property {FormFieldResponse[]|null} form_data - Form fields data (if display_form is 1)
 * @property {SeriesResponse[]|null} series - Sub-series data (if sub_series_present is true)
 */

/**
 * GET /series/{company_id}/{langauge_id}
 * @summary Get top-level series for a company
 * @tags series
 * @security Authorization
 * @param {string} company_id.path.required - hash id of company
 * @param {string} langauge_id.path.required - hash id of language
 * @return {SeriesResponse[]} 200 - Series retrieved successfully
 * @return 401 - Unauthorized
 * @return 404 - Company not found
 * @return 500 - Internal server error
 */
series.get('/:company_id/:langauge_id', controller.getSeries);

/**
 * GET /series/sub-series/{series_id}/{langauge_id}
 * @summary Get sub-series or form data for a series
 * @tags series
 * @security Authorization
 * @param {string} series_id.path.required - hash id of parent series
 * @param {string} langauge_id.path.required - hash id of language
 * @return {SubSeriesResponse} 200 - Sub-series or form data retrieved successfully
 * @return 401 - Unauthorized
 * @return 404 - Parent series not found
 * @return 500 - Internal server error
 */
series.get('/sub-series/:series_id/:langauge_id', controller.getSubSeries);

export default series;
