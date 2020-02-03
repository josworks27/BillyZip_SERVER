import { Router } from 'express';
export const paymentRouter = Router();
import * as paymentController from '../controllers/payment';
// /payment
paymentRouter.post('/', paymentController.PostPayment);
paymentRouter.get('/', paymentController.GetPayment);
