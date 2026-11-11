
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    connectionTimeoutMillis: 5000
});

// Gestisce eventuali errori sulle connessioni inattive
pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
});

module.exports = pool;
