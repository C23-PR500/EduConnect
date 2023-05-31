import { Router } from 'express';
import verifyToken from '../middleware/auth.js';

import { 
  retrieveAll as retrieveAllJobs,
  retrieveById as retrieveJobById,
} from '../controllers/job.controller.js';

const router = Router({ mergeParams: true });

router.get('', verifyToken, retrieveAllJobs);
router.get('/:id', verifyToken, retrieveJobById);

export default router;
