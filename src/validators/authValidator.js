const { z } = require("zod");

const passwordSchema = z.string()
    .min(8, "Password must contain at least 8 characters.")
    .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password must not exceed 72 bytes."
    );

const registerSchema = z.object({
    email: z.string()
        .trim()
        .email("A valid email address is required.")
        .toLowerCase(),

    password: passwordSchema
});

const loginSchema = z.object({
    email: z.string()
        .trim()
        .email("A valid email address is required.")
        .toLowerCase(),

    password: z.string()
        .min(1, "Password is required.")
});

const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Current password is required."),

    newPassword: passwordSchema,

    confirmPassword: z.string()
        .min(1, "Password confirmation is required.")
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Password confirmation does not match.",
        path: ["confirmPassword"]
    }
).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
        message: "New password must be different from the current password.",
        path: ["newPassword"]
    }
);

module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema
};