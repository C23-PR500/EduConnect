import { Router } from 'express';
import verifyToken from '../middleware/auth.js';

import { 
  create as createUser,
  authenticate as authenticateUser,
  retrieveAll as retrieveAllUsers,
  retreiveById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

const router = Router({ mergeParams: true });

router.post('/register', createUser);
router.post('/login', authenticateUser);

router.get('', verifyToken, retrieveAllUsers);
router.get('/:id', verifyToken, retreiveById);
router.patch('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

export default router;
