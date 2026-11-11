
const fs = require("node:fs");
const path = require("node:path");

const pool = require("../config/database");

const DATA_FILE = path.join(
    __dirname,
    "../../data/applications.json"
);

async function migrateApplications() {
    try {
        // Legge le candidature dal vecchio archivio JSON
        const rawData = fs.readFileSync(DATA_FILE, "utf8");
        const applications = JSON.parse(rawData);

        if (!Array.isArray(applications)) {
            throw new Error("Invalid applications data format");
        }

        console.log(`Found ${applications.length} applications`);

        let migrated = 0;

        // Trasferisce ogni candidatura in PostgreSQL
        for (const application of applications) {
            const result = await pool.query(
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

        // Verifica il numero totale di candidature nel database
        const result = await pool.query(
            "SELECT COUNT(*) FROM applications"
        );

        console.log(`Successfully migrated: ${migrated}`);
        console.log(`Total applications in database: ${result.rows[0].count}`);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrateApplications();
