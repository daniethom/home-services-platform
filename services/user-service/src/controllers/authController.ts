import { Request, Response } from 'express';
import { UserModel, CreateUserData } from '../models/User';
import { generateTokens } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/validation';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      // Validate input
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          type: 'https://api.homeservices.co.za/errors/validation-error',
          title: 'Validation Error',
          status: 400,
          detail: error.details[0].message,
          timestamp: new Date().toISOString()
        });
      }

      const { email, password, first_name, last_name, phone } = value;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          type: 'https://api.homeservices.co.za/errors/user-exists',
          title: 'User Already Exists',
          status: 409,
          detail: 'An account with this email address already exists',
          timestamp: new Date().toISOString()
        });
      }

      // Create user
      const userData: CreateUserData = {
        email,
        password,
        first_name,
        last_name,
        phone,
        roles: ['customer']
      };

      const user = await UserModel.create(userData);
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      logger.info(`New user registered: ${user.email}`);

      // Return user data (without password) and tokens
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          roles: user.roles,
          is_verified: user.is_verified,
          created_at: user.created_at
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        type: 'https://api.homeservices.co.za/errors/internal-error',
        title: 'Registration Failed',
        status: 500,
        detail: 'Unable to create user account at this time',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      // Validate input
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          type: 'https://api.homeservices.co.za/errors/validation-error',
          title: 'Validation Error',
          status: 400,
          detail: error.details[0].message,
          timestamp: new Date().toISOString()
        });
      }

      const { email, password } = value;

      // Find user with password
      const userWithPassword = await UserModel.findByEmailWithPassword(email);
      if (!userWithPassword) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/invalid-credentials',
          title: 'Invalid Credentials',
          status: 401,
          detail: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, userWithPassword.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/invalid-credentials',
          title: 'Invalid Credentials',
          status: 401,
          detail: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
      }

      // Update last login
      await UserModel.updateLastLogin(userWithPassword.id);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(userWithPassword);

      logger.info(`User logged in: ${userWithPassword.email}`);

      // Return user data and tokens
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: userWithPassword.id,
          email: userWithPassword.email,
          first_name: userWithPassword.first_name,
          last_name: userWithPassword.last_name,
          phone: userWithPassword.phone,
          roles: userWithPassword.roles,
          is_verified: userWithPassword.is_verified,
          last_login: new Date().toISOString()
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        type: 'https://api.homeservices.co.za/errors/internal-error',
        title: 'Login Failed',
        status: 500,
        detail: 'Unable to process login request at this time',
        timestamp: new Date().toISOString()
      });
    }
  }
}
