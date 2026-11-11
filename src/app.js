
const express = require("express");
const swaggerUi = require("swagger-ui-express");

const applicationRoutes = require("./routes/applicationRoutes");
const openApiDocument = require("./docs/openapi");

const app = express();

// Permette al server di leggere richieste JSON
app.use(express.json());

// Documentazione Swagger
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument)
);

// Endpoint principale
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to WorkPilot API",
        version: "1.0.0"
    });
});

// Registrazione delle rotte
app.use("/api/applications", applicationRoutes);

// Gestione degli endpoint inesistenti
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

module.exports = app;
