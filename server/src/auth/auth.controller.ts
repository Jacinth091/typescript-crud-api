import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { db } from '../helpers/db';
import { signToken } from './jwt.service';
import { Role } from 'helpers/role';
import Joi from 'joi';
import { validateRequest } from 'middleware/validateRequest';
import { userService } from 'users/user.service';
import { UserCreationAttributes } from 'users/user.model';


export const login = async (req: Request, res: Response): Promise<any> => {
  const { userStr, password } = req.body;
  try {
    if (!userStr?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, error: 'Username/Email and Password are required.' });
    }

    const user = await userService.findByUsernameOrEmail(userStr.toString());

    if (!user) {
      return res.status(401).json({ success: false, error: 'Account not found. Register first.' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = signToken({ sub: user.id, role: user.role });

    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        title: user.title,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  const formData = req.body;
  try {
    const existingUser = await userService.findByEmail(formData.email.toString());
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email is already registered.' });
    }
    const newUser: UserCreationAttributes = {
      firstName: formData.first_name?.trim() || '',
      middleName: formData.middle_name?.trim() || '',
      lastName: formData.last_name?.trim() || '',
      email: formData.email?.trim() || '',
      username: formData.username?.trim() || '',
      passwordHash: formData.password?.trim() || '',
      title: formData.title?.trim() || '',
      role: formData.role?.trim() || Role.User,
      verified: formData.verified || false,
    }
    const user = await userService.create({ ...newUser, password: formData.password });
    if (!user) {
      return res.status(403).json({ success: false, error: "User Not Created." });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: { email: formData.email?.trim() },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
};

export const verify = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const result = await userService.verify(email);
    if (!result) {
      return res.status(404).json({ success: false, error: 'User not found or verification failed.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
};

export const profile = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const user = await db.User.findByPk(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        title: user.title,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
};

export function registerSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    title: Joi.string().optional().allow(''),
    first_name: Joi.string().required(),
    middle_name: Joi.string().optional().allow(''),
    last_name: Joi.string().required(),
    role: Joi.string().valid(Role.Admin, Role.User).default(Role.User),
    verified: Joi.bool().optional().default(false),
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
  });
  validateRequest(req, next, schema);
}

