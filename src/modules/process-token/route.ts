import { Router } from 'express';
import auth from './company-auth/auth.route';
import counter from './counter/counter.route';
import { validateProcessTokenUser } from '@/middlewares/validate-process-token-user';
import userAuth from './user-auth/user-auth.route';
import token from './token/token.route';
import tokenList from './token-list/token.route';
import { validateProcessTokenAuthUser } from '@/middlewares/validate-process-token-auth-user';
import settings from './settings/settings.route';
import departments from './department/department.route';

const processTokenRoutes: Router = Router();

processTokenRoutes.use('/auth', auth);
processTokenRoutes.use('/user-auth',userAuth);
processTokenRoutes.use('/counter',  counter);
processTokenRoutes.use('/token', validateProcessTokenAuthUser, token);
processTokenRoutes.use('/token-list', validateProcessTokenAuthUser, tokenList);
processTokenRoutes.use('/settings', validateProcessTokenAuthUser, settings)
processTokenRoutes.use('/departments', validateProcessTokenAuthUser, departments)

export default processTokenRoutes;
