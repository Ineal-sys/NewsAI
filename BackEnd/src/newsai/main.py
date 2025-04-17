#!/usr/bin/env python
import warnings
import feedparser
import requests
import time
from datetime import datetime, timedelta
import os
import json
from crew import Newsai
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
import re

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# Ce fichier main sert à exécuter le crew localement, évitez d'ajouter de la logique inutile ici.

# Remplace la connexion pymysql par SQLAlchemy avec pool
MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DATABASE')}"
engine = create_engine(MYSQL_URL, poolclass=QueuePool, pool_size=4, max_overflow=10)

articles_traite = 0
ajouts_reussis = 0
deja_presents = 0
erreurs = 0
anciens = 0
METRIC = 0  

def extract_json_from_response(response_text):
    """Extrait le premier bloc JSON d'une réponse texte, même s'il y a du texte avant/après."""
    match = re.search(r'({.*?})', response_text, re.DOTALL)
    if match:
        json_str = match.group(1)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            print("Erreur : JSON invalide")
            return None
    else:
        print("Erreur : Aucun JSON trouvé")
        return None

def Crew(inputs, entry_date):
    """Crée le crew Newsai et insère l'article si le JSON est valide. Retourne True si succès, False sinon."""
    result = Newsai().crew().kickoff(inputs=inputs)
    global METRIC
    METRIC = METRIC + result.token_usage.total_tokens
    parsed = extract_json_from_response(result.raw)
    if not parsed:
        print("❌ Résultat non JSON :")
        print(result.raw)
        return False
    print("✅ Résultat JSON valide")
    try:
        with engine.begin() as conn:
            Sql = text("INSERT INTO articles (url, image_url, title, summary, rating, category, Date_Feed) VALUES (:url, :image_url, :title, :summary, :rating, :category, :date_feed)")
            val = {"url": inputs["url"], "image_url": parsed["image_url"], "title": parsed["title"], "summary": parsed["content"], "rating": parsed["rating"], "category": parsed["category"], "date_feed": entry_date}
            conn.execute(Sql, val)
            if METRIC > 3500000:
                print("⚠️ Limite de tokens dépassée, mise en pause (65s) du traitement.")
        time.sleep(65)
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion : {e}")
        if METRIC > 3500000:
            print("⚠️ Limite de tokens dépassée, mise en pause (65s) du traitement.")
            time.sleep(65)
        return False
    

def traiter_article(entry):
    article_url = entry.link
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT id FROM articles WHERE url = :url"), {"url": article_url})
            article_id = res.fetchone()
            if article_id:
                return "deja_present"  # déjà présent
            entry_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                entry_date = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                entry_date = datetime(*entry.updated_parsed[:6])
            if entry_date and entry_date >= datetime.now() - timedelta(days=1):
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RedditRSSBot/1.0'}
                response = requests.get(article_url, headers=headers, timeout=10)
                inputs = {"url": article_url, "content": response.content.decode('utf-8')}
                try:
                    success = Crew(inputs, entry_date)
                    time.sleep(0.5)  # Pause pour éviter de surcharger le serveur
                    return "ajout" if success else "erreur"
                except Exception as e:
                    print(f"❌ Erreur lors de l'exécution du crew : {e}")
                    return "erreur"
            else:
                return "Trop_ancien"
        return "erreur"
    except Exception as e:
        print(f"❌ Erreur inattendue SQLAlchemy : {e}")
        return "erreur"

# Préparation des entries à traiter
entries = []
myresult = []
try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT * FROM URL where id = 1 OR id = 2"))
        myresult = res.fetchall()
except Exception as e:
    print(f"❌ Erreur lors de la récupération des sources : {e}")

for sources in myresult:
    url = sources[1]
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RedditRSSBot/1.0'}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        feed = feedparser.parse(response.content)
    except Exception as e:
        print(f"❌ Erreur lors du parsing du flux {url} : {e}")
        continue
    for entry in feed.entries:
        entries.append(entry)

articles_traite = len(entries)
ajouts_reussis = 0

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(traiter_article, entry) for entry in entries]
    for future in as_completed(futures):
        result = future.result()
        if result == "ajout":
            ajouts_reussis += 1
        elif result == "deja_present":
            deja_presents += 1
        elif result == "erreur":
            erreurs += 1
        elif result == "Trop_ancien":
            anciens += 1

print(f"\nRésumé de l'exécution :")
print(f"Articles traités : {articles_traite}")
print(f"Ajouts en BDD réussis : {ajouts_reussis}")
print(f"Déjà présents : {deja_presents}")
print(f"Articles trop anciens : {anciens}")
print(f"Erreurs : {erreurs}")
print(f"Différence (déjà présents ou erreurs) : {articles_traite - ajouts_reussis}")
print(f"Metrics : {METRIC}")