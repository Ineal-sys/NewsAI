SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `NEWSAI` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci;
USE `NEWSAI`;

CREATE TABLE `articles` (
  `id` int NOT NULL,
  `url` text COLLATE utf8mb4_0900_as_ci,
  `image_url` text COLLATE utf8mb4_0900_as_ci,
  `title` text COLLATE utf8mb4_0900_as_ci,
  `summary` text COLLATE utf8mb4_0900_as_ci,
  `rating` int DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_0900_as_ci DEFAULT NULL,
  `Date_Feed` text COLLATE utf8mb4_0900_as_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci;

CREATE TABLE `ReadArticle` (
  `id` int NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` int NOT NULL,
  `read_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `URL` (
  `ID` int NOT NULL,
  `URL` text COLLATE utf8mb4_0900_as_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci;

INSERT INTO `URL` (`ID`, `URL`) VALUES
(1, 'https://www.lesnumeriques.com/intelligence-artificielle/rss.xml'),
(2, 'https://www.lesnumeriques.com/informatique/rss.xml'),
(3, 'https://www.lesnumeriques.com/gaming/rss.xml'),
(4, 'https://www.lesnumeriques.com/science-espace/rss.xml'),
(5, 'https://techcrunch.com/category/artificial-intelligence/feed/'),
(6, 'https://techcrunch.com/category/gaming/feed/'),
(7, 'https://techcrunch.com/category/hardware/feed/'),
(8, 'https://techcrunch.com/category/security/feed/'),
(9, 'https://www.theverge.com/rss/index.xml'),
(10, 'https://next.ink/feed/'),
(11, 'https://www.journaldugeek.com/tag/high-tech/feed/'),
(12, 'https://www.tomshardware.com/feeds/all'),
(13, 'https://hackaday.com/blog/feed/'),
(14, 'https://www.01net.com/actualites/feed/'),
(15, 'https://www.numerama.com/tech/feed/'),
(16, 'https://fr.gizmodo.com/science/feed'),
(17, 'https://openai.com/news/rss.xml'),
(18, 'https://deepmind.google/blog/rss.xml'),
(19, 'https://www.marktechpost.com/feed/'),
(25, 'https://www.reddit.com/r/MachineLearning/.rss'),
(26, 'https://www.it-connect.fr/feed/'),
(27, 'https://www.reddit.com/r/technology/.rss'),
(28, 'https://aws.amazon.com/fr/blogs/opensource/feed/'),
(29, 'https://fosspost.org/feed'),
(30, 'https://www.journalduhacker.net/rss'),
(31, 'https://www.reddit.com/r/selfhosted/.rss'),
(32, 'https://www.newscientist.com/feed/home/'),
(34, 'https://www.reddit.com/r/science/.rss'),
(35, 'https://korben.info/feed'),
(37, 'https://www.numerama.com/sciences/feed/'),
(39, 'https://www.numerama.com/sciences/feed/'),
(41, 'https://www.journaldugeek.com/category/science/feed/'),
(42, 'https://www.wired.com/feed/tag/ai/latest/rss');

CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ReadArticle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ReadArticle_userId_articleId_key` (`userId`,`articleId`),
  ADD KEY `ReadArticle_articleId_fkey` (`articleId`);

ALTER TABLE `URL`
  ADD PRIMARY KEY (`ID`);

ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_Name_key` (`name`) USING BTREE;


ALTER TABLE `articles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `ReadArticle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `URL`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `ReadArticle`
  ADD CONSTRAINT `ReadArticle_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReadArticle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
