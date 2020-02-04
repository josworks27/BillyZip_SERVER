"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
exports.paymentRouter = express_1.Router();
const paymentController = require("../controllers/payment");
// /payment
exports.paymentRouter.post('/', paymentController.PostPayment);
exports.paymentRouter.get('/', paymentController.GetPayment);
//# sourceMappingURL=payment.js.map