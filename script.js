/**
 * Frame Maker Logic
 *
 * Refactored to use ES modules and reactive state management
 */

import { textColors, frameColors } from './colors.js';
import { presets, localPhotos } from './config.js';
import { createReactiveState } from './state.js';
import {
  parseSvgConfig,
  applySvgConfig,
  getDefaultsFromConfig,
} from './svg-config.js';
import { generateUI } from './ui-generator.js';

import './theme-switcher.js';
import './scroll-mask-feature.js';

/**
 * Default state configuration
 */
const defaultState = {
  text: '#Hiring',
  textColor: frameColors.at(0),
  frameColor: frameColors.at(0),
  textRotation: 0,
  frameRotation: 0,
  fontSize: 80,
  userImage: null, // Will hold the Image object
  frameImage: null, // Will hold the SVG Image object
  svgContent: null, // Raw SVG string for editing
  selectedFrameId: 'opentowork2', // 'hiring', 'opentowork', 'custom'
  fontFamily: 'Inter, sans-serif',
  textScale: 0.9, //0..1
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

const renderPropsSet = new Set(renderTriggerProperties);

// Properties that only need simple draw (no SVG update)
const drawOnlyProperties = ['userImage', 'frameImage'];

const [state, addStatePropListener] = createReactiveState(defaultState);

addStatePropListener(renderTriggerProperties, (propName, value, oldValue) => {
  // console.log('⚛️up+draw', propName, value, oldValue);
  updateAndDraw();
});
addStatePropListener(drawOnlyProperties, (propName, value, oldValue) => {
  // console.log('⚛️draw', propName, value, oldValue);
  draw();
});

// Canvas setup
const canvas = $previewCanvas;
const ctx = canvas.getContext('2d');
const CANVAS_SIZE = 800;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Drawing functions
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.userImage) {
    ctx.drawImage(state.userImage, 0, 0, canvas.width, canvas.height);
  }

  if (state.frameImage) {
    ctx.drawImage(state.frameImage, 0, 0, canvas.width, canvas.height);
  }
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

    const $radio = $galleryItem.querySelector('input[type=radio]');
    $radio.value = key;
    $radio.checked = key === state.selectedFrameId;

    $galleryItem.dataset.frame = key;
    $frameGallery.appendChild($galleryItem);
  });
}

function initPhotoGallery() {
  $photoGallery.replaceChildren();

  localPhotos.forEach((filename, index) => {
    const $galleryItem =
      $tmplGalleryItem.content.firstElementChild.cloneNode(true);

    const $img = $galleryItem.querySelector('img');
    $img.src = `./photos/${filename}`;

    const $radio = $galleryItem.querySelector('input[type=radio]');
    $radio.value = filename;

    if (index === 0) {
      $radio.checked = true;
    }

    $photoGallery.appendChild($galleryItem);
  });
}

// Preview overlay toggle
function togglePreviewOverlay() {
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
      img.src = target.closest('.gallery-item').querySelector('img').src;
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
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// Load default placeholder image
function loadDefaultImage() {
  const placeholderImg = new Image();
  placeholderImg.crossOrigin = 'Anonymous';
  placeholderImg.src = `./photos/${localPhotos.at(0)}`;

  placeholderImg.onload = () => {
    if (!state.userImage) {
      state.userImage = placeholderImg;
    }
  };
}

// Initialize application
function init() {
  initFrameGallery();
  initPhotoGallery();
  setupEventListeners();
  loadDefaultImage();

  // Apply default preset
  applyPreset('opentowork2');
}

// Start the application
init();
