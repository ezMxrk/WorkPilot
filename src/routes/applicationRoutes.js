
const express = require("express");

const router = express.Router();

// Controllers
const {
    getApplications,
    getApplication,
    createApplication,
    editApplication,
    removeApplication
} = require("../controllers/applicationController");

// Middlewares
const validateRequest = require("../middleware/validateRequest");
const validateQuery = require("../middleware/validateQuery");

// Validators
const {
    createApplicationSchema,
    updateApplicationSchema,
    listApplicationsSchema
} = require("../validators/applicationValidator");

// GET: tutte le candidature con filtri e paginazione
router.get(
    "/",
    validateQuery(listApplicationsSchema),
    getApplications
);

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
