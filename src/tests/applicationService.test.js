const test = require("node:test");
const assert = require("node:assert/strict");

const {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../services/applicationService");

test("should create and retrieve an application", () => {
    const application = addApplication(
        "Google",
        "Frontend Developer"
    );

    const result = getApplicationById(application.id);

    assert.equal(result.company, "Google");
    assert.equal(result.position, "Frontend Developer");

    deleteApplication(application.id);
});

test("should return all applications", () => {
    const application = addApplication(
        "Amazon",
        "Backend Developer"
    );

    const result = getAllApplications();

    assert.ok(result.some(item => item.id === application.id));

    deleteApplication(application.id);
});

test("should update an application", () => {
    const application = addApplication(
        "Microsoft",
        "Junior Developer"
    );

    const updated = updateApplication(application.id, {
        status: "interview"
    });

    assert.equal(updated.status, "interview");
    assert.equal(updated.id, application.id);

    deleteApplication(application.id);
});

test("should delete an application", () => {
    const application = addApplication(
        "Apple",
        "Software Engineer"
    );

    const deleted = deleteApplication(application.id);

    assert.equal(deleted, true);
    assert.equal(getApplicationById(application.id), null);
});

test("should return null when updating a nonexistent application", () => {
    const result = updateApplication("nonexistent-id", {
        status: "rejected"
    });

    assert.equal(result, null);
});