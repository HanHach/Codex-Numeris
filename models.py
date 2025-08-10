from sqlalchemy import Column, Integer, String, DateTime
from database import db  # Import the shared db instance 
try:
    from sqlalchemy import JSON
    JsonType = JSON
except ImportError:
    JsonType = String 

# ------------ Database Base Declaration is managed by db.Model from Flask-SQLAlchemy ---------

# ------------ Project Model Definition -----------
class Project(db.Model):
    __tablename__ = "projects"

    id           = Column(Integer, primary_key=True)            # GitHub ID => unique guaranteed
    name         = Column(String,  nullable=False, index=True)
    description  = Column(String)
    url          = Column(String)
    stars        = Column(Integer, default=0, index=True)
    language     = Column(String,  index=True)
    organization = Column(String,  index=True)
    created_at   = Column(DateTime)
    updated_at   = Column(DateTime)
    topics       = Column(JsonType)    


    # ------------ Serialization Method ---------------
    def to_dict(self):
        """Serializes the object to a dict."""
        created = getattr(self, 'created_at', None)
        updated = getattr(self, 'updated_at', None)
        topics = getattr(self, 'topics', None)
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'url': self.url,
            'stars': self.stars,
            'language': self.language,
            'organization': self.organization,
            'created_at': created.isoformat() if created else None,
            'updated_at': updated.isoformat() if updated else None,
            'topics': topics if topics else []
        }
