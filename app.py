from flask import Flask, render_template, jsonify
from config import DATABASE_URL  # Import the centralized database URL
from database import db          # Import the shared db instance
from models import Project       # Import the Project model

# ------------ Application Configuration --------
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ------------ Database Initialization ----------
db.init_app(app)  # Initialize the db instance with the app

# Create tables if they don't exist
with app.app_context():
    db.create_all()


# ------------ Main Routes ------------------------

@app.route("/")
def index():
    return render_template("index.html")

# ------------ API Routes -------------------------
@app.route("/api/projects")
def get_projects():
    """Returns all projects as JSON."""
    try:
        projects = Project.query.order_by(Project.stars.desc()).all()
        return jsonify([project.to_dict() for project in projects])
    except Exception as e:
        # Log the exception for debugging
        app.logger.error(f"Error fetching projects: {e}")
        return jsonify({"error": "An error occurred while fetching projects"}), 500

# ------------ Application Entry Point ----------
if __name__ == "__main__":
    # For running the app directly with pyhton app.py
    with app.app_context():
        print("DB used by Flask:", db.engine.url)
    app.run(debug=True)
