import { Router } from 'express';
import * as favsController from '../controllers/favs';
import { authChecker } from '../middleware/authChecker';
export const favsRouter = Router();

favsRouter.post('/', authChecker, favsController.PostFavs);
favsRouter.get('/', authChecker, favsController.GetFavs);
favsRouter.delete('/:id', authChecker, favsController.DeleteFavs);
