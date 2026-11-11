
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const {
    addApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("./services/applicationService");

const rl = readline.createInterface({ input, output });

async function showMenu() {
    console.log("\n========== WORKPILOT ==========");
    console.log("1. Aggiungi candidatura");
    console.log("2. Visualizza tutte le candidature");
    console.log("3. Cerca candidatura per ID");
    console.log("4. Modifica stato candidatura");
    console.log("5. Elimina candidatura");
    console.log("0. Esci");
    console.log("===============================");
}

async function addNewApplication() {
    const company = await rl.question("Nome azienda: ");
    const position = await rl.question("Posizione lavorativa: ");

    try {
        const application = addApplication(company, position);

        console.log("\nCandidatura aggiunta!");
        console.log(`ID: ${application.id}`);
        console.log(`Azienda: ${application.company}`);
        console.log(`Posizione: ${application.position}`);
        console.log(`Stato: ${application.status}`);
    } catch (error) {
        console.log("Errore:", error.message);
    }
}

function showApplications() {
    const applications = getAllApplications();

    if (applications.length === 0) {
        console.log("\nNon ci sono candidature registrate.");
        return;
    }

    console.log("\n========== CANDIDATURE ==========");

    applications.forEach((application, index) => {
        console.log(`\n${index + 1}. ${application.company}`);
        console.log(`   Posizione: ${application.position}`);
        console.log(`   Stato: ${application.status}`);
        console.log(`   ID: ${application.id}`);
    });
}

async function searchApplication() {
    const id = await rl.question("Inserisci l'ID della candidatura: ");
    const application = getApplicationById(id);

    if (!application) {
        console.log("\nCandidatura non trovata.");
        return;
    }

    console.log("\nCandidatura trovata:");
    console.log(application);
}

async function changeApplicationStatus() {
    const id = await rl.question("ID della candidatura: ");

    const application = getApplicationById(id);

    if (!application) {
        console.log("\nCandidatura non trovata.");
        return;
    }

    console.log("\nStati disponibili:");
    console.log("saved, applied, interview, rejected, accepted");

    const status = await rl.question("Nuovo stato: ");

    try {
        const updated = updateApplication(id, { status });

        console.log("\nStato aggiornato:", updated.status);
    } catch (error) {
        console.log("Errore:", error.message);
    }
}

async function removeApplication() {
    const id = await rl.question("ID della candidatura da eliminare: ");

    const deleted = deleteApplication(id);

    if (deleted) {
        console.log("\nCandidatura eliminata correttamente.");
    } else {
        console.log("\nCandidatura non trovata.");
    }
}

async function main() {
    let running = true;

    console.log("Benvenuto in WorkPilot!");

    while (running) {
        await showMenu();

        const choice = await rl.question("Seleziona un'opzione: ");

        switch (choice) {
            case "1":
                await addNewApplication();
                break;

            case "2":
                showApplications();
                break;

            case "3":
                await searchApplication();
                break;

            case "4":
                await changeApplicationStatus();
                break;

            case "5":
                await removeApplication();
                break;

            case "0":
                running = false;
                console.log("\nChiusura di WorkPilot...");
                break;

            default:
                console.log("\nOpzione non valida.");
        }
    }

    rl.close();
}

main().catch(error => {
    console.error("Errore imprevisto:", error);
    rl.close();
});
