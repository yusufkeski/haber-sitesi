const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ROTA DOSYALARINI ÇAĞIR
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes'); // <-- Artık bu dosyayı kullanıyoruz
const contentController = require('./controllers/contentController');
const userController = require('./controllers/userController');
const checkAuth = require('./middleware/authMiddleware'); // Köşe yazıları için lazım

const app = express();
const PORT = 3000;

// AYARLAR
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resim klasörünü dışarı aç
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- GLOBAL UPLOAD AYARI (Content ve User Controller için) ---
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

// ==========================================
// ROTALAR
// ==========================================

// 1. AUTH (Giriş)
app.use('/api/auth', authRoutes);

// 2. HABERLER (newsRoutes.js dosyasına devrettik)
app.use('/api/news', newsRoutes); 

// 3. PERSONEL YÖNETİMİ
app.get('/api/users', userController.getUsers);
app.post('/api/users', upload.single('image'), userController.addUser);
app.put('/api/users/:id', upload.single('image'), userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);

// 4. VİDEOLAR
app.get('/api/videos', contentController.getVideos);
app.post('/api/videos', upload.none(), contentController.addVideo);
app.delete('/api/videos/:id', contentController.deleteVideo);

// 5. REKLAMLAR
app.get('/api/ads', contentController.getAds);
app.post('/api/ads', upload.single('image'), contentController.addAd);
app.delete('/api/ads/:id', contentController.deleteAd);

// 6. KÖŞE YAZILARI
app.get('/api/authors', contentController.getAuthors);
app.get('/api/column-posts', contentController.getColumnPosts);
app.get('/api/column-posts/:id', contentController.getColumnPostById);
// Yazma/Silme işlemleri yetki ister (checkAuth)
app.post('/api/column-posts', checkAuth, upload.none(), contentController.addColumnPost);
app.delete('/api/column-posts/:id', checkAuth, contentController.deleteColumnPost);

// BAŞLAT
app.listen(PORT, () => {
    console.log(`🚀 Sunucu Aktif: http://localhost:${PORT}`);
});