# app.py
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
import os

# Configuration de l'application
app = Flask(__name__)

# Configuration de la base de données
# Utilise la variable d'environnement si elle existe, sinon une base locale
db_uri = os.environ.get('DATABASE_URL', 'sqlite:///projects.db')
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Importation du modèle après l'initialisation de db pour éviter les importations circulaires
from models import Project

# Route principale
@app.route("/")
def index():
    return render_template("index.html")

# Point d'entrée pour l'exécution directe
if __name__ == "__main__":
    app.run(debug=True)
