const db = require('../db');
const fs = require('fs');
const path = require('path');

/* ================= CACHE ================= */
let sliderCache = null;
let sliderCacheTime = 0;

/* ================= 1️⃣ TÜM HABERLER (HOME LİSTE – HAFİF) ================= */
exports.getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const [news] = await db.query(`
            SELECT n.*, c.name AS category_name
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [countResult] = await db.query('SELECT COUNT(*) as count FROM news');
        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);

        res.json({
            news,
            total,
            page,
            totalPages
        });

    } catch (err) {
        console.error("Haber Listeleme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};



/* ================= 2️⃣ KATEGORİYE GÖRE ================= */
exports.getNewsByCategory = async (req, res) => {
    try {
        const categoryName = req.params.category;

        const sql = `
            SELECT 
                n.id,
                n.title,
                n.slug,
                n.image_path,
                n.created_at,
                c.name AS category_name
            FROM news n
            JOIN categories c ON n.category_id = c.id
            WHERE c.name = ?
            ORDER BY n.created_at DESC
        `;

        const [rows] = await db.query(sql, [categoryName]);
        res.json(rows);
    } catch (err) {
        console.error("Kategori Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 3️⃣ ARAMA ================= */
exports.searchNews = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        if (!searchTerm) return res.json([]);

        const query = `%${searchTerm}%`;

        const sql = `
            SELECT 
                n.id,
                n.title,
                n.slug,
                n.image_path,
                n.created_at,
                c.name AS category_name
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            WHERE n.title LIKE ?
            ORDER BY n.created_at DESC
        `;

        const [rows] = await db.query(sql, [query]);
        res.json(rows);
    } catch (err) {
        console.error("Arama Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 4️⃣ TEK HABER DETAY (FULL DATA) ================= */
exports.getNewsBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;

        await db.query('UPDATE news SET view_count = view_count + 1 WHERE slug = ?', [slug]);

        const sql = `
            SELECT n.*,
                   c.name AS category_name,
                   u.full_name AS author_name,
                   u.image_path AS author_image
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.slug = ?
        `;

        const [rows] = await db.query(sql, [slug]);
        if (!rows.length) return res.status(404).json({ message: 'Haber bulunamadı' });

        const [media] = await db.query('SELECT * FROM news_media WHERE news_id = ?', [rows[0].id]);
        rows[0].gallery = media;

        res.json(rows[0]);
    } catch (err) {
        console.error("Haber Detay Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 5️⃣ HABER EKLE ================= */
exports.addNews = async (req, res) => {
    try {
        const { title, content, category_id, is_slider, is_breaking } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        const authorId = req.userData?.userId || null;

        const slug = title.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-');

        const sql = `
            INSERT INTO news 
            (title, slug, content, category_id, image_path, is_slider, is_breaking, author_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            title, slug, content, category_id, imagePath,
            is_slider === '1', is_breaking === '1', authorId
        ]);

        sliderCache = null; // cache temizle
        res.json({ message: 'Haber eklendi', insertId: result.insertId });

    } catch (err) {
        console.error("HABER EKLEME ÇÖKTÜ:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 6️⃣ HABER GÜNCELLE ================= */
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
        sliderCache = null;
        res.json({ message: 'Haber güncellendi' });

    } catch (err) {
        console.error("Güncelleme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 7️⃣ HABER SİL ================= */
exports.deleteNews = async (req, res) => {
    try {
        await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        sliderCache = null;
        res.json({ message: 'Haber silindi' });
    } catch (err) {
        console.error("Silme Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 8️⃣ SLIDER / BREAKING TOGGLE ================= */
exports.toggleNewsStatus = async (req, res) => {
    try {
        const { field, status } = req.body;
        const id = req.params.id;

        const value = (status === true || status === 'true' || status === 1) ? 1 : 0;
        await db.query(`UPDATE news SET ${field} = ? WHERE id = ?`, [value, id]);

        sliderCache = null;
        res.json({ message: 'Durum güncellendi' });
    } catch (err) {
        console.error("Toggle Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 9️⃣ GALERİ MEDYASI ================= */
exports.addNewsMedia = async (req, res) => {
    try {
        const newsId = req.params.id;
        if (!req.files?.length) return res.status(400).json({ message: 'Dosya yok' });

        for (let file of req.files) {
            await db.query(
                'INSERT INTO news_media (news_id, media_type, media_path) VALUES (?, ?, ?)',
                [newsId, 'image', `/uploads/${file.filename}`]
            );
        }

        res.json({ message: 'Galeri eklendi' });
    } catch (err) {
        console.error("Galeri ekleme hatası:", err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= 🔥 SLIDER HABERLERİ (CACHE) ================= */
exports.getSliderNews = async (req, res) => {
    try {
        if (sliderCache && Date.now() - sliderCacheTime < 60000) {
            return res.json(sliderCache);
        }

        const [rows] = await db.query(`
            SELECT id, title, slug, image_path, created_at
            FROM news
            WHERE is_slider = 1
            ORDER BY created_at DESC
            LIMIT 5
        `);

        sliderCache = rows;
        sliderCacheTime = Date.now();
        res.json(rows);

    } catch (err) {
        console.error("Slider Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};
