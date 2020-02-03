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
const usersRouter = __importStar(require("./routes/users"));
// Create express server
const app = express_1.default();
// middleware
require('dotenv').config();
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
// router
app.use('/users', usersRouter);
exports.default = app;
