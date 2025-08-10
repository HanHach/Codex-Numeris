# Codex Numeris

---

#### Description
Codex Numeris is an interactive web application that visualizes the open-source ecosystem of Harvard-affiliated projects as a dynamic, explorable galaxy. Each star in the galaxy represents a project, with its position, size, and color conveying information about its creation date, popularity, and programming language.

This project is designed to be run locally and comes with a pre-populated database.

---

## Requirements

- Python 3.8+
- Git

---

## Local Installation and Usage

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/HanHach/Codex-Numeris.git
cd Codex-Numeris
```

### 2. Create and Activate a Virtual Environment
```bash
# Create the virtual environment
python -m venv venv

# Activate on Windows (PowerShell)
venv\Scripts\activate

# Activate on macOS/Linux (Bash)
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
flask run
```
Open your browser to `http://127.0.0.1:5000` to see the visualization.

---

## Key Features

-   **Interactive Galaxy:** Navigate a dynamic galaxy of open-source projects using intuitive pan and zoom controls.
-   **Data-Driven Visualization:** Each star's position (timeline), size (popularity), and color (language) are determined by real data from GitHub.
-   **Dynamic Filtering:** Instantly filter the galaxy by programming language or creation year.
-   **Detailed Tooltips:** Hover over any star to get detailed information about the project.
-   **Immersive Design:** A custom-built visualization using p5.js with a multi-layered parallax background and glowing stars.

---

## For Maintainers: Updating the Database

If you wish to refresh the project data with the latest information from GitHub, you will need to run the data collector.

**1. Configure Environment Variables:**
   - Create a file named `.env` in the root of the project directory.
   - Add your GitHub Personal Access Token to this file:
     ```
     GITHUB_TOKEN="your_personal_access_token_here"
     ```
   - A token does not require any special permissions.

**2. Run the Data Collector:**
   - From the root of the project, run the collector script:
     ```bash
     python collectors/github_collector.py
     ```
   - This will overwrite the existing `projects.db` file with fresh data.

---
