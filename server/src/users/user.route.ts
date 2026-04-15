import { Router } from 'express';
import { Role } from '../helpers/role';
import { createAccount, createSchema, deleteUser, getAll, getUserById, update, updateSchema } from './users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, authorize(Role.Admin), getAll);
router.get('/:id', authenticate, authorize(Role.Admin), getUserById);
router.post('/', authenticate, authorize(Role.Admin), createSchema, createAccount);
router.put('/:id', authenticate, authorize(Role.Admin), updateSchema, update);
router.delete('/:id', authenticate, authorize(Role.Admin), deleteUser);

export default router;
