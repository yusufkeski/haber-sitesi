const db = require('../db');

exports.getAllVideos = async (req, res) => {
    try {
        const [videos] = await db.query('SELECT * FROM videos ORDER BY created_at DESC');
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addVideo = async (req, res) => {
    try {
        const { title, video_url } = req.body;
        // Youtube Embed linkine çevirme (Basit mantık)
        // Link: https://www.youtube.com/watch?v=dQw4w9WgXcQ -> Embed: https://www.youtube.com/embed/dQw4w9WgXcQ
        let finalUrl = video_url;
        if(video_url.includes('watch?v=')) {
            finalUrl = video_url.replace('watch?v=', 'embed/');
        } else if(video_url.includes('youtu.be/')) {
            finalUrl = video_url.replace('youtu.be/', 'youtube.com/embed/');
        }

        const sql = 'INSERT INTO videos (title, video_url) VALUES (?, ?)';
        await db.query(sql, [title, finalUrl]);
        res.status(201).json({ message: 'Video eklendi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        await db.query('DELETE FROM videos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Video silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};