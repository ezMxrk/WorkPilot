
const express = require("express");

const router = express.Router();

const {
    getApplications,
    getApplication,
    createApplication,
    editApplication,
    removeApplication
} = require("../controllers/applicationController");

const validateRequest = require("../middleware/validateRequest");

const {
    createApplicationSchema,
    updateApplicationSchema
} = require("../validators/applicationValidator");

// GET: tutte le candidature
router.get("/", getApplications);

// POST: nuova candidatura
router.post(
    "/",
    validateRequest(createApplicationSchema),
    createApplication
);

// GET: candidatura tramite ID
router.get("/:id", getApplication);

// PUT: aggiornamento candidatura
router.put(
    "/:id",
    validateRequest(updateApplicationSchema),
    editApplication
);

// DELETE: eliminazione candidatura
router.delete("/:id", removeApplication);

module.exports = router;
