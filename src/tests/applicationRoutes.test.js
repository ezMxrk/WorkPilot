
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");

const app = require("../app");

test("GET / should return API information", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Welcome to WorkPilot API");
});

test("POST should create an application", async () => {
    let id;

    try {
        const response = await request(app)
            .post("/api/applications")
            .send({
                company: "Google",
                position: "Backend Developer"
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.company, "Google");
        assert.equal(response.body.position, "Backend Developer");

        id = response.body.id;
    } finally {
        if (id) {
            await request(app).delete(`/api/applications/${id}`);
        }
    }
});

test("POST should reject invalid application data", async () => {
    const response = await request(app)
        .post("/api/applications")
        .send({
            company: "   ",
            position: "Developer"
        });

    assert.equal(response.status, 400);
    assert.ok(response.body.error);
});

test("GET should retrieve an application by ID", async () => {
    let id;

    try {
        const created = await request(app)
            .post("/api/applications")
            .send({
                company: "Microsoft",
                position: "Software Engineer"
            });

        id = created.body.id;

        const response = await request(app)
            .get(`/api/applications/${id}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.id, id);
    } finally {
        if (id) {
            await request(app).delete(`/api/applications/${id}`);
        }
    }
});

test("PUT should update an application", async () => {
    let id;

    try {
        const created = await request(app)
            .post("/api/applications")
            .send({
                company: "Amazon",
                position: "Developer"
            });

        id = created.body.id;

        const response = await request(app)
            .put(`/api/applications/${id}`)
            .send({
                status: "interview"
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.status, "interview");
    } finally {
        if (id) {
            await request(app).delete(`/api/applications/${id}`);
        }
    }
});

test("DELETE should remove an application", async () => {
    const created = await request(app)
        .post("/api/applications")
        .send({
            company: "Apple",
            position: "Frontend Developer"
        });

    const id = created.body.id;

    const response = await request(app)
        .delete(`/api/applications/${id}`);

    assert.equal(response.status, 200);

    const verification = await request(app)
        .get(`/api/applications/${id}`);

    assert.equal(verification.status, 404);
});

test("GET should return 404 for a nonexistent application", async () => {
    const nonexistentId = randomUUID();

    const response = await request(app)
        .get(`/api/applications/${nonexistentId}`);

    assert.equal(response.status, 404);
});
