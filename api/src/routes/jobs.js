import { Router } from 'express';
import verifyToken from '../middleware/auth.js';

import { 
  retrieveAll as retrieveAllJobs,
  retrieveById as retrieveJobById,
  retrieveApplicantsById as retrieveJobApplicantsById,
} from '../controllers/job.controller.js';

const router = Router({ mergeParams: true });

router.get('', verifyToken, retrieveAllJobs);
router.get('/:id', verifyToken, retrieveJobById);
router.get('/:id/applicants', verifyToken, retrieveJobApplicantsById);

export default router;
