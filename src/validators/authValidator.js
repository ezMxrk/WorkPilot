
const { z } = require("zod");

const passwordSchema = z.string()
    .min(8, "Password must contain at least 8 characters.")
    .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password must not exceed 72 bytes."
    );

const emailSchema = z.string()
    .trim()
    .email("A valid email address is required.")
    .toLowerCase();

const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

const loginSchema = z.object({
    email: emailSchema,

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

const forgotPasswordSchema = z.object({
    email: emailSchema
});

const resetPasswordSchema = z.object({
    token: z.string()
        .length(64, "Invalid password reset token."),

    newPassword: passwordSchema,

    confirmPassword: z.string()
        .min(1, "Password confirmation is required.")
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Password confirmation does not match.",
        path: ["confirmPassword"]
    }
);

module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
