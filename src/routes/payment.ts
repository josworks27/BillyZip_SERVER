import { Router } from 'express';
import * as paymentController from '../controllers/payment';
import { authChecker } from '../middlewares/authChecker';
export const paymentRouter = Router();

paymentRouter.post('/', authChecker, paymentController.PostPayment);
paymentRouter.get('/', authChecker, paymentController.GetPayment);
