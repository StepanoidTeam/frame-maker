/**
 * SVG Config Parser and Applier
 *
 * Parses <config> element from SVG and applies state values.
 */

/**
 * @typedef {Object} SvgProperty
 * @property {string} name - Property identifier (maps to state key)
 * @property {'color'|'text'|'range'|'select'} type - Input control type
 * @property {string} target - CSS variable (--var) or selector (#id, .class)
 * @property {string|null} [attr] - Attribute to modify (textContent, fill, etc.)
 * @property {string} default - Default value
 * @property {string} label - UI label
 * @property {number} [min] - For range: minimum value
 * @property {number} [max] - For range: maximum value
 * @property {number} [step] - For range: step value
 * @property {string} [unit] - Unit suffix (deg, px, %, etc.)
 * @property {string[]} [options] - For select: available options
 */

/**
 * Parse <config> element from SVG document.
 * @param {Document} svgDoc - Parsed SVG document
 * @returns {Map<string, SvgProperty>} Map of property name to config
 */
export function parseSvgConfig(svgDoc) {
  const config = new Map();

  const configEl = svgDoc.querySelector('config');

  if (!configEl) {
    console.warn('No <config> element found in SVG');
    return config;
  }

  const properties = configEl.querySelectorAll('property');

  for (const prop of properties) {
    const name = prop.getAttribute('name');
    if (!name) continue;

    const type = prop.getAttribute('type') || 'text';
    const optionsStr = prop.getAttribute('options');

    /** @type {SvgProperty} */
    const property = {
      name,
      type,
      target: prop.getAttribute('target') || '',
      attr: prop.getAttribute('attr') || null,
      default: prop.getAttribute('default') || '',
      label: prop.getAttribute('label') || name,
      unit: prop.getAttribute('unit') || '',
    };

    if (type === 'range') {
      property.min = parseFloat(prop.getAttribute('min')) || 0;
      property.max = parseFloat(prop.getAttribute('max')) || 100;
      property.step = parseFloat(prop.getAttribute('step')) || 1;
    }

    if (type === 'select' && optionsStr) {
      property.options = optionsStr.split('|').map((s) => s.trim());
    }

    config.set(name, property);
  }

  return config;
}

/**
 * Extract default state values from config.
 * @param {Map<string, SvgProperty>} config
 * @returns {Object} Default state object
 */
export function getDefaultsFromConfig(config) {
  const defaults = {};

  for (const [name, prop] of config) {
    if (prop.type === 'range') {
      defaults[name] = parseFloat(prop.default);
    } else {
      defaults[name] = prop.default;
    }
  }

  return defaults;
}

/**
 * Apply current state to SVG document based on config.
 * @param {Document} svgDoc - Parsed SVG document
 * @param {Map<string, SvgProperty>} config - Parsed config
 * @param {Object} state - Current state values
 */
import { FONT_IMPORTS } from './fonts.js';

export function applySvgConfig(svgDoc, config, state) {
  const cssVars = [];

  for (const [name, prop] of config) {
    const value = state[name] ?? prop.default;
    const valueWithUnit = prop.unit ? `${value}${prop.unit}` : value;

    if (prop.target.startsWith('--')) {
      cssVars.push(`${prop.target}: ${valueWithUnit};`);
    } else if (prop.target.startsWith('#') || prop.target.startsWith('.')) {
      const el = svgDoc.querySelector(prop.target);
      if (!el) {
        console.warn(`Element not found: ${prop.target}`);
        continue;
      }

      if (prop.attr === 'textContent') {
        el.textContent = value;

        const stylesPropName = `${name}Styles`;
        const textStyles = state[stylesPropName];
        if (textStyles && prop.type === 'text') {
          // Uppercase
          if (textStyles.uppercase) {
            el.textContent = el.textContent.toUpperCase();
          }
          // Font weight (bold)
          if (textStyles.bold) {
            el.style.fontWeight = 'bold';
          } else {
            el.style.fontWeight = 'normal';
          }
          // Font style (italic)
          if (textStyles.italic) {
            el.style.fontStyle = 'italic';
          } else {
            el.style.fontStyle = 'normal';
          }
        }
      } else if (prop.attr) {
        el.setAttribute(prop.attr, valueWithUnit);
      }
    }
  }

  if (cssVars.length > 0) {
    let styleEl = svgDoc.querySelector('style[data-fm-config]');

    if (!styleEl) {
      styleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.setAttribute('data-fm-config', '');
      svgDoc.documentElement.prepend(styleEl);
    }

    // Import only the selected font family (first token before comma)
    const selectedFamily = (
      state.fontFamily ||
      config.get('fontFamily')?.default ||
      ''
    )
      .split(',')[0]
      .trim();
    const importUrl = FONT_IMPORTS[selectedFamily];

    styleEl.textContent = `
      /* Fonts: import only selected family */
      ${importUrl ? `@import url('${importUrl}');` : ''}
      :root {
        ${cssVars.join('\n        ')}
      }
    `;
  }

  const configEl = svgDoc.querySelector('config');
  configEl?.remove();
}

/**
 * Get property by target (reverse lookup helper).
 * @param {Map<string, SvgProperty>} config
 * @param {string} target
 * @returns {SvgProperty|undefined}
 */
export function getPropertyByTarget(config, target) {
  for (const prop of config.values()) {
    if (prop.target === target) return prop;
  }
  return undefined;
}
