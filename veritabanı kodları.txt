-- --------------------------------------------------------
-- Sunucu:                       127.0.0.1
-- Sunucu sürümü:                8.4.7 - MySQL Community Server - GPL
-- Sunucu İşletim Sistemi:       Win64
-- HeidiSQL Sürüm:               12.14.0.7170
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- nerik_db için veritabanı yapısı dökülüyor
CREATE DATABASE IF NOT EXISTS `nerik_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `nerik_db`;

-- tablo yapısı dökülüyor nerik_db.ads
CREATE TABLE IF NOT EXISTS `ads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area` enum('header','sidebar','footer') COLLATE utf8mb4_unicode_ci DEFAULT 'sidebar',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.ads: 0 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `ads` DISABLE KEYS */;
/*!40000 ALTER TABLE `ads` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#2563eb',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.categories: 3 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`, `slug`, `color`) VALUES
	(1, 'Gündem', 'gundem', '#2563eb'),
	(2, 'Spor', 'spor', '#2563eb'),
	(3, 'Ekonomi', 'ekonomi', '#2563eb');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.column_posts
CREATE TABLE IF NOT EXISTS `column_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `columnist_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `columnist_id` (`columnist_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.column_posts: 0 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `column_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `column_posts` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.columnists
CREATE TABLE IF NOT EXISTS `columnists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.columnists: 0 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `columnists` DISABLE KEYS */;
/*!40000 ALTER TABLE `columnists` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.news
CREATE TABLE IF NOT EXISTS `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `view_count` int DEFAULT '0',
  `is_breaking` tinyint(1) DEFAULT '0',
  `is_slider` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `author_id` (`author_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.news: 0 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` (`id`, `title`, `slug`, `summary`, `content`, `image_path`, `category_id`, `author_id`, `status`, `view_count`, `is_breaking`, `is_slider`, `created_at`, `updated_at`) VALUES
	(1, 'Deneme Haber', 'deneme-haber-1770577555973', NULL, '<h1 class="ql-align-center"><em><u>Haber</u></em></h1><h2 class="ql-align-center"><s>Haber</s></h2><p class="ql-align-center"></p><p>Sistem Çalışıyor İse Haber <strong>Görüntülenecektir.</strong></p>', '/uploads/1770577555962.jpg', 1, 2, 'published', 7, 0, 0, '2026-02-08 18:07:34', '2026-02-08 20:21:46'),
	(3, 'Aziz Baytekini siktiler', 'aziz-baytekini-siktiler', NULL, '<p>Vezirköprü KYK yurdunda 405 numaralı odada kalan Aziz Baytekin, oda arkadaşı <strong>Yusuf Keski</strong> ve <strong>Ufuk Bildik</strong> tarafından Gangbang tecavüze uğradı. Bu olaydan sonra Oturma ve yürüme yetisini kaybeden aziz baytekin şuanda sadece yatabiliyor.</p>', '/uploads/1770578141018.jpg', NULL, 2, 'published', 2, 1, 1, '2026-02-08 19:15:41', '2026-02-08 20:21:46');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.settings
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`setting_key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.settings: 0 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','editor','author') COLLATE utf8mb4_unicode_ci DEFAULT 'author',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.users: 1 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`, `permissions`, `is_active`, `created_at`) VALUES
	(2, 'admin', '$2b$10$vpgtTA51GVgFZZpKJgFwcODV8gjWEhTpmH/crgj70Wpj8yCCzHYJ2', 'Osman Bey', 'admin', '{"all": true}', 1, '2026-02-08 14:12:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.videos
CREATE TABLE IF NOT EXISTS `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.videos: 0 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` (`id`, `title`, `url`, `created_at`) VALUES
	(1, 'asdasf', 'https://www.youtube.com/embed/aWMdUqyk3Ys&list=RDaWMdUqyk3Ys&start_radio=1', '2026-02-08 20:27:34'),
	(2, 'asdasd', 'https://www.youtube.com/embed/yr7mYngK1Xc', '2026-02-08 20:28:06');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
