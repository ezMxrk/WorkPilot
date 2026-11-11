const createApplication = require("../models/application");

const applications = [];

function addApplication(company, position, status = "applied") {
    const application = createApplication(company, position, status);

    applications.push(application);

    return application;
}

function getAllApplications() {
    return [...applications];
}

function getApplicationById(id) {
    return applications.find(application => application.id === id) || null;
}

function updateApplication(id, updates) {
    const application = getApplicationById(id);

    if (!application) {
        return null;
    }

    const updatedData = createApplication(
        updates.company ?? application.company,
        updates.position ?? application.position,
        updates.status ?? application.status
    );

    application.company = updatedData.company;
    application.position = updatedData.position;
    application.status = updatedData.status;

    return application;
}

function deleteApplication(id) {
    const index = applications.findIndex(
        application => application.id === id
    );

    if (index === -1) {
        return false;
    }

    applications.splice(index, 1);

    return true;
}

module.exports = {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
};