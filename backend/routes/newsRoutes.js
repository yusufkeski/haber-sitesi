const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const checkAuth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// --- ROTALAR ---
router.get('/', newsController.getAllNews);
router.get('/:slug', newsController.getNewsBySlug);

// Korumalı Rotalar (Sadece Admin)
router.post('/', checkAuth, upload.single('image'), newsController.createNews);
router.put('/:id', checkAuth, upload.single('image'), newsController.updateNews); // Güncelleme
router.delete('/:id', checkAuth, newsController.deleteNews);
router.patch('/:id/toggle', checkAuth, newsController.toggleStatus); // Hızlı Durum Değiştirme

module.exports = router;