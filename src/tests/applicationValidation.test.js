
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");

const app = require("../app");
const pool = require("../config/database");

let token;
let testUserId;

async function createTestUser() {
    const email = `validation-test-${randomUUID()}@workpilot.test`;
    const password = "TestPassword123!";

    const registration = await request(app)
        .post("/api/auth/register")
        .send({ email, password });

    assert.equal(registration.status, 201);

    const login = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    assert.equal(login.status, 200);

    return {
        id: registration.body.user.id,
        token: login.body.token
    };
}

test.before(async () => {
    const user = await createTestUser();

    testUserId = user.id;
    token = user.token;
});

test.after(async () => {
    if (testUserId) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [testUserId]
        );
    }
});

test("POST should reject an empty company", async () => {
    const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
            company: "",
            position: "Developer"
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Validation failed");
    assert.equal(response.body.details[0].field, "company");
});

test("POST should reject an invalid status", async () => {
    const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
            company: "Google",
            position: "Developer",
            status: "unknown"
        });

    assert.equal(response.status, 400);
});

test("POST should reject unexpected fields", async () => {
    const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
            company: "Google",
            position: "Developer",
            admin: true
        });

    assert.equal(response.status, 400);
});

test("PUT should reject an empty request body", async () => {
    const response = await request(app)
        .put("/api/applications/123456")
        .set("Authorization", `Bearer ${token}`)
        .send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Validation failed");
});

test("PUT should reject unexpected fields", async () => {
    const response = await request(app)
        .put("/api/applications/123456")
        .set("Authorization", `Bearer ${token}`)
        .send({
            admin: true
        });

    assert.equal(response.status, 400);
});
