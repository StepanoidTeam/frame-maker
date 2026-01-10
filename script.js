/**
 * Frame Maker Logic
 */

import { presets } from './config.js';
import { createReactiveState } from './state.js';
import {
  parseSvgConfig,
  applySvgConfig,
  getDefaultsFromConfig,
} from './svg-config.js';
import { generateUI } from './ui-generator.js';
import {
  photosList,
  uploadedPhotos,
  loadPhotosFromStorage,
  addUploadedPhoto,
} from './photo-storage.js';

import './theme-switcher.js';
import { updateMask } from './scroll-mask-feature.js';
import { resetCanvasZoom } from './canvas-zoom.js';

/**
 * Default state configuration
 */
const defaultState = {
  userImage: null, // Will hold the Image object
  frameImage: null, // Will hold the SVG Image object
  svgContent: null, // Raw SVG string for editing
  selectedFrameId: 'opentowork2', // 'hiring', 'opentowork', 'custom'
};

let currentFrameConfig = null;

// Reactive state - automatically calls updateAndDraw on changes
// Properties that should trigger redraw
const renderTriggerProperties = [
  'text',
  'textColor',
  'frameColor',
  'textRotation',
  'frameRotation',
  'fontSize',
  'fontFamily',
  'textScale',
];

const imageErrorPng = './no-image.png';

const renderPropsSet = new Set(renderTriggerProperties);

const [state, addStatePropListener] = createReactiveState(defaultState);

addStatePropListener(
  renderTriggerProperties,
  (_propName, _value, _oldValue) => {
    updateAndDraw();
  }
);
addStatePropListener(['userImage'], drawPhoto);
addStatePropListener(['frameImage'], drawFrame);

addStatePropListener(['userImage'], resetCanvasZoom);

// Canvas setup - separate canvases for photo and frame
const photoCanvas = $photoCanvas;
const frameCanvas = $frameCanvas;
const photoCtx = photoCanvas.getContext('2d');
const frameCtx = frameCanvas.getContext('2d');
const CANVAS_SIZE = 800;
photoCanvas.width = CANVAS_SIZE;
photoCanvas.height = CANVAS_SIZE;
frameCanvas.width = CANVAS_SIZE;
frameCanvas.height = CANVAS_SIZE;

