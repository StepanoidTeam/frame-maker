/**
 * Dynamic UI Generator from SVG Config
 */

import { textColors, frameColors } from './colors.js';

const colorPalettes = {
  frame: frameColors,
  text: textColors,
};

/**
 * Generate UI controls from SVG config.
 * @param {Map<string, import('./svg-config.js').SvgProperty>} config
 * @param {Object} state - Reactive state object
 * @param {HTMLElement} container - Container element for controls
 */
export function generateUI(config, state, container) {
  container.innerHTML = '';

  for (const [, prop] of config) {
    const controlGroup = createControlGroup(prop, state);
    if (controlGroup) {
      container.appendChild(controlGroup);
    }
  }
}

function createControlGroup(prop, state) {
  const group = document.createElement('div');
  group.className = 'control-group';
  group.dataset.property = prop.name;

  const label = document.createElement('label');
  label.textContent = prop.label;
  label.htmlFor = `control-${prop.name}`;
  group.appendChild(label);

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

  if (control) {
    group.appendChild(control);
  }

  return group;
}

function createTextInput(prop, state) {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = `control-${prop.name}`;
  input.className = 'text-input';
  input.value = state[prop.name] ?? prop.default;
  input.placeholder = prop.label;

  input.addEventListener('input', (e) => {
    state[prop.name] = e.target.value;
  });

  return input;
}

function createColorPalette(prop, state) {
  const wrapper = document.createElement('div');
  wrapper.className = 'color-palette-wrapper';

  const palette = document.createElement('form');
  palette.className = 'color-palette';
  palette.id = `control-${prop.name}`;

  const colors = (prop.palette && colorPalettes[prop.palette]) || frameColors;

  colors.forEach((color, index) => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `color-${prop.name}`;
    radio.value = color;
    radio.id = `${prop.name}-color-${index}`;
    radio.className = 'color-swatch';
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
  const wrapper = document.createElement('div');
  wrapper.className = 'range-wrapper';

  const input = document.createElement('input');
  input.type = 'range';
  input.id = `control-${prop.name}`;
  input.className = 'range-slider';
  input.min = prop.min;
  input.max = prop.max;
  input.step = prop.step;
  input.value = state[prop.name] ?? prop.default;

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'range-value';
  valueDisplay.textContent = `${input.value}${prop.unit}`;

  input.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    state[prop.name] = value;
    valueDisplay.textContent = `${value}${prop.unit}`;
  });

  wrapper.appendChild(input);
  wrapper.appendChild(valueDisplay);

  return wrapper;
}

function createSelect(prop, state) {
  const select = document.createElement('select');
  select.id = `control-${prop.name}`;
  select.className = 'select-input';

  const options = prop.options || [prop.default];

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

  return select;
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
