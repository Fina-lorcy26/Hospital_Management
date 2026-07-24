import { GetPatients, GetMedecins, GetRendezVous } from './wailsjs/go/main/App.js';

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-menu a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById('page-' + targetPage).classList.add('active');
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                overlay.classList.remove('active');
            }
        });
    });
});

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.openModal = openModal;
window.closeModal = closeModal;

function showProfile(type) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-profil-' + type).classList.add('active');
}

function navigateBack(targetPage) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-' + targetPage).classList.add('active');
    document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${targetPage}"]`).classList.add('active');
}

window.showProfile = showProfile;
window.navigateBack = navigateBack;

async function loadPatients() {
    const patients = await GetPatients();
    const container = document.querySelector('.patients-list');
    document.querySelectorAll('.patient-row').forEach(row => row.remove());
    patients.forEach(p => {
        const row = document.createElement('div');
        row.className = 'patient-row';
        row.innerHTML = `
            <span class="patient-name col-name">${p.nom}</span>
            <span class="patient-specialty col-specialty">${p.specialite}</span>
            <div class="patient-actions col-actions">
                <button class="btn-modify" onclick="openModal('modal-overlay-modif-patient')">Modifier</button>
                <button class="btn-view" onclick="showProfile('patient')">Voir</button>
                <button class="btn-delete">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}

async function loadMedecins() {
    const medecins = await GetMedecins();
    const container = document.querySelector('.medecins-list');
    document.querySelectorAll('.medecins-row').forEach(row => row.remove());
    medecins.forEach(m => {
        const row = document.createElement('div');
        row.className = 'medecins-row';
        row.innerHTML = `
            <span class="medecins-name col-name">${m.nom}</span>
            <span class="medecins-specialty col-specialty">${m.specialite}</span>
            <div class="medecins-actions col-actions">
                <button class="btn-modify" onclick="openModal('modal-overlay-modif-medecin')">Modifier</button>
                <button class="btn-view" onclick="showProfile('medecin')">Voir</button>
                <button class="btn-delete">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}

async function loadRendezVous() {
    const rdvs = await GetRendezVous();

    console.log("RENDEZ-VOUS RECUS :", rdvs);
    const container = document.querySelector('.rdv-list');
    console.log("CONTENEUR RDV :", container);
    document.querySelectorAll('.rdv-row').forEach(row => row.remove());
    const badgeClass = {
        'Confirmé': 'badge-confirme',
        'En attente': 'badge-attente',
        'Annulé': 'badge-annule'
    };
    rdvs.forEach(r => {
        const row = document.createElement('div');
        row.className = 'rdv-row';
        row.innerHTML = `
            <span class="col-patient">${r.patient_nom}</span>
            <span class="col-medecin">${r.medecin_nom}</span>
            <span class="col-date">${r.date}</span>
            <span class="col-heure">${r.heure}</span>
            <span class="col-statut">
                <span class="badge ${badgeClass[r.statut] || ''}">${r.statut}</span>
            </span>
            <div class="col-actions rdv-actions">
                <button class="btn-modify" onclick="openModal('modal-overlay-modif-rdv')">Modifier</button>
                <button class="btn-view" onclick="showProfile('rdv')">Voir</button>
                <button class="btn-delete">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}

loadPatients().catch(error => {
    console.error("Erreur lors du chargement des patients :", error);
});

loadMedecins().catch(error => {
    console.error("Erreur lors du chargement des médecins :", error);
});

loadRendezVous().catch(error => {
    console.error("Erreur lors du chargement des rendez-vous :", error);
});