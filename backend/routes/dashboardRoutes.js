const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const checkAuth = require('../middleware/authMiddleware');

// İstatistikleri çek (Sadece giriş yapmış kullanıcılar görebilir)
router.get('/stats', checkAuth, dashboardController.getDashboardStats);

module.exports = router;