// GESTION DES PATIENTS

import { GetPatients, AddPatient, UpdatePatient, DeletePatient } from './wailsjs/go/main/App.js';
import { openModal, closeModal } from './modal-utils.js';

// ---------- CHARGEMENT DES LISTES ----------
//recupere les patients
let allPatients = [];

export async function loadPatients() {
    allPatients = await GetPatients();
    renderPatients(allPatients);
    setupPatientsSearch();
}

function renderPatients(patients) {
    const container = document.getElementById('patients-list-body');
    if (!container) return;
    container.innerHTML = '';

    if (patients.length === 0) {
        container.innerHTML = '<div class="no-results">Aucun patient trouvé.</div>';
        return;
    }

    patients.forEach(p => {
        const row = document.createElement('div');
        row.className = 'patient-row';
        row.innerHTML = `
            <span class="patient-name col-name">${p.nom} ${p.prenom}</span>
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

function setupPatientsSearch() {
    const searchInput = document.getElementById('patients-search');
    if (!searchInput || searchInput.dataset.bound) return; // évite les doublons d'écouteur
    searchInput.dataset.bound = 'true';

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = allPatients.filter(p =>
            `${p.nom} ${p.prenom}`.toLowerCase().includes(q) ||
            (p.telephone || '').toLowerCase().includes(q)
        );
        renderPatients(filtered);
    });
}

//Fonction pour le select patient dans rendez-vous
export async function remplirListePatients(selectId) {
    const patients = await GetPatients();
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";
    patients.forEach(patient => {
        const option = document.createElement("option");
        option.value = patient.id; // Stocke l'ID unique
        option.textContent = `${patient.nom} ${patient.prenom}`;
        select.appendChild(option);
    });
}

// ---------- SUPPRESSION ----------

async function deletePatientHandler(id) {
    if (confirm('Supprimer ce patient ?')) {
        const result = await DeletePatient(id);
        if (result === 'ok') {
            loadPatients();
        } else {
            alert(result);
        }
    }
}
window.deletePatientHandler = deletePatientHandler;

// ---------- MODIFIER PATIENT ----------

let currentEditPatientId = null;
//injection des données existantes pour la modification
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

// ----AFFICHER LE PROFIL PATIENT-----

function showPatientProfile(patient) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-patient').classList.add('active');

    //La petite carte au dessus avec avatar et nom dans "voir"
    const card = document.querySelector('#page-profil-patient .profile-card');
    card.querySelector('.profile-avatar').textContent = patient.nom.charAt(0);
    card.querySelector('.profile-title h2').textContent = patient.nom;

// Remplissage de la fiche
    document.getElementById('profil-patient-prenom').textContent = patient.prenom;
    document.getElementById('profil-patient-sexe').textContent = patient.sexe;
    document.getElementById('profil-patient-date-naiss').textContent = patient.date_naissance;
    document.getElementById('profil-patient-tel').textContent = patient.telephone;
    document.getElementById('profil-patient-adresse').textContent = patient.adresse;
    document.getElementById('profil-patient-motif').textContent = patient.motif;
}
window.showPatientProfile = showPatientProfile;

// ---------- FORMULAIRES ----------
document.addEventListener('DOMContentLoaded', () => {
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
});
