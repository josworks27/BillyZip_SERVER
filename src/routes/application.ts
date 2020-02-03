import { Router } from 'express';
export const applicationRouter = Router();
import * as applicationController from '../controllers/application';
// /application
applicationRouter.post('/', applicationController.PostApplication);
applicationRouter.get('/', applicationController.GetApplication);
