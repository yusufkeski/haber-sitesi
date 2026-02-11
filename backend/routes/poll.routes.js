const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');

router.get('/', pollController.getPolls);
router.post('/vote', pollController.votePoll);

module.exports = router;