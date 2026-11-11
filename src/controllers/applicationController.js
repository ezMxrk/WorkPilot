
const {
    addApplication,
    getAllApplications,
    listApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../services/applicationService");

// GET: recupera tutte le candidature
function getApplications(req, res, next) {
    try {
        const filters = res.locals.validatedQuery;

        const result = listApplications(filters);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

// GET: recupera una candidatura tramite ID
function getApplication(req, res, next) {
    try {
        const application = getApplicationById(req.params.id);

        if (!application) {
            const error = new Error("Application not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(application);
    } catch (error) {
        next(error);
    }
}

// POST: crea una nuova candidatura
function createApplication(req, res, next) {
    try {
        const { company, position, status } = req.body;

        const application = addApplication(
            company,
            position,
            status
        );

        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
}

// PUT: aggiorna una candidatura
function editApplication(req, res, next) {
    try {
        const application = updateApplication(
            req.params.id,
            req.body
        );

        if (!application) {
            const error = new Error("Application not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(application);
    } catch (error) {
        next(error);
    }
}

// DELETE: elimina una candidatura
function removeApplication(req, res, next) {
    try {
        const deleted = deleteApplication(req.params.id);

        if (!deleted) {
            const error = new Error("Application not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "Application deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getApplications,
    getApplication,
    createApplication,
    editApplication,
    removeApplication
};
