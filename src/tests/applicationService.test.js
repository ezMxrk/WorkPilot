
const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const pool = require("../config/database");

const {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../services/applicationService");

let userId;

// Creiamo un utente dedicato ai test
test.before(async () => {
    userId = randomUUID();

    await pool.query(
        `INSERT INTO users (id, email, password_hash)
         VALUES ($1, $2, $3)`,
        [
            userId,
            `service-test-${userId}@workpilot.test`,
            "test-only-password-hash"
        ]
    );
});

// Eliminiamo l'utente e tutte le sue candidature
test.after(async () => {
    if (userId) {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userId]
        );
    }
});

test("should create and retrieve an application", async () => {
    const application = await addApplication(
        "Google",
        "Frontend Developer",
        undefined,
        userId
    );

    try {
        const result = await getApplicationById(
            application.id,
            userId
        );

        assert.equal(result.company, "Google");
        assert.equal(result.position, "Frontend Developer");
    } finally {
        await deleteApplication(application.id, userId);
    }
});

test("should return all applications", async () => {
    const application = await addApplication(
        "Amazon",
        "Backend Developer",
        undefined,
        userId
    );

    try {
        const result = await getAllApplications(userId);

        assert.ok(
            result.some(item => item.id === application.id)
        );
    } finally {
        await deleteApplication(application.id, userId);
    }
});

test("should update an application", async () => {
    const application = await addApplication(
        "Microsoft",
        "Junior Developer",
        undefined,
        userId
    );

    try {
        const updated = await updateApplication(
            application.id,
            {
                status: "interview"
            },
            userId
        );

        assert.equal(updated.status, "interview");
        assert.equal(updated.id, application.id);
    } finally {
        await deleteApplication(application.id, userId);
    }
});

test("should delete an application", async () => {
    const application = await addApplication(
        "Apple",
        "Software Engineer",
        undefined,
        userId
    );

    const deleted = await deleteApplication(
        application.id,
        userId
    );

    const result = await getApplicationById(
        application.id,
        userId
    );

    assert.equal(deleted, true);
    assert.equal(result, null);
});

test("should return null when updating a nonexistent application", async () => {
    const nonexistentId = randomUUID();

    const result = await updateApplication(
        nonexistentId,
        {
            status: "rejected"
        },
        userId
    );

    assert.equal(result, null);
});

test("should reject operations without an authenticated user", async () => {
    await assert.rejects(
        () => getAllApplications(),
        {
            message: "Authenticated user ID is required."
        }
    );
});
