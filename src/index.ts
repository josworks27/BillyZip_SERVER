import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
require('dotenv').config();

import * as usersController from './controllers/users';


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

// routes
// usersController
app.post('/users/singup', usersController.PostSignup);
app.post('/users/singin', usersController.PostSignin);
app.get('/users/signout', usersController.GetSignout);
app.get('/users/:id/current-info', usersController.GetCurrentInfo);
app.get('/users/:id/list', usersController.GetList);
app.put('/users/:id/my-info', usersController.PutMyInfo);

export default app;
