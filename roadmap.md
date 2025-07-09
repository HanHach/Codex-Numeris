# Plan Complet - Codex Numeris

## 🎯 PLAN NON-TECHNIQUE COMPLET

### **1. Définition du Projet**

**Vision :** Créer une expérience web immersive qui transforme les données brutes des projets open source Harvard en une "galaxie" interactive explorable.

**Objectifs Mesurables :**

- Collecter 200+ projets open source Harvard
- Créer une visualisation interactive avec 5+ filtres
- Déployer une application web accessible publiquement
- Obtenir une note A pour le projet final CS50

**Public Cible :**

- Étudiants et chercheurs Harvard
- Développeurs intéressés par l'open source académique
- Évaluateurs CS50

### **2. Gestion de Projet**

**Méthode :** Approche Agile avec sprints hebdomadaires

**Outils de Suivi :**

- **GitHub Issues** : Tracker les tâches et bugs
- **Documentation** : README détaillé + commentaires code
- **Backup** : Commits quotidiens minimum

**Jalons Critiques :**

- Semaine 4 : Premier déploiement live
- Semaine 6 : Visualisation fonctionnelle
- Semaine 8 : Projet finalisé

### **3. Communication et Présentation**

**Vidéo de Présentation (3 minutes) :**

1. **Intro** (30s) : Problème résolu et solution proposée
2. **Démo** (90s) : Navigation dans la galaxie, filtres, interactions
3. **Technique** (45s) : Stack utilisée, défis surmontés
4. **Conclusion** (15s) : Impact et perspectives

**README Structure :**

- Description du projet et inspiration
- Instructions d'installation et d'utilisation
- Architecture technique
- Captures d'écran
- Défis rencontrés et solutions
- Améliorations futures

### **4. Sécurité et Bonnes Pratiques**

**Gestion des Secrets :**

- Variables d'environnement pour tokens
- Fichier .env en local (jamais committé)
- Configuration Railway pour production

**Validation des Données :**

- Sanitisation des entrées utilisateur
- Validation des réponses API
- Gestion des erreurs gracieuse

**Accessibilité :**

- Contrastes respectés (WCAG 2.1)
- Navigation clavier
- Textes alternatifs pour éléments graphiques

### **5. UX/UI Design**

**Principe de Design :**

- **Simplicité** : Interface épurée, focus sur la visualisation
- **Intuitivité** : Interactions naturelles (hover, zoom, filtres)
- **Responsivité** : Fonctionne sur mobile et desktop
- **Performance** : Chargement rapide, animations fluides

**Palette de Couleurs :**

- Fond noir (espace) : `#0a0a0a`
- Texte principal : `#ffffff`
- Accents : Palette Viridis pour les langages
- Hover/Focus : `#64ffda` (cyan)
  :root {
  --harvard-crimson: #A41034;
  --dark-gray: #2E2E2E;
  --medium-gray: #4A4A4A;
  }

h1, h2 {
color: var(--harvard-crimson);
}

body {
color: var(--dark-gray);
}

**Typographie :**

- Police principale : Inter ou system fonts
- Tailles : 16px base, 24px titres, 14px labels

### **6. Tests et Validation**

**Tests Utilisateur :**

- Navigation intuitive (5 personnes testent à froid)
- Charge rapide (< 3 secondes)
- Responsive design (mobile/tablet/desktop)

**Tests Techniques :**

- API endpoints fonctionnels
- Gestion d'erreurs (API down, pas de données)
- Performance (1000+ projets)

### **7. Déploiement et Maintenance**

**Stratégie de Déploiement :**

- **Environnement de dev** : Local avec SQLite
- **Staging** : Railway avec PostgreSQL (test)
- **Production** : Railway avec domaine personnalisé

**Monitoring :**

- Logs d'erreurs Railway
- Analytics basiques (nombre de visiteurs)
- Performance monitoring

---

## 🛠️ PLAN TECHNIQUE COMPLET

### **1. Architecture Système**

**Stack Technique :**

- **Backend** : Python 3.9+, Flask 2.0+
- **Base de données** : SQLAlchemy (SQLite → PostgreSQL)
- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Visualisation** : Plotly.js 2.0+
- **Déploiement** : Railway + PostgreSQL
- **Versioning** : Git + GitHub

**Structure du Projet :**

```
codex-numeris/
├── app.py                 # Application Flask principale
├── models.py             # Modèles SQLAlchemy
├── requirements.txt      # Dépendances Python
├── .env                  # Variables d'environnement (local)
├── .gitignore           # Fichiers à ignorer
├── README.md            # Documentation
├── collectors/
│   ├── __init__.py
│   ├── github_collector.py
│   └── data_processor.py
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
└── templates/
    ├── base.html
    └── index.html
```

