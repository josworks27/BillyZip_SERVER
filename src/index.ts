import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
require('dotenv').config();

import * as usersController from './controllers/users';
import * as housesController from './controllers/houses';
import * as applicationController from './controllers/application';
import * as favsController from './controllers/favs';
import * as paymentController from './controllers/payment';

// Create express server
const app = express();

// middleware
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());
//   app.use(
//     cors({
//       origin: ['http://stroll1.s3-website.ap-northeast-2.amazonaws.com'],
//       methods: ['GET', 'POST'],
//       credentials: true,
//     }),
//   );

// Controllers
// 1. usersController
app.post('/users/singup', usersController.PostSignup);
app.post('/users/singin', usersController.PostSignin);
app.get('/users/signout', usersController.GetSignout);
app.get('/users/:id/current-info', usersController.GetCurrentInfo);
app.get('/users/:id/list', usersController.GetList);
app.put('/users/:id/my-info', usersController.PutMyInfo);

// 2. housesController
app.get('/houses', housesController.GetAllHouses);
app.post('/houses', housesController.PostNewHouse);
app.post('/houses/search', housesController.PostSearchHouse);
app.get('/houses/:id', housesController.GetHouse);
app.put('/houses/:id', housesController.PutHouse);
app.delete('/houses/:id', housesController.DeleteHouse);

// 3. applicationController
app.post('/application', applicationController.PostApplication);
app.get('/application', applicationController.GetApplication);

// 4. favsController
app.post('/favs', favsController.PostFavs);
app.get('/favs', favsController.GetFavs);

// 5. paymentController
app.post('/payment', paymentController.PostPayment);
app.get('/payment', paymentController.GetPayment);

export default app;
