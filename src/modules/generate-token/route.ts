import { Router } from 'express';
import series from './series/series.route';
import language from './language/language.route';
import token from './token/token.route';
import auth from './auth/auth.route';
import { validateGenerateTokenUser } from '@/middlewares/validate-generate-token-user';

const generateTokenRoutes: Router = Router();

generateTokenRoutes.use('/auth', auth);
generateTokenRoutes.use('/language',validateGenerateTokenUser, language);
generateTokenRoutes.use('/series',validateGenerateTokenUser, series);
generateTokenRoutes.use('/token', validateGenerateTokenUser,token);

export default generateTokenRoutes;
