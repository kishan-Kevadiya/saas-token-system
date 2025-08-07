import { Router } from 'express';
import series from './series/series.route';
import language from './language/language.route';
import token from './token/token.route';
import auth from './auth/auth.route';

const generateTokenRoutes: Router = Router();

generateTokenRoutes.use('/auth', auth);
generateTokenRoutes.use('/language', language);
generateTokenRoutes.use('/series', series);
generateTokenRoutes.use('/token', token);

export default generateTokenRoutes;
