import { Router } from 'express';
import verifyToken from '../middleware/auth.js';

import { 
  retrieveAll as retrieveAllSkills,
} from '../controllers/skill.controller.js';

const router = Router({ mergeParams: true });

router.get('', verifyToken, retrieveAllSkills);

export default router;
