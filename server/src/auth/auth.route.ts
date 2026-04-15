import express from 'express';
import { login, register, profile, registerSchema, verify } from './auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerSchema, register);
router.post('/verify', verify);
router.get('/profile', authenticate, profile);

export default router;
