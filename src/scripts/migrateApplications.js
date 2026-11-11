
const fs = require("node:fs");
const path = require("node:path");

const pool = require("../config/database");

const DATA_FILE = path.join(
    __dirname,
    "../../data/applications.json"
);

async function migrateApplications(applications, databasePool = pool) {
    if (!Array.isArray(applications)) {
        throw new Error("Invalid applications data format");
    }

    let client;
    let transactionStarted = false;

    try {
        client = await databasePool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        let migrated = 0;

        for (const application of applications) {
            const result = await client.query(
                `INSERT INTO applications
                    (id, company, position, status, applied_at)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    application.id,
                    application.company,
                    application.position,
                    application.status,
                    application.appliedAt
                ]
            );

            migrated += result.rowCount;
        }

        const result = await client.query(
            "SELECT COUNT(*) FROM applications"
        );

        await client.query("COMMIT");
        transactionStarted = false;

        return {
            migrated,
            total: result.rows[0].count
        };

    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        throw error;

    } finally {
        if (client) {
            client.release();
        }
    }
}

async function runMigration() {
    try {
        const rawData = fs.readFileSync(DATA_FILE, "utf8");
        const applications = JSON.parse(rawData);

        console.log(`Found ${applications.length} applications`);

        const result = await migrateApplications(applications);

        console.log(`Successfully migrated: ${result.migrated}`);
        console.log(`Total applications in database: ${result.total}`);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    runMigration();
}

module.exports = migrateApplications;
