// ============================================
// GESTION DES CONSULTATIONS
// ============================================
import { GetConsultationsByMedecin, DeleteConsultation, TerminerRendezVous,
         UpdateRendezVousStatut } from './wailsjs/go/main/App.js';
import { openModal, closeModal } from './modal-utils.js';
import { loadMesRdv, loadRendezVous } from './rendezvous.js';
import { loadDashboard } from './dashboard.js';
import { MEDECIN_MAT_ACTUEL } from './state.js';

// charge les consultations déja éffectuées
let CONSULTATIONS_ACTUELLES = [];

export async function loadConsultationsEffectuees() {
    const all = await GetConsultationsByMedecin(MEDECIN_MAT_ACTUEL);
    CONSULTATIONS_ACTUELLES = all;

    const container = document.getElementById('consultations-effectuees-list-body');
    if (!container) return;
    container.innerHTML = '';

    all.forEach(c => {
        const row = document.createElement('div');
        row.className = 'consultation-row';
        row.innerHTML = `
            <span class="col-patient">${c.patient_nom}</span>
            <span class="col-date">${c.date_consultation}</span>
            <div class="col-actions">
                <button class="btn-view" onclick="showConsultationDetailById(${c.id})">Voir</button>
                <button class="btn-delete" onclick="deleteConsultationHandler(${c.id}, ${c.rdv_id})">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}

function showConsultationDetailById(id) {
    const c = CONSULTATIONS_ACTUELLES.find(item => item.id === id);
    if (c) showConsultationDetail(c);
}
window.showConsultationDetailById = showConsultationDetailById;

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
