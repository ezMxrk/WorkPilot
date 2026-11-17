
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const pool = require("../config/database");
const env = require("../config/env");
const { sendPasswordResetEmail } = require("./emailService");

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
        `SELECT id, email, password_hash, created_at, token_version
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
        {
            sub: user.id,
            tokenVersion: user.token_version
        },
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

async function getUserById(userId) {
    const result = await pool.query(
        `SELECT id, email, created_at
         FROM users
         WHERE id = $1`,
        [userId]
    );

    return result.rows[0] || null;
}

async function changeUserPassword(userId, currentPassword, newPassword) {
    const result = await pool.query(
        `SELECT password_hash
         FROM users
         WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        return false;
    }

    const passwordMatches = await bcrypt.compare(
        currentPassword,
        result.rows[0].password_hash
    );

    if (!passwordMatches) {
        return false;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
        `UPDATE users
         SET password_hash = $1,
             token_version = token_version + 1,
             updated_at = NOW()
         WHERE id = $2`,
        [newPasswordHash, userId]
    );

    return true;
}

async function requestPasswordReset(email) {
    const genericMessage =
        "If an account with that email exists, a password reset link has been sent.";

    const userResult = await pool.query(
        `SELECT id, email
         FROM users
         WHERE email = $1`,
        [email]
    );

    if (userResult.rows.length === 0) {
        return genericMessage;
    }

    const user = userResult.rows[0];

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const resetUrl = new URL(
        "/reset-password",
        env.FRONTEND_URL
    );

    resetUrl.searchParams.set("token", rawToken);

    await pool.query(
        `DELETE FROM password_reset_tokens
         WHERE user_id = $1 OR expires_at <= NOW()`,
        [user.id]
    );

    await pool.query(
        `INSERT INTO password_reset_tokens
            (user_id, token_hash, expires_at)
         VALUES
            ($1, $2, NOW() + ($3 * INTERVAL '1 minute'))`,
        [
            user.id,
            tokenHash,
            env.PASSWORD_RESET_TOKEN_TTL_MINUTES
        ]
    );

    try {
        await sendPasswordResetEmail(user.email, resetUrl.toString());
    } catch (error) {
        console.error("Password reset email delivery failed:", error);

        await pool.query(
            `DELETE FROM password_reset_tokens
             WHERE token_hash = $1`,
            [tokenHash]
        );
    }

    return genericMessage;
}

async function resetUserPassword(token, newPassword) {
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const tokenResult = await client.query(
            `SELECT id, user_id
             FROM password_reset_tokens
             WHERE token_hash = $1
               AND expires_at > NOW()
             FOR UPDATE`,
            [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return false;
        }

        const resetToken = tokenResult.rows[0];

        const updateResult = await client.query(
            `UPDATE users
             SET password_hash = $1,
                 token_version = token_version + 1,
                 updated_at = NOW()
             WHERE id = $2
             RETURNING id`,
            [newPasswordHash, resetToken.user_id]
        );

        if (updateResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return false;
        }

        await client.query(
            `DELETE FROM password_reset_tokens
             WHERE user_id = $1`,
            [resetToken.user_id]
        );

        await client.query("COMMIT");

        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    changeUserPassword,
    requestPasswordReset,
    resetUserPassword
};
