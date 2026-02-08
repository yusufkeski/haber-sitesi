const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Token'ı header'dan al ("Bearer <token>" formatında)
        const token = req.headers.authorization.split(' ')[1];
        
        // Şifreyi çöz
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verileri isteğe ekle
        req.userData = { 
            userId: decodedToken.id, 
            role: decodedToken.role,
            permissions: decodedToken.permissions 
        };
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Yetkisiz erişim! Lütfen giriş yapın.' });
    }
};