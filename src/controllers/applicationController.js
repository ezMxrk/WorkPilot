
const {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../services/applicationService");

// GET: recupera tutte le candidature
function getApplications(req, res) {
    const applications = getAllApplications();

    res.status(200).json(applications);
}

// GET: recupera una candidatura tramite ID
function getApplication(req, res) {
    const application = getApplicationById(req.params.id);

    if (!application) {
        return res.status(404).json({
            error: "Application not found"
        });
    }

    res.status(200).json(application);
}

// POST: crea una nuova candidatura
function createApplication(req, res) {
    try {
        const { company, position, status } = req.body;

        const application = addApplication(
            company,
            position,
            status
        );

        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

// PUT: aggiorna una candidatura
function editApplication(req, res) {
    try {
        const application = updateApplication(
            req.params.id,
            req.body
        );

        if (!application) {
            return res.status(404).json({
                error: "Application not found"
            });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

// DELETE: elimina una candidatura
function removeApplication(req, res) {
    const deleted = deleteApplication(req.params.id);

    if (!deleted) {
        return res.status(404).json({
            error: "Application not found"
        });
    }

    res.status(200).json({
        message: "Application deleted successfully"
    });
}

module.exports = {
    getApplications,
    getApplication,
    createApplication,
    editApplication,
    removeApplication
};
