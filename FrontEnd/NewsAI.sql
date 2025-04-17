SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Base de données : `NEWSAI`
--

-- --------------------------------------------------------

--
-- Structure de la table `articles`
--

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

-- --------------------------------------------------------

--
-- Structure de la table `ReadArticle`
--

CREATE TABLE `ReadArticle` (
  `id` int NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` int NOT NULL,
  `read_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `URL`
--

CREATE TABLE `URL` (
  `ID` int NOT NULL,
  `URL` text COLLATE utf8mb4_0900_as_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci;

-- --------------------------------------------------------

--
-- Structure de la table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ReadArticle`
--
ALTER TABLE `ReadArticle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ReadArticle_userId_articleId_key` (`userId`,`articleId`),
  ADD KEY `ReadArticle_articleId_fkey` (`articleId`);

--
-- Index pour la table `URL`
--
ALTER TABLE `URL`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_Name_key` (`name`) USING BTREE;

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ReadArticle`
--
ALTER TABLE `ReadArticle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `URL`
--
ALTER TABLE `URL`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `ReadArticle`
--
ALTER TABLE `ReadArticle`
  ADD CONSTRAINT `ReadArticle_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReadArticle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
