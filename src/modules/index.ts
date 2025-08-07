import { Router } from 'express';

import generateTokenRoutes from './generate-token/route';
import processTokenRoutes from './process-token/route';

const router: Router = Router();

router.use('/generate-token', generateTokenRoutes);

router.use('/process-token', processTokenRoutes);

export default router;
