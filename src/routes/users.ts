import { Router } from 'express';
import * as usersController from '../controllers/users';
export const usersRouter = Router();

usersRouter.post('/signup', usersController.PostSignup);
usersRouter.post('/signin', usersController.PostSignin);
usersRouter.get('/signout', usersController.GetSignout);
usersRouter.get('/currentInfo', usersController.GetCurrentInfo);
usersRouter.get('/list', usersController.GetList);
usersRouter.get('/myInfo', usersController.GetMyInfo);
usersRouter.put('/myInfo', usersController.PutMyInfo);
usersRouter.put('/mobile', usersController.PutMobile);
