/**
 * Frame Maker Logic
 *
 * Refactored to use ES modules and reactive state management
 */

import { textColors, frameColors } from './colors.js';
import { presets, localPhotos } from './config.js';
import { createReactiveState } from './state.js';

/**
 * Default state configuration
 */
const defaultState = {
  text: '#Hiring',
  textColor: frameColors.at(0),
  frameColor: frameColors.at(0),
  textRotation: 0,
  frameRotation: 0,
  frameStyle: 'solid', // 'solid', 'gradient', 'pattern'
  fontSize: 80,
  userImage: null, // Will hold the Image object
  frameImage: null, // Will hold the SVG Image object
  svgContent: null, // Raw SVG string for editing
  selectedFrameId: 'opentowork2', // 'hiring', 'opentowork', 'custom'
  fontFamily: 'Inter, sans-serif',
  textScale: 0.9, //0..1
};

// Reactive state - automatically calls updateAndDraw on changes
// Properties that should trigger redraw
const renderTriggerProperties = [
  'text',
  'textColor',
  'frameColor',
  'textRotation',
  'frameRotation',
  'frameStyle',
  'fontSize',
  'fontFamily',
  'textScale',
];

// Properties that only need simple draw (no SVG update)
const drawOnlyProperties = ['userImage', 'frameImage'];

const [state, addStatePropListener] = createReactiveState(defaultState);

addStatePropListener(renderTriggerProperties, (propName, value, oldValue) => {
  console.log('⚛️up+draw', propName, value, oldValue);
  updateAndDraw();
});
addStatePropListener(drawOnlyProperties, (propName, value, oldValue) => {
  console.log('⚛️draw', propName, value, oldValue);
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

  // Inject Font Styles with CSS custom properties
  const styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
  // todo(vmyshko): vars/props should apply dynamically based on prev parsed state?
  // todo(vmyshko): font-family should be set dynamically here.
  // we should have config with font names and links, it should be wired to font select dropdown
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&display=swap');
    text { font-family: ${state.fontFamily}; }
    :root{
      --color: ${state.frameColor};
      --font-size: ${state.fontSize};
      --text-color: ${state.textColor};
      --font-family: ${state.fontFamily};
      --text-rotation: ${state.textRotation}deg;
      --frame-rotation: ${state.frameRotation}deg;
      --text-scale: ${state.textScale};
    }
  `;
  doc.documentElement.prepend(styleEl);

  // Update Text element
  const textEl = doc.getElementById('frame-text');
  if (textEl) {
    textEl.textContent = state.text;
  }

  // Update Frame Color and Rotation
  const pathEl = doc.getElementById('frame-path');
  if (pathEl) {
    const preset = presets[state.selectedFrameId];
    if (
      preset &&
      preset.frameStyle === 'gradient' &&
      state.frameColor === preset.frameColor
    ) {
      // Keep original fill (likely url(#gradient))
    } else {
      pathEl.setAttribute('fill', state.frameColor);
    }
  }

  // Update Background Pill Width for text
  const bgEl = doc.getElementById('text-bg');
  if (bgEl && textEl) {
    const fontSize = parseFloat(textEl.getAttribute('font-size'));
    const charWidth = fontSize * 0.6;
    const textWidth = state.text.length * charWidth;
    const padding = 10;
    const newWidth = textWidth + padding;

    bgEl.setAttribute('width', newWidth);
    bgEl.setAttribute('x', 30 - newWidth / 2);
  }

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

// Sync UI with state
function applyStateToUI() {
  $inputText.value = state.text;
  $inputFontSize.value = state.fontSize;
  $colorPaletteText.elements.radioName.value = state.textColor;
  $colorPaletteFrame.elements.radioName.value = state.frameColor;
}

// Preset management
function applyPreset(id) {
  const preset = presets[id];
  if (!preset) return;

  // Batch state updates without triggering multiple renders
  const oldSvgContent = state.svgContent;

  state.selectedFrameId = id;
  state.text = preset.text;
  state.textColor = preset.textColor;
  state.frameColor = preset.frameColor;

  // Load SVG
  fetch(preset.src)
    .then((response) => response.text())
    .then((svgText) => {
      state.svgContent = svgText;
      updateSVG();
    });

  // Update UI
  $inputText.value = state.text;
  $inputText.disabled = false;

  draw();
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

function initColorPalette($colorPalette, colors) {
  $colorPalette.replaceChildren();

  colors.forEach((color) => {
    const $colorSwatch =
      $tmplColorSwatch.content.firstElementChild.cloneNode(true);
    $colorSwatch.value = color;
    $colorSwatch.style.setProperty('--color', color);
    $colorPalette.appendChild($colorSwatch);
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

  // Text Input - state change triggers automatic redraw
  $inputText.addEventListener('input', (e) => {
    state.text = e.target.value;
  });

  // Sliders - state changes trigger automatic redraw
  $inputFontSize.addEventListener('input', (e) => {
    state.fontSize = parseInt(e.target.value);
  });

  $inputTextRotation.addEventListener('input', (e) => {
    state.textRotation = parseInt(e.target.value);
  });

  $inputFrameRotation.addEventListener('input', (e) => {
    state.frameRotation = parseInt(e.target.value);
  });

  $inputTextScale.addEventListener('input', (e) => {
    state.textScale = parseFloat(e.target.value);
  });

  // Font Family
  $selectFontFamily.addEventListener('change', (e) => {
    state.fontFamily = e.target.value;
  });

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

  // Color Pickers (Delegation)
  $colorPaletteText.addEventListener('change', ({ target }) => {
    state.textColor = target.value;
  });

  $colorPaletteFrame.addEventListener('change', ({ target }) => {
    state.frameColor = target.value;
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
  initColorPalette($colorPaletteText, textColors);
  initColorPalette($colorPaletteFrame, frameColors);
  setupEventListeners();
  loadDefaultImage();

  // Apply default preset
  applyPreset('opentowork2');
  applyStateToUI();
}

// Start the application
init();
