
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");

test("GET should filter applications by company and paginate results", async () => {
    const createdIds = [];

    try {
        // Creiamo tre candidature di prova
        const applications = [
            {
                company: "WorkPilot Test Google",
                position: "Developer"
            },
            {
                company: "WorkPilot Test Microsoft",
                position: "Backend Developer"
            },
            {
                company: "WorkPilot Test Google",
                position: "Frontend Developer"
            }
        ];

        for (const application of applications) {
            const response = await request(app)
                .post("/api/applications")
                .send(application);

            assert.equal(response.status, 201);
            createdIds.push(response.body.id);
        }

        // Filtriamo per azienda e limitiamo a un risultato
        const response = await request(app)
            .get("/api/applications")
            .query({
                company: "workpilot test google",
                page: 1,
                limit: 1
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.data.length, 1);
        assert.equal(response.body.pagination.total, 2);
        assert.equal(response.body.pagination.totalPages, 2);
        assert.equal(response.body.pagination.page, 1);

    } finally {
        // Eliminiamo le candidature create durante il test
        for (const id of createdIds) {
            await request(app).delete(`/api/applications/${id}`);
        }
    }
});

test("GET should reject invalid pagination parameters", async () => {
    const response = await request(app)
        .get("/api/applications")
        .query({
            page: -1,
            limit: 500
        });

    assert.equal(response.status, 400);
});

test("GET should reject an invalid application status filter", async () => {
    const response = await request(app)
        .get("/api/applications")
        .query({
            status: "unknown"
        });

    assert.equal(response.status, 400);
});
