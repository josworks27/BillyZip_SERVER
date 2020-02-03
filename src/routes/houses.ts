import { Router } from 'express';
export const housesRouter = Router();
import * as housesController from '../controllers/houses';
// /houses
housesRouter.post('/', housesController.PostNewHouse);
housesRouter.get('/', housesController.GetAllHouses);
housesRouter.post('/search', housesController.PostSearchHouse);
// housesRouter.post('/:id', housesController.PostHouse);
housesRouter.get('/:id', housesController.GetHouse);
housesRouter.put('/:id', housesController.PutHouse);
housesRouter.delete('/:id', housesController.DeleteHouse);
