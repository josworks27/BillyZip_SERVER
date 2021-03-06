import { Router } from 'express';
import * as housesController from '../controllers/houses';
import * as reviewController from '../controllers/review';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as path from 'path';
import * as AWS from 'aws-sdk';
import { authChecker } from '../middleware/authChecker';

export const housesRouter = Router();

// Image Upload into AWS S3
AWS.config.loadFromPath(
  '/Users/joseongcheol/Desktop/code_states_im16/immersive16/07_final_project/BillyZip-server/src/config/awsconfig.json',
);

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'billyzip',
    key: function(req, file, cb) {
      const extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension);
    },
    acl: 'public-read-write',
  }),
});

// housesController
housesRouter.post('/', upload.array('images', 7), authChecker, housesController.PostHouse);
housesRouter.get('/', authChecker, housesController.GetMainHouses);
housesRouter.get('/all', authChecker, housesController.GetAllHouses);
housesRouter.post('/filter', authChecker, housesController.PostFilterHouse);
housesRouter.post('/search', authChecker, housesController.PostSearchHouse);
housesRouter.get('/part/:type', authChecker, housesController.GetPartHouses);
housesRouter.get('/:id', authChecker, housesController.GetHouse);
housesRouter.put('/:id', upload.array('images', 7), authChecker, housesController.PutHouse);
housesRouter.delete('/:id', authChecker, housesController.DeleteHouse);

// reviewController
housesRouter.post('/:id/review', authChecker, reviewController.postReview);
// housesRouter.put('/:id/review/:id', authChecker, reviewController.putReview);
housesRouter.delete('/:id/review/:reviewId', authChecker, reviewController.deleteReview);
