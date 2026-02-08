// backend/createAdmin.js
const db = require('./db'); // Veritabanı bağlantımız
const bcrypt = require('bcryptjs'); // Şifreleme aracımız

async function createAdmin() {
    const username = 'admin';
    const password = '123123'; // Osman Bey'in ilk şifresi (Sonra değiştirir)
    const fullName = 'Osman Bey';

    try {
        // 1. Şifreyi Hashle (Kriptola)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Veritabanına Ekle
        // role: 'admin' ve permissions: tüm yetkiler açık
        const sql = `INSERT INTO users (username, password_hash, full_name, role, permissions) VALUES (?, ?, ?, ?, ?)`;
        
        await db.query(sql, [
            username, 
            hashedPassword, 
            fullName, 
            'admin', 
            JSON.stringify({ all: true }) // Tüm yetkiler onda
        ]);

        console.log('✅ Süper Admin başarıyla oluşturuldu!');
        console.log(`👤 Kullanıcı Adı: ${username}`);
        console.log(`🔑 Şifre: ${password}`);
        process.exit(); // İş bitince çık

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️ Bu kullanıcı zaten var!');
        } else {
            console.error('❌ Hata oluştu:', error);
        }
        process.exit(1);
    }
}

createAdmin();