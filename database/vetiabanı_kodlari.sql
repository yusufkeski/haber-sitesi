-- 1. Veritabanını oluştur ve seç
CREATE DATABASE IF NOT EXISTS nerik_db;
USE nerik_db;

-- 2. ÖNCE KULLANICILAR TABLOSU (Foreign Key hatası almamak için)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'editor', 'author') DEFAULT 'author',
    permissions JSON,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SONRA KATEGORİLER TABLOSU
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#2563eb'
);

-- 4. EN SON HABERLER TABLOSU (Düzeltilmiş Hali)
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE, -- HATA ÇÖZÜMÜ: 255 yerine 191 yapıldı.
    summary VARCHAR(500),
    content LONGTEXT,
    image_path VARCHAR(255),
    category_id INT,
    author_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    is_breaking BOOLEAN DEFAULT 0,
    is_slider BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. AYARLAR TABLOSU
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value LONGTEXT
);

-- Örnek Kategoriler Ekle
INSERT INTO categories (name, slug) VALUES 
('Gündem', 'gundem'), 
('Spor', 'spor'), 
('Ekonomi', 'ekonomi');

-- Örnek Admin Hesabı (Test için)
INSERT INTO users (username, password_hash, full_name, role, permissions) 
VALUES ('admin', 'hashlenmis_sifre_ornegi', 'Osman Bey', 'admin', '{"all": true}');