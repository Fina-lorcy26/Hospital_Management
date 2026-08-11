// GESTION DES RENDEZ-VOUS

import { GetRendezVous, AddRendezVous, UpdateRendezVous, DeleteRendezVous,
         UpdateRendezVousStatut, AnnulerRendezVous } from './wailsjs/go/main/App.js';
import { openModal, closeModal } from './modal-utils.js';
import { remplirListePatients } from './patients.js';
import { remplirListeMedecins } from './medecins.js';
import { loadDashboard } from './dashboard.js';
import { MEDECIN_MAT_ACTUEL } from './state.js';

const badgeClass = {
    "Confirmé": "badge-confirme",
    "En attente": "badge-attente",
    "Annulé": "badge-annule"
};

// recupere et injecte tous les rendez-vous dans leur liste
export async function loadRendezVous() {
    const rdvs = await GetRendezVous();
    const container = document.getElementById('rdv-list-body');

    if (!container) return;

    container.innerHTML = '';

    rdvs.forEach(r => {

        // Le bouton Modifier n'est pas disponible
        // pour les rendez-vous confirmés ou terminés
        let boutonModifier = '';

        if (r.statut !== 'Confirmé' && r.statut !== 'Terminée') {
            boutonModifier = `
                <button 
                    class="btn-modify" 
                    onclick='openEditRdv(${JSON.stringify(r)})'>
                    Modifier
                </button>
            `;
        }

        const row = document.createElement('div');

        row.className = 'rdv-row';

        row.innerHTML = `
            <span class="col-patient">${r.patient_nom}</span>

            <span class="col-medecin">${r.medecin_nom}</span>

            <span class="col-date">${r.date}</span>

            <span class="col-heure">${r.heure}</span>

            <span class="col-statut">
                <span class="badge ${badgeClass[r.statut] || ''}">
                    ${r.statut}
                </span>

                ${
                    r.statut === 'Annulé' && r.motif_annulation
                    ? `<div class="motif-annulation-note">
                        ${r.motif_annulation}
                       </div>`
                    : ''
                }
            </span>

            <div class="col-actions rdv-actions">
                ${boutonModifier}

                <button 
                    class="btn-delete" 
                    onclick="deleteRdvHandler(${r.id})">
                    Supprimer
                </button>
            </div>
        `;

        container.appendChild(row);
    });
}

// fonction qui charge les rdv du medecin connecté
export async function loadMesRdv() {
    const allRdvs = await GetRendezVous();
    const mesRdvs = allRdvs.filter(r => r.medecin_mat === MEDECIN_MAT_ACTUEL);
    const container = document.getElementById('mes-rdv-list-body');
    if (!container) return;

    container.innerHTML = '';

    mesRdvs.forEach(r => {
        const row = document.createElement('div');
        row.className = 'rdv-row';

        let actionsHtml = '';
        if (r.statut === 'En attente') {
            actionsHtml += `<button class="btn-view" onclick="confirmerRdv(${r.id})">Confirmer</button>`;
        }
        if (r.statut === 'Confirmé') {
            actionsHtml += `<button class="btn-view" onclick="window.ouvrirModalTerminer(${r.id})">Terminer</button>`;
        }
        if (r.statut === 'En attente' || r.statut === 'Confirmé') {
            actionsHtml += `<button class="btn-delete" onclick="annulerRdv(${r.id})">Annuler</button>`;
        }

        row.innerHTML = `
            <span class="col-patient">${r.patient_nom}</span>
            <span class="col-date">${r.date}</span>
            <span class="col-heure">${r.heure}</span>
            <span class="col-motif">${r.motif}</span>
            <span class="col-statut"><span class="badge ${badgeClass[r.statut] || ''}">${r.statut}</span></span>
            <div class="col-actions rdv-actions">${actionsHtml}</div>
        `;
        container.appendChild(row);
    });
}

async function confirmerRdv(id) {
    await UpdateRendezVousStatut(id, 'Confirmé');
    loadMesRdv();
    loadRendezVous();
    loadDashboard();
}
window.confirmerRdv = confirmerRdv;

export async function openAjoutRdv() {
    await remplirListePatients("rdv-patient-id");
    await remplirListeMedecins("rdv-medecin-mat");
    openModal("modal-overlay-rdv");
}
window.openAjoutRdv = openAjoutRdv;

async function deleteRdvHandler(id) {
    if (confirm('Supprimer ce rendez-vous ?')) {
        await DeleteRendezVous(id);
        loadRendezVous();
    }
}
window.deleteRdvHandler = deleteRdvHandler;

let currentEditRdvId = null;

async function openEditRdv(rdv) {
    currentEditRdvId = rdv.id;
    await remplirListePatients("modif-rdv-patient-id");
    await remplirListeMedecins("modif-rdv-medecin-mat");
    document.getElementById('modif-motif-rdv').value = rdv.motif;
    document.getElementById('modif-rdv-date').value = rdv.date;
    document.getElementById('modif-heure-rdv').value = rdv.heure;
    openModal('modal-overlay-modif-rdv');
}
window.openEditRdv = openEditRdv;

// Affiche et rempli les informations sur un rendez-vous
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

// ---------- ANNULATION D'UN RENDEZ-VOUS ----------

let rdvIdEnCoursAnnulation = null;

function annulerRdv(id) {
    rdvIdEnCoursAnnulation = id;
    document.getElementById('motif-annulation').value = '';
    document.getElementById('modal-annuler-rdv').classList.add('active');
}

function fermerModalAnnulation() {
    rdvIdEnCoursAnnulation = null;
    document.getElementById('modal-annuler-rdv').classList.remove('active');
}

async function confirmerAnnulation() {
    const motif = document.getElementById('motif-annulation').value.trim();
    if (!motif) {
        alert('Merci de préciser un motif.');
        return;
    }
    const res = await AnnulerRendezVous(rdvIdEnCoursAnnulation, motif);
    if (res !== 'ok') {
        alert(res);
        return;
    }
    fermerModalAnnulation();
    loadMesRdv();
    loadRendezVous();
    loadDashboard();
}

window.annulerRdv = annulerRdv;
window.fermerModalAnnulation = fermerModalAnnulation;
window.confirmerAnnulation = confirmerAnnulation;

// ---------- FORMULAIRES ----------
document.addEventListener('DOMContentLoaded', () => {
    // ---------- Formulaire Ajouter Rendez-vous ----------
    document.getElementById('form-add-rdv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await AddRendezVous(
            document.getElementById('rdv-patient-id').value,
            document.getElementById('rdv-medecin-mat').value,
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

    // -----------------Modifier un rendez-vous---------------
    document.getElementById('form-modif-rdv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await UpdateRendezVous(
            currentEditRdvId,
            document.getElementById('modif-rdv-patient-id').value,
            document.getElementById('modif-rdv-medecin-mat').value,
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
});
