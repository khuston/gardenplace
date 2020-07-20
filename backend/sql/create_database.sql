-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.5.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for gardenplace
CREATE DATABASE IF NOT EXISTS `gardenplace` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `gardenplace`;

-- Dumping structure for table gardenplace.email_verifications
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` binary(4) NOT NULL DEFAULT '\0\0\0\0',
  `expires` datetime NOT NULL,
  `user_id` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `expires` (`expires`),
  KEY `code` (`code`),
  KEY `FK_email_verifications_users` (`user_id`),
  CONSTRAINT `FK_email_verifications_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.gardeners
CREATE TABLE IF NOT EXISTS `gardeners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `garden_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__users` (`user_id`),
  KEY `FK__gardens` (`garden_id`),
  CONSTRAINT `FK__gardens` FOREIGN KEY (`garden_id`) REFERENCES `gardens` (`id`),
  CONSTRAINT `FK__users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.gardens
CREATE TABLE IF NOT EXISTS `gardens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.garden_images
CREATE TABLE IF NOT EXISTS `garden_images` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `image_id` bigint(20) NOT NULL,
  `garden_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__images` (`image_id`),
  KEY `FK_garden_images_gardens` (`garden_id`),
  CONSTRAINT `FK__images` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  CONSTRAINT `FK_garden_images_gardens` FOREIGN KEY (`garden_id`) REFERENCES `gardens` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.garden_owners
CREATE TABLE IF NOT EXISTS `garden_owners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `garden_id` bigint(20) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__owned_gardens` (`garden_id`),
  KEY `FK__owners` (`owner_id`),
  CONSTRAINT `FK__owned_gardens` FOREIGN KEY (`garden_id`) REFERENCES `gardens` (`id`),
  CONSTRAINT `FK__owners` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.images
CREATE TABLE IF NOT EXISTS `images` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `private_url` varchar(4096) DEFAULT NULL,
  `uploaded` datetime NOT NULL,
  `description` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.plants
CREATE TABLE IF NOT EXISTS `plants` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT '0',
  `garden_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_plants_gardens` (`garden_id`),
  CONSTRAINT `FK_plants_gardens` FOREIGN KEY (`garden_id`) REFERENCES `gardens` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.plant_images
CREATE TABLE IF NOT EXISTS `plant_images` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plant_id` bigint(20) NOT NULL,
  `image_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__plants2` (`plant_id`),
  KEY `FK__images2` (`image_id`),
  CONSTRAINT `FK__images2` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  CONSTRAINT `FK__plants2` FOREIGN KEY (`plant_id`) REFERENCES `plants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.plant_owners
CREATE TABLE IF NOT EXISTS `plant_owners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plant_id` bigint(20) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__owned_plants` (`plant_id`),
  KEY `FK__plant_owners` (`owner_id`),
  CONSTRAINT `FK__owned_plants` FOREIGN KEY (`plant_id`) REFERENCES `plants` (`id`),
  CONSTRAINT `FK__plant_owners` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `author_id` bigint(20) NOT NULL,
  `first_published` datetime NOT NULL,
  `last_edited` datetime DEFAULT NULL,
  `text` varchar(15000) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK__sessions` (`author_id`),
  CONSTRAINT `FK__sessions` FOREIGN KEY (`author_id`) REFERENCES `sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.post_images
CREATE TABLE IF NOT EXISTS `post_images` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) NOT NULL,
  `image_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_post_images_posts` (`post_id`),
  KEY `FK_post_images_images` (`image_id`),
  CONSTRAINT `FK_post_images_images` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  CONSTRAINT `FK_post_images_posts` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `session_token` binary(16) NOT NULL,
  `user_id` bigint(20) NOT NULL DEFAULT 0,
  `ipv4_address` binary(4) DEFAULT NULL,
  `ipv6_address` binary(16) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires` datetime NOT NULL,
  `nonce` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_token`),
  KEY `FK_sessions_users` (`user_id`),
  CONSTRAINT `FK_sessions_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gardenplace.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(320) NOT NULL,
  `email_verified` bit(1) NOT NULL DEFAULT b'0',
  `hash` binary(60) NOT NULL DEFAULT '0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0',
  `nonce` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
