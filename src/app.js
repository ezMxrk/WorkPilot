
const express = require("express");
const swaggerUi = require("swagger-ui-express");

const applicationRoutes = require("./routes/applicationRoutes");
const openApiDocument = require("./docs/openapi");

const {
    notFound,
    errorHandler
} = require("./middleware/errorHandler");

const app = express();

// Middleware per leggere richieste JSON
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

// Gestione delle rotte inesistenti
app.use(notFound);

// Gestione centralizzata degli errori
app.use(errorHandler);

module.exports = app;
