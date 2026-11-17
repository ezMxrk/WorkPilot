
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = require("../app");
const pool = require("../config/database");
const env = require("../config/env");

let token;
let testUserId;

const testEmail = `change-password-${randomUUID()}@workpilot.test`;

const currentPassword = "CurrentPassword123!";
const newPassword = "NewPassword456!";

test.before(async () => {
    const passwordHash = await bcrypt.hash(currentPassword, 12);

    const result = await pool.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id`,
        [testEmail, passwordHash]
    );

    testUserId = result.rows[0].id;

    token = jwt.sign(
        { sub: testUserId, tokenVersion: 0 },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
});

test.beforeEach(async () => {
    const passwordHash = await bcrypt.hash(currentPassword, 12);

    await pool.query(
        `UPDATE users
         SET password_hash = $1,
             token_version = 0
         WHERE id = $2`,
        [passwordHash, testUserId]
    );
});

test.after(async () => {
    if (testUserId) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [testUserId]
        );
    }
});

test("PUT /api/auth/change-password should update the password and revoke old sessions", async () => {
    const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
            currentPassword,
            newPassword,
            confirmPassword: newPassword
        });

    assert.equal(response.status, 200);

    assert.equal(
        response.body.message,
        "Password updated successfully."
    );

    const result = await pool.query(
        `SELECT password_hash, token_version
         FROM users
         WHERE id = $1`,
        [testUserId]
    );

    const oldPasswordMatches = await bcrypt.compare(
        currentPassword,
        result.rows[0].password_hash
    );

    const newPasswordMatches = await bcrypt.compare(
        newPassword,
        result.rows[0].password_hash
    );

    assert.equal(oldPasswordMatches, false);
    assert.equal(newPasswordMatches, true);
    assert.equal(result.rows[0].token_version, 1);

    const oldSessionResponse = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

    assert.equal(oldSessionResponse.status, 401);
    assert.equal(
        oldSessionResponse.body.error,
        "Authentication session has been revoked."
    );
});

test("PUT /api/auth/change-password should reject an incorrect current password", async () => {
    const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
            currentPassword: "WrongPassword123!",
            newPassword,
            confirmPassword: newPassword
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.error,
        "Current password is incorrect."
    );
});

test("PUT /api/auth/change-password should reject a password shorter than 8 characters", async () => {
    const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
            currentPassword,
            newPassword: "short",
            confirmPassword: "short"
        });

    assert.equal(response.status, 400);
});

test("PUT /api/auth/change-password should reject mismatched password confirmation", async () => {
    const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
            currentPassword,
            newPassword,
            confirmPassword: "DifferentPassword789!"
        });

    assert.equal(response.status, 400);
});

test("PUT /api/auth/change-password should reject the current password as the new password", async () => {
    const response = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
            currentPassword,
            newPassword: currentPassword,
            confirmPassword: currentPassword
        });

    assert.equal(response.status, 400);
});

test("PUT /api/auth/change-password should reject requests without authentication", async () => {
    const response = await request(app)
        .put("/api/auth/change-password")
        .send({
            currentPassword,
            newPassword,
            confirmPassword: newPassword
        });

    assert.equal(response.status, 401);
});
