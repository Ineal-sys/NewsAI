# 📰 BackEnd NewsAI

> Le moteur intelligent qui alimente la plateforme NewsAI

Le backend de NewsAI est conçu pour collecter, analyser et stocker des articles provenant de flux RSS. Il utilise l'IA pour générer des résumés pertinents, attribuer des notes et classer les articles par catégories.

---

## ✨ Fonctionnalités principales

- **🔍 Extraction de contenu** : Analyse des flux RSS pour extraire les articles récents
- **📝 Résumé et classification** : Génération de résumés, attribution de notes et classification par catégories
- **💾 Stockage des articles** : Sauvegarde des articles traités dans une base de données MySQL
- **🔧 Pipeline extensible** : Ajout facile de nouvelles tâches ou agents grâce à CrewAI

## 🛠️ Technologies utilisées

- **CrewAI** : Orchestration des agents d'IA et des tâches d'analyse
- **SQLAlchemy** : Interaction avec la base de données MySQL
- **Python 3.12** : Langage de programmation principal
- **Feedparser** : Analyse des flux RSS

---

## 💻 Installation rapide

### Prérequis

- **Python** : Version 3.12.10
- **Base de données MySQL** : Instance configurée avec les tables nécessaires

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/Ineal-sys/NewsAI.git
cd NewsAI/BackEnd
```

### Étape 2 : Configurer l'environnement

```bash
# Créer et activer un environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

### Étape 3 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine du dossier `BackEnd` :

```env
# Accès à la base de données
MYSQL_USER=votre_utilisateur
MYSQL_PASSWORD=votre_mot_de_passe
MYSQL_HOST=localhost
MYSQL_DATABASE=newsai

# Configuration de l'IA
MODEL=gpt-4
GEMINI_API_KEY=votre_cle_api
```

---

## 🚀 Utilisation

### Lancer le traitement des articles

```bash
python -m newsai.main
```

Cette commande va :
1. Récupérer les articles depuis les flux RSS configurés
2. Analyser et traiter chaque article avec l'IA
3. Stocker les résultats dans la base de données

### Personnalisation

Vous pouvez facilement étendre les fonctionnalités en modifiant :

- **`config/agents.yaml`** : Définition des agents et leurs objectifs
- **`config/tasks.yaml`** : Définition des tâches et leurs instructions

---

## 📊 Structure du projet

```
BackEnd/
├── src/newsai/         # Code source principal
│   ├── crew.py        # Définition des agents et du crew
│   ├── main.py        # Point d'entrée principal
│   ├── tools/         # Outils personnalisés pour CrewAI
│   └── config/        # Fichiers de configuration YAML
├── knowledge/         # Fichiers de connaissances
└── pyproject.toml    # Configuration du projet Python
```

## ❓ Dépannage

### Problèmes courants

- **Erreur de connexion à la base de données** : Vérifiez vos variables d'environnement et que MySQL est bien en cours d'exécution
- **Limite de tokens dépassée** : Le script met automatiquement en pause le traitement pendant 65 secondes si la limite est atteinte
- **Erreur lors du parsing des flux** : Vérifiez que les URLs dans la table `URL` de la base de données sont valides

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Soumettre une pull request
- Ouvrir une issue pour signaler un bug ou proposer une amélioration
- Partager vos idées pour de nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus de détails.