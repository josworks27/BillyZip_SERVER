import { Router } from 'express';
import * as forumController from '../controllers/forum';
export const forumRouter = Router();

forumRouter.post('/', forumController.PostForum);
