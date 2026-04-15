import jwt from 'jsonwebtoken';
import config from '../config';


export interface JwtPayload {
  sub: number;  
  role: string;  
  iat?: number;
  exp?: number;
}


export function signToken(payload: JwtPayload): string {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  const expiresIn = payload.role === 'Admin' ? '8h' : '1h';

  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}


export function verifyToken(token: string): JwtPayload | null {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  try {
    return jwt.verify(token, config.jwtSecret) as unknown as JwtPayload;
  } catch (error) {
    return null;
  }
}
