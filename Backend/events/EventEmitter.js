/**
 * EventEmitter implementation for the Observer Pattern
 * Allows components to publish and subscribe to events
 */
export class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function to remove
   */
  off(event, listener) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(
      existingListener => existingListener !== listener
    );
  }
  
  /**
   * Subscribe to an event for a single execution
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    
    this.on(event, onceWrapper);
  }
  
  /**
   * Publish an event with data
   * @param {string} event - Event name
   * @param {...any} args - Data to pass to listeners
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}
