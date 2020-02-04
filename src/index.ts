import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import 'dotenv/config';

// Import Routers
import { usersRouter } from './routes/users';
import { housesRouter } from './routes/houses';
import { favsRouter } from './routes/favs';
import { applicationRouter } from './routes/application';
import { paymentRouter } from './routes/payment';


// typeORM으로 DB연결 => 데이터베이스 연결되면서 각 entities도 생성된다.
createConnection()
  .then(async () => {
    
    // Create express server
    const app = express();

    // middlewares
    const PORT: string | number = process.env.PORT || 3000;
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

    // start express server
    app.listen(PORT, () => {
      console.log(
        `BillyZip server has started on port ${PORT}. Open http://localhost:${PORT} to see results`,
      );
    });
  })
  .catch((error) => console.log(error));
