
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");

const app = require("../app");
const pool = require("../config/database");

let token;
let testUserId;

test.before(async () => {
    const email = `profile-${randomUUID()}@workpilot.test`;
    const password = "TestPassword123!";

    const registration = await request(app)
        .post("/api/auth/register")
        .send({ email, password });

    assert.equal(registration.status, 201);

    testUserId = registration.body.user.id;

    const login = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    assert.equal(login.status, 200);

    token = login.body.token;
});

test.after(async () => {
    if (testUserId) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [testUserId]
        );
    }
});

test("GET /api/auth/me should return the authenticated user profile", async () => {
    const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.user.id, testUserId);
    assert.ok(response.body.user.email);
    assert.ok(response.body.user.created_at);

    assert.equal(
        Object.hasOwn(response.body.user, "password_hash"),
        false
    );
});

test("GET /api/auth/me should reject requests without a token", async () => {
    const response = await request(app)
        .get("/api/auth/me");

    assert.equal(response.status, 401);
});

test("GET /api/auth/me should reject an invalid token", async () => {
    const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

    assert.equal(response.status, 401);
});
