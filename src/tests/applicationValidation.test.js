
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");

test("POST should reject an empty company", async () => {
    const response = await request(app)
        .post("/api/applications")
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
        .send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Validation failed");
});

test("PUT should reject unexpected fields", async () => {
    const response = await request(app)
        .put("/api/applications/123456")
        .send({
            admin: true
        });

    assert.equal(response.status, 400);
});
