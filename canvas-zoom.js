///////////////////////////////
/////     canvas zoom     /////
///////////////////////////////

// Zoom state for preview canvas
let canvasZoom = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let didPan = false; // Track if panning occurred during current interaction

// Zoom limits
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_SENSITIVITY = 0.001;
const PINCH_SENSITIVITY = 0.01;

// only zoom the photo canvas, frame stays static

// Apply transform to photo canvas only
function applyCanvasTransform() {
  $photoCanvas.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${canvasZoom})`;
}

// Reset zoom and position
export function resetCanvasZoom() {
  canvasZoom = 1;
  canvasOffsetX = 0;
  canvasOffsetY = 0;
  applyCanvasTransform();
}

// Zoom towards a specific point
function zoomAtPoint(delta, clientX, clientY) {
  const rect = $profilePreview.getBoundingClientRect();

  // Calculate mouse position relative to container center
  const containerCenterX = rect.left + rect.width / 2;
  const containerCenterY = rect.top + rect.height / 2;

  const mouseX = clientX - containerCenterX;
  const mouseY = clientY - containerCenterY;

  // Calculate new zoom
  const oldZoom = canvasZoom;
  canvasZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvasZoom + delta));

  // Adjust offset to zoom towards mouse position
  const zoomRatio = canvasZoom / oldZoom;
  canvasOffsetX = mouseX - (mouseX - canvasOffsetX) * zoomRatio;
  canvasOffsetY = mouseY - (mouseY - canvasOffsetY) * zoomRatio;

  applyCanvasTransform();
}

// Handle wheel event (mouse wheel + trackpad scroll/pinch)
$profilePreview.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    // Detect pinch gesture on trackpad (ctrlKey is true for pinch-to-zoom)
    if (e.ctrlKey) {
      // Pinch-to-zoom gesture on trackpad
      const delta = -e.deltaY * PINCH_SENSITIVITY;
      zoomAtPoint(delta, e.clientX, e.clientY);
    } else {
      // Regular scroll - use as zoom
      // deltaY: scroll up = negative = zoom in, scroll down = positive = zoom out
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      zoomAtPoint(delta, e.clientX, e.clientY);
    }
  },
  { passive: false }
);

// Handle touch events for pinch-to-zoom on touch devices
let initialPinchDistance = 0;
let initialPinchZoom = 1;
let initialPinchCenterX = 0;
let initialPinchCenterY = 0;

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

$profilePreview.classList.add('cursor-grab');

$profilePreview.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDistance = getTouchDistance(e.touches);
      initialPinchZoom = canvasZoom;
      const center = getTouchCenter(e.touches);
      initialPinchCenterX = center.x;
      initialPinchCenterY = center.y;
    } else if (e.touches.length === 1 && canvasZoom > 1) {
      // Enable panning when zoomed in
      isPanning = true;
      panStartX = e.touches[0].clientX - canvasOffsetX;
      panStartY = e.touches[0].clientY - canvasOffsetY;
    }
  },
  { passive: false }
);

$profilePreview.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, initialPinchZoom * scale)
      );

      const rect = $profilePreview.getBoundingClientRect();
      const containerCenterX = rect.left + rect.width / 2;
      const containerCenterY = rect.top + rect.height / 2;

      const pinchX = initialPinchCenterX - containerCenterX;
      const pinchY = initialPinchCenterY - containerCenterY;

      const zoomRatio = newZoom / canvasZoom;
      canvasOffsetX = pinchX - (pinchX - canvasOffsetX) * zoomRatio;
      canvasOffsetY = pinchY - (pinchY - canvasOffsetY) * zoomRatio;
      canvasZoom = newZoom;

      applyCanvasTransform();
    } else if (e.touches.length === 1 && isPanning) {
      e.preventDefault();
      canvasOffsetX = e.touches[0].clientX - panStartX;
      canvasOffsetY = e.touches[0].clientY - panStartY;
      applyCanvasTransform();
    }
  },
  { passive: false }
);

$profilePreview.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    initialPinchDistance = 0;
  }
  if (e.touches.length === 0) {
    isPanning = false;
  }
});

// Mouse panning when zoomed in
$profilePreview.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    isPanning = true;
    panStartX = e.clientX - canvasOffsetX;
    panStartY = e.clientY - canvasOffsetY;

    updateCursor(true);

    $framingGrid.hidden = false;
  }
});

document.addEventListener('mousemove', (e) => {
  if (isPanning) {
    canvasOffsetX = e.clientX - panStartX;
    canvasOffsetY = e.clientY - panStartY;
    applyCanvasTransform();
    didPan = true; // Mark that panning occurred
  }
});

document.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;

    updateCursor();
    // Reset didPan after a short delay to allow click event to check it first
    setTimeout(() => {
      didPan = false;
    }, 0);
  }
});

// Update cursor based on zoom level
function updateCursor(isGrabbing = false) {
  $profilePreview.classList.toggle('cursor-grab', !isGrabbing);
  $profilePreview.classList.toggle('cursor-grabbing', isGrabbing);
  $framingGrid.classList.toggle('hidden', !isGrabbing);
}

// Double-click to reset zoom
$profilePreview.addEventListener('dblclick', (e) => {
  e.preventDefault();
  resetCanvasZoom();
  updateCursor();
});

// Export functions for external use
window.canvasZoomControls = {
  reset: resetCanvasZoom,
  zoomIn: () => {
    canvasZoom = Math.min(MAX_ZOOM, canvasZoom * 1.2);
    applyCanvasTransform();
    updateCursor();
  },
  zoomOut: () => {
    canvasZoom = Math.max(MIN_ZOOM, canvasZoom / 1.2);
    applyCanvasTransform();
    updateCursor();
  },
  getZoom: () => canvasZoom,
  getOffsetX: () => canvasOffsetX,
  getOffsetY: () => canvasOffsetY,
  didPan: () => didPan,
};