### **2. Modèle de Données**

**Schéma Principal :**

```python
class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    url = Column(String(500))
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    language = Column(String(50), index=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    organization = Column(String(100))
    topics = Column(JSON)  # Liste des topics GitHub


```

### **3. Collecteur de Données**

**GitHub API Integration :**

```python
class GitHubCollector:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'token {os.environ["GITHUB_TOKEN"]}',
            'Accept': 'application/vnd.github.v3+json'
        })
        self.rate_limit = 5000
        self.rate_limit_remaining = 5000

    def get_harvard_organizations(self):
        """Découvre automatiquement les organisations Harvard"""
        return [
            'harvard', 'HarvardOpenData', 'harvard-lil',
            'harvard-dce', 'harvardnlp', 'harvard-ml',
            'harvard-edge', 'harvard-acc', 'harvard-cs50'
        ]

    def collect_org_repositories(self, org_name):
        """Collecte tous les repos d'une organisation"""
        url = f"{self.base_url}/orgs/{org_name}/repos"
        params = {'per_page': 100, 'type': 'public'}

        repositories = []
        page = 1

        while True:
            params['page'] = page
            response = self.session.get(url, params=params)

            if response.status_code == 200:
                repos = response.json()
                if not repos:
                    break
                repositories.extend(repos)
                page += 1
            else:
                break

        return repositories

    def calculate_impact_score(self, repo):
        """Calcule un score d'impact basé sur plusieurs métriques"""
        stars = repo.get('stargazers_count', 0)
        forks = repo.get('forks_count', 0)
        watchers = repo.get('watchers_count', 0)

        # Formule pondérée
        impact = (stars * 0.5) + (forks * 0.3) + (watchers * 0.2)
        return min(impact / 10, 100)  # Normalisation 0-100

    def is_quality_project(self, repo):
        """Filtre les projets de qualité"""
        return (
            repo.get('description') and
            len(repo.get('description', '')) > 20 and
            repo.get('stargazers_count', 0) > 0 and
            not repo.get('fork', False) and
            repo.get('language') in [
                'Python', 'JavaScript', 'R', 'Java', 'C++',
                'Julia', 'Go', 'Rust', 'TypeScript'
            ]
        )
```

### **4. API Backend**

**Endpoints principaux :**

```python
@app.route('/api/projects')
def get_projects():
    """Retourne tous les projets avec filtres optionnels"""
    language = request.args.get('language')
    min_stars = request.args.get('min_stars', 0, type=int)
    search = request.args.get('search', '')

    query = Project.query

    if language and language != 'all':
        query = query.filter(Project.language == language)

    if min_stars > 0:
        query = query.filter(Project.stars >= min_stars)

    if search:
        query = query.filter(Project.name.contains(search) |
                           Project.description.contains(search))

    projects = query.order_by(Project.stars.desc()).limit(500).all()
    return jsonify([p.to_dict() for p in projects])

@app.route('/api/stats')
def get_stats():
    """Statistiques globales"""
    total_projects = Project.query.count()
    total_stars = db.session.query(func.sum(Project.stars)).scalar()
    languages = db.session.query(Project.language, func.count(Project.id))\
                         .group_by(Project.language)\
                         .order_by(func.count(Project.id).desc())\
                         .limit(10).all()

    return jsonify({
        'total_projects': total_projects,
        'total_stars': total_stars,
        'top_languages': [{'language': lang, 'count': count}
                         for lang, count in languages]
    })

@app.route('/api/project/<int:project_id>')
def get_project_details(project_id):
    """Détails d'un projet spécifique"""
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())
```

### **5. Frontend Interactif**

**Visualisation Plotly.js :**

