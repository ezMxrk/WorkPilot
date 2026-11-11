
const {
    addApplication,
    listApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../services/applicationService");

// GET: recupera tutte le candidature con filtri e paginazione
async function getApplications(req, res, next) {
    try {
        const filters = res.locals.validatedQuery;

        const result = await listApplications(filters);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

// GET: recupera una candidatura tramite ID
async function getApplication(req, res, next) {
    try {
        const application = await getApplicationById(req.params.id);

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
async function createApplication(req, res, next) {
    try {
        const { company, position, status } = req.body;

        const application = await addApplication(
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
async function editApplication(req, res, next) {
    try {
        const application = await updateApplication(
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
async function removeApplication(req, res, next) {
    try {
        const deleted = await deleteApplication(req.params.id);

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
