// Generalized mqtt message format for the CLI
function createCLIResponseMessage(message, content, code) {
    return {
        message: message,
        content: content,
        status: {
            code: code,
            message: message,
        }
    };
}

function createCLIResponseLoginMessage(message, content, code, response) {
    return {
        message: message,
        content: content,
        response: response,
        status: {
            code: code,
            message: message,
        }
    };
}

const HTTP_STATUS_CODES = {
    ok: 200,
    created: 201,
    conflict: 409,
    badRequest: 400,
    notFound: 404
}

module.exports = { createCLIResponseMessage, createCLIResponseLoginMessage, HTTP_STATUS_CODES };
