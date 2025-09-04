import { Router } from 'express';

import generateTokenRoutes from './generate-token/route';
import processTokenRoutes from './process-token/route';
import dbSyncRoute from './db-sync/route';

const router: Router = Router();

router.use('/generate-token', generateTokenRoutes);

router.use('/process-token', processTokenRoutes);

router.use('/db-sync', dbSyncRoute);

export default router;
