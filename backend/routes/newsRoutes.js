// backend/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const checkAuth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Resim Yükleme Ayarı (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Dosya adı çakışmasın diye tarih ekliyoruz
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// --- ROTALAR ---

// Herkes görebilir
router.get('/', newsController.getAllNews);
router.get('/:slug', newsController.getNewsBySlug);

// Sadece Giriş Yapanlar (checkAuth)
// upload.single('image') -> Frontend'den 'image' isminde dosya bekler
router.post('/', checkAuth, upload.single('image'), newsController.createNews);

router.delete('/:id', checkAuth, newsController.deleteNews);

module.exports = router;