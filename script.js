/**
 * Frame Maker Logic
 */

// todo(vmyshko): wtf is this? do not wrap whole app
document.addEventListener('DOMContentLoaded', () => {
  // todo(vmyshko): extract colors to separate file
  const textColors = ['black', '#ffffff', '#0a66c2'];
  const frameColors = [
    '#79389f',
    '#467031',
    '#FF7745',
    '#0a66c2',
    '#fff000',
    '#ff80ed',
    '#ffffff',
    '#7b5804',
    '#00ff00',
    '#ff0000',
    '#00ffff',
    'black',
    // not-gay
    `linear-gradient(89.7deg, 
    rgba(223,0,0,1) 2.7%, 
    rgba(214,91,0,1) 15.1%, 
    rgba(233,245,0,1) 29.5%, 
    rgba(23,255,17,1) 45.8%, 
    rgba(29,255,255,1) 61.5%, 
    rgba(5,17,255,1) 76.4%, 
    rgba(202,0,253,1) 92.4%)`,
  ];

  // todo(vmyshko): extract state as module
  // State
  const state = {
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

  function applyState() {
    // todo(vmyshko): think about it...
    $inputText.value = state.text;
    $inputFontSize.value = state.fontSize;

    $colorPaletteText.elements.radioName.value = state.textColor;
    $colorPaletteFrame.elements.radioName.value = state.frameColor;
  }

  // DOM Elements

  // todo(vmyshko): refac to use just ids starting with $
  const canvas = $previewCanvas;
  const ctx = canvas.getContext('2d');

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
    '1765933298027.jpeg',
    'photo_2025-12-16_23-24-09.jpg',
  ];

  // Load default placeholder image
  const placeholderImg = new Image();
  placeholderImg.crossOrigin = 'Anonymous';

  // Use the first photo from the gallery as default

  placeholderImg.src = `./photos/${localPhotos.at(0)}`;

  placeholderImg.onload = () => {
    if (!state.userImage) {
      state.userImage = placeholderImg;
      draw();
    }
  };

  // todo(vmyshko): extract as a plugin (not sure)
  function togglePreviewOverlay() {
    $profilePreview.classList.toggle('show-preview-overlay');
  }
  $profilePreview.addEventListener('click', togglePreviewOverlay);

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
      src: 'frames-svg/zhiring.svg',
      // Keep these for fallback or if user switches to custom
      text: '#Hiring',
      textColor: '#ffffff',
      frameColor: '#79389f',
      frameStyle: 'gradient',
      fontSize: 74,
    },
    opentowork: {
      type: 'svg',
      src: 'frames-svg/zopen-to.svg',
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

    // todo(vmyshko): make generic approach - set all preset data to state
    state.selectedFrameId = id;
    state.text = preset.text;
    state.textColor = preset.textColor;
    state.frameColor = preset.frameColor;

    // Load SVG
    fetch(preset.src)
      .then((response) => response.text())
      .then((svgText) => {
        state.svgContent = svgText; // Store raw SVG
        updateSVG(); // Parse and update SVG based on state
      });

    // todo(vmyshko): get/parse svg vars/props somewhere here
    // to make dynamic editor elements and wire things up

    // Update UI Controls
    $inputText.value = state.text;

    // Enable text input for SVG frames now that they are editable
    $inputText.disabled = false;

    draw();
  }

  function updateSVG() {
    if (!state.svgContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(state.svgContent, 'image/svg+xml');

    // Inject Font Styles
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

    // todo(vmyshko): also should be getting by custom prop mark from svg
    // Update Text
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
        // Do nothing to fill
      } else {
        pathEl.setAttribute('fill', state.frameColor);
      }
    }

    // todo(vmyshko): this is some custom shit, i need to investigate...
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

    // 1. Draw User Image
    if (state.userImage) {
      ctx.drawImage(state.userImage, 0, 0, canvas.width, canvas.height);
    }

    // 2. Draw Frame (SVG only)
    if (state.frameImage) {
      ctx.drawImage(state.frameImage, 0, 0, canvas.width, canvas.height);
    }
  }

  // todo(vmyshko): refac this draw and updateSvg approaches.
  function updateAndDraw() {
    if (presets[state.selectedFrameId].type === 'svg') {
      updateSVG();
    } else {
      draw();
    }
  }

  // --- Event Listeners ---

  function initFrameGallery() {
    $frameGallery.replaceChildren();

    const frameIds = Object.keys(presets);

    frameIds.forEach((key) => {
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

  // --- Photo Gallery ---
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

  // Initial Render
  initFrameGallery();
  initPhotoGallery();

  // Text Input
  $inputText.addEventListener('input', (e) => {
    state.text = e.target.value;
    // todo(vmyshko): i dont like this repeated updateAndDraw() on each handler,
    // it should be called automatically for any compoent (related to svg state props) was changed
    updateAndDraw();
  });

  // Sliders
  $inputFontSize.addEventListener('input', (e) => {
    state.fontSize = parseInt(e.target.value);
    updateAndDraw();
  });

  $inputTextRotation.addEventListener('input', (e) => {
    state.textRotation = parseInt(e.target.value);
    updateAndDraw();
  });

  $inputFrameRotation.addEventListener('input', (e) => {
    state.frameRotation = parseInt(e.target.value);

    updateAndDraw();
  });

  // Font Family
  $selectFontFamily.addEventListener('change', (e) => {
    state.fontFamily = e.target.value;
    updateAndDraw();
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
      const _img = new Image();
      _img.crossOrigin = 'Anonymous';
      _img.onload = () => {
        state.userImage = _img;
        draw();
      };
      _img.src = target.closest('.gallery-item').querySelector('img').src;
    }
  });

  // Color Pickers

  function initColorPalette($colorPalette, colors, name) {
    $colorPalette.replaceChildren();

    colors.forEach((color) => {
      const $colorSwatch =
        $tmplColorSwatch.content.firstElementChild.cloneNode(true);

      $colorSwatch.value = color;
      $colorSwatch.style.setProperty('--color', color);

      $colorPalette.appendChild($colorSwatch);
    });
  }

  initColorPalette($colorPaletteText, textColors, 'text-colors');
  initColorPalette($colorPaletteFrame, frameColors, 'frame-colors');

  //(Delegation)
  $colorPaletteText.addEventListener('change', ({ target }) => {
    state.textColor = target.value;

    updateAndDraw();
  });

  $colorPaletteFrame.addEventListener('change', ({ target }) => {
    state.frameColor = target.value;

    updateAndDraw();
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
          draw();
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

  // Initial Draw
  applyPreset('opentowork2'); // Default
  applyState();

  // Text Scale
  $inputTextScale.addEventListener('input', (e) => {
    state.textScale = parseFloat(e.target.value);

    updateAndDraw();
  });
});
