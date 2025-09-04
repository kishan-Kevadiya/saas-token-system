import { Router } from 'express';
import dbSync from './db-sync.route';
import { verifyPublicRouteToken } from '@/middlewares/validate-public-route';
const dbSyncRoute: Router = Router();

dbSyncRoute.use('/', verifyPublicRouteToken, dbSync);

export default dbSyncRoute;
