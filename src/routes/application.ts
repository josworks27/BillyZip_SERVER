import { Router } from 'express';
import * as applicationController from '../controllers/application';
export const applicationRouter = Router();

applicationRouter.post('/', applicationController.PostApplication);
applicationRouter.get('/', applicationController.GetApplication);
applicationRouter.delete('/', applicationController.DeleteApplication);
