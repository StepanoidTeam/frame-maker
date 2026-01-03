/**
 * Dynamic UI Generator from SVG Config
 */

import { textColors, frameColors } from './colors.js';
import { FONT_FAMILIES } from './fonts.js';

const colorPalettes = {
  frame: frameColors,
  text: textColors,
};

const templates = {
  text: '$tmplControlText',
  color: '$tmplControlColor',
  range: '$tmplControlRange',
  select: '$tmplControlSelect',
  swatch: '$tmplColorSwatch',
};

function cloneTemplate(id) {
  const tmpl = document.getElementById(id);
  if (!tmpl) return null;
  const node = tmpl.content.firstElementChild.cloneNode(true);
  return node;
}

/**
 * Generate UI controls from SVG config.
 * @param {Map<string, import('./svg-config.js').SvgProperty>} config
 * @param {Object} state - Reactive state object
 * @param {HTMLElement} container - Container element for controls
 */
export function generateUI(config, state, container) {
  container.replaceChildren();

  for (const [, prop] of config) {
    const controlGroup = createControlGroup(prop, state);
    if (controlGroup) {
      container.appendChild(controlGroup);
    }
  }
}

function createControlGroup(prop, state) {
  let control;

  switch (prop.type) {
    case 'text':
      control = createTextInput(prop, state);
      break;
    case 'color':
      control = createColorPalette(prop, state);
      break;
    case 'range':
      control = createRangeSlider(prop, state);
      break;
    case 'select':
      control = createSelect(prop, state);
      break;
    default:
      console.warn(`Unknown property type: ${prop.type}`);
      return null;
  }

  const labelSpan = control.querySelector('label>span');

  if (labelSpan) {
    labelSpan.textContent = prop.label;
  }

  control.dataset.property = prop.name;

  return control;
}

function createTextInput(prop, state) {
  const textControl = cloneTemplate(templates.text);
  if (!textControl) return null;

  const input = textControl.querySelector('input');

  input.id = `$control_${prop.name}`;
  input.value = state[prop.name] ?? prop.default;
  input.placeholder = prop.label;

  input.addEventListener('input', (e) => {
    state[prop.name] = e.target.value;
  });

  return textControl;
}

function createColorPalette(prop, state) {
  const wrapper = cloneTemplate(templates.color);
  if (!wrapper) return null;

  const palette = wrapper.querySelector('form.color-palette');
  if (!palette) return null;
  palette.id = `$control_${prop.name}`;

  const colors = (prop.palette && colorPalettes[prop.palette]) || frameColors;

  colors.forEach((color, index) => {
    const radio = cloneTemplate(templates.swatch);
    if (!radio) return;
    radio.value = color;
    radio.checked = color === (state[prop.name] ?? prop.default);
    radio.style.setProperty('--color', color);

    radio.addEventListener('change', () => {
      state[prop.name] = color;
    });

    palette.appendChild(radio);
  });

  wrapper.appendChild(palette);
  return wrapper;
}

function createRangeSlider(prop, state) {
  const wrapper = cloneTemplate(templates.range);
  if (!wrapper) return null;

  const input = wrapper.querySelector('input.range-slider');
  const valueDisplay = wrapper.querySelector('.range-value');
  if (!input || !valueDisplay) return null;

  const getWidthPt = (value) =>
    ((value - prop.min) / (prop.max - prop.min)) * 100;

  input.id = `control-${prop.name}`;
  input.min = prop.min;
  input.max = prop.max;
  input.step = prop.step;
  // todo(vmyshko): refac some duplicated code here
  input.value = state[prop.name] ?? prop.default;
  input.setAttribute('data-width', getWidthPt(input.value));
  valueDisplay.textContent = `${input.value}${prop.unit}`;

  input.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    state[prop.name] = value;
    input.setAttribute('data-width', getWidthPt(value));
    valueDisplay.textContent = `${value}${prop.unit}`;
  });

  return wrapper;
}

function createSelect(prop, state) {
  const dropDown = cloneTemplate(templates.select);
  if (!dropDown) return null;
  dropDown.id = `control-${prop.name}`;

  const options =
    prop.name === 'fontFamily' ? FONT_FAMILIES : prop.options || [prop.default];

  const select = dropDown.querySelector('select');
  options.forEach((optionValue) => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue.split(',')[0];
    option.selected = optionValue === (state[prop.name] ?? prop.default);
    select.appendChild(option);
  });

  select.addEventListener('change', (e) => {
    state[prop.name] = e.target.value;
  });

  return dropDown;
}

/**
 * Update UI controls to reflect current state.
 * @param {Map<string, import('./svg-config.js').SvgProperty>} config
 * @param {Object} state
 */
export function syncUIWithState(config, state) {
  for (const [, prop] of config) {
    const value = state[prop.name] ?? prop.default;
    const controlId = `control-${prop.name}`;

    switch (prop.type) {
      case 'text': {
        const input = document.getElementById(controlId);
        if (input) input.value = value;
        break;
      }
      case 'range': {
        const input = document.getElementById(controlId);
        if (input) {
          input.value = value;
          const valueDisplay = input.nextElementSibling;
          if (valueDisplay) {
            valueDisplay.textContent = `${value}${prop.unit}`;
          }
        }
        break;
      }
      case 'select': {
        const select = document.getElementById(controlId);
        if (select) select.value = value;
        break;
      }
      case 'color': {
        const palette = document.getElementById(controlId);
        if (palette) {
          const radio = palette.querySelector(`input[value="${value}"]`);
          if (radio) radio.checked = true;
        }
        break;
      }
      default:
        break;
    }
  }
}
