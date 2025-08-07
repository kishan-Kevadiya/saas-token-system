import { Router } from 'express';
import LanguageController from './language.controller';

const language: Router = Router();
const controller = new LanguageController();

/**
 * GererateTokenLanguageResponse
 * @typedef {object} GererateTokenLanguageResponse
 * @property {string} id - hash id of language
 * @property {string} name - English name of language
 * @property {string} code - Language code (e.g., 'en', 'es')
 * @property {string} title - Display title of language
 */

/**
 * GET /language/{company_id}
 * @summary Get languages for a company
 * @tags language
 * @security Authorization
 * @param {string} company_id.path.required - hash id of company
 * @return {GererateTokenLanguageResponse[]} 200 - Languages retrieved successfully
 * @return  401 - Unauthorized
 * @return  404 - Company not found or no languages found
 * @return  500 - Internal server error
 */
language.get('/:company_id', controller.getLanguages);

export default language;
