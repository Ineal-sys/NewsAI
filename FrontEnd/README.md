# NewsAI (FrontEnd)

Ceci est une application Next.js conçue pour agréger et afficher des articles. Elle permet aux utilisateurs de parcourir, rechercher, filtrer les articles par catégorie et par note, et pour les utilisateurs connectés, de marquer des articles comme lus.

L'application est configurée pour fonctionner dans un conteneur Docker.

## Prérequis

*   Docker installé sur votre machine.
*   Docker Compose installé sur votre machine (généralement inclus avec Docker Desktop).

## Démarrage Rapide

### Variables d'Environnement

Créez un fichier `.env.production.local` à la racine du projet et ajoutez les variables d'environnement nécessaires. Par exemple :

```
# URL de connexion à votre base de données Prisma
DATABASE_URL="votre_chaine_de_connexion_db"

# Secret pour NextAuth.js (générez une chaîne sécurisée)
NEXTAUTH_SECRET="votre_secret_nextauth"

# URL de base de votre application pour NextAuth.js
NEXTAUTH_URL="http://localhost:3002"

```

### Option 1: Utilisation de Docker Compose (Recommandé)

Docker Compose simplifie la gestion du conteneur.

1.  **Construire et démarrer le service :**
    ```bash
    docker compose up --build -d
    ```
    *   `--build` : Construit l'image Docker avant de démarrer le conteneur (ou la reconstruit si le Dockerfile a changé).
    *   `-d` : Démarre le conteneur en arrière-plan (detached mode).

2.  **Arrêter le service :**
    ```bash
    docker compose down
    ```

3.  **Voir les logs :**
    ```bash
    docker compose logs -f app
    ```
    *   `-f` : Suit les logs en temps réel.
    *   `app` : Le nom du service défini dans `docker-compose.yml`.

L'application devrait maintenant être accessible à l'adresse `http://localhost:3002`.

### Option 2: Utilisation directe de Docker

1.  **Construire l'Image Docker :**
    Pour construire l'image Docker, exécutez la commande suivante à la racine du projet :
    ```bash
    docker build -t nom-de-votre-projet .
    ```
    Remplacez `nom-de-votre-projet` par un nom approprié pour votre image Docker.

2.  **Lancer le Conteneur Docker :**
    Pour exécuter l'application à l'aide de l'image Docker construite, utilisez la commande suivante :
    ```bash
    docker run -p 3002:3000 --env-file .env.production.local --name mon-app-nextjs-conteneur -d nom-de-votre-projet
    ```
    *   `-p 3002:3000` : Mappe le port 3002 de votre machine hôte au port 3002 à l'intérieur du conteneur.
    *   `--env-file .env.production.local` : Charge les variables d'environnement depuis le fichier spécifié.
    *   `--name mon-app-nextjs-conteneur`: Donne un nom au conteneur pour le gérer plus facilement.
    *   `-d`: Démarre en arrière-plan.
    *   `nom-de-votre-projet` : Spécifie le nom de l'image Docker à exécuter.

3.  **Arrêter le conteneur :**
    ```bash
    docker stop mon-app-nextjs-conteneur
    ```

4.  **Supprimer le conteneur :**
    ```bash
    docker rm mon-app-nextjs-conteneur
    ```

5.  **Voir les logs :**
    ```bash
    docker logs -f mon-app-nextjs-conteneur
    ```

L'application devrait également être accessible à `http://localhost:3002`.

## API Publique

Le projet expose plusieurs points d'accès API (routes) pour interagir avec les données. Voici le détail :

### Articles

*   **`GET /api/articles`**
    *   Récupère une liste paginée d'articles.
    *   **Paramètres de requête (Query Params) :**
        *   `page` (optionnel, `number`) : Numéro de la page (défaut: `1`).
        *   `limit` (optionnel, `number`) : Nombre d'articles par page (défaut: `15`).
        *   `rating` (optionnel, `number`) : Note minimale des articles à inclure (défaut: `6`).
        *   `sortBy` (optionnel, `string`) : Champ de tri. Valeurs possibles : `created_at`, `Date_Feed`, `rating`, `title`. (défaut: `created_at`).
        *   `order` (optionnel, `string`) : Ordre de tri. Valeurs possibles : `asc`, `desc`. (défaut: `desc`).
        *   `includeRead` (optionnel, `boolean`) : Si `true`, inclut les articles marqués comme lus (ne fonctionne que pour les utilisateurs connectés). (défaut: `false`, les articles lus sont exclus pour les utilisateurs connectés).

*   **`GET /api/articles/[articleId]`**
    *   Récupère les détails d'un article spécifique.
    *   **Paramètre de chemin (Path Param) :**
        *   `articleId` (requis, `number`) : L'identifiant unique de l'article.

*   **`GET /api/articles/category/[categoryName]`**
    *   Récupère les articles appartenant à une catégorie spécifique.
    *   **Paramètre de chemin (Path Param) :**
        *   `categoryName` (requis, `string`) : Le nom de la catégorie (doit être encodé pour l'URL si nécessaire).
    *   **Paramètres de requête (Query Params) :**
        *   `page` (optionnel, `number`) : Numéro de la page (défaut: `1`).
        *   `limit` (optionnel, `number`) : Nombre d'articles par page (défaut: `15`).
        *   `sortBy` (optionnel, `string`) : Champ de tri. Valeurs possibles : `created_at`, `Date_Feed`, `rating`, `title`. (défaut: `Date_Feed`).
        *   `order` (optionnel, `string`) : Ordre de tri. Valeurs possibles : `asc`, `desc`. (défaut: `asc`).
        *   `includeRead` (optionnel, `boolean`) : Si `true`, inclut les articles marqués comme lus (ne fonctionne que pour les utilisateurs connectés). (défaut: `false`, les articles lus sont exclus pour les utilisateurs connectés).

*   **`POST /api/articles/read`**
    *   Marque un article comme lu pour l'utilisateur actuellement connecté.
    *   **Authentification requise.**
    *   **Corps de la requête (Request Body - JSON) :**
        *   `articleId` (requis, `number`) : L'identifiant de l'article à marquer comme lu.

### Catégories

*   **`GET /api/categories`**
    *   Récupère la liste des noms de catégories distinctes existantes.
    *   Pas de paramètres.

### Recherche

*   **`GET /api/search`**
    *   Recherche des articles en fonction d'un terme dans le titre ou le résumé.
    *   **Paramètres de requête (Query Params) :**
        *   `q` (requis, `string`) : Le terme de recherche.
        *   `page` (optionnel, `number`) : Numéro de la page (défaut: `1`).
        *   `limit` (optionnel, `number`) : Nombre d'articles par page (défaut: `15`).
        *   `includeRead` (optionnel, `boolean`) : Si `true`, inclut les articles marqués comme lus dans les résultats (ne fonctionne que pour les utilisateurs connectés). (défaut: `false`, les articles lus sont exclus pour les utilisateurs connectés).

## Déploiement

Suivez les instructions de déploiement spécifiques à votre hébergeur (par exemple, Docker Hub, AWS ECS, Google Cloud Run, etc.) en utilisant l'image Docker construite.