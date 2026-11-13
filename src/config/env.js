
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

    PORT: z.coerce.number().int().min(1).max(65535).default(3000)
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const errors = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");

    throw new Error(`Invalid environment configuration:\n${errors}`);
}

module.exports = result.data;
