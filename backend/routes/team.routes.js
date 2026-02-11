const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const multer = require('multer');
const path = require('path');

// Resim yükleme (Multer) ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Logolar da diğer resimlerle aynı yere gitsin
    },
    filename: function (req, file, cb) {
        // Çakışmayı önlemek için ismin sonuna zaman damgası ekliyoruz
        cb(null, 'logo_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API Uç Noktaları
router.get('/', teamController.getTeams);
router.post('/', upload.single('logo'), teamController.addTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;