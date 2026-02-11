const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standings.controller');

router.get('/', standingsController.getStandings);
router.post('/toggle', standingsController.toggleVisibility);
router.put('/update', standingsController.updateTeamStats);

module.exports = router;