
const test = require("node:test");
const assert = require("node:assert/strict");

const createApplication = require("../models/application");

test("should create an application correctly", () => {
    const application = createApplication(
        "Google",
        "Frontend Developer"
    );

    assert.equal(application.company, "Google");
    assert.equal(application.position, "Frontend Developer");
    assert.equal(application.status, "applied");
    assert.ok(application.id);
    assert.ok(application.appliedAt);
});

test("should accept a custom application status", () => {
    const application = createApplication(
        "Microsoft",
        "Developer",
        "interview"
    );

    assert.equal(application.status, "interview");
});

test("should reject missing company or position", () => {
    assert.throws(
        () => createApplication("", "Developer"),
        /Company is required/
    );

    assert.throws(
        () => createApplication("Google", ""),
        /Position is required/
    );
});

test("should reject invalid application status", () => {
    assert.throws(
        () => createApplication(
            "Google",
            "Developer",
            "unknown"
        ),
        /Invalid application status/
    );
});

test("should remove unnecessary spaces", () => {
    const application = createApplication(
        "  Google  ",
        "  Frontend Developer  "
    );

    assert.equal(application.company, "Google");
    assert.equal(application.position, "Frontend Developer");
});

test("should reject values containing only spaces", () => {
    assert.throws(
        () => createApplication("   ", "Developer"),
        /Company is required/
    );

    assert.throws(
        () => createApplication("Google", "   "),
        /Position is required/
    );
});
