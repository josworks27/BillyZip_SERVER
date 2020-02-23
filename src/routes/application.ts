import { Router } from 'express';
import { authChecker } from '../middlewares/authChecker';
import * as applicationController from '../controllers/application';
export const applicationRouter = Router();

applicationRouter.post('/', authChecker, applicationController.PostApplication);
applicationRouter.get('/', authChecker, applicationController.GetApplication);
applicationRouter.delete('/', authChecker, applicationController.DeleteApplication);
applicationRouter.put('/', authChecker, applicationController.PutApplication);
applicationRouter.get('/my-application', authChecker, applicationController.GetMyApplication);
