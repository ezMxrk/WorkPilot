
const express = require("express");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const applicationRoutes = require("./routes/applicationRoutes");
const openApiDocument = require("./docs/openapi");
const authRoutes = require("./routes/authRoutes");

const {
    notFound,
    errorHandler
} = require("./middleware/errorHandler");

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests, please try again later."
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Please try again later."
    }
});

app.use(express.json());

app.use("/api/applications", apiLimiter);

// Mantiene il limite di autenticazione per login e registrazione.
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);

// Le altre rotte di autenticazione hanno limiti specifici.
app.use("/api/auth", authRoutes);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument)
);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to WorkPilot API",
        version: "1.0.0"
    });
});

app.use("/api/applications", applicationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
