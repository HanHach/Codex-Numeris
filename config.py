import os

# ------------ Database Configuration -----------

# Centralized and absolute path to the database file.
# This ensures that both the main app and the collectors refer to the exact same database file, avoiding errors.

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'collectors', 'projects.db')
DATABASE_URL = os.environ.get('DATABASE_URL' , f'sqlite:///{DB_PATH}')
