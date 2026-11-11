
function validateRequest(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const error = new Error("Validation failed");

            error.statusCode = 400;
            error.details = result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }));

            return next(error);
        }

        // Sostituisce il body con i dati validati
        req.body = result.data;

        next();
    };
}

module.exports = validateRequest;
