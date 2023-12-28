// function for creating delays, used for request timeouts
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// export the delay function
module.exports = delay;