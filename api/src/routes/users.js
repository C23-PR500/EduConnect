import { Router } from 'express';

import { 
  create as createUser,
  authenticate as authenticateUser,
} from '../controllers/user.controller.js';

const router = Router({ mergeParams: true });

router.post('/register', createUser);
router.post('/login', authenticateUser);

export default router;
