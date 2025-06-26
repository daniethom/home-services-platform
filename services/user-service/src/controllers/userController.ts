import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';
import Joi from 'joi';

// Validation schema for profile updates
const updateProfileSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces'
    }),
  
  last_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces'
    }),
  
  phone: Joi.string()
    .pattern(/^(\+27|0)[0-9]{9}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid South African phone number'
    })
});

export class UserController {
  /**
   * Get current user's profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Get fresh user data from database
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          type: 'https://api.homeservices.co.za/errors/user-not-found',
          title: 'User Not Found',
          status: 404,
          detail: 'User profile not found',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Profile accessed by user: ${user.email}`);

      // Return user profile (without password)
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          roles: user.roles,
          is_verified: user.is_verified,
          last_login: user.last_login,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        type: 'https://api.homeservices.co.za/errors/internal-error',
        title: 'Profile Retrieval Failed',
        status: 500,
        detail: 'Unable to retrieve user profile at this time',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate input
      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          type: 'https://api.homeservices.co.za/errors/validation-error',
          title: 'Validation Error',
          status: 400,
          detail: error.details[0].message,
          timestamp: new Date().toISOString()
        });
      }

      // Get current user
      const currentUser = await UserModel.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          type: 'https://api.homeservices.co.za/errors/user-not-found',
          title: 'User Not Found',
          status: 404,
          detail: 'User profile not found',
          timestamp: new Date().toISOString()
        });
      }

      // Update user profile
      const updatedUser = await UserModel.updateProfile(userId, value);

      logger.info(`Profile updated by user: ${currentUser.email}`);

      // Return updated profile
      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          phone: updatedUser.phone,
          avatar_url: updatedUser.avatar_url,
          roles: updatedUser.roles,
          is_verified: updatedUser.is_verified,
          last_login: updatedUser.last_login,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        }
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        type: 'https://api.homeservices.co.za/errors/internal-error',
        title: 'Profile Update Failed',
        status: 500,
        detail: 'Unable to update user profile at this time',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete current user's account (soft delete)
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Soft delete user account
      await UserModel.deactivateUser(userId);

      logger.info(`Account deactivated by user: ${req.user!.email}`);

      res.status(200).json({
        message: 'Account deactivated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        type: 'https://api.homeservices.co.za/errors/internal-error',
        title: 'Account Deletion Failed',
        status: 500,
        detail: 'Unable to deactivate account at this time',
        timestamp: new Date().toISOString()
      });
    }
  }
}
