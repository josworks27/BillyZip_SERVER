const express = require('express');

const router = express.Router();
const applicationController = require('./');

router.post('/', applicationController);

module.exports = router;
