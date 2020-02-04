"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv/config");
const users_1 = require("./routes/users");
const houses_1 = require("./routes/houses");
const favs_1 = require("./routes/favs");
const application_1 = require("./routes/application");
const payment_1 = require("./routes/payment");
// Create express server
const app = express();
// middlewares
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
}));
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
app.use('/users', users_1.usersRouter);
app.use('/houses', houses_1.housesRouter);
app.use('/application', application_1.applicationRouter);
app.use('/favs', favs_1.favsRouter);
app.use('/payment', payment_1.paymentRouter);
exports.default = app;
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
//# sourceMappingURL=index.js.map