const test = require("node:test");
const assert = require("node:assert/strict");

const createApplication = require("../models/application");

test("should create an application correctly", () => {
    const application = createApplication(
        "Riot Games",
        "Software Engineer"
    );

    assert.equal(application.company, "Riot Games");
    assert.equal(application.position, "Software Engineer");
    assert.equal(application.status, "applied");

    assert.match(
        application.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    assert.ok(!Number.isNaN(Date.parse(application.appliedAt)));
});

test("should accept a custom application status", () => {
    const application = createApplication(
        "Microsoft",
        "Junior Developer",
        "interview"
    );

    assert.equal(application.status, "interview");
});

test("should reject missing company or position", () => {
    assert.throws(
        () => createApplication("", "Developer"),
        { message: "Company and position are required" }
    );

    assert.throws(
        () => createApplication("Microsoft", ""),
        { message: "Company and position are required" }
    );
});

test("should reject invalid application status", () => {
    assert.throws(
        () => createApplication(
            "Google",
            "Developer",
            "unknown"
        ),
        { message: "Invalid application status" }
    );
});