import { Router } from 'express';
import * as authController from '../controllers/auth';
export const authRouter = Router();

authRouter.post('/', authController.postAuth);
authRouter.post('/verify', authController.postVerify);
