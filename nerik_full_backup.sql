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
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.ads: 2 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `ads` DISABLE KEYS */;
INSERT INTO `ads` (`id`, `title`, `image_path`, `target_url`, `area`, `is_active`, `created_at`) VALUES
	(1, 'adcac', '/uploads/1770585228366.jpeg', 'asvadcav', 'sidebar', 1, '2026-02-08 21:13:48'),
	(2, 'fiş', '/uploads/1770590495875.webp', 'https://www.google.com/', 'header', 1, '2026-02-08 22:41:35');
/*!40000 ALTER TABLE `ads` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#2563eb',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.categories: 4 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`, `slug`, `color`) VALUES
	(1, 'Gündem', 'gundem', '#2563eb'),
	(2, 'Spor', 'spor', '#2563eb'),
	(3, 'Ekonomi', 'ekonomi', '#2563eb'),
	(5, 'TEKNOLOJİ', '', '#2563eb');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.column_posts
CREATE TABLE IF NOT EXISTS `column_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.column_posts: 1 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `column_posts` DISABLE KEYS */;
INSERT INTO `column_posts` (`id`, `user_id`, `title`, `content`, `view_count`, `created_at`) VALUES
	(4, 2, 'köşe yazısı 1', '<ul><li>avsdvsfvdxfvscasdvsdvs<u>df&nbsp;df&nbsp;sf</u><em><u>sfvesvds</u></em><strong><em><u>svsvsdvsdvdsvsdcsdv&nbsp;sdvsdvsdvsvsdvsvsdvsdvsdv</u></em></strong><sub><strong><em><u>svsvsdvsdsdv</u></em></strong></sub><sup><strong><em><u>vsdvsdvsd</u></em></strong></sup><strong><em><u>svsvsdvsdvd</u></em></strong><strong class="ql-size-huge"><em><u>vdsvsdvs</u></em></strong><strong class="ql-size-small"><em><u>dsvsdvs</u></em></strong><strong><em><u>vsdvsvd</u></em></strong><strong style="background-color: rgb(230, 0, 0);"><em><u>vsdvsdvsdv</u></em></strong><strong style="background-color: rgb(0, 0, 0);"><em><u>sdvsdv</u></em></strong><strong><em><u>sdvsdvsdvsd</u></em></strong><strong style="color: rgb(68, 68, 68);"><em><u>sdvsdvsdv</u></em></strong><strong style="color: rgb(230, 0, 0);"><em><u>sdvsdvsdsdvs</u></em></strong><strong style="color: rgb(230, 0, 0);" class="ql-font-serif"><em><u>vsdvsdvsd</u></em></strong><strong style="color: rgb(230, 0, 0);" class="ql-font-monospace"><em><u>vsdvsdvsdvsdvs</u></em></strong></li></ul>', 0, '2026-02-09 19:44:21');
/*!40000 ALTER TABLE `column_posts` ENABLE KEYS */;

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
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.news: 3 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` (`id`, `title`, `slug`, `summary`, `content`, `image_path`, `category_id`, `author_id`, `status`, `view_count`, `is_breaking`, `is_slider`, `created_at`, `updated_at`) VALUES
	(1, 'Deneme Haber', 'deneme-haber-1770577555973', NULL, '<h1 class="ql-align-center"><em><u>Haber</u></em></h1><h2 class="ql-align-center"><s>Haber</s></h2><p class="ql-align-center"></p><p>Sistem Çalışıyor İse Haber <strong>Görüntülenecektir.</strong></p>', '/uploads/1770577555962.jpg', 1, 2, 'published', 12, 1, 1, '2026-02-08 18:07:34', '2026-02-10 23:04:55'),
	(3, 'Aziz Baytekini siktiler', 'aziz-baytekini-siktiler-1770590892780', NULL, '<p>Vezirköprü KYK yurdunda 405 numaralı odada kalan Aziz Baytekin, oda arkadaşı <strong>Yusuf Keski</strong> ve <strong>Ufuk Bildik</strong> tarafından Gangbang tecavüze uğradı. Bu olaydan sonra Oturma ve yürüme yetisini kaybeden aziz baytekin şuanda sadece yatabiliyor.</p><p></p><p>https://www.youtube.com/watch?v=yr7mYngK1Xc&amp;pp=ygUWa8O8cnQgdHJhdmVzdGkgxZ9hcmvEsdIHCQmRCgGHKiGM7w%3D%3D</p>', '/uploads/1770578141018.jpg', 3, 2, 'published', 14, 1, 1, '2026-02-08 19:15:41', '2026-02-10 23:04:54'),
	(4, 'Bakire Anteplinin Hazin Sonu ...', 'bakire-anteplinin-hazin-sonu-1770590909931', NULL, '<p>Antepli bakire genç <strong><u>Erdal Muhittin Sikikalkan,</u></strong> Sultan Taş adlı şahıs tarafından sikilerek öldürüldü. </p>', '/uploads/1770590676323.jpg', 2, 3, 'published', 9, 1, 1, '2026-02-08 22:44:36', '2026-02-10 23:07:31');
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
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.users: 2 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`, `permissions`, `is_active`, `created_at`, `image_path`) VALUES
	(2, 'admin', '$2b$10$vpgtTA51GVgFZZpKJgFwcODV8gjWEhTpmH/crgj70Wpj8yCCzHYJ2', 'admin', 'admin', '{"all": true}', 1, '2026-02-08 14:12:57', NULL),
	(3, 'yusufseksi', '$2b$10$txr0hbMElcy9h4i7QYiIjevhO2q6OjdgQ9divFfRhHrU/.PQnnxQ6', 'Yusuf Keski', 'editor', '{"can_edit_news": true}', 1, '2026-02-08 22:32:46', '/uploads/1770589966617.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

-- tablo yapısı dökülüyor nerik_db.videos
CREATE TABLE IF NOT EXISTS `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nerik_db.videos: 1 rows tablosu için veriler indiriliyor
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` (`id`, `title`, `url`, `created_at`) VALUES
	(2, 'asdasd', 'https://www.youtube.com/embed/yr7mYngK1Xc', '2026-02-08 20:28:06');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
