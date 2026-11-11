
const pool = require("../config/database");

const createApplication = require("../models/application");

// Converte una riga PostgreSQL nel formato utilizzato da WorkPilot
function mapApplication(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        company: row.company,
        position: row.position,
        status: row.status,
        appliedAt: row.applied_at.toISOString()
    };
}

// Aggiunge una nuova candidatura
async function addApplication(company, position, status = "applied") {
    const application = createApplication(company, position, status);

    const result = await pool.query(
        `INSERT INTO applications
            (id, company, position, status, applied_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
            application.id,
            application.company,
            application.position,
            application.status,
            application.appliedAt
        ]
    );

    return mapApplication(result.rows[0]);
}

// Recupera tutte le candidature
async function getAllApplications() {
    const result = await pool.query(
        "SELECT * FROM applications ORDER BY applied_at ASC"
    );

    return result.rows.map(mapApplication);
}

// Recupera una candidatura tramite ID
async function getApplicationById(id) {
    const result = await pool.query(
        "SELECT * FROM applications WHERE id = $1",
        [id]
    );

    return mapApplication(result.rows[0]);
}

// Aggiorna una candidatura

async function updateApplication(id, updates) {
    const result = await pool.query(
        `UPDATE applications
         SET company = COALESCE($1, company),
             position = COALESCE($2, position),
             status = COALESCE($3, status)
         WHERE id = $4
         RETURNING *`,
        [
            updates.company ?? null,
            updates.position ?? null,
            updates.status ?? null,
            id
        ]
    );

    return mapApplication(result.rows[0]);
}


// Elimina una candidatura
async function deleteApplication(id) {
    const result = await pool.query(
        "DELETE FROM applications WHERE id = $1 RETURNING id",
        [id]
    );

    return result.rowCount > 0;
}

// Recupera le candidature con filtri e paginazione
async function listApplications({
    status,
    company,
    page = 1,
    limit = 10
} = {}) {
    const conditions = [];
    const values = [];

    // Filtro per stato
    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    // Ricerca azienda ignorando maiuscole e minuscole
    if (company) {
        values.push(`%${company}%`);
        conditions.push(`company ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // Conta i risultati prima della paginazione
    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM applications
         ${whereClause}`,
        values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Calcola l'offset
    const offset = (page - 1) * limit;

    // Aggiunge i parametri della paginazione
    const paginationValues = [...values, limit, offset];

    const result = await pool.query(
        `SELECT *
         FROM applications
         ${whereClause}
         ORDER BY applied_at ASC
         LIMIT $${values.length + 1}
         OFFSET $${values.length + 2}`,
        paginationValues
    );

    return {
        data: result.rows.map(mapApplication),
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
}

module.exports = {
    addApplication,
    getAllApplications,
    listApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
};
