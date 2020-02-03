import { Router } from 'express';
export const favsRouter = Router();
import * as favsController from '../controllers/favs';
// /favs
favsRouter.post('/', favsController.PostFavs);
favsRouter.get('/', favsController.GetFavs);
