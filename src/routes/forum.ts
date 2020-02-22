import { Router } from 'express';
import * as forumController from '../controllers/forum';
import { authChecker } from '../middlewares/authChecker';
export const forumRouter = Router();

forumRouter.post('/', authChecker, forumController.PostForum);
forumRouter.post('/room', authChecker, forumController.PostForumRoom);
forumRouter.post('/list', authChecker, forumController.PostForumList);
