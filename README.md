# Codex Numeris

---


#### Video Demo: [Video Demo](https://drive.google.com/file/d/1oVRD8OTrowoeCDPZTrWzhAk8D0q81sHh/view?usp=drive_link)

#### Description: 
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

```
git clone https://github.com/HanHach/Codex-Numeris.git
cd Codex-Numeris
```

### 2. Create and Activate a Virtual Environment

```
# Create the virtual environment
python -m venv venv

# Activate the environment
# On Windows (PowerShell):
venv\Scripts\activate
# On macOS/Linux (Bash):
source venv/bin/activate
```

### 3. Install Dependencies

Install the required Python packages using pip.

```
pip install -r requirements.txt
```

### 4. Run the Application

You can now start the Flask web server. The recommended way to run a Flask application for development is using the `flask` command.

```
flask run
```
> **Note:** The `flask run` command automatically detects your `app.py` file and runs it in a proper application context, which is more robust than using `python app.py`.

You should see an output indicating that the server is running on `http://127.0.0.1:5000`. Open this URL in your web browser to see the visualization.

---

## Key Features

-   **Interactive Galaxy:** Navigate a dynamic galaxy of open-source projects using intuitive pan and zoom controls.
-   **Data-Driven Visualization:** Each star's (orb) position (timeline), size (popularity), and color (language) are determined by real data from GitHub.
-   **Dynamic Filtering:** Instantly filter the galaxy by programming language or creation year to discover trends and specific project clusters.
-   **Detailed Tooltips:** Hover over any star to get detailed information about the project, including its description, star count, and a direct link to its GitHub repository.
-   **Immersive Design:** A custom-built visualization using p5.js with a multi-layered parallax background, glowing stars, and smooth animations for a fluid user experience.

---

## Project Structure

The project is organized into a Flask backend that serves data and a p5.js frontend that handles the visualization.

### Backend Files

-   `app.py`: The main Flask application file. It sets up the server, initializes the database, and defines the API route (`/api/projects`) that serves project data to the frontend. It acts as the central orchestrator for the backend services.
-   `database.py`: A simple module that centralizes the SQLAlchemy database object to prevent circular import issues, ensuring a single, consistent database connection across the application.
-   `models.py`: Defines the `Project` data model using SQLAlchemy, specifying the schema and structure of the `projects` table in the SQLite database, including fields like name, stars, and language.
-   `config.py`: Centralizes application configuration, primarily the path to the SQLite database file, ensuring both the Flask application and the data collector use the same database instance for consistency.
-   `collectors/github_collector.py`: A standalone script responsible for fetching project data from the GitHub API, applying quality filters (e.g., minimum stars, relevant languages), and efficiently storing the processed data in the SQLite database.

### Frontend Files

-   `templates/index.html`: The main HTML file that provides the structural foundation for the web page. It includes the p5.js canvas where the galaxy visualization is rendered, along with various UI elements for filters and interactive controls.
-   `static/css/style.css`: Contains all the styling rules for the application. It defines the dark, cosmic theme, and meticulously controls the layout and appearance of the UI overlay, tooltips, and other visual components to ensure a cohesive aesthetic.
-   `static/js/galaxy.js`: The core of the visualization. This script uses p5.js to draw the project galaxy, handle user interactions, and manage the overall state of the sketch. It orchestrates the camera and UI modules and contains the main `setup()` and `draw()` loops.
-   `static/js/ui.js`: Manages all user interface-related functionality. This includes dynamically populating filter options, controlling the display and content of tooltips on hover, and managing event listeners for various interactive controls.
-   `static/js/camera.js`: Handles all camera logic for the p5.js canvas. This module provides functionalities for panning, zooming, and converting between world and screen coordinates, allowing users to smoothly navigate through the interactive galaxy.


### Commenting Style

Throughout the codebase, a consistent commenting style is used to delineate logical sections (eg : // ---------- Core Functions ----------). This approach was chosen to improve readability and maintainability by breaking down large files into self-contained, easy-to-navigate blocks.
I know it's not something usually done, but I find it super helpful.

---

## Design Choices and Development Process

The development of Codex Numeris involved several critical design choices and architectural decisions to achieve its unique interactive visualization.

### The Visualization Pivot: From Plotly.js to p5.js

Initially, I had considered using a standard charting library like Plotly.js. The idea was to create a simple scatter plot where the X-axis would represent time and the Y-axis popularity. However, I quickly encountered several limitations. Plotly, while powerful for conventional data visualization, proved rigid. It imposed a Cartesian structure that did not allow for the "galactic" atmosphere I envisioned. I couldn't easily add "jitter" effects to space out the stars, nor create subtle visual effects like glowing halos or twinkling animations (at least i didnt succeed in doing so). The overall experience felt too static and analytical for the immersive concept.

I therefore made the decision to pivot towards p5.js. As a "creative coding" library, p5.js offered total, pixel-level control over the canvas. This unlocked the full creative potential of the project, enabling:
-   **Multi-layered star rendering:** Creating depth and a sense of a vast cosmos.
-   **Parallax effects:** Enhancing the feeling of movement and immersion as the user navigates.
-   **Custom camera controls:** Allowing for intuitive pan and zoom within the galaxy.
-   **Dynamic visual effects:** Such as subtle twinkling, glowing halos, and smooth transitions.

### Modular Frontend Architecture

As the complexity of the visualization grew, the `galaxy.js` file became monolithic and challenging to maintain. I decided to refactor the frontend. All camera logic (panning, zooming, coordinate conversions) was isolated into `camera.js`, and DOM manipulation (filters, tooltips) was moved into `ui.js`. This refactoring made the main `galaxy.js` file significantly more readable, as it now acts primarily as an orchestrator, managing the overall sketch state and integrating the functionalities of the other modules.

This choice introduced a technical challenge: a conflict between ES6 modules (`import`/`export`) and p5.js's default "global" mode. I resolved this by adopting p5.js's "instance mode," a practice that encapsulates all p5.js functionality within a single object, ensuring compatibility and stability of the modularized code.

### Data Visualization Logic and Aesthetics

A major challenge was representing the project data meaningfully within the galaxy. A simple linear mapping of star counts to the Y-axis proved ineffective, as a few highly popular projects would disproportionately compress all others. To achieve a more balanced and readable distribution of "stars," I implemented a logarithmic scale (log10) for popularity. This allowed for a much more equitable spread of projects across the galaxy's vertical axis.

Aesthetically, each "star" is not a simple circle. It's composed of three superimposed ellipses with varying opacities to create a luminous halo effect, further enhanced by a subtle twinkling animation. 

---

## For Maintainers: Updating the Database

If you wish to refresh the project data with the latest information from GitHub, you will need to run the data collector.

**1. Configure Environment Variables:**
   - Create a file named `.env` in the root of the project directory.
   - Add your GitHub Personal Access Token to this file:
     ```
     GITHUB_TOKEN="your_personal_access_token_here"
     ```
   - > **Note:** You can generate a token from your GitHub account settings. The token does not require any special permissions.

**2. Run the Data Collector:**
   - From the root of the project, run the collector script:
```
python collectors/github_collector.py
```
   - This will overwrite the existing `projects.db` file with fresh data. This process may take a few minutes.
