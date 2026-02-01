/**
 * Reactive State Management for Frame Maker
 *
 * Creates a reactive state object that automatically triggers
 * callbacks when properties are changed.
 */

/**
 * Creates a reactive state with automatic change detection
 * @param {Object} initialState - Initial state values
 * @returns {[Proxy, addStatePropListener]} - Reactive state proxy and listener add fn
 */
export function createReactiveState(initialState) {
  const stateListeners = new Map();

  /**
   *
   * @param {string[]} statePropNames - prop names to trigger on
   * @param {Function} handler - Callback triggered on specific state props change
   */
  function addStatePropListener(statePropNames, handler) {
    for (let propName of statePropNames) {
      if (!stateListeners.has(propName)) {
        stateListeners.set(propName, []);
      }
      stateListeners.get(propName).push(handler);
    }
  }

  const proxyHandlers = {
    set(target, propName, value) {
      const oldValue = target[propName];
      target[propName] = value;

      // Only trigger onChange if value actually changed
      if (oldValue !== value) {
        if (stateListeners.has(propName)) {
          stateListeners
            .get(propName)
            .forEach((handler) => handler(propName, value, oldValue));
        }
      }

      return true;
    },
    get(target, property) {
      return target[property];
    },
  };

  return [new Proxy({ ...initialState }, proxyHandlers), addStatePropListener];
}
