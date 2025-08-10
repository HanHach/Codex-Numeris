export const ui = {};

// ------------ Filter Management ------------
// Function to populate language and year filters
export function populateFilters(projects) {
  // Get unique, sorted languages from all projects
  const languages = [
    ...new Set(projects.map((p) => p.language).filter(Boolean)),
  ].sort();

  // Generate years from 2013 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 2013; i--) { // Start year for guides is 2013
    years.push(i);
  }

  // Add "All" option
  ui.languageFilter.innerHTML = '<option value="all">All Languages</option>';
  ui.yearFilter.innerHTML = '<option value="all">All Years</option>';

  // Populate dropdowns.
  languages.forEach((lang) => {
    ui.languageFilter.innerHTML += `<option value="${lang}">${lang}</option>`;
  });
  years.forEach((year) => {
    ui.yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
  });
  updateResetButtonVisibility(); // Initial check for button visibility
}

// Function to manage "Reset View" button visibility
export function updateResetButtonVisibility() {
  const selectedLanguage = ui.languageFilter.value;
  const selectedYear = ui.yearFilter.value;

  if (selectedLanguage !== "all" || selectedYear !== "all") {
    ui.resetButton.style.display = "inline-block"; // Show button
  } else {
    ui.resetButton.style.display = "none"; // Hide button
  }
}

// ------------ Event Listener Setup --------
// Function to set up event listeners for filters and reset button
export function setupEventListeners(p5, applyFilters, resetFilters) {
  // Initialize UI elements
  ui.languageFilter = document.getElementById("language-filter");
  ui.yearFilter = document.getElementById("year-filter");
  ui.resetButton = document.getElementById("reset-filters");
  ui.tooltip = document.getElementById("tooltip");

  ui.languageFilter.addEventListener("change", applyFilters);
  ui.yearFilter.addEventListener("change", applyFilters);
  ui.resetButton.addEventListener("click", resetFilters);
}

// ------------ Tooltip Management --------
// Function to update the tooltip content and visibility
export function updateTooltip(p5, hoveredOrb, mouseX, mouseY) {
  if (hoveredOrb) {
    p5.cursor(p5.HAND); // Change cursor to hand on hover
    ui.tooltip.style.display = "block";
    // Position tooltip next to cursor (screen coordinates)
    ui.tooltip.style.left = mouseX + 15 + "px"; // 15px horizontal offset from cursor
    ui.tooltip.style.top = mouseY + "px";

    // Enrich the tooltip with better formatting
    const project = hoveredOrb.project;
    const creationDate = new Date(project.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    
    // Helper function to format project description for the tooltip
    const formatDescription = (desc, maxLength = 500) => { // Max tooltip width 500px
      if (!desc) return "No description available.";

      let formatted = desc;
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g; // Regex to find markdown-style links, e.g., [text](url)
      let match;
      // Replace all markdown links with HTML <a> tags
      while ((match = linkRegex.exec(formatted)) !== null) {
        const fullMatch = match[0]; // 
        const linkText = match[1];  //
        const linkUrl = match[2];   
        const htmlLink = `<a href="${linkUrl}" target="_blank" style="color: #4dabf7; text-decoration: none;">${linkText}</a>`;
        formatted = formatted.replace(fullMatch, htmlLink);
      }
      
      // Convert newline characters to html line breaks for display
      formatted = formatted.replace(/\n/g, '<br>');
      
      // Truncate the description if it exceeds the maximum length
      if (formatted.length > maxLength) {
        // Find the last space before the limit to avoid cutting words in half
        let lastSpace = formatted.lastIndexOf(' ', maxLength);
        if (lastSpace === -1) lastSpace = maxLength; // If no space, truncate at the exact limit
        
        // TODO: add a "Read More" link instead of just '...'
        return formatted.substring(0, lastSpace) + '...';
      }
      
      return formatted;
    };
    ui.tooltip.innerHTML = `
      <h3>${project.name}</h3>
      ${project.organization ? `<p><strong>Organization:</strong> ${project.organization}</p>` : ''}
      <p>${formatDescription(project.description)}</p>
      <div class="meta">
        <div>⭐ <strong>${project.stars.toLocaleString()}</strong> stars</div>
        ${project.language ? `<div>💻 <strong>${project.language}</strong> language</div>` : ''}
        <div>📅 Created on <strong>${creationDate}</strong></div>
        <div style="margin-top: 0.5rem;">
          <a href="${project.url}" target="_blank" style="color: #4dabf7; text-decoration: none;">
            🔗 View on GitHub
          </a>
        </div>
      </div>
    `;
  } else {
    p5.cursor(p5.ARROW); // Reset cursor to arrow
    ui.tooltip.style.display = "none";
  }
}
