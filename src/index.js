
const env = require("./config/env");
const app = require("./app");
const pool = require("./config/database");

const server = app.listen(env.PORT, () => {
    console.log(
        `WorkPilot API running on http://localhost:${env.PORT}`
    );
});

// Gestione degli errori del server
server.on("error", (error) => {
    console.error("Server startup error:", error);
    process.exit(1);
});

// Chiusura ordinata dell'applicazione
async function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down WorkPilot...`);

    server.close(async () => {
        try {
            await pool.end();
            console.log("Database connections closed.");
            process.exit(0);
        } catch (error) {
            console.error("Error closing database connections:", error);
            process.exit(1);
        }
    });
}

// Gestione delle interruzioni
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
