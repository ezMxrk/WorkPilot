
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");

const app = require("../app");
const pool = require("../config/database");

let userA;
let userB;

// Crea un utente di prova e recupera il token JWT
async function createTestUser() {
    const email = `stats-${randomUUID()}@workpilot.test`;
    const password = "TestPassword123!";

    const registration = await request(app)
        .post("/api/auth/register")
        .send({ email, password });

    assert.equal(registration.status, 201);

    const login = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    assert.equal(login.status, 200);
    assert.ok(login.body.token);

    return {
        id: registration.body.user.id,
        token: login.body.token
    };
}

// Crea due utenti prima dei test
test.before(async () => {
    userA = await createTestUser();
    userB = await createTestUser();
});

// Elimina gli utenti di prova dopo i test
test.after(async () => {
    if (userA?.id) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userA.id]
        );
    }

    if (userB?.id) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userB.id]
        );
    }
});

// Crea una candidatura per un utente
async function createApplication(token, company, status) {
    const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
            company,
            position: "Software Developer",
            status
        });

    assert.equal(response.status, 201);

    return response.body;
}

// Verifica che le statistiche conteggino correttamente ogni stato
test("GET /stats should return correct application statistics", async () => {
    await createApplication(userA.token, "Company Saved", "saved");
    await createApplication(userA.token, "Company Applied", "applied");
    await createApplication(userA.token, "Company Interview", "interview");
    await createApplication(userA.token, "Company Rejected", "rejected");
    await createApplication(userA.token, "Company Accepted", "accepted");
    await createApplication(userA.token, "Company Applied 2", "applied");

    const response = await request(app)
        .get("/api/applications/stats")
        .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(response.status, 200);

    assert.deepEqual(response.body, {
        total: 6,
        saved: 1,
        applied: 2,
        interview: 1,
        rejected: 1,
        accepted: 1
    });
});

// Verifica le statistiche di un utente senza candidature
test("GET /stats should return zero when the user has no applications", async () => {
    const response = await request(app)
        .get("/api/applications/stats")
        .set("Authorization", `Bearer ${userB.token}`);

    assert.equal(response.status, 200);

    assert.deepEqual(response.body, {
        total: 0,
        saved: 0,
        applied: 0,
        interview: 0,
        rejected: 0,
        accepted: 0
    });
});

// Verifica che un utente non possa vedere le statistiche di un altro
test("GET /stats should only return the authenticated user's statistics", async () => {
    await createApplication(userB.token, "User B Company", "accepted");

    const response = await request(app)
        .get("/api/applications/stats")
        .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(response.status, 200);

    assert.deepEqual(response.body, {
        total: 6,
        saved: 1,
        applied: 2,
        interview: 1,
        rejected: 1,
        accepted: 1
    });
});

// Verifica che le richieste senza autenticazione vengano rifiutate
test("GET /stats should reject unauthenticated requests", async () => {
    const response = await request(app)
        .get("/api/applications/stats");

    assert.equal(response.status, 401);
});
