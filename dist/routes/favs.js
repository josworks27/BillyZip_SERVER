"use strict";
const express = require('express');
const router = express.Router();
const favsController = require('./');
router.post('/', favsController);
module.exports = router;