// Drawing functions
function drawImageContain(ctx, canvas, img) {
  const canvasAspect = canvas.width / canvas.height;
  const imgAspect = img.width / img.height;

  let drawWidth;
  let drawHeight;
  let offsetX;
  let offsetY;

  if (imgAspect > canvasAspect) {
    // Image is wider relative to canvas
    drawWidth = canvas.width;
    drawHeight = canvas.width / imgAspect;
    offsetX = 0;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    // Image is taller relative to canvas
    drawHeight = canvas.height;
    drawWidth = canvas.height * imgAspect;
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function drawPhoto() {
  photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  if (state.userImage) {
    drawImageContain(photoCtx, photoCanvas, state.userImage);
  }
}

function drawFrame() {
  frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
  if (state.frameImage) {
    frameCtx.drawImage(
      state.frameImage,
      0,
      0,
      frameCanvas.width,
      frameCanvas.height
    );
  }
}

function draw() {
  drawPhoto();
  drawFrame();
}

// Combine both canvases for download with zoom/pan transforms applied
function getDownloadCanvas() {
  // Combined canvas for download (hidden)
  const downloadCanvas = document.createElement('canvas');
  const downloadCtx = downloadCanvas.getContext('2d');
  downloadCanvas.width = CANVAS_SIZE;
  downloadCanvas.height = CANVAS_SIZE;

  downloadCtx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);

  // Get zoom state from canvas-zoom.js
  const zoom = window.canvasZoomControls?.getZoom() || 1;
  const offsetX = window.canvasZoomControls?.getOffsetX() || 0;
  const offsetY = window.canvasZoomControls?.getOffsetY() || 0;

  // Calculate scale factor (CSS transform is relative to display size, canvas is 800x800)
  // The preview container displays at ~300px, so we need to scale the offset
  const previewContainer = document.getElementById('$profilePreview');
  const containerSize = previewContainer?.getBoundingClientRect().width || 300;
  const scaleFactor = CANVAS_SIZE / containerSize;

  // Apply transform to match the visual preview
  downloadCtx.save();
  downloadCtx.translate(downloadCanvas.width / 2, downloadCanvas.height / 2);
  downloadCtx.translate(offsetX * scaleFactor, offsetY * scaleFactor);
  downloadCtx.scale(zoom, zoom);
  downloadCtx.translate(-downloadCanvas.width / 2, -downloadCanvas.height / 2);
  downloadCtx.drawImage(photoCanvas, 0, 0);
  downloadCtx.restore();

  // Draw frame without transform (stays static)
  downloadCtx.drawImage(frameCanvas, 0, 0);
  return downloadCanvas;
}

function updateSVG() {
  if (!state.svgContent) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(state.svgContent, 'image/svg+xml');

  if (!currentFrameConfig) {
    currentFrameConfig = parseSvgConfig(doc);

    const configDefaults = getDefaultsFromConfig(currentFrameConfig);
    Object.entries(configDefaults).forEach(([key, value]) => {
      if (state[key] === undefined || state[key] === defaultState[key]) {
        state[key] = value;
      }
    });

    const newProps = Array.from(currentFrameConfig.keys()).filter(
      (prop) => !renderPropsSet.has(prop)
    );
    if (newProps.length) {
      addStatePropListener(newProps, () => {
        updateAndDraw();
      });
      newProps.forEach((prop) => renderPropsSet.add(prop));
    }

    if (currentFrameConfig.size > 0) {
      generateUI(currentFrameConfig, state, $dynamicControlsContainer);
    }
  }

  applySvgConfig(doc, currentFrameConfig, state);

  // Serialize back to string
  const serializer = new XMLSerializer();
  const newSvgText = serializer.serializeToString(doc.documentElement);

  // Create Blob and Image
  const blob = new Blob([newSvgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    state.frameImage = img;
    draw();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function updateAndDraw() {
  if (presets[state.selectedFrameId]?.type === 'svg') {
    updateSVG();
  } else {
    draw();
  }
}

// Preset management
function applyPreset(id) {
  const preset = presets[id];
  if (!preset) return;

  currentFrameConfig = null;
  state.selectedFrameId = id;
  if (preset.type === 'svg') {
    // Load SVG
    fetch(preset.src)
      .then((response) => response.text())
      .then((svgText) => {
        state.svgContent = svgText;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        currentFrameConfig = parseSvgConfig(doc);

        const defaultsFromConfig = getDefaultsFromConfig(currentFrameConfig);
        Object.entries(defaultsFromConfig).forEach(([key, value]) => {
          state[key] = value;
        });

        if (preset.text) state.text = preset.text;
        if (preset.textColor) state.textColor = preset.textColor;
        if (preset.frameColor) state.frameColor = preset.frameColor;

        if (currentFrameConfig.size > 0) {
          generateUI(currentFrameConfig, state, $dynamicControlsContainer);

          const textStyleProps = [];
          for (const [name, prop] of currentFrameConfig) {
            if (prop.type === 'text') {
              textStyleProps.push(`${name}Styles`);
            }
          }

          if (textStyleProps.length > 0) {
            addStatePropListener(
              textStyleProps,
              (_propName, _value, _oldValue) => {
                updateAndDraw();
              }
            );
          }

          /////////////////////
          // mask refreshing
          updateMask($dynamicControlsContainer, 'vertical');
          /////////////////////
        } else {
          // todo(vmyshko): no settings? add stub
        }

        currentFrameConfig = null;
        updateSVG();
      });
  } else {
    // Load static image (PNG/JPG)
    state.svgContent = null;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      state.frameImage = img;
      draw();
    };
    img.src = preset.src;

    $dynamicControlsContainer.replaceChildren();

    const $controlsStub =
      $tmplControlsStub.content.firstElementChild.cloneNode(true);
    $dynamicControlsContainer.appendChild($controlsStub);
  }
}

// Gallery initialization
function initFrameGallery() {
  $frameGallery.replaceChildren();

  Object.keys(presets).forEach((key) => {
    const preset = presets[key];
    const $galleryItem =
      $tmplGalleryItem.content.firstElementChild.cloneNode(true);

    const $img = $galleryItem.querySelector('img');
    $img.src = preset.src;
    $img.alt = preset.text;

    $img.addEventListener('error', (error) => {
      console.warn(`Failed to load frame: ${key}`, error);
      $img.src = imageErrorPng;
      $img.alt = '404';
    });

    const $radio = $galleryItem.querySelector('input[type=radio]');
    $radio.value = key;
    $radio.checked = key === state.selectedFrameId;

    $galleryItem.dataset.frame = key;
    $frameGallery.appendChild($galleryItem);
  });
}

function initPhotoGallery() {
  $photoGallery.replaceChildren();

  photosList.forEach((photoId, index) => {
    const $galleryItem =
      $tmplGalleryItem.content.firstElementChild.cloneNode(true);

    const $img = $galleryItem.querySelector('img');
    $img.src = uploadedPhotos[photoId];

    $img.addEventListener('error', (error) => {
      console.warn(`Failed to load photo: ${photoId}`, error);
      $img.src = imageErrorPng;
      $img.alt = '404';
    });

    const $radio = $galleryItem.querySelector('input[type=radio]');
    $radio.value = photoId;

    if (index === 0) {
      $radio.checked = true;
    }

    $photoGallery.appendChild($galleryItem);
  });
}

// Preview overlay toggle
function togglePreviewOverlay() {
  // Don't toggle if user was panning the canvas
  if (window.canvasZoomControls?.didPan?.()) return;
  $profilePreview.classList.toggle('show-preview-overlay');
}

// Event handlers setup
function setupEventListeners() {
  // Preview overlay
  $profilePreview.addEventListener('click', togglePreviewOverlay);

  // Frame Gallery (Delegation)
  $frameGallery.addEventListener('change', ({ target }) => {
    if (target.type === 'radio') {
      applyPreset(target.value);
    }
  });

  // Photo Gallery (Delegation)
  $photoGallery.addEventListener('change', ({ target }) => {
    if (target.type === 'radio') {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        state.userImage = img;
      };

      const photoId = target.value;
      img.src = uploadedPhotos[photoId];
    }
  });

  // Image Upload
  $uploadPhotoBtn.addEventListener('click', () => {
    $fileInput.click();
  });

  $fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          state.userImage = img;

          // Generate short ID for uploaded photo
          const photoId = `uploaded-${Date.now()}`;
          const dataUrl = event.target.result;

          // Add to storage
          addUploadedPhoto(photoId, dataUrl);

          // Rebuild photo gallery
          initPhotoGallery();

          // Select the newly uploaded photo
          const firstRadio = $photoGallery.querySelector('input[type=radio]');
          if (firstRadio) {
            firstRadio.checked = true;
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Download
  $downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'frame-avatar.png';
    link.href = getDownloadCanvas().toDataURL('image/png');
    link.click();
  });
}

// Load default placeholder image
function loadDefaultImage() {
  const placeholderImg = new Image();
  placeholderImg.crossOrigin = 'Anonymous';

  const firstPhotoId = photosList.at(0);
  if (!firstPhotoId) return; // No photos available

  placeholderImg.src = uploadedPhotos[firstPhotoId];

  placeholderImg.onload = () => {
    if (!state.userImage) {
      state.userImage = placeholderImg;
    }
  };
}

// Initialize application
async function init() {
  // Load photos from localStorage
  loadPhotosFromStorage();

  initFrameGallery();
  initPhotoGallery();
  setupEventListeners();
  loadDefaultImage();

  // Apply default preset
  applyPreset(state.selectedFrameId);
}

// Start the application
init();
