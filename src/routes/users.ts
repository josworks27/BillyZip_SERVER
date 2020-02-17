import { Router } from 'express';
import * as usersController from '../controllers/users';
export const usersRouter = Router();

usersRouter.post('/signup', usersController.PostSignup);
usersRouter.post('/signin', usersController.PostSignin);
usersRouter.get('/signout', usersController.GetSignout);
usersRouter.get('/:id/currentInfo', usersController.GetCurrentInfo);
usersRouter.get('/:id/list', usersController.GetList);
usersRouter.get('/:id/myInfo', usersController.GetMyInfo);
usersRouter.put('/:id/myInfo', usersController.PutMyInfo);
usersRouter.put('/mobile', usersController.PutMobile);
