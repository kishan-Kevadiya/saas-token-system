import { Router } from 'express';
import PrintSettingsController from './print-settings.controller';

const printSettings: Router = Router();
const controller = new PrintSettingsController();

/**
 * PrintSettings
 * @typedef {object} PrintSettings
 * @property {string} id - hash id of the settings
 * @property {string} setting_key - setting key
 * @property {string} setting_value - setting value
 */

/**
 * GET /process-token/print-settings
 * @summary Get print settings
 * @tags print-settings
 * @security Authorization
 * @return {PrintSettings[]} 200 - print settings retrieved
 * @return 401 - Unauthorized
 * @return 500 - Internal server error
 * @return 404 - Not found
 */
printSettings.get('/', controller.getPrintSettings);

export default printSettings;
