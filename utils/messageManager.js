/*===============  MESSAGE EVENT MANAGER  =============== */

/* Each route handler that expects a message from the mqtt broker is added to the map
 * as a listener with its unique subTopic as a key. When a message is received, that
 * message is forwarded to the appropriate listener. */

const listeners = new Map();

// register a listener for a specific message topic
function addListener(topic, listener) {
    if (!listeners.has(topic)) {
        listeners.set(topic, []);
    }
    listeners.get(topic).push(listener);
    console.log(listeners)
}

// trigger an event and notify registered listener
function fireEvent(topic, data) {
    const eventListeners = listeners.get(topic) || [];
    eventListeners.forEach(listener => listener(data));
    listeners.delete(topic);
}

// export the router
module.exports = {
    addListener,
    fireEvent
}