import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export const generateTokens = (user: User) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    roles: user.roles
  };

  try {
    const accessToken = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Failed to generate JWT tokens');
  }
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
