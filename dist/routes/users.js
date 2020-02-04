"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
exports.usersRouter = express_1.Router();
const usersController = require("../controllers/users");
exports.usersRouter.post('/signup', usersController.PostSignup);
exports.usersRouter.post('/signin', usersController.PostSignin);
exports.usersRouter.get('/signout', usersController.GetSignout);
exports.usersRouter.get('/:id/currentInfo', usersController.GetCurrentInfo);
exports.usersRouter.get('/:id/list', usersController.GetList);
exports.usersRouter.get('/:id/myInfo', usersController.GetMyInfo);
exports.usersRouter.put('/:id/myInfo', usersController.PutMyInfo);
//# sourceMappingURL=users.js.map