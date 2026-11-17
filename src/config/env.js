
require("dotenv").config();

const { z } = require("zod");

const envSchema = z.object({
    DB_HOST: z.string().trim().min(1, "DB_HOST is required"),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
    DB_NAME: z.string().trim().min(1, "DB_NAME is required"),
    DB_USER: z.string().trim().min(1, "DB_USER is required"),
    DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),

    JWT_SECRET: z.string().min(64, "JWT_SECRET must contain at least 64 characters"),
    JWT_EXPIRES_IN: z.string().default("1h"),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    FRONTEND_URL: z.string().url().default("http://localhost:5173"),

    EMAIL_MODE: z.enum(["console", "smtp"]).default("console"),

    SMTP_HOST: z.string().default("smtp-relay.brevo.com"),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_USER: z.string().default(""),
    SMTP_PASSWORD: z.string().default(""),
    EMAIL_FROM: z.string().default("WorkPilot <noreply@example.com>"),

    PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce
        .number()
        .int()
        .min(5)
        .max(60)
        .default(30)
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const errors = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");

    throw new Error(`Invalid environment configuration:\n${errors}`);
}

if (
    result.data.EMAIL_MODE === "smtp" &&
    (!result.data.SMTP_USER || !result.data.SMTP_PASSWORD)
) {
    throw new Error(
        "SMTP_USER and SMTP_PASSWORD are required when EMAIL_MODE=smtp"
    );
}

module.exports = result.data;
