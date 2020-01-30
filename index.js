const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 4000;

// middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(cookieParser());
//   app.use(
//     cors({
//       origin: ['http://stroll1.s3-website.ap-northeast-2.amazonaws.com'],
//       methods: ['GET', 'POST'],
//       credentials: true,
//     }),
//   );
app.use(cors());
app.use(morgan('dev'));

// router
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log(`BillyZip App Listening on PORT ${PORT}!`));
