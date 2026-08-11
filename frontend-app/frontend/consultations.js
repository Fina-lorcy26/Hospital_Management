// GESTION DES CONSULTATIONS

import { GetConsultationsByMedecin, GetToutesLesConsultations, DeleteConsultation, TerminerRendezVous,
         UpdateRendezVousStatut, UpdateConsultation } from './wailsjs/go/main/App.js';
import { openModal, closeModal } from './modal-utils.js';
import { loadMesRdv, loadRendezVous } from './rendezvous.js';
import { loadDashboard } from './dashboard.js';
import { MEDECIN_MAT_ACTUEL } from './state.js';

// charge les consultations déja éffectuées
let CONSULTATIONS_ACTUELLES = [];
let CONSULTATIONS_ADMIN = [];
let origineConsultation = null;

export async function loadConsultationsEffectuees() {
    const all = await GetConsultationsByMedecin(MEDECIN_MAT_ACTUEL);
    CONSULTATIONS_ACTUELLES = all;
    renderConsultationsEffectuees(all);
    setupConsultationsEffectueesSearch();
}

function renderConsultationsEffectuees(consultations) {
    const container = document.getElementById('consultations-effectuees-list-body');
    if (!container) return;
    container.innerHTML = '';
    if (consultations.length === 0) {
        container.innerHTML = '<div class="no-results">Aucune consultation trouvée.</div>';
        return;
    }

    consultations.forEach(c => {
        const row = document.createElement('div');
        row.className = 'consultation-row';
        row.innerHTML = `
            <span class="col-patient">${c.patient_nom}</span>
            <span class="col-date">${c.date_consultation}</span>
           <div class="consult-actions col-actions">
                    <button class="btn-view" onclick="showConsultationDetailById(${c.id})">Voir </button>
                    <button class="btn-modify" onclick="editConsultationHandler(${c.id})"> Modifier </button>
                    <button class="btn-delete" onclick="deleteConsultationHandler(${c.id}, ${c.rdv_id})"> Supprimer </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function setupConsultationsEffectueesSearch() {
    const searchInput = document.getElementById('consultations-effectuees-search');
    if (!searchInput || searchInput.dataset.bound) return;
    searchInput.dataset.bound = 'true';

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = CONSULTATIONS_ACTUELLES.filter(c =>
            (c.patient_nom || '').toLowerCase().includes(q) ||
            (c.date_consultation || '').toLowerCase().includes(q)
        );
        renderConsultationsEffectuees(filtered);
    });
}

function showConsultationDetailById(id) {
    const c = CONSULTATIONS_ACTUELLES.find(item => item.id === id);
    if (c) {
        origineConsultation = 'consultations-effectuees';
        showConsultationDetail(c);
    }
}
window.showConsultationDetailById = showConsultationDetailById;

// Modifier une consultation 
function editConsultationHandler(id) {
    const c = CONSULTATIONS_ACTUELLES.find(item => item.id === id);
    if (!c) {
        alert('Consultation introuvable.');
        return;
    }
    document.getElementById('modifier-consultation-id').value = c.id;
    document.getElementById('modifier-diagnostic').value = c.diagnostic || '';
    document.getElementById('modifier-traitement').value = c.traitement || '';
    document.getElementById('modifier-observation').value = c.observation || '';

    openModal('modal-overlay-modifier-consultation');
}
window.editConsultationHandler = editConsultationHandler;

// enregistrement de la consultation modifiée
document.getElementById('form-modifier-consultation').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('modifier-consultation-id').value);
    const diagnostic = document.getElementById('modifier-diagnostic').value.trim();
    const traitement = document.getElementById('modifier-traitement').value.trim();
    const observation = document.getElementById('modifier-observation').value.trim();
    if (!diagnostic) {
        alert('Le diagnostic est obligatoire.');
        return;
    }
    try {
        const result = await UpdateConsultation(
            id, diagnostic, traitement, observation
        );
        if (result === 'ok') {
            closeModal('modal-overlay-modifier-consultation');
            await loadConsultationsEffectuees();
            await loadDashboard();
            alert('Consultation modifiée avec succès.');
        } else {
            alert(result);
        }
    } catch (err) {
        alert('Erreur lors de la modification : ' + err);
    }
});

async function deleteConsultationHandler(id, rdvId) {
    if (confirm('Supprimer cette consultation ? Le rendez-vous redeviendra "Confirmé" pour permettre une nouvelle saisie.')) {
        const result = await DeleteConsultation(id);
        if (result === 'ok') {
            await UpdateRendezVousStatut(rdvId, 'Confirmé');
            loadConsultationsEffectuees();
            loadMesRdv();
            loadDashboard();
        } else {
            alert(result);
        }
    }
}
window.deleteConsultationHandler = deleteConsultationHandler;

// Fonction pour avoir le compte rendu d'une consultation(voir)
function showConsultationDetail(c) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-consultation').classList.add('active');
    document.getElementById('consult-detail-patient').textContent = c.patient_nom;
    document.getElementById('consult-detail-date-rdv').textContent = c.date_rdv;
    document.getElementById('consult-detail-diagnostic').textContent = c.diagnostic;
    document.getElementById('consult-detail-traitement').textContent = c.traitement;
    document.getElementById('consult-detail-observation').textContent = c.observation;
    document.getElementById('consult-detail-medecin').textContent = c.medecin_nom;
}
window.showConsultationDetail = showConsultationDetail;
window.ouvrirModalTerminer = function(rdvId) {
  document.getElementById('terminer-rdv-id').value = rdvId;
  openModal('modal-overlay-terminer');
};
window.fermerModalTerminer = function() {
  closeModal('modal-overlay-terminer');
  document.getElementById('form-terminer').reset();
};
document.getElementById('form-terminer').addEventListener('submit', async function(e) {
  e.preventDefault();
  const rdvId = parseInt(document.getElementById('terminer-rdv-id').value);
  const diagnostic = document.getElementById('terminer-diagnostic').value.trim();
  const traitement = document.getElementById('terminer-traitement').value.trim();
  const observation = document.getElementById('terminer-observation').value.trim();

  if (!diagnostic) {
    alert('Le diagnostic est obligatoire.');
    return;
  }
  try {
    await TerminerRendezVous(rdvId, diagnostic, traitement, observation);
    window.fermerModalTerminer();
    await loadMesRdv();
    await loadRendezVous();
    await loadDashboard();
  } catch (err) {
    alert('Erreur lors de la clôture du rdv : ' + err);
  }
});


//Consultations de tous les medecins pour l'admin
export async function loadConsultationsAdmin() {
    const all = await GetToutesLesConsultations();
    CONSULTATIONS_ADMIN = all;
    renderConsultationsAdmin(all);
    setupConsultationsSearch();
}
function renderConsultationsAdmin(consultations) {
    const container = document.getElementById('consultations-list-body');
    if (!container) return;
    container.innerHTML = '';
    if (consultations.length === 0) {
        container.innerHTML = '<div class="no-results">Aucune consultation trouvée.</div>';
        return;
    }
    consultations.forEach(c => {
        const row = document.createElement('div');
        row.className = 'consultation-row';
        row.innerHTML = `
            <span class="col-patient">${c.patient_nom}</span>
            <span class="col-medecin">${c.medecin_nom}</span>
            <span class="col-date">${c.date_consultation}</span>
            <div class="consult-actions col-actions">
                <button class="btn-view" onclick="showConsultationDetailByIdAdmin(${c.id})">
                    Voir
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function setupConsultationsSearch() {
    const searchInput = document.getElementById('consultations-search');
    if (!searchInput || searchInput.dataset.bound) return;
    searchInput.dataset.bound = 'true';

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = CONSULTATIONS_ADMIN.filter(c =>
            (c.patient_nom || '').toLowerCase().includes(q) ||
            (c.medecin_nom || '').toLowerCase().includes(q) ||
            (c.date_consultation || '').toLowerCase().includes(q)
        );
        renderConsultationsAdmin(filtered);
    });
}

// Le voir de l'admin 
function showConsultationDetailByIdAdmin(id) {
    const c = CONSULTATIONS_ADMIN.find(item => item.id === id);
    if (c) {
        origineConsultation = 'consultations';
        showConsultationDetail(c);
    }
}
window.showConsultationDetailByIdAdmin = showConsultationDetailByIdAdmin;
window.retourConsultation = function () {
    if (origineConsultation) {
        goToPage(origineConsultation);
    } else {
        goToPage('dashboard');
    }
};;