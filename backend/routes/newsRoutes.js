const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const checkAuth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- RESİM YÜKLEME AYARI ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// ======================================================
// 1. ÖZEL GET ROTALARI (En Üste!)
// ======================================================
router.get('/search', newsController.searchNews);
router.get('/category/:category', newsController.getNewsByCategory);

// ======================================================
// 2. ADMİN İŞLEMLERİ (ID Gerektirenler - Ortaya!)
// ======================================================
// Bu satırlar 'checkAuth' ile korunur

// Manşet / Son Dakika Yap (Status Toggle)
router.put('/:id/status', checkAuth, newsController.toggleNewsStatus);

// Haber Sil
router.delete('/:id', checkAuth, newsController.deleteNews);

// Haber Güncelle
router.put('/:id', checkAuth, upload.single('image'), newsController.updateNews);

// Haber Ekle (ID yok ama POST işlemi)
router.post('/', checkAuth, upload.single('image'), newsController.addNews);


// ======================================================
// 3. GENEL LİSTELEME (En Alta Yakın)
// ======================================================
router.get('/', newsController.getAllNews);


// ======================================================
// 4. TEK HABER OKUMA (En Sona!)
// ======================================================
// DİKKAT: Bunu yukarı taşırsan Admin paneli bozulur!
router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;