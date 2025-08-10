import os, sys, requests
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# ------------- Environment Setup & Imports ------------- 
load_dotenv()
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, JSON

# ------------ Database Configuration -------------
# The database URL is imported from the central config file
from config import DATABASE_URL
engine   = create_engine(DATABASE_URL)
Session  = sessionmaker(bind=engine)
session  = Session()
Base = declarative_base()

# ------------ Project Model Definition -------------
# Copied from models.py but use it here to make the script autonomous
class Project(Base):
    __tablename__ = "projects"

    id           = Column(Integer, primary_key=True)
    name         = Column(String,  nullable=False, index=True)
    description  = Column(String)
    url          = Column(String)
    stars        = Column(Integer, default=0, index=True)
    language     = Column(String,  index=True)
    organization = Column(String,  index=True)
    created_at   = Column(DateTime)
    updated_at   = Column(DateTime)
    topics       = Column(JSON)

# ------------ GitHub API Configuration -------------
# Initial headers snippet was generated with AI assistance, Added the 'Accept' header to enable repository topics retrieval.
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",   # essential for /topics
    "User-Agent": "CodexNumeris/1.0",
    "X-GitHub-Api-Version": "2022-11-28"
}

# ------------ Collection Parameters -------------
# Generated with AI to include an exhaustive list of official Harvard GitHub organizations.
HARVARD_ORGS = [
    'harvard', 'harvard-lil', 'huit', 'cga-harvard',
    'harvard-library', 'hms-dbmi', 'harvardnlp', 'IQSS',
    'berkmancenter', 'cid-harvard', 'mahmoodlab', 
    'Harvard-Ophthalmology-AI-Lab', 'sorgerlab', 'harvard-acc',
    'churchlab', 'broadinstitute'
]

BAD_KEYWORDS = ('pset1', 'pset2', 'pset3', 'pset4', 'pset5', 'week1', 'week2', 'homework', 'assignment', 'final-project')


# ------------ Quality Check Function -------------
def is_quality(repo):
    
    # 1: Must have a description of at least 10 characters
    desc = repo.get('description') or ''
    if len(desc.strip()) < 10:
        return False

    # 2: Must have at least 10 stars
    stars = repo.get('stargazers_count', 0)
    if stars < 10:
        return False

    # 3 : Must not be a fork
    if repo.get('fork'):
        return False

    # 4: Must be recently updated (in the last 24 months)
    upd_at = repo.get('updated_at')
    if not upd_at:
        return False # No update date, reject
    
    last_upd = datetime.fromisoformat(upd_at.replace('Z', ''))
    last_upd = last_upd.replace(tzinfo=timezone.utc) if last_upd.tzinfo is None else last_upd
    if last_upd < datetime.now(timezone.utc) - timedelta(days=30*24):
        return False

    # 5: Name should not contain "bad" keywords.
    for kw in BAD_KEYWORDS:
        if kw in repo['name'].lower():
            return False

    return True

# ------------ Data Storage Function ------------

def store_repo(repo: dict, source="org"):
    """Inserts the repository if it doesn't exist yet (key = GitHub ID)."""
    if session.query(Project).filter_by(id=repo["id"]).first():
        return

    # Optimisation: topic are retrieved directly from the repo object (no additional API call needed)
    topics_list = repo.get("topics", [])
    project = Project(
        id=repo["id"],
        name=repo["name"],
        description=repo["description"],
        url=repo["html_url"],
        stars=repo["stargazers_count"],
        language=repo["language"],
        organization=repo["owner"]["login"],
        created_at=datetime.fromisoformat(repo["created_at"].replace("Z", "")),
        updated_at=datetime.fromisoformat(repo["updated_at"].replace("Z", "")),
        topics=topics_list
    )
    session.add(project)
    print(f"  -> Added ({source}) : {repo['name']}")

# ------------ Collection functions ---------------

def collect_orgs():
    for org in HARVARD_ORGS:
        print(f"[ORG] {org}")
        page = 1
        while True:
            url     = f"https://api.github.com/orgs/{org}/repos"
            params  = {'per_page': 100, 'page': page}
            r       = requests.get(url, headers=HEADERS, params=params)
            if r.status_code != 200: break
            repos = r.json()
            if not repos: break
            for repo in repos:
                if is_quality(repo): store_repo(repo, 'org')
            session.commit()
            page += 1

def collect_search():
    queries = [
        "harvard.edu in:readme pushed:>2024-01-01 stars:>10",  
        "harvard bioinformatics stars:>10",                    
        "harvard deep learning neural network stars:>10",     
        "cs50 harvard stars:>10"                              
    ]
    
    for query in queries:
        print(f"[SEARCH] query: {query}")
        for page in range(1, 6):
            r = requests.get("https://api.github.com/search/repositories",
                           headers=HEADERS,
                           params={'q': query, 'per_page': 50, 'page': page})
            if r.status_code != 200: break
            items = r.json().get('items', [])
            if not items: break
            for repo in items:
                if is_quality(repo): store_repo(repo, 'search')
            session.commit()

# ------------ Main Execution ---------------------
def main():
    print("[✓] DB used: ", engine.url)
    Base.metadata.create_all(engine)
    collect_orgs()
    collect_search()
    print(" Collection complete.")

if __name__ == "__main__":
    main()
