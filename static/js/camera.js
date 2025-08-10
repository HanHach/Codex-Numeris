export let camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
export let minWorldX, maxWorldX, minWorldY, maxWorldY;

// ------------ Camera Setup ------------
// Function to set initial camera view, ensuring all orbs are visible.
export function setInitialCameraView(p5, orbs, worldLimits) {
  if (!orbs.length) return; 

  // Update world limits from the main galaxy script, defining the boundaries of the content
  minWorldX = worldLimits.minX;
  maxWorldX = worldLimits.maxX;
  minWorldY = worldLimits.minY;
  maxWorldY = worldLimits.maxY;

  // Calculate the center of the entire "world"
  const worldWidth = maxWorldX - minWorldX;
  const worldHeight = maxWorldY - minWorldY;
  const centerX = minWorldX + worldWidth / 2;
  const centerY = minWorldY + worldHeight / 2;

  // Calculate the required zoom level to fit the entire world content within the canvas.
  //  With margin
  const zoomX = p5.width / worldWidth;
  const zoomY = p5.height / worldHeight;
  const initialZoom = Math.min(zoomX, zoomY) * 0.9; // 80% of canvas for initial view

  // Set the initial camera position and zoom directly
  camera.x = centerX;
  camera.y = centerY;
  camera.zoom = initialZoom;

  // set the target values, so the camera start in the correct state and doesn't animate from a default position.
  camera.targetX = centerX;
  camera.targetY = centerY;
  camera.targetZoom = initialZoom;
}

// ------------ Camera Interaction Controls ------------
// Handle mouse wheel for zooming in and out
export function handleMouseWheel(p5, event) {
  // Determine zoom direction: delta > 0 means scroll down (zoom out), delta < 0 means scroll up (zoom in)
  const zoomFactor = event.delta > 0 ? 0.9 : 1.1;
  // Apply zoom, constraining it within defined min/max limits
  camera.targetZoom = p5.constrain(camera.targetZoom * zoomFactor, 0.35, 5); // Min zoom 0.35, max zoom 5
  return false; // prevent default browser page scrolling
}

// Handle mouse drag for panning the camera view
export function handleMouseDragged(p5) {
  // Convert mouse movement (in screen pixels) to "world" movement, accounting for the current zoom level.
  camera.targetX -= p5.movedX / camera.zoom;
  camera.targetY -= p5.movedY / camera.zoom;

  // Constrain the camera's target position within the defined world limits
  camera.targetX = p5.constrain(camera.targetX, minWorldX, maxWorldX);
  camera.targetY = p5.constrain(camera.targetY, minWorldY, maxWorldY);

  return false; // prevent default browser page scrolling
}

// ------------ Coordinate Conversion Utilities ------------
// Convert screen cords to world coords
export function screenToWorld(p5, screenX, screenY) {
  const worldX = (screenX - p5.width / 2) / camera.zoom + camera.x;
  const worldY = (screenY - p5.height / 2) / camera.zoom + camera.y;
  return p5.createVector(worldX, worldY);
}
