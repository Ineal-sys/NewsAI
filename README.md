# 📰 NewsAI Project

> Une plateforme intelligente d'agrégation et d'analyse d'articles utilisant l'IA pour résumer et classer le contenu.

NewsAI est une application complète qui collecte, analyse et présente des articles provenant de flux RSS. Grâce à l'IA, elle génère des résumés pertinents, attribue des notes de qualité et classe les articles par catégories, offrant ainsi une expérience de lecture optimisée.

## 🌟 Fonctionnalités principales

- **Agrégation automatique** : Collecte d'articles depuis divers flux RSS
- **Analyse par IA** : Résumés générés automatiquement et classification intelligente
- **Interface utilisateur intuitive** : Navigation fluide par catégories et filtres
- **Système de notation** : Évaluation de la pertinence des articles sur une échelle de 1 à 10
- **Suivi de lecture** : Possibilité de marquer les articles comme lus (utilisateurs connectés)

## 🏗️ Architecture

Le projet est divisé en deux composants principaux qui fonctionnent ensemble :

### 🔧 Backend

Le backend est responsable de l'extraction, de l'analyse et du stockage des articles. Il utilise :
- **CrewAI** pour orchestrer les agents d'IA et les tâches d'analyse
- **SQLAlchemy** pour interagir avec la base de données MySQL
- **Python 3.12** comme langage principal

[En savoir plus sur le Backend →](./BackEnd/README.md)

### 🖥️ Frontend

Le frontend est une application moderne qui permet aux utilisateurs de consulter les articles. Il utilise :
- **Next.js** comme framework React
- **Material UI** pour l'interface utilisateur
- **NextAuth.js** pour l'authentification
- **Prisma** pour l'accès à la base de données

[En savoir plus sur le Frontend →](./FrontEnd/README.md)

## 🚀 Démarrage rapide

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Ineal-sys/NewsAI.git
   cd NewsAI
   ```

2. **Configurer le backend**
   ```bash
   cd BackEnd
   # Suivre les instructions dans BackEnd/README.md
   ```

3. **Configurer le frontend**
   ```bash
   cd ../FrontEnd
   # Suivre les instructions dans FrontEnd/README.md
   ```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Soumettre une pull request
- Ouvrir une issue pour signaler un bug ou proposer une amélioration
- Partager vos idées pour de nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT.
