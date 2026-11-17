
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const pool = require("../config/database");

async function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication token is required."
        });
    }

    const token = authorization.slice(7);

    let payload;

    try {
        payload = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired authentication token."
        });
    }

    if (!payload.sub) {
        return res.status(401).json({
            error: "Invalid authentication token."
        });
    }

    const tokenVersion = payload.tokenVersion ?? 0;

    if (!Number.isInteger(tokenVersion) || tokenVersion < 0) {
        return res.status(401).json({
            error: "Invalid authentication token."
        });
    }

    try {
        const result = await pool.query(
            `SELECT token_version
             FROM users
             WHERE id = $1`,
            [payload.sub]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Authentication session is no longer valid."
            });
        }

        const currentTokenVersion = result.rows[0].token_version;

        if (tokenVersion !== currentTokenVersion) {
            return res.status(401).json({
                error: "Authentication session has been revoked."
            });
        }

        req.user = {
            id: payload.sub
        };

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authenticateToken;
