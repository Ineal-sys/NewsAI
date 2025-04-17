SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

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

CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  ADD UNIQUE KEY `User_email_key` (`email`);


ALTER TABLE `articles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `ReadArticle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `URL`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `ReadArticle`
  ADD CONSTRAINT `ReadArticle_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReadArticle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;