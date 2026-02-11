const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const checkAuth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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



const upload = multer({ storage });

/* ================= PUBLIC ================= */
router.get('/search', newsController.searchNews);
router.get('/category/:category', newsController.getNewsByCategory);
router.get('/slider', newsController.getSliderNews);
router.get('/', newsController.getAllNews);
router.get('/:slug', newsController.getNewsBySlug);

/* ================= ADMIN ================= */

// HABER EKLE (Kapak resmi)
router.post('/', checkAuth, upload.single('image'), newsController.addNews);

// HABER GÜNCELLE
router.put('/:id', checkAuth, upload.single('image'), newsController.updateNews);

// HABER SİL
router.delete('/:id', checkAuth, newsController.deleteNews);

// SLIDER / BREAKING
router.put('/:id/status', checkAuth, newsController.toggleNewsStatus);

// 🔥 GALERİ MEDYASI EKLE
router.post('/:id/media', checkAuth, upload.array('media', 10), newsController.addNewsMedia);


module.exports = router;
