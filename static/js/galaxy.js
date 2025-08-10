import { ui, populateFilters, setupEventListeners as setupUIEventListeners, updateTooltip } from './ui.js';
import { camera, setInitialCameraView, handleMouseWheel, handleMouseDragged, screenToWorld } from './camera.js';

// ------------ p5.js Instance Mode Setup ------------
const sketch = (p5) => {
  // ------------ Sketch-Scoped Variables ------------
  let allProjects = []; // Array to store all projects
  let orbs = [];
  let hoveredOrb = null;
  let colorCache = {}; 
  let backgroundOrbs = [];
  let worldLimits = {}; // dictionary to store the limits of the world  

  // ------------ Core p5.js Functions -------------
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.pixelDensity(1); // Adjust for high-DPI screens for consistent rendering
    p5.ellipseMode(p5.CENTER); // Draw ellipses from their center
    p5.imageMode(p5.CENTER);   // Draw images from their center
    p5.noStroke();  // Disable drawing outlines for shapes by default.

    // Initialize background orbs (stars) that create a parallax effect
    createBackgroundOrbs(1500); 

    // Load project data from the backend API
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        allProjects = data;
        orbs = createOrbs(allProjects); // Create visual orbs from project data
        setInitialCameraView(p5, orbs, worldLimits); // Position camera to show all orbs
        
        // Set up UI elements (filters, tooltip) and their event listeners.
        // The p5 instance is passed to allow UI functions to interact with p5.js (example., cursor changes).
        setupUIEventListeners(p5, applyFilters, resetFilters);
        populateFilters(allProjects);
      })
      .catch((error) => console.error("Error fetching data:", error)); 

    // Add a global event listener to the window for when it loses focus (eg., user switches tabs).
   // Quick fix for a weird bug on tab switch
    window.addEventListener('blur', () => {
      hoveredOrb = null; // Clear any currently hovered orb
      p5.mouseIsPressed = false; // Reset p5.js's internal mouse pressed state (Bugfix : it's a correction from a bug)
    });
  };

  p5.draw = () => {
    if (!allProjects.length) return; 

    // Smoothly interpolate camera's current position/zoom towards its target position/zoom.
    const lerpFactor = 0.08; 
    camera.x = p5.lerp(camera.x, camera.targetX, lerpFactor);
    camera.y = p5.lerp(camera.y, camera.targetY, lerpFactor);
    camera.zoom = p5.lerp(camera.zoom, camera.targetZoom, lerpFactor);

    p5.background("#0A0F1E"); 

    // Apply camera transformations to the entire drawing context.
  
    p5.translate(p5.width / 2, p5.height / 2);
    p5.scale(camera.zoom);
    p5.translate(-camera.x, -camera.y); // translate by negative camera position: Moves the "world" relative to the camera,

    // Draw various elements of the galaxy visualization
    drawBackgroundOrbs();   // Draw the distant, twinkling background stars
    drawProjectOrbs();  // the interactive project orbs
    drawSubtleGuides();  // The timeline and popularity guides
    handleMouseInteraction(); // Manage mouse hover and tooltip display for orbs
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight); // Adjust canvas size to new window dimensions
    // Recalculate orb positions and camera view if projects are loaded, ensuring the visualization adapts correctly to the new window size.
    if (allProjects.length > 0) {
      orbs = createOrbs(allProjects); // Recreate orbs to adjust their positions based on new canvas size
      setInitialCameraView(p5, orbs, worldLimits); // Reset camera to fit all orbs in the new view
    }
    // Recreate background orbs to fill the new canvas dimensions
    backgroundOrbs = [];
    createBackgroundOrbs(1500); // Number of background orbs
  };

  // Event handler for mouse wheel scrolling (zoom)
  p5.mouseWheel = (event) => handleMouseWheel(p5, event);
  // for mouse dragging
  p5.mouseDragged = () => handleMouseDragged(p5);
  // Event handler for mouse press (clicking on orbs)
  p5.mousePressed = () => {
// open its associated project URL in a new tab
    if (hoveredOrb) {
      window.open(hoveredOrb.project.url, "_blank");
      // Immediately reset `hoveredOrb` to null after a click.
      // This prevents the "repeated project opening" bug.
      hoveredOrb = null;
    }
  };

  // ------------ Orb Creation and Drawing -------------
  /**
   * Creates orb objects from GitHub projects data
   * @param {Array} projects - Array of GitHub project objects with stars, created_at, etc.
   * @returns {Array} Array of orb objects with position, size and visual properties
   */
  function createOrbs(projects) {
    if (!projects?.length) return [];

    // X-axis: Time rnge from config year to now
    const minDate = new Date(2013, 0, 1); // Guide min year
    const maxDate = new Date();
    
    // Y-axis: Popularity (stars). Using log10 scale for better distribution of star counts
    const maxStars = Math.max(1, ...projects.map(p => p.stars));
    const maxLogStars = Math.log10(maxStars + 1); // Using log10 for better scale

    // Track the boundaries of the generated orbs to set the initial camera view
    let tempMinX = Infinity, tempMaxX = -Infinity;
    let tempMinY = Infinity, tempMaxY = -Infinity;

    const createdOrbs = projects
      .map((project) => {
        const creationDate = new Date(project.created_at);
        if (creationDate < minDate) return null;

        // --- Calculate X Position (Timeline) ---
        // Map the project's creation date to a horizontal position.
        const posX = p5.map(
          creationDate.getTime(),
          minDate.getTime(),
          maxDate.getTime(),
          p5.width * -0.5, // Galaxy X offset
          p5.width * 2.5 // Galaxy X spread
        );

        // --- Calculate Y Position (Popularity) ---
        // Using log10 scale for better distribution of star counts
        const logStars = Math.log10(project.stars + 1); // Add 1 to avoid log(0)
        
        // Map popularity to vertical position with adjusted scale
        // Higher stars get more vertical space, lower stars are more compressed
        const verticalRange = p5.height * 1.2; // Slightly increased range
        const popularityInfluence = p5.map(
          logStars, 
          0, 
          maxLogStars,
          verticalRange * 0.8,  // Start higher up (positive Y is down in p5)
          -verticalRange * 0.8  // End higher on screen (negative Y is up)
        );
        
        // Add jitter but reduce its impact for better readability
        const jitterAmount = p5.height * 0.03; // Reduced jitter for better alignment
        const posY = p5.height / 2 + popularityInfluence + p5.random(-jitterAmount, jitterAmount);

        // --- Calculate Size (Popularity) ---
        // A simpler, more direct mapping for orb size based on popularity.
        const size = p5.map(logStars, 0, maxLogStars, 5, 60); // Orb min/max size

        // Update the boundaries of the world, used to frame the camera initially.
        tempMinX = p5.min(tempMinX, posX);
        tempMaxX = p5.max(tempMaxX, posX);
        tempMinY = p5.min(tempMinY, posY);
        tempMaxY = p5.max(tempMaxY, posY);

        return {
          x: posX, y: posY, size: size,
          color: getLanguageColor(project.language),
          twinkleOffset: p5.random(p5.TWO_PI),
          alpha: 1, targetAlpha: 1,
          project: project,
        };
      })
      .filter(Boolean);

    // Set world limits with a margin for better initial camera framing
    const marginX = p5.width * 0.1;
    const marginY = p5.height * 0.05;
    worldLimits.minX = tempMinX - marginX;
    worldLimits.maxX = tempMaxX + marginX;
    worldLimits.minY = tempMinY - marginY;
    worldLimits.maxY = tempMaxY + marginY;

    return createdOrbs;
  }

  function drawProjectOrbs() {
    orbs.forEach((orb) => {
      // Ssmoothly transition the orb's alpha for filtering effects.
      orb.alpha = p5.lerp(orb.alpha, orb.targetAlpha, 0.05); // Filter alpha lerp factor
      // skip drawing orbs that are almost invisible to improve performance.
      if (orb.alpha < 0.01) return;

      const c = p5.color(orb.color);
      const r = p5.red(c);
      const g = p5.green(c);
      const b = p5.blue(c);

      // Draw the orb in multiple layers to create a glowing effect.
      // 1. Outer Halo: A large, semi-transparent ellipse.
      p5.fill(r, g, b, 20 * orb.alpha); // Orb outer halo alpha
      p5.noStroke();
      p5.ellipse(orb.x, orb.y, orb.size * 2.5);

      // 2. Body: The main, more opaque part of the orb
      p5.fill(r, g, b, 200 * orb.alpha); // Orb body alpha
      p5.ellipse(orb.x, orb.y, orb.size);

      // 3.Core: A small, bright center to give a sense of depth.
      p5.fill(255, 255, 255, 220 * orb.alpha); // Orb core alpha
      p5.ellipse(orb.x, orb.y, orb.size * 0.3);

      // If the orb is being hovered, draw a highlight ring around it.
      if (orb === hoveredOrb) {
        p5.stroke(255, 255, 255, 150); // Orb highlight alpha
        p5.strokeWeight(2); // Orb highlight stroke weight
        p5.noFill();
        p5.ellipse(orb.x, orb.y, orb.size * 2);
      }
    });
  }

  // -------------- Background and Guides ------------
  function createBackgroundOrbs(num) {
    for (let i = 0; i < num; i++) {
      backgroundOrbs.push({
        x: p5.random(-p5.width, 2 * p5.width),
        y: p5.random(-p5.height, 2 * p5.height),
        size: p5.random(1, 4), // Background orb min/max size
        z: p5.random(0.05, 0.7), // Background orb min/max z
        twinkleOffset: p5.random(p5.TWO_PI),
      });
    }
  }

  function drawBackgroundOrbs() {
    let time = p5.millis() / 1000;
    p5.push();
    p5.translate((camera.x - p5.width / 2) * 0.5, (camera.y - p5.height / 2) * 0.5); // Apply parallax effect (factor 0.5)
    backgroundOrbs.forEach((orb) => {
      const alpha = (100 + p5.sin(time * orb.z * 5 + orb.twinkleOffset) * 50) * orb.z; // Twinkle speed 5
      p5.fill(255, 255, 255, p5.constrain(alpha, 20, 255)); // Min alpha 20
      p5.noStroke();
      p5.ellipse(orb.x, orb.y, orb.size * orb.z);
    });
    p5.pop();
  }

  function drawSubtleGuides() {
    p5.push();
    const labelColor = p5.color(255, 255, 255, 50); // Guide label alpha
    // Calculate visible world bounds based on camera position and zoom
    const viewLeft = camera.x - p5.width / 2 / camera.zoom;
    const viewRight = camera.x + p5.width / 2 / camera.zoom;
    const viewTop = camera.y - p5.height / 2 / camera.zoom;
    const viewBottom = camera.y + p5.height / 2 / camera.zoom;

    if (allProjects.length > 0) {
      const starLevels = [10, 100, 1000, 10000, 100000]; 
      const maxStars = Math.max(1, ...allProjects.map((proj) => proj.stars));
      const maxLogStars = Math.log10(maxStars + 1);

      if (camera.zoom > 0.2) { // only show when zoomed in enough
        starLevels.forEach((starCount) => {
          const logStarCount = Math.log10(starCount + 1);
          if (logStarCount > maxLogStars && starCount !== 0) return;
          const verticalRange = p5.height * 1.2; // match the same range as in createOrbs
          const popularityInfluence = p5.map(
            logStarCount, 
            0, 
            maxLogStars,
            verticalRange * 0.8,
            -verticalRange * 0.8
          );
          const y = p5.height / 2 + popularityInfluence;
          p5.noStroke();
          p5.fill(labelColor);
          p5.textSize(12 / camera.zoom); // Guide label text size
          p5.textAlign(p5.RIGHT, p5.CENTER);
          p5.text(`${starCount}★`, viewLeft + (p5.width * 0.05) / camera.zoom, y); // Guide X axis label offset
        });
      }
    }

    const minDate = new Date(2013, 0, 1); // Guide min year
    const maxDate = new Date();
    for (let year = minDate.getFullYear(); year <= maxDate.getFullYear(); year += 1) {
      const yearDate = new Date(year, 0, 1);
      const x = p5.map(yearDate.getTime(), minDate.getTime(), maxDate.getTime(), p5.width * -0.5, p5.width * 2.5); // Galaxy X offset and spread
      // Adjust year label density based on zoom
      let labelStep = 1;
      if (camera.zoom < 0.2) labelStep = 10;
      else if (camera.zoom < 0.5) labelStep = 5;
      else if (camera.zoom < 1.0) labelStep = 2;
      if (year % labelStep === 0) {
        p5.noStroke();
        p5.fill(labelColor);
        p5.textSize(12 / camera.zoom); // Guide label text size
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text(year.toString(), x, viewBottom - (p5.height * 0.05) / camera.zoom); // Guide X axis label offset
      }
    }

    p5.noStroke();
    p5.fill(labelColor);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.textSize(18 / camera.zoom); // Guide axis label text size
    p5.text("Timeline (Creation Date)", (viewLeft + viewRight) / 2, viewBottom - (p5.height * 0.02) / camera.zoom); // Guide Y axis label offset
    p5.push();
    p5.translate(viewLeft + (p5.width * 0.02) / camera.zoom, (viewTop + viewBottom) / 2); // Guide Y axis label offset
    p5.rotate(-p5.HALF_PI); // Rotate for vertical axis title
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.textSize(18 / camera.zoom); // Guide axis label text size
    p5.text("Popularity (Stars)", 0, 0);
    p5.pop();
    p5.pop();
  }

  // ------------ Interaction and Filtering ------------
  function handleMouseInteraction() {
    const worldMouse = screenToWorld(p5, p5.mouseX, p5.mouseY);
    hoveredOrb = null;
    let minDistance = Infinity;

    // Check for mouse hover on orbs (hit-testing)
    orbs.forEach((orb) => {
      if (orb.alpha < 0.1) return; // Filter hidden orb alpha
      const d = p5.dist(worldMouse.x, worldMouse.y, orb.x, orb.y);
      if (d < orb.size / 2 + 5 && d < minDistance) // Orb hover buffer
        { 
        hoveredOrb = orb;
        minDistance = d;
      }
    });

    updateTooltip(p5, hoveredOrb, p5.mouseX, p5.mouseY);
  }

  function applyFilters() {
    const selectedLanguage = ui.languageFilter.value;
    const selectedYear = ui.yearFilter.value;

    orbs.forEach((orb) => {
      const languageMatch = selectedLanguage === "all" || orb.project.language === selectedLanguage;
      const yearMatch = selectedYear === "all" || new Date(orb.project.created_at).getFullYear().toString() === selectedYear;
      orb.targetAlpha = languageMatch && yearMatch ? 1 : 0.1; // Filter hidden orb alpha
    });
    // After applying filters, need to tell the UI to update the reset button
    if (ui.updateResetButtonVisibility) {
      ui.updateResetButtonVisibility();
    }
  }

  function resetFilters() {
    if (ui.languageFilter) ui.languageFilter.value = "all";
    if (ui.yearFilter) ui.yearFilter.value = "all";
    applyFilters();
  }

  // ------------ Utility Functions ------------
  function getLanguageColor(language) {
    if (!language) return "#cccccc";
    if (colorCache[language]) return colorCache[language];

    let hash = 0;
    for (let i = 0; i < language.length; i++) {
      hash = language.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    const saturation = 70; // Brighter colors
    const lightness = 55;  // Brighter colors
    const colorValue = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    colorCache[language] = colorValue;
    return colorValue;
  }
};

// Create the p5 instance
new p5(sketch);
