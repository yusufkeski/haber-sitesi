const db = require('../db');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. GENEL SAYILAR (Kartlar için)
        // Toplam Haber
        const [newsCount] = await db.query('SELECT COUNT(*) as total FROM news');
        // Toplam Okunma (Tüm haberlerin view_count toplamı)
        const [viewsCount] = await db.query('SELECT SUM(view_count) as total FROM news');
        // Toplam Personel
        const [usersCount] = await db.query('SELECT COUNT(*) as total FROM users');

        // 2. EDİTÖR PERFORMANSI (Pasta Grafik)
        // Hangi yazar kaç haber girmiş?
        const sqlAuthorPerf = `
            SELECT u.full_name, COUNT(n.id) as news_count 
            FROM users u 
            LEFT JOIN news n ON u.id = n.author_id 
            GROUP BY u.id 
            HAVING news_count > 0
        `;
        const [authorStats] = await db.query(sqlAuthorPerf);

        // 3. EN ÇOK OKUNAN 5 HABER (Bar Grafik veya Liste)
        const sqlTopNews = `
            SELECT title, view_count 
            FROM news 
            ORDER BY view_count DESC 
            LIMIT 5
        `;
        const [topNews] = await db.query(sqlTopNews);

        // 4. SON 7 GÜNDE EKLENEN HABERLERİN PERFORMANSI (Bar Grafik)
        // Tarihe göre değil, habere göre getireceğiz.
        const sqlLast7Days = `
            SELECT title, view_count, DATE_FORMAT(created_at, '%d.%m') as short_date
            FROM news 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at ASC
        `;
        const [last7Days] = await db.query(sqlLast7Days);

        // Hepsini paketleyip gönder
        res.json({
            totalNews: newsCount[0].total,
            totalViews: viewsCount[0].total || 0, // Hiç okunma yoksa 0 dönsün
            totalUsers: usersCount[0].total,
            authorStats: authorStats,
            topNews: topNews,
            last7Days: last7Days
        });

    } catch (err) {
        console.error("Dashboard İstatistik Hatası:", err);
        res.status(500).json({ error: err.message });
    }
};