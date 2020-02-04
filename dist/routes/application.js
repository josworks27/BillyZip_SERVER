"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
exports.applicationRouter = express_1.Router();
const applicationController = require("../controllers/application");
// /application
exports.applicationRouter.post('/', applicationController.PostApplication);
exports.applicationRouter.get('/', applicationController.GetApplication);
//# sourceMappingURL=application.js.map