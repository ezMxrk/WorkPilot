
const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../services/applicationService");

test("should create and retrieve an application", async () => {
    const application = await addApplication(
        "Google",
        "Frontend Developer"
    );

    try {
        const result = await getApplicationById(application.id);

        assert.equal(result.company, "Google");
        assert.equal(result.position, "Frontend Developer");
    } finally {
        await deleteApplication(application.id);
    }
});

test("should return all applications", async () => {
    const application = await addApplication(
        "Amazon",
        "Backend Developer"
    );

    try {
        const result = await getAllApplications();

        assert.ok(result.some(item => item.id === application.id));
    } finally {
        await deleteApplication(application.id);
    }
});

test("should update an application", async () => {
    const application = await addApplication(
        "Microsoft",
        "Junior Developer"
    );

    try {
        const updated = await updateApplication(application.id, {
            status: "interview"
        });

        assert.equal(updated.status, "interview");
        assert.equal(updated.id, application.id);
    } finally {
        await deleteApplication(application.id);
    }
});

test("should delete an application", async () => {
    const application = await addApplication(
        "Apple",
        "Software Engineer"
    );

    const deleted = await deleteApplication(application.id);
    const result = await getApplicationById(application.id);

    assert.equal(deleted, true);
    assert.equal(result, null);
});

test("should return null when updating a nonexistent application", async () => {
    const nonexistentId = randomUUID();

    const result = await updateApplication(nonexistentId, {
        status: "rejected"
    });

    assert.equal(result, null);
});
