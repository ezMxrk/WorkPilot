
const pool = require("../config/database");
const createApplication = require("../models/application");

// Verifica che sia stato specificato un proprietario
function validateUserId(userId) {
    if (!userId) {
        throw new Error("Authenticated user ID is required.");
    }
}

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

// Aggiunge una candidatura appartenente all'utente autenticato
async function addApplication(company, position, status, userId) {
    validateUserId(userId);

    const application = createApplication(
        company,
        position,
        status ?? "applied"
    );

    const result = await pool.query(
        `INSERT INTO applications
            (id, company, position, status, applied_at, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            application.id,
            application.company,
            application.position,
            application.status,
            application.appliedAt,
            userId
        ]
    );

    return mapApplication(result.rows[0]);
}

// Recupera tutte le candidature di un utente
async function getAllApplications(userId) {
    validateUserId(userId);

    const result = await pool.query(
        `SELECT *
         FROM applications
         WHERE user_id = $1
         ORDER BY applied_at ASC`,
        [userId]
    );

    return result.rows.map(mapApplication);
}

// Recupera una candidatura verificandone il proprietario
async function getApplicationById(id, userId) {
    validateUserId(userId);

    const result = await pool.query(
        `SELECT *
         FROM applications
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    return mapApplication(result.rows[0]);
}

// Aggiorna esclusivamente le candidature dell'utente
async function updateApplication(id, updates, userId) {
    validateUserId(userId);

    const result = await pool.query(
        `UPDATE applications
         SET company = COALESCE($1, company),
             position = COALESCE($2, position),
             status = COALESCE($3, status)
         WHERE id = $4 AND user_id = $5
         RETURNING *`,
        [
            updates.company ?? null,
            updates.position ?? null,
            updates.status ?? null,
            id,
            userId
        ]
    );

    return mapApplication(result.rows[0]);
}

// Elimina esclusivamente le candidature dell'utente
async function deleteApplication(id, userId) {
    validateUserId(userId);

    const result = await pool.query(
        `DELETE FROM applications
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    return result.rowCount > 0;
}

// Recupera le candidature con filtri e paginazione
async function listApplications({
    userId,
    status,
    company,
    page = 1,
    limit = 10
} = {}) {
    validateUserId(userId);

    const conditions = ["user_id = $1"];
    const values = [userId];

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    if (company) {
        values.push(`%${company}%`);
        conditions.push(`company ILIKE $${values.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM applications
         ${whereClause}`,
        values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

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
