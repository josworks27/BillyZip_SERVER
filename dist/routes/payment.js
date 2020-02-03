"use strict";
const express = require('express');
const router = express.Router();
const paymentController = require('./');
router.post('/', paymentController);
module.exports = router;