```javascript
class GalaxyVisualizer {
  constructor(containerId) {
    this.container = containerId;
    this.projects = [];
    this.filteredProjects = [];
    this.colorScale = this.generateColorScale();
  }

  async loadData() {
    try {
      const response = await fetch("/api/projects");
      this.projects = await response.json();
      this.filteredProjects = [...this.projects];
      this.render();
    } catch (error) {
      console.error("Error loading data:", error);
      this.showError("Failed to load project data");
    }
  }

  generateColorScale() {
    const languages = [
      "Python",
      "JavaScript",
      "R",
      "Java",
      "C++",
      "Julia",
      "Go",
      "Rust",
      "TypeScript",
    ];
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#ffeaa7",
      "#dda0dd",
      "#98d8c8",
      "#f7dc6f",
      "#bb8fce",
    ];

    return languages.reduce((acc, lang, index) => {
      acc[lang] = colors[index % colors.length];
      return acc;
    }, {});
  }

  render() {
    const trace = {
      x: this.filteredProjects.map((p) => p.impact_score),
      y: this.filteredProjects.map((p) => p.community_activity),
      mode: "markers",
      type: "scatter",
      text: this.filteredProjects.map(
        (p) => `<b>${p.name}</b><br>${p.description || "No description"}`
      ),
      hovertemplate:
        "%{text}<br>⭐ %{marker.size} stars<br>Language: %{marker.color}<extra></extra>",
      marker: {
        size: this.filteredProjects.map((p) =>
          Math.max(8, Math.sqrt(p.stars) * 2)
        ),
        color: this.filteredProjects.map(
          (p) => this.colorScale[p.language] || "#cccccc"
        ),
        opacity: 0.8,
        line: {
          width: 1,
          color: "rgba(255,255,255,0.3)",
        },
      },
    };

    const layout = {
      title: {
        text: "Harvard Open Source Galaxy",
        font: { size: 24, color: "white" },
      },
      xaxis: {
        title: "Impact Score",
        gridcolor: "rgba(255,255,255,0.1)",
        color: "white",
      },
      yaxis: {
        title: "Community Activity",
        gridcolor: "rgba(255,255,255,0.1)",
        color: "white",
      },
      plot_bgcolor: "rgba(10,10,10,0.9)",
      paper_bgcolor: "rgba(10,10,10,0.9)",
      font: { color: "white" },
      hovermode: "closest",
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      displaylogo: false,
    };

    Plotly.newPlot(this.container, [trace], layout, config);
    this.addEventListeners();
  }

  addEventListeners() {
    document
      .getElementById("language-filter")
      .addEventListener("change", (e) => {
        this.filterByLanguage(e.target.value);
      });

    document.getElementById("search").addEventListener("input", (e) => {
      this.searchProjects(e.target.value);
    });

    document.getElementById("reset-zoom").addEventListener("click", () => {
      Plotly.relayout(this.container, {
        "xaxis.autorange": true,
        "yaxis.autorange": true,
      });
    });
  }

  filterByLanguage(language) {
    if (language === "all") {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(
        (p) => p.language === language
      );
    }
    this.render();
    this.updateStats();
  }

  searchProjects(query) {
    if (!query.trim()) {
      this.filteredProjects = [...this.projects];
    } else {
      const searchLower = query.toLowerCase();
      this.filteredProjects = this.projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    this.render();
    this.updateStats();
  }

  updateStats() {
    const totalProjects = this.filteredProjects.length;
    const totalStars = this.filteredProjects.reduce(
      (sum, p) => sum + p.stars,
      0
    );
    const uniqueLanguages = new Set(
      this.filteredProjects.map((p) => p.language)
    ).size;

    document.getElementById("total-projects").textContent = totalProjects;
    document.getElementById("total-stars").textContent =
      totalStars.toLocaleString();
    document.getElementById("total-languages").textContent = uniqueLanguages;
  }

  showError(message) {
    document.getElementById(
      "galaxy"
    ).innerHTML = `<div class="error-message">${message}</div>`;
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  const galaxy = new GalaxyVisualizer("galaxy");
  galaxy.loadData();
});
```

### **6. Sécurité et Performance**

??? Qchose de très basique essentiel mais pas avancé poour un petit projet open source

### **7. Déploiement Railway**

**Configuration Railway :**

```python
# railway.json
{
    "build": {
        "builder": "NIXPACKS"
    },
    "deploy": {
        "startCommand": "python app.py",
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
}
```

**Variables d'environnement :**

- `GITHUB_TOKEN`: Token personnel GitHub
- `DATABASE_URL`: URL PostgreSQL (auto-générée par Railway)
- `FLASK_ENV`: production
- `SECRET_KEY`: Clé secrète Flask

### **8. Monitoring et Maintenance**

**Logging :**

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

**Health Check :**

```python
@app.route('/health')
def health_check():
    try:
        # Test DB connection
        db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow()})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500
```

---

## 📋 ÉLÉMENTS MANQUANTS IDENTIFIÉS

### **Sécurité Avancée :**

- CORS configuration
- Input validation/sanitization
- SQL injection prevention
- XSS protection

### **UX/UI Améliorations :**

- Loading states
- Error handling UI
- Mobile responsiveness
- Accessibility (ARIA labels)

### **Performance :**

- Database indexing
- API pagination
- Frontend bundling
- Image optimization

### **Documentation :**

- API documentation (Swagger)
- Code comments
- User guide
- Deployment guide

Ce plan couvre maintenant tous les aspects techniques et non-techniques du projet, garantissant une approche complète et professionnelle.
