const db = require('../db');

exports.getPolls = async (req, res) => {
    try {
        // Promise yapısına uygun olarak await kullanıyoruz (callback yok)
        const [results] = await db.query('SELECT * FROM poll_options ORDER BY id ASC');
        res.json(results);
    } catch (err) {
        console.error("Anketleri çekerken hata:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.votePoll = async (req, res) => {
    const { optionId } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // 1. Bu IP daha önce oy kullanmış mı?
        const [results] = await db.query('SELECT id FROM poll_votes WHERE ip_address = ?', [ipAddress]);

        if (results.length > 0) {
            return res.status(403).json({ message: 'Daha önce oy kullandınız. İlginiz için teşekkürler!' });
        }

        // 2. Kullanmamışsa IP'yi kaydet
        await db.query('INSERT INTO poll_votes (ip_address) VALUES (?)', [ipAddress]);
        
        // 3. İlgili şıkkın oy sayısını 1 artır
        await db.query('UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ?', [optionId]);
        
        res.json({ message: 'Oyunuz başarıyla kaydedildi!' });
    } catch (err) {
        console.error("Oy kullanırken hata:", err);
        res.status(500).json({ error: err.message });
    }
};