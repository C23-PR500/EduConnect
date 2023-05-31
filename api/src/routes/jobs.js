import { Router } from 'express';
import verifyToken from '../middleware/auth.js';

import { 
  retrieveAll as retrieveAllJobs,
} from '../controllers/job.controller.js';

const router = Router({ mergeParams: true });

router.get('', verifyToken, retrieveAllJobs);

export default router;
