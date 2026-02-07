// backend/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Bağlantı havuzu oluşturuyoruz (Performans için önemli)
const pool = mysql.createPool({
    host: 'localhost',      // WAMP Server senin bilgisayarında
    user: 'root',           // WAMP varsayılan kullanıcısı
    password: '',           // WAMP varsayılan şifresi (boş ise tırnakları boş bırak)
    database: 'nerik_db',   // HeidiSQL'de az önce açtığımız veritabanı adı
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Bağlantıyı test edelim
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Veritabanına bağlanılamadı:', err.message);
    } else {
        console.log('✅ WAMP MySQL veritabanına başarıyla bağlandı!');
        connection.release();
    }
});

module.exports = pool.promise(); // Promise yapısı ile dışarı açıyoruz (Modern kullanım)