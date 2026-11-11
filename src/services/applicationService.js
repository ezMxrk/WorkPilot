
const fs = require("node:fs");
const path = require("node:path");

const createApplication = require("../models/application");

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "applications.json");

function loadApplications() {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]", "utf8");
    }

    const data = fs.readFileSync(DATA_FILE, "utf8");

    try {
        const parsedData = JSON.parse(data);

        if (!Array.isArray(parsedData)) {
            throw new Error("Invalid applications data format");
        }

        return parsedData;
    } catch (error) {
        throw new Error(
            `Unable to load applications: ${error.message}`
        );
    }
}

let applications = loadApplications();

function saveApplications() {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(applications, null, 4),
        "utf8"
    );
}

function addApplication(company, position, status = "applied") {
    const application = createApplication(company, position, status);

    applications.push(application);
    saveApplications();

    return application;
}

function getAllApplications() {
    return [...applications];
}

function getApplicationById(id) {
    return applications.find(
        application => application.id === id
    ) || null;
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

    saveApplications();

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
    saveApplications();

    return true;
}

module.exports = {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
};
