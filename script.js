/**
 * Frame Maker Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    text: '#Hiring',
    textColor: '#ffffff',
    frameColor: '#79389f',
    frameStyle: 'solid', // 'solid', 'gradient', 'pattern'
    fontSize: 14,
    rotation: 0,
    thickness: 20,
    userImage: null, // Will hold the Image object
    userImage: null, // Will hold the Image object
    frameImage: null, // Will hold the SVG Image object
    svgContent: null, // Raw SVG string for editing
    selectedFrameId: 'opentowork2', // 'hiring', 'opentowork', 'custom'
    fontFamily: 'Inter, sans-serif',
  };

  // DOM Elements
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const textInput = document.getElementById('frame-text-input');
  const fontSizeInput = document.getElementById('font-size-input');
  const rotationInput = document.getElementById('rotation-input');
  const thicknessInput = document.getElementById('thickness-input');
  const uploadBtn = document.getElementById('upload-photo-btn');
  const fileInput = document.getElementById('file-input');
  const downloadBtn = document.getElementById('download-btn');
  const styleRadios = document.getElementsByName('frame-style');
  const fontFamilySelect = document.getElementById('font-family-select');

  // Initialize Canvas Resolution
  const CANVAS_SIZE = 800;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // --- Photo Gallery Data ---
  const localPhotos = [
    '1688381504089.jpeg',
    '1699455018471.jpeg',
    '1744056970861.jpeg',
    '1752057077706.jpeg',
  ];

  // Load default placeholder image
  const placeholderImg = new Image();
  placeholderImg.crossOrigin = 'Anonymous';

  // Use the first photo from the gallery as default
  if (localPhotos.length > 0) {
    placeholderImg.src = `./photos/${localPhotos[0]}`;
  } else {
    // Fallback if no photos
    placeholderImg.src = './photos/1688381504089.jpeg';
  }

  placeholderImg.onload = () => {
    if (!state.userImage) {
      state.userImage = placeholderImg;
      draw();
    }
  };

  // --- Presets ---
  // todo(vmyshko): extract to config file
  const presets = {
    opentowork2: {
      type: 'svg',
      src: 'frames-svg/open-to-work-800.svg',
      text: '#OPENTOWORK',
      textColor: '#ffffff',
      frameColor: '#467031',
      frameStyle: 'solid',
      fontSize: 74,
    },
    hiring: {
      type: 'svg',
      src: 'frames-svg/hiring.svg',
      // Keep these for fallback or if user switches to custom
      text: '#Hiring',
      textColor: '#ffffff',
      frameColor: '#79389f',
      frameStyle: 'gradient',
      fontSize: 74,
    },
    opentowork: {
      type: 'svg',
      src: 'frames-svg/open-to-work.svg',
      text: '#OPENTOWORK',
      textColor: '#000000',
      frameColor: '#467031',
      frameStyle: 'solid',
      fontSize: 74,
    },
  };

  function applyPreset(id) {
    const preset = presets[id];
    if (!preset) return;

    state.selectedFrameId = id;
    state.text = preset.text;
    state.textColor = preset.textColor;
    state.frameColor = preset.frameColor;
    state.frameStyle = preset.frameStyle;

    // Load SVG
    fetch(preset.src)
      .then((response) => response.text())
      .then((svgText) => {
        state.svgContent = svgText; // Store raw SVG
        updateSVG(); // Parse and update SVG based on state
      });

    // Update UI Controls
    textInput.value = state.text;

    // Update Color Swatches UI
    document
      .querySelectorAll('.color-swatch[data-type="frame"]')
      .forEach((s) => {
        if (s.dataset.color === state.frameColor) s.classList.add('active');
        else s.classList.remove('active');
      });
    document
      .querySelectorAll('.color-swatch[data-type="text"]')
      .forEach((s) => {
        if (s.dataset.color === state.textColor) s.classList.add('active');
        else s.classList.remove('active');
      });

    // Update Radio Buttons
    styleRadios.forEach((radio) => {
      radio.checked = radio.value === state.frameStyle;
    });

    // Enable text input for SVG frames now that they are editable
    textInput.disabled = false;

    draw();
  }

  function updateSVG() {
    if (!state.svgContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(state.svgContent, 'image/svg+xml');

    // Inject Font Styles
    const styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&display=swap');
            text { font-family: ${state.fontFamily}; }
            :root{
                --color: ${state.frameColor};
                --font-size: ${state.fontSize};
                --text-color: ${state.textColor};
                --font-family: ${state.fontFamily};
            }
        `;
    doc.documentElement.prepend(styleEl);

    // Update Text
    const textEl = doc.getElementById('frame-text');
    if (textEl) {
      textEl.textContent = state.text;
    }

    // Update Frame Color
    const pathEl = doc.getElementById('frame-path');
    if (pathEl) {
      // If user selected a specific color (not gradient default), override fill
      // We check if the current color matches the preset default.
      // If it's different, we apply the solid color.
      // Or simpler: always apply solid color if it's not the default gradient ID?
      // For now, let's just apply the color. If it was a gradient, this will overwrite it with solid color.
      // To keep gradient, we'd need more complex logic.
      // Let's assume if user picks a color, they want that solid color.
      // But we need to know if we should keep the default gradient.

      // Hack: Check if the current state color matches the preset's default color.
      // If it matches AND the preset uses a gradient, we might want to keep the gradient.
      // However, the SVG has `fill="url(#hiringGradient)"`.
      // If we set `fill` attribute, it overrides.

      // Let's just set the fill. If the user wants the original gradient, they might need to "reset".
      // But wait, the "Hiring" preset default color is #79389f.
      // If state.frameColor is #79389f, we might want to NOT touch the fill if it's supposed to be a gradient.

      const preset = presets[state.selectedFrameId];
      if (
        preset &&
        preset.frameStyle === 'gradient' &&
        state.frameColor === preset.frameColor
      ) {
        // Keep original fill (likely url(#gradient))
        // Do nothing to fill
      } else {
        pathEl.setAttribute('fill', state.frameColor);
      }
    }

    // Update Background Pill Width
    const bgEl = doc.getElementById('text-bg');
    if (bgEl && textEl) {
      // Approximate text width. SVG doesn't have layout engine in DOMParser.
      // We can guess based on char count and font size.
      // Font size in SVG is 8 or 7.
      const fontSize = parseFloat(textEl.getAttribute('font-size'));
      const charWidth = fontSize * 0.6;
      const textWidth = state.text.length * charWidth;
      const padding = 10;
      const newWidth = textWidth + padding;

      bgEl.setAttribute('width', newWidth);
      // Center it: cx is 30. x = 30 - width/2
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
      URL.revokeObjectURL(url); // Clean up
    };
    img.src = url;
  }

  // --- Drawing Logic ---
  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw User Image (Circular Mask)
    if (state.userImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(state.userImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // 2. Draw Frame (SVG only)
    if (state.frameImage) {
      ctx.drawImage(state.frameImage, 0, 0, canvas.width, canvas.height);
    }
  }

  // Helper to lighten/darken color
  function adjustColor(color, amount) {
    return (
      '#' +
      color
        .replace(/^#/, '')
        .replace(/../g, (color) =>
          (
            '0' +
            Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(
              16
            )
          ).substr(-2)
        )
    );
  }

  // --- Event Listeners ---

  // --- Gallery Rendering ---
  function renderGallery() {
    const galleryList = document.querySelector('.gallery-list');
    galleryList.innerHTML = ''; // Clear existing content

    Object.keys(presets).forEach((key) => {
      const preset = presets[key];
      const item = document.createElement('div');
      item.className = `gallery-item ${
        key === state.selectedFrameId ? 'active' : ''
      }`;
      item.dataset.frame = key;

      const iconContent = `<img src="${preset.src}" alt="${preset.text}">`;

      // Use preset text or fallback to capitalized key for display
      const displayText =
        preset.text || key.charAt(0).toUpperCase() + key.slice(1);

      item.innerHTML = `
                <div class="profile-circle">
                    ${iconContent}
                </div>
                <span class="gallery-item-text">${displayText}</span>
            `;

      item.addEventListener('click', () => {
        // UI Update
        document
          .querySelectorAll('.gallery-item')
          .forEach((i) => i.classList.remove('active'));
        item.classList.add('active');

        // Logic Update
        applyPreset(key);
      });

      galleryList.appendChild(item);
    });
  }

  // --- Photo Gallery ---
  function renderPhotoGallery() {
    const photoGallery = document.getElementById('photo-gallery');
    if (!photoGallery) return;

    photoGallery.innerHTML = '';

    localPhotos.forEach((filename, index) => {
      const imgPath = `./photos/${filename}`;
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumbnail';
      if (index === 0) {
        thumb.classList.add('active');
      }
      thumb.innerHTML = `<img src="${imgPath}" alt="Photo">`;

      thumb.addEventListener('click', () => {
        // Update active state
        document
          .querySelectorAll('.photo-thumbnail')
          .forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');

        // Load image
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          state.userImage = img;
          draw();
        };
        img.src = imgPath;
      });

      photoGallery.appendChild(thumb);
    });
  }

  // Initial Render
  renderGallery();
  renderPhotoGallery();

  // Text Input
  textInput.addEventListener('input', (e) => {
    state.text = e.target.value;
    draw();
    updateSVG();
  });

  // Sliders
  fontSizeInput.addEventListener('input', (e) => {
    state.fontSize = parseInt(e.target.value);
    draw();
    updateSVG();
  });

  rotationInput.addEventListener('input', (e) => {
    state.rotation = parseInt(e.target.value);
    draw();
  });

  thicknessInput.addEventListener('input', (e) => {
    state.thickness = parseInt(e.target.value);
    draw();
  });

  // Font Family
  fontFamilySelect.addEventListener('change', (e) => {
    state.fontFamily = e.target.value;
    if (presets[state.selectedFrameId].type === 'svg') {
      updateSVG();
    } else {
      draw();
    }
  });

  // Radio Buttons
  styleRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.frameStyle = e.target.value;
        draw();
      }
    });
  });

  // Color Pickers (Delegation)
  document
    .querySelectorAll('.color-swatch[data-type="text"]')
    .forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        state.textColor = e.target.dataset.color;
        // Update active state UI
        document
          .querySelectorAll('.color-swatch[data-type="text"]')
          .forEach((s) => s.classList.remove('active'));
        e.target.classList.add('active');

        if (presets[state.selectedFrameId].type === 'svg') {
          updateSVG();
        } else {
          draw();
        }
      });
    });

  document
    .querySelectorAll('.color-swatch[data-type="frame"]')
    .forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        state.frameColor = e.target.dataset.color;
        // Update active state UI
        document
          .querySelectorAll('.color-swatch[data-type="frame"]')
          .forEach((s) => s.classList.remove('active'));
        e.target.classList.add('active');

        if (presets[state.selectedFrameId].type === 'svg') {
          updateSVG();
        } else {
          draw();
        }
      });
    });

  // Image Upload
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          state.userImage = img;
          draw();
          // Clear gallery selection
          document
            .querySelectorAll('.photo-thumbnail')
            .forEach((t) => t.classList.remove('active'));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'frame-avatar.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Initial Draw
  applyPreset('opentowork2'); // Default
});
