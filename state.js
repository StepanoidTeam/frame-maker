/**
 * Reactive State Management for Frame Maker
 *
 * Creates a reactive state object that automatically triggers
 * callbacks when properties are changed.
 */

/**
 * Creates a reactive state with automatic change detection
 * @param {Object} initialState - Initial state values
 * @param {Function} onChange - Callback triggered on any state change
 * @returns {Proxy} - Reactive state proxy
 */
export function createReactiveState(initialState, onChange) {
  const handlers = {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;

      // Only trigger onChange if value actually changed
      if (oldValue !== value && onChange) {
        onChange(property, value, oldValue);
      }

      return true;
    },
    get(target, property) {
      return target[property];
    },
  };

  return new Proxy({ ...initialState }, handlers);
}
