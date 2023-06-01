
import { Router } from 'express';
import verifyToken from '../middleware/auth.js';

import { 
  create as createUser,
  authenticate as authenticateUser,
  retrieveAll as retrieveAllUsers,
  retrieveById as retrieveUserById,
  updateById as updateUserById,
  deleteById as deleteUserById,
  followById as followUserById,
  getFollowedUsersById,
  applyToJobById,
} from '../controllers/user.controller.js';

const router = Router({ mergeParams: true });

router.post('/register', createUser);
router.post('/login', authenticateUser);

router.get('', verifyToken, retrieveAllUsers);
router.get('/:id', verifyToken, retrieveUserById);
router.patch('/:id', verifyToken, updateUserById);
router.delete('/:id', verifyToken, deleteUserById);

router.post('/:id/following/:targetUserId/follow', verifyToken, followUserById);
router.get('/:id/following', verifyToken, getFollowedUsersById);

router.post('/:id/jobs/:jobId/apply', verifyToken, applyToJobById);

export default router;
