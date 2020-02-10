import { Router } from 'express';
import * as favsController from '../controllers/favs';
export const favsRouter = Router();

favsRouter.post('/', favsController.PostFavs);
favsRouter.get('/', favsController.GetFavs);
favsRouter.delete('/', favsController.DeleteFavs);
