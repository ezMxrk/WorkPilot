
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");
const env = require("../config/env");

async function registerUser({ email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email, created_at`,
        [email, passwordHash]
    );

    return result.rows[0];
}

async function loginUser({ email, password }) {
    const result = await pool.query(
        `SELECT id, email, password_hash, created_at
         FROM users
         WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        return null;
    }

    const token = jwt.sign(
        { sub: user.id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
        },
        token
    };
}

module.exports = {
    registerUser,
    loginUser
};

