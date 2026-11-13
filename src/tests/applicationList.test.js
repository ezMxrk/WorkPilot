
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");

const app = require("../app");
const pool = require("../config/database");

let token;
let testUserId;

async function createTestUser() {
    const email = `list-test-${randomUUID()}@workpilot.test`;
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

test("GET should filter applications by company and paginate results", async () => {
    const createdIds = [];

    try {
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
                .set("Authorization", `Bearer ${token}`)
                .send(application);

            assert.equal(response.status, 201);
            createdIds.push(response.body.id);
        }

        const response = await request(app)
            .get("/api/applications")
            .set("Authorization", `Bearer ${token}`)
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
        for (const id of createdIds) {
            await request(app)
                .delete(`/api/applications/${id}`)
                .set("Authorization", `Bearer ${token}`);
        }
    }
});

test("GET should reject invalid pagination parameters", async () => {
    const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .query({
            page: -1,
            limit: 500
        });

    assert.equal(response.status, 400);
});

test("GET should reject an invalid application status filter", async () => {
    const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .query({
            status: "unknown"
        });

    assert.equal(response.status, 400);
});
