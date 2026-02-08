// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Rota dosyasını çağır
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rotaları tanımla
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Nerik Medya API Çalışıyor! 🚀' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});