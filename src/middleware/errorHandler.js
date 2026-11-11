
function notFound(req, res, next) {
    const error = new Error("Route not found");

    error.statusCode = 404;

    next(error);
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || error.status || 500;

    const message =
        statusCode >= 500
            ? "Internal server error"
            : error.message;

    const response = {
        error: message
    };

    if (error.details) {
        response.details = error.details;
    }

    res.status(statusCode).json(response);
}

module.exports = {
    notFound,
    errorHandler
};
