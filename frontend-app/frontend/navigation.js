import { GetPatients, AddPatient, UpdatePatient, DeletePatient,
         GetMedecins, AddMedecin, UpdateMedecin, DeleteMedecin,
         GetRendezVous, AddRendezVous, UpdateRendezVous, DeleteRendezVous,
         GetDashboardStats } from './wailsjs/go/main/App.js';

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-menu a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');

            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('page-' + targetPage).classList.add('active');

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            if (targetPage === 'patients') loadPatients();
            if (targetPage === 'medecins') loadMedecins();
            if (targetPage === 'rendez-vous') loadRendezVous();
            if (targetPage === 'dashboard') loadDashboard();
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                overlay.classList.remove('active');
            }
        });
    });

    // ---------- Formulaire Ajouter Patient ----------
    document.getElementById('form-add-patient').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await AddPatient(
            document.getElementById('patient-nom').value,
            document.getElementById('patient-prenom').value,
            document.getElementById('patient-sexe').value,
            document.getElementById('patient-tel').value,
            document.getElementById('date_Naiss_patient').value,
            document.getElementById('adresse_patient').value,
            document.getElementById('motif_patient').value
        );
        if (result === 'ok') {
            closeModal('modal-overlay-patient');
            e.target.reset();
            loadPatients();
        } else {
            alert(result);
        }
    });

    // ---------- Formulaire Ajouter Médecin ----------
    document.getElementById('form-add-medecin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await AddMedecin(
            document.getElementById('mat-medecin').value,
            document.getElementById('medecin-nom').value,
            document.getElementById('medecin-prenom').value,
            document.getElementById('medecin-specialite').value,
            document.getElementById('medecin-telephone').value,
            document.getElementById('medecin-email').value
        );
        if (result === 'ok') {
            closeModal('modal-overlay-medecin');
            e.target.reset();
            loadMedecins();
        } else {
            alert(result);
        }
    });

    // ---------- Formulaire Ajouter Rendez-vous ----------
    document.getElementById('form-add-rdv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await AddRendezVous(
            document.getElementById('rdv-patient-nom').value,
            document.getElementById('rdv-medecin-nom').value,
            document.getElementById('rdv-motif').value,
            document.getElementById('rdv-date').value,
            document.getElementById('rdv-heure').value
        );
        if (result === 'ok') {
            closeModal('modal-overlay-rdv');
            e.target.reset();
            loadRendezVous();
        } else {
            alert(result);
        }
    });

    // ---------- Formulaire Modifier Patient ----------
    document.getElementById('form-modif-patient').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await UpdatePatient(
            currentEditPatientId,
            document.getElementById('modif-patient-nom').value,
            document.getElementById('modif-patient-prenom').value,
            document.getElementById('modif-patient-sexe').value,
            document.getElementById('modif-patient-tel').value,
            document.getElementById('modif-date-naiss-patient').value,
            document.getElementById('modif-adresse-patient').value,
            document.getElementById('modif-motif-patient').value
        );
        if (result === 'ok') {
            closeModal('modal-overlay-modif-patient');
            loadPatients();
        } else {
            alert(result);
        }
    });

    document.getElementById('form-modif-medecin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await UpdateMedecin(
        currentEditMedecinMatricule,
        document.getElementById('modif-medecin-nom').value,
        document.getElementById('modif-medecin-prenom').value,
        document.getElementById('modif-medecin-specialite').value,
        document.getElementById('modif-medecin-tel').value,
        document.getElementById('modif-email-medecin').value
    );
    if (result === 'ok') {
        closeModal('modal-overlay-modif-medecin');
        loadMedecins();
    } else {
        alert(result);
    }
});

document.getElementById('form-modif-rdv').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await UpdateRendezVous(
        currentEditRdvId,
        document.getElementById('modif-rdv-patient-nom').value,
        document.getElementById('modif-rdv-medecin-nom').value,
        document.getElementById('modif-motif-rdv').value,
        document.getElementById('modif-rdv-date').value,
        document.getElementById('modif-heure-rdv').value
    );
    if (result === 'ok') {
        closeModal('modal-overlay-modif-rdv');
        loadRendezVous();
    } else {
        alert(result);
    }
});

    loadPatients();
    loadMedecins();
    loadRendezVous();
    loadDashboard();
    updateTopbarDate();
});

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.openModal = openModal;
window.closeModal = closeModal;

