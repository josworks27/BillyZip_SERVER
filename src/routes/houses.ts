import { Router } from 'express';
import * as housesController from '../controllers/houses';
import * as reviewController from '../controllers/review';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as path from 'path';
import * as AWS from 'aws-sdk';

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

// Image Upload into /uploads
// const upload = multer({
//   storage: multer.diskStorage({
//     // set a localstorage destination
//     destination: (req, file, cb) => {
//       cb(null, './src/uploads/');
//     },
//     // convert a file name
//     filename: (req, file, cb) => {
//       cb(null, new Date().valueOf() + path.extname(file.originalname));
//     },
//   }),
// });

// housesController
housesRouter.post('/', upload.array('images', 7), housesController.PostHouse);
housesRouter.get('/', housesController.GetMainHouses);
housesRouter.get('/all', housesController.GetAllHouses);
housesRouter.post('/filter', housesController.PostFilterHouse);
housesRouter.post('/search', housesController.PostSearchHouse);
housesRouter.get('/part/:type', housesController.GetPartHouses);
housesRouter.get('/:id', housesController.GetHouse);
housesRouter.put('/:id', housesController.PutHouse);
housesRouter.delete('/:id', housesController.DeleteHouse);

// reviewController
// ! GET은 상세 매물 갖고 올 때 조인해서 응답하기!
housesRouter.post('/:id/comment', reviewController.postReview);
housesRouter.put('/:id/comment', reviewController.putReview);
housesRouter.delete('/:id/comment', reviewController.deleteReview);
