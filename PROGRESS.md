(Enhanced by AI for easier scanning)

# 📝 Progress Report — Project *Codex Numeris*

---

## ✅ **Phase 1 — Foundation & Configuration**

**Objective:** Establish a clean, structured, and scalable development environment.

*   **Project Setup:**
    *   📁 Created the `Codex Numeris` folder with `templates/` and `static/` directories.
    *   🧱 Initialized a Git repository for version control.
*   **Environment:**
    *   🐍 Set up and activated a Python virtual environment (`venv`).
    *   🚫 Created a `.gitignore` to exclude `venv/`, `__pycache__/`, etc.
*   **Core Dependencies:**
    *   📦 Installed `Flask`, `Flask-SQLAlchemy`, and `requests`.
*   **Validation:**
    *   🔧 Built a "Hello World" Flask app to confirm the setup.
    *   📝 Drafted the initial `README.md` with a project description and setup instructions.

---

## ✅ **Phase 2 — Backend: Data Collection & Processing**

**Objective:** Build a robust backend to collect, filter, and serve high-quality project data.

*   **Database Schema (`models.py`):**
    *   🧬 Defined the `Project` model using SQLAlchemy.
    *   🗃️ Specified key fields including `id`, `name`, `description`, `stars`, `language`, and `url`.
*   **Data Collector (`github_collector.py`):**
    *   🔐 Implemented secure GitHub API authentication using a `.env` file.
    *   🤖 Developed a collector to fetch projects from **15+ Harvard organizations** and targeted search queries.
    *   🔁 Enhanced the collector to handle API pagination for complete data retrieval.
*   **Data Quality Filtering:**
    *   🧹 Created the `is_quality()` function to act as a gatekeeper.
    *   **Filtering Rules:**
        *   Require a meaningful description.
        *   Require a minimum number of stars.
        *   Exclude forked repositories.
        *   Filter out student assignments (e.g., "pset", "homework").
*   **API Layer (`app.py`):**
    *   🗄️ Connected to the SQLite database.
    *   🌐 Created the `/api/projects` route to expose curated data in JSON format for the frontend.

---

## ✅ **Phase 3 — Frontend: Interactive Visualization**

**Objective:** Design and build an engaging, interactive, and visually rich "galaxy"-style visualization.

*   **Strategic Pivot: from Plotly.js to p5.js:**
    *   **Problem Identified:** Plotly.js was too rigid for the desired level of custom interactivity and aesthetics.
    *   **Solution Chosen:** Switched to **p5.js** to allow pixel-level control and creative freedom.
*   **Core Visualization (`galaxy.js`):**
    *   ✨ Fetched data from the backend API and transformed each project into a "star" object.
    *   🎨 Rendered stars as layered glowing orbs with subtle animations to suggest depth.
    *   🌌 Added a rich space-themed background using a multi-layer parallax system.
*   **Data-Driven Aesthetics:**
    *   **Position Mapping:** Project creation date mapped to X-axis, popularity to Y-axis.
    *   **Scale Balance:** Applied a **logarithmic scale** to star counts to preserve visibility of smaller projects.
*   **User Experience & Interactivity:**
    *   🖱️ Added hover detection with project tooltips and clickable stars linking to GitHub.
    *   🎥 Built smooth pan and zoom camera controls with boundaries to avoid disorientation.
    *   🗺️ Introduced contextual guides for time and popularity that dynamically appear based on zoom level.
*   **UI Controls & Filtering (`ui.js`):**
    *   ⚙️ Filters auto-populated based on project `language` and `year` (2013 to present).
    *   🔘 Included a "Reset View" button that appears only when filters are active.
    *   💨 Applied filters with smooth transitions and fading animations.

---

## ✅ **Phase 4 — Finalization: Technical Refactoring**

**Objective:** Resolve architectural inconsistencies and improve maintainability.

*   **Frontend Modularization:**
    *   **Initial Step:** Split the monolithic `galaxy.js` into smaller modules: `camera.js` and `ui.js`.
    *   **Identified Conflict:** The modern `import`/`export` syntax conflicted with p5.js's default "global" mode.
    *   **Implemented Fix:** Re-architected the frontend to use **p5.js instance mode**.
*   **Outcome:**
    *   🛠️ Encapsulated all p5.js logic in a single object passed into other modules.
    *   🧩 Resulting code is now both **modular** and **stable**.

---

## ✅ **Phase 5 — Final Review & Quality Assurance**

**Objective:** Ensure code quality, full functionality, and polished documentation.

*   **Code & Functionality:**
    *   🔎 Conducted a full code review to resolve inconsistencies and check for edge cases.
    *   ✔️ Performed end-to-end testing: data collection, API behavior, filtering, and interactivity.
*   **Documentation:**
    *   ✍️ Finalized a comprehensive `README.md` detailing features, architecture, and setup instructions.
