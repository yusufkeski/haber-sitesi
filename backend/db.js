// backend/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Bağlantı havuzu oluşturuyoruz
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Bağlantıyı test edelim (Sadece sunucu açılırken 1 kere dener)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Veritabanı Hatası:', err.message);
    } else {
        console.log('✅ MySQL Bağlantısı Başarılı!');
        connection.release();
    }
});

module.exports = pool.promise();