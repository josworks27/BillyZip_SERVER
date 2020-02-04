"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
exports.favsRouter = express_1.Router();
const favsController = require("../controllers/favs");
// /favs
exports.favsRouter.post('/', favsController.PostFavs);
exports.favsRouter.get('/', favsController.GetFavs);
//# sourceMappingURL=favs.js.map