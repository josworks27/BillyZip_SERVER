import * as express from 'express';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import 'dotenv/config';

import { usersRouter } from './routes/users';
import { housesRouter } from './routes/houses';
import { favsRouter } from './routes/favs';
import { applicationRouter } from './routes/application';
import { paymentRouter } from './routes/payment';

// Create express server
const app = express();

// middlewares
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

// Routes
app.use('/users', usersRouter);
app.use('/houses', housesRouter);
app.use('/application', applicationRouter);
app.use('/favs', favsRouter);
app.use('/payment', paymentRouter);

export default app;

// import 'reflect-metadata';
// import { createConnection } from 'typeorm';
// import { User } from './entity/User';

// createConnection()
//   .then(async (connection) => {
//     console.log('Inserting a new user into the database...');
//     const user = new User();
//     user.firstName = 'Timber';
//     user.lastName = 'Saw';
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log('Saved a new user with id: ' + user.id);

//     console.log('Loading users from the database...');
//     const users = await connection.manager.find(User);
//     console.log('Loaded users: ', users);

//     console.log('Here you can setup and run express/koa/any other framework.');
//   })
//   .catch((error) => console.log(error));
