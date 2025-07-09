Phase 2 : Développement du Cœur (À Faire)
 Modèle de Données : Définir les modèles de la base de données avec SQLAlchemy dans models.py.

 Collecteur de Données : Développer le script github_collector.py pour appeler l'API de GitHub.

 Filtrage des Données : Implémenter la logique pour ne garder que les projets de qualité (avec description, un minimum d'étoiles, etc.).

 Stockage : Écrire le code pour insérer les données collectées dans la base de données.

 API Interne : Créer les routes Flask (/api/projects, /api/stats) pour exposer les données au format JSON.

Phase 3 : Visualisation et Interface (À Faire)
 Structure Frontend : Développer la page index.html avec la mise en page de base (conteneur pour la visualisation, filtres).

 Visualisation Interactive : Écrire le code JavaScript pour utiliser Plotly.js afin de créer la "galaxie" interactive.

 Interactivité : Ajouter les fonctionnalités de filtres (par langage) et de recherche dans le frontend.

 Tests Locaux : Tester l'application de bout en bout sur votre machine avec les données collectées.

Phase 4 : Déploiement et Finalisation (À Faire)
 Mise en Place de l'Hébergement : Créer un compte sur Railway et le lier à votre dépôt GitHub.

 Configuration de la Production : Mettre en place la base de données PostgreSQL sur Railway.

 Variables d'Environnement : Configurer les secrets (GITHUB_TOKEN, DATABASE_URL) sur la plateforme d'hébergement.

 Déploiement : Déployer l'application et s'assurer qu'elle est accessible et fonctionnelle via l'URL publique.

 Monitoring de Base : Ajouter une route /health pour vérifier l'état de l'application.

 Finalisation : Préparer la documentation finale (README.md détaillé) et la vidéo de présentation du projet.