// backend/controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password, full_name } = req.body;

    // 1. Kullanıcı var mı kontrol et
    const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
    }

    // 2. Şifreyi şifrele (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Veritabanına kaydet
    // Varsayılan rol 'author' (yazar) olarak atanır
    const sql = 'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)';
    await db.query(sql, [username, hashedPassword, full_name, 'author']);

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    // 1. Kullanıcıyı bul
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
        return res.status(400).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
    }

    const user = users[0];

    // 2. Şifreyi kontrol et (Hash kıyaslama)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(400).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
    }

    // 3. Token oluştur (Dijital Kimlik)
    const token = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token 1 gün geçerli
    );

    res.json({
        message: 'Giriş başarılı',
        token,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        }
    });
};