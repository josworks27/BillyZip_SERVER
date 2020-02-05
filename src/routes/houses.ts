import { Router } from 'express';
import * as housesController from '../controllers/houses';
export const housesRouter = Router();

housesRouter.post('/', housesController.PostHouse);
housesRouter.get('/', housesController.GetAllHouses);
housesRouter.post('/search', housesController.PostSearchHouse);
housesRouter.get('/:id', housesController.GetHouse);
housesRouter.put('/:id', housesController.PutHouse);
housesRouter.delete('/:id', housesController.DeleteHouse);
