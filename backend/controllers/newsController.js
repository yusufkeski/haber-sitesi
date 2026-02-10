const db = require('../db');
const fs = require('fs');
const path = require('path');

// 1. Tüm Haberleri Getir (JOIN ile Kategori Adını da alarak)
exports.getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        // DİKKAT: category_id üzerinden categories tablosuna bağlanıyoruz (LEFT JOIN)
        // Frontend 'news.category' beklediği için 'c.name as category' takma adını kullanıyoruz.
        const sql = `
            SELECT n.*, c.name as category 
            FROM news n 
            LEFT JOIN categories c ON n.category_id = c.id 
            ORDER BY n.created_at DESC 
            LIMIT ? OFFSET ?
        `;

        const [news] = await db.query(sql, [limit, offset]);
        const [countResult] = await db.query('SELECT COUNT(*) as count FROM news');
        
        res.json({
            news: news, 
            total: countResult[0].count,
            page: page
        });
    } catch (err) {
        console.error("Haber Listeleme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};

// 2. Kategoriye Göre Getir (İsmi ID'ye çevirerek veya JOIN ile)
exports.getNewsByCategory = async (req, res) => {
    try {
        const categoryName = req.params.category; // URL'den gelen: 'GÜNDEM'
        console.log("İstenen Kategori:", categoryName);

        // categories tablosuyla birleştirip isme göre arıyoruz
        const sql = `
            SELECT n.*, c.name as category_name 
            FROM news n 
            JOIN categories c ON n.category_id = c.id 
            WHERE c.name = ? 
            ORDER BY n.created_at DESC
        `;
        
        const [rows] = await db.query(sql, [categoryName]);
        
        console.log("Bulunan Haber Sayısı:", rows.length); // Terminalde bunu görmelisin
        res.json(rows);
    } catch (err) {
        console.error("❌ KATEGORİ HATASI:", err);
        res.status(500).json({ error: err.message });
    }
};

// 3. Arama Yap
exports.searchNews = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) return res.json([]);

        // Aramada da kategori ismini görmek isteyebilirsin
        const sql = `
            SELECT n.*, c.name as category 
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id 
            WHERE n.title LIKE ? OR n.content LIKE ? 
            ORDER BY n.created_at DESC
        `;
        const query = `%${searchTerm}%`;
        
        const [rows] = await db.query(sql, [query, query]);
        res.json(rows);
    } catch (err) {
        console.error("Arama Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};

// 4. Tek Haber Getir (Yazar Bilgisiyle Birlikte)
exports.getNewsBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;

        // 1. Önce okunma sayısını artır
        await db.query('UPDATE news SET view_count = view_count + 1 WHERE slug = ?', [slug]);

        // 2. Haberi çekerken USERS tablosuyla birleştir (JOIN)
        // u.full_name -> author_name olarak, u.image_path -> author_image olarak gelecek
        const sql = `
            SELECT n.*, 
                   c.name as category_name,
                   u.full_name as author_name,
                   u.image_path as author_image
            FROM news n 
            LEFT JOIN categories c ON n.category_id = c.id 
            LEFT JOIN users u ON n.author_id = u.id 
            WHERE n.slug = ?
        `;
        const [rows] = await db.query(sql, [slug]);

        if (rows.length === 0) return res.status(404).json({ message: 'Haber bulunamadı' });
        
        res.json(rows[0]);
    } catch (err) {
        console.error("Haber Detay Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};

// 5. Haber Ekle (Yazar ID'sini Kaydederek)
exports.addNews = async (req, res) => {
    try {
        const { title, content, category_id, is_slider, is_breaking } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        
        // Giriş yapan kullanıcının ID'sini al (Auth middleware sayesinde req.user.id dolu gelir)
        const authorId = req.user ? req.user.id : null; 

        const slug = title.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-');

        // author_id alanını da ekledik
        const sql = `INSERT INTO news (title, slug, content, category_id, image_path, is_slider, is_breaking, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.query(sql, [title, slug, content, category_id, imagePath, is_slider === 'true', is_breaking === 'true', authorId]);
        
        res.json({ message: 'Haber eklendi' });
    } catch (err) {
        console.error("Haber Ekleme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};

// 6. Haber Güncelle
exports.updateNews = async (req, res) => {
    try {
        const { title, content, category_id, is_slider, is_breaking } = req.body;
        const newsId = req.params.id;

        let sql = `UPDATE news SET title=?, content=?, category_id=?, is_slider=?, is_breaking=? WHERE id=?`;
        let params = [title, content, category_id, is_slider === 'true', is_breaking === 'true', newsId];

        if (req.file) {
            sql = `UPDATE news SET title=?, content=?, category_id=?, is_slider=?, is_breaking=?, image_path=? WHERE id=?`;
            params = [title, content, category_id, is_slider === 'true', is_breaking === 'true', `/uploads/${req.file.filename}`, newsId];
        }

        await db.query(sql, params);
        res.json({ message: 'Haber güncellendi' });
    } catch (err) {
        console.error("Güncelleme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};

// 7. Haber Sil
exports.deleteNews = async (req, res) => {
    try {
        await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.json({ message: 'Haber silindi' });
    } catch (err) {
        console.error("Silme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};

// 8. Durum Değiştir
exports.toggleNewsStatus = async (req, res) => {
    try {
        const { field, status } = req.body;
        const id = req.params.id;

        if (field !== 'is_slider' && field !== 'is_breaking') {
            return res.status(400).json({ message: 'Geçersiz alan' });
        }

        const value = (status === true || status === 'true' || status === 1) ? 1 : 0;
        await db.query(`UPDATE news SET ${field} = ? WHERE id = ?`, [value, id]);
        res.json({ message: 'Durum güncellendi' });
    } catch (err) {
        console.error("Toggle Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};