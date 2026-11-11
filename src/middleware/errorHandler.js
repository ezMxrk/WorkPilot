
function notFound(req, res, next) {
    const error = new Error("Route not found");

    error.statusCode = 404;

    next(error);
}

// Traduce i codici PostgreSQL in risposte HTTP
const databaseErrors = {
    "22P02": {
        statusCode: 400,
        message: "Invalid data format"
    },
    "23502": {
        statusCode: 400,
        message: "Required field is missing"
    },
    "23503": {
        statusCode: 409,
        message: "Related resource conflict"
    },
    "23505": {
        statusCode: 409,
        message: "Resource already exists"
    },
    "23514": {
        statusCode: 400,
        message: "Data violates a validation constraint"
    }
};

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const databaseError = databaseErrors[error.code];

    const statusCode =
        databaseError?.statusCode ??
        error.statusCode ??
        error.status ??
        500;

    const validStatusCode =
        Number.isInteger(statusCode) &&
        statusCode >= 400 &&
        statusCode <= 599;

    const finalStatusCode = validStatusCode
        ? statusCode
        : 500;

    let message;

    if (databaseError) {
        message = databaseError.message;
    } else if (finalStatusCode >= 500) {
        message = "Internal server error";
    } else {
        message = error.message;
    }

    const response = {
        error: message
    };

    // I dettagli vengono restituiti solo per errori client
    if (finalStatusCode < 500 && error.details) {
        response.details = error.details;
    }

    res.status(finalStatusCode).json(response);
}

module.exports = {
    notFound,
    errorHandler
};
