import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        first_name: string;
        last_name: string;
      };
    }
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT token and inject user into request
   */
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/missing-token',
          title: 'Authentication Required',
          status: 401,
          detail: 'Authorization header is required',
          timestamp: new Date().toISOString()
        });
      }

      // Check Bearer token format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/invalid-token-format',
          title: 'Invalid Token Format',
          status: 401,
          detail: 'Authorization header must be "Bearer <token>"',
          timestamp: new Date().toISOString()
        });
      }

      const token = parts[1];

      // Verify JWT token
      let decoded: JWTPayload;
      try {
        decoded = verifyToken(token);
      } catch (error) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/invalid-token',
          title: 'Invalid or Expired Token',
          status: 401,
          detail: 'The provided token is invalid or has expired',
          timestamp: new Date().toISOString()
        });
      }

      // Get fresh user data from database
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/user-not-found',
          title: 'User Not Found',
          status: 401,
          detail: 'User associated with token no longer exists',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is still active
      if (!user.is_active) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/user-deactivated',
          title: 'User Account Deactivated',
          status: 401,
          detail: 'This user account has been deactivated',
          timestamp: new Date().toISOString()
        });
      }

      // Inject user data into request
      req.user = {
        id: user.id,
        email: user.email,
        roles: user.roles,
        first_name: user.first_name,
        last_name: user.last_name
      };

      logger.debug(`User authenticated: ${user.email}`);
      next();

    } catch (error) {
      logger.error('Authentication middleware error:', error);
      res.status(500).json({
        type: 'https://api.homeservices.co.za/errors/auth-error',
        title: 'Authentication Error',
        status: 500,
        detail: 'An error occurred during authentication',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Require specific roles for access
   */
  static requireRoles(...requiredRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          type: 'https://api.homeservices.co.za/errors/no-user-context',
          title: 'Authentication Required',
          status: 401,
          detail: 'User must be authenticated to access this resource',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => 
        req.user!.roles.includes(role)
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          type: 'https://api.homeservices.co.za/errors/insufficient-permissions',
          title: 'Insufficient Permissions',
          status: 403,
          detail: `Access requires one of the following roles: ${requiredRoles.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Optional authentication - adds user to request if token is provided
   */
  static optionalAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // No token provided, continue without user
    }

    // Use the authenticate middleware but don't return errors
    AuthMiddleware.authenticate(req, res, (error) => {
      if (error) {
        // Continue without user if authentication fails
        logger.debug('Optional auth failed, continuing without user');
      }
      next();
    });
  }
}

// Export individual middleware functions for convenience
export const authenticate = AuthMiddleware.authenticate;
export const requireRoles = AuthMiddleware.requireRoles;
export const optionalAuth = AuthMiddleware.optionalAuth;
