import { Router } from 'express';
import * as paymentController from '../controllers/payment';
export const paymentRouter = Router();

paymentRouter.post('/', paymentController.PostPayment);
paymentRouter.get('/', paymentController.GetPayment);
