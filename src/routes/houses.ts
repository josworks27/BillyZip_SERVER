import { Router } from 'express';
import * as housesController from '../controllers/houses';
import * as multer from 'multer';
import * as path from 'path';

export const housesRouter = Router();

const upload = multer({
    storage: multer.diskStorage({
      // set a localstorage destination
      destination: (req, file, cb) => {
        cb(null, './src/uploads/');
      },
      // convert a file name
      filename: (req, file, cb) => {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
    }),
  });

housesRouter.post('/', upload.array('images', 3), housesController.PostHouse);
housesRouter.get('/', housesController.GetAllHouses);
housesRouter.post('/search', housesController.PostSearchHouse);
housesRouter.get('/:id', housesController.GetHouse);
housesRouter.put('/:id', housesController.PutHouse);
housesRouter.delete('/:id', housesController.DeleteHouse);
