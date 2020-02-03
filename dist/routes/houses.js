"use strict";
const express = require('express');
const router = express.Router();
const housesController = require('./');
router.post('/', housesController);
module.exports = router;
