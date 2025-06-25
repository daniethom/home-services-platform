import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// User registration
router.post('/register', AuthController.register);

// User login
router.post('/login', AuthController.login);

export default router;
