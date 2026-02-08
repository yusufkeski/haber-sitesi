const express = require('express');
const cors = require('cors');
const path = require('path');
const videoController = require('./controllers/videoController');

// Rotaları içe aktar (Senin orijinal dosyaların)
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const PORT = 3000;

// 1. AYARLAR VE İZİNLER
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/videos', videoController.getAllVideos);
app.post('/api/videos', videoController.addVideo); // (Auth eklenebilir)
app.delete('/api/videos/:id', videoController.deleteVideo);

// Resim klasörünü dışarı aç
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // DİKKAT: 'public/uploads' değil, direkt 'uploads' olabilir. Kontrol et.
// NOT: Senin 'newsRoutes.js' dosyan resimleri 'public/uploads/' klasörüne kaydediyor. 
// O yüzden statik klasör yolunu da ona göre ayarlamalıyız:
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));


// 2. ROTALARI TANIMLA
app.use('/api/auth', authRoutes); // Login ve Register işlemleri burada
app.use('/api/news', newsRoutes); // Haber ekleme/silme işlemleri burada

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`🚀 Profesyonel Sunucu Aktif: http://localhost:${PORT}`);
});