import { Router } from 'express';
import * as usersController from '../controllers/users';
import { authChecker } from '../middleware/authChecker';
export const usersRouter = Router();

usersRouter.post('/signup', usersController.PostSignup);
usersRouter.post('/signin', usersController.PostSignin);
// usersRouter.get('/signout', authChecker, usersController.GetSignout);
usersRouter.get('/current-info', authChecker, usersController.GetCurrentInfo);
usersRouter.get('/list', authChecker, usersController.GetList);
usersRouter.get('/my-info', authChecker, usersController.GetMyInfo);
usersRouter.put('/my-info', authChecker, usersController.PutMyInfo);
usersRouter.delete('/my-info', authChecker, usersController.DeleteMyInfo);
usersRouter.put('/mobile', authChecker, usersController.PutMobile);
