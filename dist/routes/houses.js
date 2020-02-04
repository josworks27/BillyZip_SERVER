"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
exports.housesRouter = express_1.Router();
const housesController = require("../controllers/houses");
// /houses
exports.housesRouter.post('/', housesController.PostNewHouse);
exports.housesRouter.get('/', housesController.GetAllHouses);
exports.housesRouter.post('/search', housesController.PostSearchHouse);
// housesRouter.post('/:id', housesController.PostHouse);
exports.housesRouter.get('/:id', housesController.GetHouse);
exports.housesRouter.put('/:id', housesController.PutHouse);
exports.housesRouter.delete('/:id', housesController.DeleteHouse);
//# sourceMappingURL=houses.js.map