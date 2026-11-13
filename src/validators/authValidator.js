
const { z } = require("zod");

const registerSchema = z.object({
    email: z.string()
        .trim()
        .email("A valid email address is required.")
        .toLowerCase(),

    password: z.string()
        .min(8, "Password must contain at least 8 characters.")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password must not exceed 72 bytes."
        )
});

const loginSchema = z.object({
    email: z.string()
        .trim()
        .email("A valid email address is required.")
        .toLowerCase(),

    password: z.string().min(1, "Password is required.")
});

module.exports = {
    registerSchema,
    loginSchema
};
