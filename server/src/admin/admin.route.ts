import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { adminDashboard } from './admin.controller';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('Admin'), adminDashboard);

export default router;
