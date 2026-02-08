// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Token genelde "Bearer <token>" şeklinde gelir
        const token = req.headers.authorization.split(' ')[1];
        
        // Token'ı şifreyle çözmeye çalış
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Çözülen veriyi isteğe ekle (req.userData içinde id ve role olacak)
        req.userData = { 
            userId: decodedToken.id, 
            role: decodedToken.role 
        };
        
        next(); // Her şey yolunda, geçebilirsin
    } catch (error) {
        res.status(401).json({ message: 'Yetkisiz erişim! Lütfen giriş yapın.' });
    }
};