
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID, createHash } = require("node:crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = require("../app");
const pool = require("../config/database");
const env = require("../config/env");

const testEmail = `password-reset-${randomUUID()}@workpilot.test`;
const originalPassword = "InitialPassword123!";
const newPassword = "ResetPassword789!";

let testUserId;

function hashToken(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

test.before(async () => {
    const passwordHash = await bcrypt.hash(originalPassword, 12);

    const result = await pool.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id`,
        [testEmail, passwordHash]
    );

    testUserId = result.rows[0].id;
});

test.after(async () => {
    if (testUserId) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [testUserId]
        );
    }
});

test(
    "Password reset flow should work securely",
    { skip: env.EMAIL_MODE !== "console" },
    async () => {
        // 1. Richiesta di recupero password per un account esistente.
        const originalLog = console.log;
        const capturedLogs = [];

        let forgotResponse;

        console.log = (...args) => {
            capturedLogs.push(args.join(" "));
        };

        try {
            forgotResponse = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: testEmail });
        } finally {
            console.log = originalLog;
        }

        assert.equal(forgotResponse.status, 200);

        assert.equal(
            forgotResponse.body.message,
            "If an account with that email exists, a password reset link has been sent."
        );

        // 2. Recupera il token dal link stampato in console.
        const consoleOutput = capturedLogs.join("\n");
        const resetLinkMatch = consoleOutput.match(
            /Reset link:\s*(https?:\/\/\S+)/
        );

        assert.ok(
            resetLinkMatch,
            "Password reset link should be printed in console mode."
        );

        const resetUrl = new URL(resetLinkMatch[1]);
        const rawToken = resetUrl.searchParams.get("token");

        assert.ok(rawToken);
        assert.equal(rawToken.length, 64);

        // 3. Verifica che nel database sia salvato solo l'hash.
        const tokenResult = await pool.query(
            `SELECT token_hash, expires_at
             FROM password_reset_tokens
             WHERE user_id = $1`,
            [testUserId]
        );

        assert.equal(tokenResult.rows.length, 1);
        assert.equal(tokenResult.rows[0].token_hash, hashToken(rawToken));
        assert.notEqual(tokenResult.rows[0].token_hash, rawToken);

        assert.ok(
            new Date(tokenResult.rows[0].expires_at) > new Date()
        );

        // 4. Un'email non registrata deve ricevere la stessa risposta.
        const unknownEmailResponse = await request(app)
            .post("/api/auth/forgot-password")
            .send({
                email: `unknown-${randomUUID()}@workpilot.test`
            });

        assert.equal(unknownEmailResponse.status, 200);

        assert.equal(
            unknownEmailResponse.body.message,
            forgotResponse.body.message
        );

        // 5. Crea una vecchia sessione per verificare la revoca.
        const oldSessionToken = jwt.sign(
            {
                sub: testUserId,
                tokenVersion: 0
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );

        // 6. Esegue il reset con un token valido.
        const resetResponse = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: rawToken,
                newPassword,
                confirmPassword: newPassword
            });

        assert.equal(resetResponse.status, 200);

        assert.equal(
            resetResponse.body.message,
            "Password reset successfully. Please log in again."
        );

        // 7. Verifica che la password sia stata aggiornata.
        const userResult = await pool.query(
            `SELECT password_hash, token_version
             FROM users
             WHERE id = $1`,
            [testUserId]
        );

        const passwordMatches = await bcrypt.compare(
            newPassword,
            userResult.rows[0].password_hash
        );

        assert.equal(passwordMatches, true);
        assert.equal(userResult.rows[0].token_version, 1);

        // 8. Il token utilizzato non deve essere più valido.
        const remainingTokens = await pool.query(
            `SELECT id
             FROM password_reset_tokens
             WHERE user_id = $1`,
            [testUserId]
        );

        assert.equal(remainingTokens.rows.length, 0);

        const replayResponse = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: rawToken,
                newPassword,
                confirmPassword: newPassword
            });

        assert.equal(replayResponse.status, 400);

        assert.equal(
            replayResponse.body.error,
            "This password reset link is invalid or has expired."
        );

        // 9. Anche la vecchia sessione JWT deve essere revocata.
        const oldSessionResponse = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${oldSessionToken}`);

        assert.equal(oldSessionResponse.status, 401);

        assert.equal(
            oldSessionResponse.body.error,
            "Authentication session has been revoked."
        );

        // 10. Un token scaduto deve essere rifiutato.
        const expiredRawToken = "f".repeat(64);
        const expiredTokenHash = hashToken(expiredRawToken);

        await pool.query(
            `INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at)
             VALUES
                ($1, $2, NOW() - INTERVAL '1 minute')`,
            [testUserId, expiredTokenHash]
        );

        const expiredResponse = await request(app)
            .post("/api/auth/reset-password")
            .send({
                token: expiredRawToken,
                newPassword: "AnotherPassword123!",
                confirmPassword: "AnotherPassword123!"
            });

        assert.equal(expiredResponse.status, 400);

        assert.equal(
            expiredResponse.body.error,
            "This password reset link is invalid or has expired."
        );

        // 11. Verifica che la nuova password consenta il login.
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: newPassword
            });

        assert.equal(loginResponse.status, 200);
        assert.ok(loginResponse.body.token);
        assert.equal(loginResponse.body.user.id, testUserId);
    }
);
