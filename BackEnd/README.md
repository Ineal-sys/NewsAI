# BackEnd NewsAI

Le backend de l'application NewsAI est conçu pour traiter, analyser et stocker des articles provenant de flux RSS. Il utilise la bibliothèque CrewAI pour orchestrer des agents et des tâches, et SQLAlchemy pour interagir avec une base de données MySQL.

## Fonctionnalités principales

- **Extraction de contenu** : Analyse des flux RSS pour extraire les articles récents.
- **Résumé et classification** : Utilisation d'agents CrewAI pour générer des résumés, attribuer des notes et classer les articles dans des catégories pertinentes.
- **Stockage des articles** : Les articles traités sont stockés dans une base de données MySQL.
- **Pipeline d'analyse extensible** : Ajout facile de nouvelles tâches ou agents grâce à CrewAI.

## Prérequis

- **Python** : Version 3.12.10.
- **Base de données MySQL** : Une instance MySQL configurée avec les tables nécessaires (voir le fichier `schema.prisma` ou `NewsAI.sql` dans le dossier FrontEnd).
- **Variables d'environnement** :
  - `MYSQL_USER` : Nom d'utilisateur pour la base de données.
  - `MYSQL_PASSWORD` : Mot de passe pour la base de données.
  - `MYSQL_HOST` : Hôte de la base de données.
  - `MYSQL_DATABASE` : Nom de la base de données.
  - `MODEL` : Modèle LLM utilisé par CrewAI.
  - `GEMINI_API_KEY` : Clé API pour le modèle LLM.

## Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/votre-repo/newsai.git
   cd newsai/BackEnd
   ```

2. **Installer les dépendances** :
   Assurez-vous d'avoir un environnement virtuel activé, puis exécutez :
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurer les variables d'environnement** :
   Créez un fichier `.env` à la racine du dossier `BackEnd` et ajoutez les variables nécessaires :
   ```env
   MYSQL_USER=votre_utilisateur
   MYSQL_PASSWORD=votre_mot_de_passe
   MYSQL_HOST=localhost
   MYSQL_DATABASE=newsai
   MODEL=gpt-4
   GEMINI_API_KEY=votre_cle_api
   ```

## Utilisation

### Lancer le traitement des articles

Le fichier `main.py` est le point d'entrée principal pour exécuter le traitement des articles. Il analyse les flux RSS, extrait les articles et les insère dans la base de données.

Exécutez la commande suivante pour démarrer le traitement :
```bash
python -m newsai.main
```

### Ajouter des agents ou des tâches

Les agents et tâches sont définis dans les fichiers de configuration YAML :
- `config/agents.yaml` : Définit les agents et leurs objectifs.
- `config/tasks.yaml` : Définit les tâches et leurs instructions.

Vous pouvez modifier ou ajouter de nouvelles configurations pour étendre les fonctionnalités.

## Structure du projet

- `src/newsai/` : Contient le code source principal.
  - `crew.py` : Définit les agents, tâches et le crew principal.
  - `main.py` : Point d'entrée pour exécuter le traitement.
  - `tools/` : Contient des outils personnalisés pour CrewAI.
  - `config/` : Fichiers de configuration pour les agents et tâches.
- `knowledge/` : Contient des fichiers de connaissances ou de préférences utilisateur.
- `pyproject.toml` : Fichier de configuration pour le projet Python.

## Développement

### Lancer un environnement de développement

1. Activez votre environnement virtuel.
2. Installez les dépendances de développement :
   ```bash
   pip install -r requirements-dev.txt
   ```

## Contribution

Les contributions sont les bienvenues ! Veuillez soumettre une pull request ou ouvrir une issue pour discuter des changements que vous souhaitez apporter.

## Licence

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus de détails.

