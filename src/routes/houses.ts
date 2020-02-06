import { Router } from 'express';
import * as housesController from '../controllers/houses';
import * as reviewController from '../controllers/review';
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

// housesController
housesRouter.post('/', upload.array('images', 3), housesController.PostHouse);
housesRouter.get('/', housesController.GetMainHouses);
housesRouter.post('/search', housesController.PostSearchHouse);
housesRouter.get('/part', housesController.GetPartHouses);
housesRouter.get('/:id', housesController.GetHouse);
housesRouter.put('/:id', housesController.PutHouse);
housesRouter.delete('/:id', housesController.DeleteHouse);

// reviewController
// ! GET은 상세 매물 갖고 올 때 조인해서 응답하기!
housesRouter.post('/:id/comment', reviewController.postReview);
housesRouter.put('/:id/comment', reviewController.putReview);
housesRouter.delete('/:id/comment', reviewController.deleteReview);