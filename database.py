# This file centralizes the SQLAlchemy object to prevent circular imports

from flask_sqlalchemy import SQLAlchemy

# It will be initialized in the main app file 
db = SQLAlchemy()
