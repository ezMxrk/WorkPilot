
const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,

    connectionTimeoutMillis: 5000
});

// Gestisce eventuali errori sulle connessioni inattive
pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
});

module.exports = pool;
