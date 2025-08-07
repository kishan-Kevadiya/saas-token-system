import { Router } from 'express';
import SettingsController from './settings.controller';

const settings: Router = Router();
const controller = new SettingsController();

/**
 * CompanySettings
 * @typedef {object} CompanySettings
 * @property {string} id - hash id of the settings
 * @property {string} language_id - id of the language
 * @property {number} service_selection - service selection
 * @property {number} srs_count - srs count
 * @property {number} font_size - font size
 * @property {number} block_size - block size
 * @property {number} display_scroll - display scroll
 * @property {string} display_transfer_token - display transfer token
 * @property {string} minutes_of_calling_before - minutes of calling before
 */

/**
 * GET /process-token/settings/
 * @summary Get settings
 * @tags settings
 * @security Authorization
 * @return {CompanySettings[]} 200 - company settings retrieved
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 * @return 404 - Not found
 */
settings.get('/', controller.getSettings);

export default settings;
