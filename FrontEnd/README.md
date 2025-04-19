# 📰 NewsAI (FrontEnd)

> Interface utilisateur moderne pour explorer les articles analysés par l'IA

Le frontend de NewsAI est une application Next.js qui permet aux utilisateurs de découvrir, filtrer et lire des articles analysés par l'IA. L'interface intuitive offre une navigation par catégories, un système de recherche et un suivi de lecture pour les utilisateurs connectés.

---

## ✨ Fonctionnalités principales

- **🔎 Navigation intuitive** : Parcourez les articles par catégories ou filtrez par note
- **🔍 Recherche avancée** : Trouvez rapidement des articles par mots-clés
- **📚 Suivi de lecture** : Marquez les articles comme lus (utilisateurs connectés)
- **📈 Filtres de qualité** : Accédez aux articles les mieux notés en priorité

## 🛠️ Technologies utilisées

- **Next.js 15** : Framework React moderne
- **Material UI 7** : Composants d'interface utilisateur élégants
- **NextAuth.js** : Authentification sécurisée
- **Prisma** : ORM pour l'accès à la base de données

---

## 💻 Installation rapide avec Docker

### Prérequis

- **Docker** installé sur votre machine
- **Docker Compose** (généralement inclus avec Docker Desktop)

### Étape 1 : Configuration des variables d'environnement

Créez un fichier `.env.production.local` à la racine du projet :

```env
# Base de données
DATABASE_URL="mysql://user:password@localhost:3306/newsai"

# Authentification
NEXTAUTH_SECRET="votre_secret_securise"
NEXTAUTH_URL="http://localhost:3002"
```

### Étape 2 : Lancement avec Docker Compose (recommandé)

```bash
# Construire et démarrer le service
docker compose up --build -d

# Voir les logs
docker compose logs -f app

# Arrêter le service
docker compose down
```

L'application sera accessible à l'adresse `http://localhost:3002`.

---

## 🔗 API Publique

L'application expose plusieurs endpoints REST pour accéder aux données :

### Articles

| Endpoint | Méthode | Description | Paramètres principaux |
|----------|---------|-------------|----------------------|
| `/api/articles` | GET | Liste paginée d'articles | `page`, `limit`, `rating`, `sortBy` |
| `/api/articles/[id]` | GET | Détails d'un article | `articleId` (dans l'URL) |
| `/api/articles/category/[name]` | GET | Articles par catégorie | `categoryName` (dans l'URL) |
| `/api/articles/read` | POST | Marquer comme lu | `articleId` (dans le corps) |

### Catégories et recherche

| Endpoint | Méthode | Description | Paramètres principaux |
|----------|---------|-------------|----------------------|
| `/api/categories` | GET | Liste des catégories | Aucun |
| `/api/search` | GET | Recherche d'articles | `q` (terme de recherche) |

> **Note** : Pour les utilisateurs connectés, le paramètre `includeRead=true` permet d'inclure les articles déjà lus dans les résultats.

---

## 📊 Structure du projet

```
FrontEnd/
├── src/
│   ├── app/           # Pages et routes Next.js
│   ├── components/    # Composants réutilisables
│   ├── lib/           # Utilitaires et fonctions
│   └── styles/        # Styles CSS
├── prisma/          # Schéma de base de données
├── public/          # Fichiers statiques
├── Dockerfile       # Configuration Docker
└── docker-compose.yml # Configuration Docker Compose
```

## ❓ Dépannage

- **Erreur de connexion à la base de données** : Vérifiez que la variable `DATABASE_URL` pointe vers une base de données accessible
- **Problèmes d'authentification** : Assurez-vous que `NEXTAUTH_SECRET` et `NEXTAUTH_URL` sont correctement configurés
- **Container qui ne démarre pas** : Vérifiez les logs avec `docker compose logs -f app`

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Soumettre une pull request
- Ouvrir une issue pour signaler un bug ou proposer une amélioration
- Partager vos idées pour de nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT.