const db = require('../db');
const bcrypt = require('bcryptjs');

// Personel Listesi (Bio kaldırıldı)
exports.getUsers = async (req, res) => {
    try {
        // Bio'yu sorgudan çıkardık
        const [users] = await db.query('SELECT id, username, full_name, role, image_path, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Yeni Personel Ekle (Bio kaldırıldı)
exports.addUser = async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body; // bio yok
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const [exists] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (exists.length > 0) return res.status(400).json({ message: 'Bu kullanıcı adı dolu!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // İzinleri role göre otomatik ata
        let permissions = {};
        if (role === 'admin') permissions = { all: true };
        else if (role === 'author') permissions = { can_post_column: true };
        else if (role === 'editor') permissions = { can_edit_news: true };

        // SQL'den bio alanını sildik
        const sql = 'INSERT INTO users (username, password_hash, full_name, role, permissions, image_path) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(sql, [username, hashedPassword, full_name, role, JSON.stringify(permissions), imagePath]);

        res.json({ message: 'Personel başarıyla eklendi.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Personel Sil
exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Personel silindi.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ... (Diğer fonksiyonların altına ekle)

// Personel Güncelle (Şifre ve Resim Dahil)
exports.updateUser = async (req, res) => {
    try {
        const { username, full_name, role, password } = req.body;
        const userId = req.params.id;

        // 1. Önce mevcut kullanıcıyı bul
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        
        const currentUser = users[0];
        let newPasswordHash = currentUser.password_hash;
        let newImagePath = currentUser.image_path;

        // 2. Eğer yeni şifre girildiyse Hash'le
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            newPasswordHash = await bcrypt.hash(password, salt);
        }

        // 3. Eğer yeni resim yüklendiyse
        if (req.file) {
            newImagePath = `/uploads/${req.file.filename}`;
        }

        // 4. İzinleri (Permissions) role göre güncelle
        let permissions = {};
        if (role === 'admin') permissions = { all: true };
        else if (role === 'author') permissions = { can_post_column: true };
        else if (role === 'editor') permissions = { can_edit_news: true };

        // 5. Veritabanını Güncelle
        const sql = `UPDATE users SET username=?, full_name=?, role=?, permissions=?, password_hash=?, image_path=? WHERE id=?`;
        await db.query(sql, [username, full_name, role, JSON.stringify(permissions), newPasswordHash, newImagePath, userId]);

        res.json({ message: 'Personel başarıyla güncellendi.' });

    } catch (err) { res.status(500).json({ error: err.message }); }
};