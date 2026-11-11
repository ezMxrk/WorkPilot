const { randomUUID } = require("node:crypto");

function createApplication(company, position, status = "applied") {

    if (!company || !position) {
        throw new Error("Company and position are required");
    }

    const validStatuses = [
        "saved",
        "applied",
        "interview",
        "rejected",
        "accepted"
    ];

    if (!validStatuses.includes(status)) {
        throw new Error("Invalid application status");
    }

    return {
        id: randomUUID(),
        company,
        position,
        status,
        appliedAt: new Date().toISOString()
    };
}

module.exports = createApplication;