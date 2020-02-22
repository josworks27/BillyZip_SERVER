import { Router } from 'express';
import * as usersController from '../controllers/users';
import { authChecker } from '../middlewares/authChecker';
export const usersRouter = Router();

usersRouter.post('/signup', usersController.PostSignup);
usersRouter.post('/signin', usersController.PostSignin);
usersRouter.get('/signout', authChecker, usersController.GetSignout);
usersRouter.get('/currentInfo', authChecker, usersController.GetCurrentInfo);
usersRouter.get('/list', authChecker, usersController.GetList);
usersRouter.get('/myInfo', authChecker, usersController.GetMyInfo);
usersRouter.put('/myInfo', authChecker, usersController.PutMyInfo);
usersRouter.put('/mobile', authChecker, usersController.PutMobile);
