
const { z } = require("zod");

const applicationStatus = z.enum([
    "saved",
    "applied",
    "interview",
    "rejected",
    "accepted"
]);

// Schema per creare una candidatura
const createApplicationSchema = z.object({
    company: z.string()
        .trim()
        .min(1, "Company is required"),

    position: z.string()
        .trim()
        .min(1, "Position is required"),

    status: applicationStatus.optional()
}).strict();

// Schema per aggiornare una candidatura
const updateApplicationSchema = z.object({
    company: z.string()
        .trim()
        .min(1, "Company cannot be empty")
        .optional(),

    position: z.string()
        .trim()
        .min(1, "Position cannot be empty")
        .optional(),

    status: applicationStatus.optional()
})
.strict()
.refine(
    data => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided"
    }
);

const listApplicationsSchema = z.object({
    status: applicationStatus.optional(),

    company: z.string()
        .trim()
        .min(1, "Company search cannot be empty")
        .optional(),

    page: z.coerce.number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .default(1),

    limit: z.coerce.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10)
}).strict();

module.exports = {
    createApplicationSchema,
    updateApplicationSchema,
    listApplicationsSchema
};
