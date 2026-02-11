const db = require('../db');

// Puan Durumunu Getir (ve yeni takımları otomatik senkronize et)
exports.getStandings = async (req, res) => {
    try {
        // 1. Anasayfada göster/gizle ayarını çek
        const [settings] = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = "show_standings"');
        const isVisible = settings.length > 0 ? settings[0].setting_value === '1' : false;

        // 2. Aktif sezonu bul
        const [seasons] = await db.query('SELECT id FROM seasons WHERE is_active = 1 LIMIT 1');
        if (seasons.length === 0) {
            return res.json({ isVisible, teams: [], message: 'Aktif sezon bulunamadı.' });
        }
        const activeSeasonId = seasons[0].id;

        // 3. OTO-SENKRONİZASYON: Takımlar tablosundaki takımları puan tablosuna 0 puanla ekle
        const [allTeams] = await db.query('SELECT id FROM teams');
        const [existingStandings] = await db.query('SELECT team_id FROM standings WHERE season_id = ?', [activeSeasonId]);
        const existingTeamIds = existingStandings.map(s => s.team_id);

        for (let team of allTeams) {
            // Eğer takım bu sezonun puan tablosunda yoksa, 0 puanla dahil et
            if (!existingTeamIds.includes(team.id)) {
                await db.query('INSERT INTO standings (season_id, team_id) VALUES (?, ?)', [activeSeasonId, team.id]);
            }
        }

        // 4. Tabloyu takımların logoları ve adlarıyla birlikte çekip sırala (Önce puana, sonra averaja göre)
        const [standings] = await db.query(`
            SELECT s.*, t.name as team_name, t.logo_path 
            FROM standings s
            JOIN teams t ON s.team_id = t.id
            WHERE s.season_id = ?
            ORDER BY s.points DESC, (s.goals_for - s.goals_against) DESC, s.won DESC
        `, [activeSeasonId]);

        res.json({ isVisible, teams: standings });
    } catch (err) {
        console.error("Puan durumu çekilirken hata:", err);
        res.status(500).json({ error: err.message });
    }
};

// Görünürlüğü Aç/Kapa
exports.toggleVisibility = async (req, res) => {
    const { isVisible } = req.body;
    const val = isVisible ? '1' : '0';
    try {
        await db.query('UPDATE site_settings SET setting_value = ? WHERE setting_key = "show_standings"', [val]);
        res.json({ message: 'Puan durumu görünürlüğü güncellendi!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Excel gibi girilen puanları kaydet
exports.updateTeamStats = async (req, res) => {
    const teams = req.body; 
    try {
        for (let team of teams) {
            await db.query(
                'UPDATE standings SET played=?, won=?, drawn=?, lost=?, goals_for=?, goals_against=?, points=? WHERE id=?',
                [team.played, team.won, team.drawn, team.lost, team.goals_for, team.goals_against, team.points, team.id]
            );
        }
        res.json({ message: 'Puan durumu başarıyla güncellendi!' });
    } catch (err) {
        console.error("Puan güncellenirken hata:", err);
        res.status(500).json({ error: err.message });
    }
};