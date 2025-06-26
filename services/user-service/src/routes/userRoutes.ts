import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile management routes
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.delete('/profile', UserController.deleteAccount);

// Admin-only routes (for future use)
router.get('/admin/users', 
  requireRoles('admin'), 
  async (req, res) => {
    // Placeholder for admin user listing
    res.status(501).json({
      message: 'Admin user listing not yet implemented',
      timestamp: new Date().toISOString()
    });
  }
);

export default router;