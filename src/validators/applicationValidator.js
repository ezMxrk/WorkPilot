
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

module.exports = {
    createApplicationSchema,
    updateApplicationSchema
};
