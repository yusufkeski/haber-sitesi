const db = require('../db');
const slugify = require('slugify');
const fs = require('fs');

// 1. TÜM HABERLERİ GETİR (Filtreleme Destekli)
exports.getAllNews = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // 'slider' veya 'breaking' filtresi

    try {
        let whereClause = 'WHERE n.status = "published"';
        if (type === 'slider') whereClause += ' AND n.is_slider = 1';
        if (type === 'breaking') whereClause += ' AND n.is_breaking = 1';

        // Toplam sayıyı al
        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM news n ${whereClause}`);
        const totalItems = countResult[0].total;

        const sql = `
            SELECT n.*, c.name as category_name, c.color as category_color, u.full_name as author_name 
            FROM news n 
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            ${whereClause}
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

// 2. TEK HABER DETAYI
exports.getNewsBySlug = async (req, res) => {
    try {
        const sql = `
            SELECT n.*, c.name as category_name, u.full_name as author_name 
            FROM news n 
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.slug = ?
        `;
        const [rows] = await db.query(sql, [req.params.slug]);

        if (rows.length === 0) return res.status(404).json({ message: 'Haber bulunamadı' });

        db.query('UPDATE news SET view_count = view_count + 1 WHERE id = ?', [rows[0].id]);

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. YENİ HABER EKLE
exports.createNews = async (req, res) => {
    try {
        const { title, summary, content, category_id, is_breaking, is_slider } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        let slug = slugify(title, { lower: true, strict: true, locale: 'tr' });
        
        const [check] = await db.query('SELECT id FROM news WHERE slug = ?', [slug]);
        if (check.length > 0) slug += `-${Date.now()}`;

        const sql = `
            INSERT INTO news (title, slug, summary, content, image_path, category_id, author_id, status, is_breaking, is_slider) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
        `;

        await db.query(sql, [
            title, slug, summary, content, imagePath, category_id, 
            req.userData.userId, 
            is_breaking === 'true' ? 1 : 0, 
            is_slider === 'true' ? 1 : 0
        ]);

        res.status(201).json({ message: 'Haber başarıyla eklendi', slug });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. HABER SİL
exports.deleteNews = async (req, res) => {
    try {
        const [item] = await db.query('SELECT image_path FROM news WHERE id = ?', [req.params.id]);

        if (item.length > 0 && item[0].image_path) {
            const filePath = `public${item[0].image_path}`; 
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.json({ message: 'Haber ve resmi silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. HABER GÜNCELLE
exports.updateNews = async (req, res) => {
    try {
        const { title, summary, content, category, is_breaking, is_slider } = req.body;
        const newsId = req.params.id;

        let slug = slugify(title, { lower: true, strict: true, locale: 'tr' });
        slug += `-${Date.now()}`;

        const [catResult] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
        const categoryId = catResult.length > 0 ? catResult[0].id : 1;

        let queryParams = [
            title, slug, summary, content, categoryId, 
            is_breaking === 'true' ? 1 : 0, 
            is_slider === 'true' ? 1 : 0
        ];

        let imageSqlPart = "";
        if (req.file) {
            const imagePath = `/uploads/${req.file.filename}`;
            imageSqlPart = ", image_path = ?";
            queryParams.push(imagePath);
        }

        queryParams.push(newsId);

        const sql = `
            UPDATE news 
            SET title=?, slug=?, summary=?, content=?, category_id=?, is_breaking=?, is_slider=?, status='published', updated_at=NOW() ${imageSqlPart}
            WHERE id=?
        `;

        await db.query(sql, queryParams);
        res.json({ message: 'Haber başarıyla güncellendi!' });
    } catch (err) {
        res.status(500).json({ error: 'Güncelleme hatası.' });
    }
};

// 6. DURUM DEĞİŞTİR (Manşet Yap/Çıkar)
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { field, value } = req.body; // field: 'is_slider', value: 1 veya 0

        if (!['is_slider', 'is_breaking'].includes(field)) {
             return res.status(400).json({ message: 'Geçersiz işlem!' });
        }

        const sql = `UPDATE news SET ${field} = ? WHERE id = ?`;
        await db.query(sql, [value, id]);
        
        res.json({ message: 'Durum güncellendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};