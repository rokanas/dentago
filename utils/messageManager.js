/*===============  MESSAGE EVENT MANAGER  =============== */

/* Each route handler that expects a message from the mqtt broker is added to the map
 * as a listener with its unique requestId as a key. When a message is received, that
 * message is forwarded to the appropriate listener. */

const listeners = new Map();

// register a listener for a specific requestId
function addListener(reqId, listener) {
    if (!listeners.has(reqId)) {
        listeners.set(reqId, []);
    }
    listeners.get(reqId).push(listener);
}

// remove listener for a specific request Id
function removeListener (reqId) {
    listeners.delete(reqId);
}

// trigger on message event and notify registered listener
function fireEvent(reqId, data) {
    const eventListeners = listeners.get(reqId) || [];
    eventListeners.forEach(listener => listener(data));
}

// export the functions
module.exports = {
    addListener,
    removeListener,
    fireEvent
}