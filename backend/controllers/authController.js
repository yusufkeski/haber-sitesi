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
    // Varsayılan rol 'author' (yazar) ve izin 'can_post_column' (yazı yazabilir) olarak atanır
    const defaultPermissions = JSON.stringify({ can_post_column: true });
    
    const sql = 'INSERT INTO users (username, password_hash, full_name, role, permissions) VALUES (?, ?, ?, ?, ?)';
    await db.query(sql, [username, hashedPassword, full_name, 'author', defaultPermissions]);

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(400).json({ message: 'Kullanıcı bulunamadı.' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Şifre hatalı.' });

    // --- İZİN KONTROLÜ (Düzeltilmiş Tek Blok) ---
    let userPermissions = {};
    try {
        if (user.permissions) {
            // Eğer veritabanından string gelirse JSON'a çevir, zaten obje ise direkt al
            userPermissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
        } else {
            userPermissions = {}; // Null ise boş obje yap
        }
    } catch (e) {
        userPermissions = {};
    }
    // -------------------------------------------

    // Token oluştur
    const token = jwt.sign(
        { 
            id: user.id, 
            role: user.role, 
            username: user.username,
            permissions: userPermissions 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.json({
        message: 'Giriş başarılı',
        token,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            permissions: userPermissions
        }
    });
};