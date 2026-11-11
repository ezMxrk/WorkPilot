
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const error = new Error("Invalid query parameters");

            error.statusCode = 400;
            error.details = result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }));

            return next(error);
        }

        res.locals.validatedQuery = result.data;

        next();
    };
}

module.exports = validateQuery;
