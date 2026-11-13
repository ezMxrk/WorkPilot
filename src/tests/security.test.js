
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");

test("GET / should include Helmet security headers", async () => {
    const response = await request(app)
        .get("/");

    assert.equal(response.status, 200);

    assert.equal(
        response.headers["x-content-type-options"],
        "nosniff"
    );

    assert.equal(
        response.headers["x-frame-options"],
        "SAMEORIGIN"
    );

    assert.ok(
        response.headers["strict-transport-security"]
    );
});

test("API should enforce the rate limit", async () => {
    let response;

    // Le prime 100 richieste devono essere consentite
    for (let i = 0; i < 100; i++) {
        response = await request(app)
            .get("/api/applications/security-test/extra");

        assert.notEqual(response.status, 429);
    }

    // La richiesta numero 101 deve essere bloccata
    response = await request(app)
        .get("/api/applications/security-test/extra");

    assert.equal(response.status, 429);

    assert.equal(
        response.body.error,
        "Too many requests, please try again later."
    );
});
