# models.py
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base

# Base déclarative pour nos modèles
Base = declarative_base()

class Project(Base):
    __tablename__ = 'projects'  # Nom de la table dans la base de données
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    url = Column(String)
    stars = Column(Integer, default=0)
    language = Column(String)
    created_at = Column(DateTime)
    # Ajoutez d'autres champs si nécessaire
