import { Router } from 'express';
import series from './series/series.route';
import language from './language/language.route';
import token from './token/token.route';
import auth from './auth/auth.route';
import barcode from './barcode/barcode.route';

const generateTokenRoutes: Router = Router();

generateTokenRoutes.use('/auth', auth);
generateTokenRoutes.use('/language', language);
generateTokenRoutes.use('/series', series);
generateTokenRoutes.use('/token', token);
generateTokenRoutes.use('/barcode', barcode)

export default generateTokenRoutes;
