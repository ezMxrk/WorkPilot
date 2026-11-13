
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { randomUUID } = require("node:crypto");

const app = require("../app");
const pool = require("../config/database");

let userA;
let userB;

let tokenA;
let tokenB;

let emailA;
let emailB;

// Crea un utente e recupera il suo token JWT
async function createTestUser() {
    const email = `test-${randomUUID()}@workpilot.test`;
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
        email,
        token: login.body.token
    };
}

// Crea due utenti prima di eseguire i test
test.before(async () => {
    userA = await createTestUser();
    userB = await createTestUser();

    tokenA = userA.token;
    tokenB = userB.token;

    emailA = userA.email;
    emailB = userB.email;
});

// Elimina gli utenti di prova dopo tutti i test
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

test("GET / should return API information", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Welcome to WorkPilot API");
});

test("GET applications should reject unauthenticated requests", async () => {
    const response = await request(app)
        .get("/api/applications");

    assert.equal(response.status, 401);
});

test("POST should create an application", async () => {
    const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Google",
            position: "Backend Developer"
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.company, "Google");
    assert.equal(response.body.position, "Backend Developer");
});

test("POST should reject invalid application data", async () => {
    const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "   ",
            position: "Developer"
        });

    assert.equal(response.status, 400);
    assert.ok(response.body.error);
});

test("GET should retrieve an application by ID", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Microsoft",
            position: "Software Engineer"
        });

    assert.equal(created.status, 201);

    const id = created.body.id;

    const response = await request(app)
        .get(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, id);
});

test("PUT should update an application", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Amazon",
            position: "Developer"
        });

    const id = created.body.id;

    const response = await request(app)
        .put(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            status: "interview"
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "interview");
});

test("DELETE should remove an application", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Apple",
            position: "Frontend Developer"
        });

    const id = created.body.id;

    const response = await request(app)
        .delete(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(response.status, 200);

    const verification = await request(app)
        .get(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(verification.status, 404);
});

test("GET should return 404 for a nonexistent application", async () => {
    const nonexistentId = randomUUID();

    const response = await request(app)
        .get(`/api/applications/${nonexistentId}`)
        .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(response.status, 404);
});

test("GET should return 400 for an invalid UUID", async () => {
    const response = await request(app)
        .get("/api/applications/not-a-valid-uuid")
        .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Invalid data format");
});

test("Users should not see each other's applications", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Private Company",
            position: "Private Position"
        });

    const id = created.body.id;

    const response = await request(app)
        .get(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenB}`);

    assert.equal(response.status, 404);
});

test("Users should not update each other's applications", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Protected Company",
            position: "Developer"
        });

    const id = created.body.id;

    const response = await request(app)
        .put(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
            status: "accepted"
        });

    assert.equal(response.status, 404);
});

test("Users should not delete each other's applications", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "Protected Company",
            position: "Backend Developer"
        });

    const id = created.body.id;

    const response = await request(app)
        .delete(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenB}`);

    assert.equal(response.status, 404);

    // Verifichiamo che il proprietario possa ancora recuperarla
    const verification = await request(app)
        .get(`/api/applications/${id}`)
        .set("Authorization", `Bearer ${tokenA}`);

    assert.equal(verification.status, 200);
});

test("Users should only receive their own applications in the list", async () => {
    const created = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            company: "User A Private Company",
            position: "Developer"
        });

    assert.equal(created.status, 201);

    const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${tokenB}`);

    assert.equal(response.status, 200);

    const companies = response.body.data.map(
        (application) => application.company
    );

    assert.ok(
        !companies.includes("User A Private Company")
    );
});
