
const express = require("express");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const applicationRoutes = require("./routes/applicationRoutes");
const openApiDocument = require("./docs/openapi");

const {
    notFound,
    errorHandler
} = require("./middleware/errorHandler");

const app = express();

// Protezione delle intestazioni HTTP
app.use(
    helmet({
        // La CSP verrà configurata separatamente
        // per mantenere compatibile Swagger UI.
        contentSecurityPolicy: false
    })
);

// Limita le richieste alle API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests, please try again later."
    }
});

// Applica il limite alle API delle candidature
app.use("/api/applications", apiLimiter);

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
