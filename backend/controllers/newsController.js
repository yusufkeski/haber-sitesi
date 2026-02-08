// backend/controllers/newsController.js
const db = require('../db');
const slugify = require('slugify');
const fs = require('fs');

// 1. TÜM HABERLERİ GETİR (Sayfalama Destekli)
exports.getAllNews = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Sayfa başı 10 haber
    const offset = (page - 1) * limit;

    try {
        // Önce toplam haber sayısını al (Sayfalama hesabı için)
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM news WHERE status = "published"');
        const totalItems = countResult[0].total;

        // Haberleri çek (Yazar ve Kategori bilgisiyle beraber - JOIN işlemi)
        const sql = `
            SELECT n.*, c.name as category_name, c.color as category_color, u.full_name as author_name 
            FROM news n 
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.author_id
            WHERE n.status = "published"
            ORDER BY n.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const [news] = await db.query(sql, [limit, offset]);

        res.json({
            news,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. TEK HABER DETAYI (SLUG İLE)
exports.getNewsBySlug = async (req, res) => {
    try {
        // Haberi çek
        const sql = `
            SELECT n.*, c.name as category_name, u.full_name as author_name 
            FROM news n 
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.slug = ?
        `;
        const [rows] = await db.query(sql, [req.params.slug]);

        if (rows.length === 0) return res.status(404).json({ message: 'Haber bulunamadı' });

        // Görüntülenme sayısını artır (Bunu asenkron yap, kullanıcıyı bekletme)
        db.query('UPDATE news SET view_count = view_count + 1 WHERE id = ?', [rows[0].id]);

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. YENİ HABER EKLE (Admin/Yazar)
exports.createNews = async (req, res) => {
    try {
        const { title, summary, content, category_id, is_breaking, is_slider } = req.body;
        
        // Resim yüklendi mi kontrolü
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        // URL (Slug) oluştur (Örn: "Büyük Yangın" -> "buyuk-yangin")
        let slug = slugify(title, { lower: true, strict: true, locale: 'tr' });
        
        // Aynı slug var mı diye kontrol et, varsa sonuna rastgele sayı ekle
        const [check] = await db.query('SELECT id FROM news WHERE slug = ?', [slug]);
        if (check.length > 0) slug += `-${Date.now()}`;

        const sql = `
            INSERT INTO news (title, slug, summary, content, image_path, category_id, author_id, status, is_breaking, is_slider) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
        `;

        await db.query(sql, [
            title, 
            slug, 
            summary, 
            content, 
            imagePath, 
            category_id, 
            req.userData.userId, // Token'dan gelen kullanıcı ID
            is_breaking === 'true' ? 1 : 0, 
            is_slider === 'true' ? 1 : 0
        ]);

        res.status(201).json({ message: 'Haber başarıyla eklendi', slug });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. HABER SİL (Admin)
exports.deleteNews = async (req, res) => {
    try {
        // Önce resim yolunu bul ki dosyayı da silelim
        const [item] = await db.query('SELECT image_path FROM news WHERE id = ?', [req.params.id]);
        
        if (item.length > 0 && item[0].image_path) {
            const filePath = `public${item[0].image_path}`;
            // Dosyayı sistemden sil
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.json({ message: 'Haber ve resmi silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};