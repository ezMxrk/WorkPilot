
const express = require("express");

const router = express.Router();

const {
    getApplications,
    getApplication,
    createApplication,
    editApplication,
    removeApplication
} = require("../controllers/applicationController");

// GET: tutte le candidature
router.get("/", getApplications);

// POST: nuova candidatura
router.post("/", createApplication);

// GET: candidatura tramite ID
router.get("/:id", getApplication);

// PUT: aggiornamento candidatura
router.put("/:id", editApplication);

// DELETE: eliminazione candidatura
router.delete("/:id", removeApplication);

module.exports = router;
