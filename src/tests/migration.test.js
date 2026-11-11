
const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const pool = require("../config/database");
const migrateApplications = require("../scripts/migrateApplications");

test("migration should rollback all inserts when an application is invalid", async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();

    const applications = [
        {
            id: firstId,
            company: "WorkPilot Rollback Test",
            position: "Developer",
            status: "applied",
            appliedAt: new Date().toISOString()
        },
        {
            id: secondId,
            company: "WorkPilot Rollback Test",
            position: "Backend Developer",
            status: "invalid-status",
            appliedAt: new Date().toISOString()
        }
    ];

    try {
        await assert.rejects(
            migrateApplications(applications),
            {
                code: "23514"
            }
        );

        const result = await pool.query(
            `SELECT id
             FROM applications
             WHERE id = $1`,
            [firstId]
        );

        assert.equal(result.rowCount, 0);

    } finally {
        await pool.query(
            "DELETE FROM applications WHERE id = ANY($1::uuid[])",
            [[firstId, secondId]]
        );
    }
});
