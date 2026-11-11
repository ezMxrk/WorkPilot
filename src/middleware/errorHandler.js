
function notFound(req, res, next) {
    const error = new Error("Route not found");

    error.statusCode = 404;

    next(error);
}

function errorHandler(error, req, res, next) {
    // Se la risposta è già stata inviata, delega a Express
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || error.status || 500;

    const message =
        statusCode >= 500
            ? "Internal server error"
            : error.message;

    res.status(statusCode).json({
        error: message
    });
}

module.exports = {
    notFound,
    errorHandler
};