// ----AFFICHER LES PROFILS-----
function showProfile(type) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-' + type).classList.add('active');
}

window.showProfile = showProfile;
function showPatientProfile(patient) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-patient').classList.add('active');

    const card = document.querySelector('#page-profil-patient .profile-card');
    card.querySelector('.profile-avatar').textContent = patient.nom.charAt(0);
    card.querySelector('.profile-title h2').textContent = patient.nom;

    const details = card.querySelectorAll('.detail-value');
    details[0].textContent = patient.prenom;
    details[1].textContent = patient.sexe;
    details[2].textContent = patient.date_naissance;
    details[3].textContent = patient.telephone;
    details[4].textContent = patient.adresse;
    details[5].textContent = patient.motif;
}

window.showPatientProfile = showPatientProfile;

function showMedecinProfile(medecin) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-medecin').classList.add('active');

    const card = document.querySelector('#page-profil-medecin .profile-card');
    card.querySelector('.profile-avatar').textContent = medecin.nom.charAt(0);
    card.querySelector('.profile-title h2').textContent = 'Dr. ' + medecin.nom;

    const details = card.querySelectorAll('.detail-value');
    details[0].textContent = medecin.matricule;
    details[1].textContent = medecin.prenom;
    details[2].textContent = medecin.specialite;
    details[3].textContent = medecin.telephone;
    details[4].textContent = medecin.email;
}

window.showMedecinProfile = showMedecinProfile;

function showRdvProfile(rdv) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-rdv').classList.add('active');

    const card = document.querySelector('#page-profil-rdv .profile-card');
    card.querySelector('.profile-title h2').textContent = rdv.patient_nom + ' — ' + rdv.medecin_nom;

    const badge = card.querySelector('.profile-header .badge');
    const badgeClass = {
        'Confirmé': 'badge-confirme',
        'En attente': 'badge-attente',
        'Annulé': 'badge-annule'
    };
    badge.className = 'badge ' + (badgeClass[rdv.statut] || '');
    badge.textContent = rdv.statut;

    const details = card.querySelectorAll('.detail-value');
    details[0].textContent = rdv.patient_nom;
    details[1].textContent = rdv.medecin_nom;
    details[2].textContent = rdv.date;
    details[3].textContent = rdv.heure;
    details[4].textContent = rdv.motif;
    details[5].textContent = rdv.statut;
}

window.showRdvProfile = showRdvProfile;

function navigateBack(targetPage) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + targetPage).classList.add('active');
    document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${targetPage}"]`).classList.add('active');
}

window.showProfile = showProfile;
window.navigateBack = navigateBack;

// ---------- CHARGEMENT DES LISTES ----------

