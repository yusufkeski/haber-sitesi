const db = require('../db');
const fs = require('fs');

// --- VİDEO İŞLEMLERİ ---
exports.getVideos = async (req, res) => {
    try { const [rows] = await db.query('SELECT * FROM videos ORDER BY created_at DESC'); res.json(rows); } catch (err) { res.status(500).json({ error: err.message }); }
};
exports.addVideo = async (req, res) => {
    try {
        let { title, url } = req.body;
        if(url.includes('watch?v=')) url = url.replace('watch?v=', 'embed/');
        else if(url.includes('youtu.be/')) url = url.replace('youtu.be/', 'youtube.com/embed/');
        await db.query('INSERT INTO videos (title, url) VALUES (?, ?)', [title, url]);
        res.json({ message: 'Video eklendi' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
exports.deleteVideo = async (req, res) => {
    try { await db.query('DELETE FROM videos WHERE id = ?', [req.params.id]); res.json({ message: 'Silindi' }); } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- REKLAM İŞLEMLERİ ---
exports.getAds = async (req, res) => {
    try { const [rows] = await db.query('SELECT * FROM ads ORDER BY id DESC'); res.json(rows); } catch (err) { res.status(500).json({ error: err.message }); }
};
exports.addAd = async (req, res) => {
    try {
        const { title, target_url, area } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        await db.query('INSERT INTO ads (title, image_path, target_url, area) VALUES (?, ?, ?, ?)', [title, imagePath, target_url, area]);
        res.json({ message: 'Reklam eklendi' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
exports.deleteAd = async (req, res) => {
    try { await db.query('DELETE FROM ads WHERE id = ?', [req.params.id]); res.json({ message: 'Silindi' }); } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- KÖŞE YAZILARI (DÜZELTİLMİŞ BÖLÜM) ---

// Yazarları Getir (Admin panelinde yazar listesi gerekirse diye)
exports.getAuthors = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, full_name, image_path FROM users WHERE role IN ('admin', 'editor', 'author')");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Yazıları Getir (BURASI HATALIYDI, DÜZELTİLDİ)
exports.getColumnPosts = async (req, res) => {
    try {
        const sql = `
            SELECT p.*, u.full_name as author_name, 
            IFNULL(u.image_path, '') as author_image 
            FROM column_posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) { 
        console.error("🔥 Listeleme Hatası:", err);
        res.status(500).json({ error: err.message }); 
    }
};

// Yazı Ekle
exports.addColumnPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Güvenlik kontrolü
        if (!req.userData) return res.status(401).json({ message: 'Oturum hatası.' });

        const userId = req.userData.userId;
        const permissions = req.userData.permissions || {};

        // Yetki kontrolü
        if (!permissions.all && !permissions.can_post_column) {
            return res.status(403).json({ message: 'Yetkiniz yok.' });
        }

        await db.query('INSERT INTO column_posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId]);
        res.json({ message: 'Köşe yazısı yayınlandı' });
    } catch (err) { 
        console.error("🔥 Ekleme Hatası:", err);
        res.status(500).json({ error: err.message }); 
    }
};

exports.deleteColumnPost = async (req, res) => {
    try {
        const permissions = req.userData ? (req.userData.permissions || {}) : {};
        if (!permissions.all && !permissions.can_delete_column) {
            return res.status(403).json({ message: 'Silme yetkiniz yok!' });
        }

        await db.query('DELETE FROM column_posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Yazı silindi' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ID'ye göre tek bir köşe yazısını getir
exports.getColumnPostById = async (req, res) => {
    try {
        const sql = `
            SELECT p.*, u.full_name as author_name, 
            IFNULL(u.image_path, '') as author_image 
            FROM column_posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'Yazı bulunamadı' });
        
        res.json(rows[0]);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};