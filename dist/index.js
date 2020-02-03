"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
require('dotenv').config();
const usersController = __importStar(require("./controllers/users"));
const housesController = __importStar(require("./controllers/houses"));
const applicationController = __importStar(require("./controllers/application"));
const favsController = __importStar(require("./controllers/favs"));
const paymentController = __importStar(require("./controllers/payment"));
// Create express server
const app = express_1.default();
// middleware
app.set('port', process.env.PORT || 3000);
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: false,
}));
app.use(cookie_parser_1.default());
app.use(morgan_1.default('dev'));
app.use(cors_1.default());
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
exports.default = app;
