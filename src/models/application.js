
const { randomUUID } = require("node:crypto");

function createValidationError(message) {
    const error = new Error(message);
    error.statusCode = 400;

    return error;
}

function createApplication(company, position, status = "applied") {

    // Verifica che azienda e posizione siano stringhe non vuote
    if (typeof company !== "string" || !company.trim()) {
        throw createValidationError("Company is required");
    }

    if (typeof position !== "string" || !position.trim()) {
        throw createValidationError("Position is required");
    }

    // Rimuove gli spazi superflui
    company = company.trim();
    position = position.trim();

    const validStatuses = [
        "saved",
        "applied",
        "interview",
        "rejected",
        "accepted"
    ];

    if (!validStatuses.includes(status)) {
        throw createValidationError("Invalid application status");
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
