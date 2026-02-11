const db = require('../db');

// Tüm Takımları Getir
exports.getTeams = async (req, res) => {
    try {
        const [teams] = await db.query('SELECT * FROM teams ORDER BY name ASC');
        res.json(teams);
    } catch (err) {
        console.error("Takımlar çekilirken hata:", err);
        res.status(500).json({ error: err.message });
    }
};

// Yeni Takım Ekle (Logo ile birlikte)
exports.addTeam = async (req, res) => {
    const { name } = req.body;
    
    // Yüklenen logonun yolunu alıyoruz (Eğer logo yüklenmemişse null kalır)
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await db.query('INSERT INTO teams (name, logo_path) VALUES (?, ?)', [name, logoPath]);
        res.json({ message: 'Takım başarıyla eklendi!' });
    } catch (err) {
        console.error("Takım eklenirken hata:", err);
        res.status(500).json({ error: err.message });
    }
};

// Takım Sil
exports.deleteTeam = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM teams WHERE id = ?', [id]);
        res.json({ message: 'Takım başarıyla silindi!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};