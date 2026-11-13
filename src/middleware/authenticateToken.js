
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication token is required."
        });
    }

    const token = authorization.slice(7);

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);

        if (!payload.sub) {
            return res.status(401).json({
                error: "Invalid authentication token."
            });
        }

        req.user = {
            id: payload.sub
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired authentication token."
        });
    }
}

module.exports = authenticateToken;

