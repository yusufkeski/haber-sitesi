const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// KONTROLCÜLER (Beyinler)
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const contentController = require('./controllers/contentController');
const userController = require('./controllers/userController');

// MİDDLEWARE (Güvenlik Görevlisi) - İŞTE EKSİK OLAN BUYDU!
const checkAuth = require('./middleware/authMiddleware');

const app = express();
const PORT = 3000;

// 1. AYARLAR VE İZİNLER
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resim klasörünü dışarı aç
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- RESİM YÜKLEME AYARI (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// 2. ANA ROTALAR
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

// --- 3. İÇERİK YÖNETİMİ ROTALARI ---

// PERSONEL YÖNETİMİ
app.get('/api/users', userController.getUsers);
app.post('/api/users', upload.single('image'), userController.addUser);
app.put('/api/users/:id', upload.single('image'), userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);

// VİDEOLAR
app.get('/api/videos', contentController.getVideos);
app.post('/api/videos', upload.none(), contentController.addVideo);
app.delete('/api/videos/:id', contentController.deleteVideo);

// REKLAMLAR
app.get('/api/ads', contentController.getAds);
app.post('/api/ads', upload.single('image'), contentController.addAd);
app.delete('/api/ads/:id', contentController.deleteAd);

// KÖŞE YAZILARI
// Yazarları ve yazıları herkes görebilir
app.get('/api/authors', contentController.getAuthors);
app.get('/api/column-posts', contentController.getColumnPosts);
app.get('/api/column-posts/:id', contentController.getColumnPostById);

// Yazı eklerken ve silerken GÜVENLİK (checkAuth) lazım!
app.post('/api/column-posts', checkAuth, upload.none(), contentController.addColumnPost);
app.delete('/api/column-posts/:id', checkAuth, contentController.deleteColumnPost);

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`🚀 Sunucu Aktif: http://localhost:${PORT}`);
});