async function loadPatients() {
    const patients = await GetPatients();
    const container = document.querySelector('.patients-list');
    document.querySelectorAll('.patient-row').forEach(row => row.remove());

    patients.forEach(p => {
        const row = document.createElement('div');
        row.className = 'patient-row';
        row.innerHTML = `
            <span class="patient-name col-name">${p.nom}</span>
            <span class="patient-specialty col-specialty">${p.motif}</span>
            <div class="patient-actions col-actions">
                <button class="btn-modify" onclick='openEditPatient(${JSON.stringify(p)})'>Modifier</button>
                <button class="btn-view" onclick='showPatientProfile(${JSON.stringify(p)})'>Voir</button>
                <button class="btn-delete" onclick="deletePatientHandler(${p.id})">Supprimer</button>
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
                <button class="btn-modify" onclick='openEditMedecin(${JSON.stringify(m)})'>Modifier</button>
                <button class="btn-view" onclick='showMedecinProfile(${JSON.stringify(m)})'>Voir</button>
                <button class="btn-delete" onclick="deleteMedecinHandler('${m.matricule}')">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}

async function loadRendezVous() {
    const rdvs = await GetRendezVous();
    const container = document.querySelector('.rdv-list');
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
                <button class="btn-modify" onclick='openEditRdv(${JSON.stringify(r)})'>Modifier</button>
                <button class="btn-view" onclick='showRdvProfile(${JSON.stringify(r)})'>Voir</button>
                <button class="btn-delete" onclick="deleteRdvHandler(${r.id})">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}
async function loadDashboard() {
    const stats = await GetDashboardStats();
    document.getElementById('total-patients').textContent = stats.total_patients;
    document.getElementById('total-medecins').textContent = stats.total_medecins;
    document.getElementById('total-rdv-jour').textContent = stats.total_rdv;
    document.getElementById('total-rdv-program').textContent = stats.rdv_en_attente;
    document.getElementById('total-consultation-attente').textContent = stats.rdv_en_attente;
}

// ---------- SUPPRESSION ----------

async function deletePatientHandler(id) {
    if (confirm('Supprimer ce patient ?')) {
        await DeletePatient(id);
        loadPatients();
    }
}

async function deleteMedecinHandler(matricule) {
    if (confirm('Supprimer ce médecin ?')) {
        await DeleteMedecin(matricule);
        loadMedecins();
    }
}

async function deleteRdvHandler(id) {
    if (confirm('Supprimer ce rendez-vous ?')) {
        await DeleteRendezVous(id);
        loadRendezVous();
    }
}

window.deletePatientHandler = deletePatientHandler;
window.deleteMedecinHandler = deleteMedecinHandler;
window.deleteRdvHandler = deleteRdvHandler;

// ---------- MODIFIER PATIENT ----------

let currentEditPatientId = null;

function openEditPatient(patient) {
    currentEditPatientId = patient.id;
    document.getElementById('modif-patient-nom').value = patient.nom;
    document.getElementById('modif-patient-prenom').value = patient.prenom;
    document.getElementById('modif-patient-sexe').value = patient.sexe;
    document.getElementById('modif-patient-tel').value = patient.telephone;
    document.getElementById('modif-date-naiss-patient').value = patient.date_naissance;
    document.getElementById('modif-adresse-patient').value = patient.adresse;
    document.getElementById('modif-motif-patient').value = patient.motif;
    openModal('modal-overlay-modif-patient');
}

window.openEditPatient = openEditPatient;

let currentEditMedecinMatricule = null;

function openEditMedecin(medecin) {
    currentEditMedecinMatricule = medecin.matricule;
    document.getElementById('modif-medecin-nom').value = medecin.nom;
    document.getElementById('modif-medecin-prenom').value = medecin.prenom;
    document.getElementById('modif-medecin-specialite').value = medecin.specialite;
    document.getElementById('modif-medecin-tel').value = medecin.telephone;
    document.getElementById('modif-email-medecin').value = medecin.email;
    openModal('modal-overlay-modif-medecin');
}

window.openEditMedecin = openEditMedecin;

let currentEditRdvId = null;

function openEditRdv(rdv) {
    currentEditRdvId = rdv.id;
    document.getElementById('modif-rdv-patient-nom').value = rdv.patient_nom;
    document.getElementById('modif-rdv-medecin-nom').value = rdv.medecin_nom;
    document.getElementById('modif-motif-rdv').value = rdv.motif;
    document.getElementById('modif-rdv-date').value = rdv.date;
    document.getElementById('modif-heure-rdv').value = rdv.heure;
    openModal('modal-overlay-modif-rdv');
}

window.openEditRdv = openEditRdv;

//---Gerer la date du Tableau de bord-----

function updateTopbarDate() {
    const dateElement = document.querySelector('.topbar-date');
    if (!dateElement) return;
    
    const now = new Date();
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
   
    const jourSemaine = jours[now.getDay()];
    const jour = now.getDate();
    const moisNom = mois[now.getMonth()];
    const annee = now.getFullYear();
    
    dateElement.textContent = `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}

