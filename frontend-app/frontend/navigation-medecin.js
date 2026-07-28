import { GetRendezVous, UpdateRendezVousStatut,
         GetConsultations, AddConsultation, UpdateConsultationStatut, DeleteConsultation } from './wailsjs/go/main/App.js';

const MEDECIN_NOM_ACTUEL = 'Dr. Clara';
let currentRdvIdForConsultation = null;

function waitForWails() {
    return new Promise((resolve) => {
        function check() {
            if (window.go && window.go.main && window.go.main.App) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        }
        check();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await waitForWails();

    const links = document.querySelectorAll('.sidebar-menu a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');

            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('page-' + targetPage).classList.add('active');

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            if (targetPage === 'mes-rdv') loadMesRdv();
            if (targetPage === 'mes-consultations') loadMesConsultations();
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                overlay.classList.remove('active');
            }
        });
    });

    document.getElementById('form-add-consultation').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await AddConsultation(
            currentRdvIdForConsultation,
            document.getElementById('consult-diagnostic').value,
            document.getElementById('consult-traitement').value,
            document.getElementById('consult-observation').value,
            document.getElementById('consult-date').value
        );
        if (result === 'ok') {
            closeModal('modal-overlay-consultation');
            e.target.reset();
            loadMesConsultations();
            alert('Consultation enregistrée avec succès');
        } else {
            alert(result);
        }
    });

    loadMesRdv();
});

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.openModal = openModal;
window.closeModal = closeModal;

// ---------- MES RENDEZ-VOUS ----------

async function loadMesRdv() {
    const allRdvs = await GetRendezVous();
    const mesRdvs = allRdvs.filter(r => r.medecin_nom === MEDECIN_NOM_ACTUEL);

    const container = document.querySelector('.rdv-list');
    document.querySelectorAll('.rdv-row').forEach(row => row.remove());

    const badgeClass = {
        'Confirmé': 'badge-confirme',
        'En attente': 'badge-attente',
        'Annulé': 'badge-annule'
    };

    mesRdvs.forEach(r => {
        const row = document.createElement('div');
        row.className = 'rdv-row';
        row.innerHTML = `
            <span class="col-patient">${r.patient_nom}</span>
            <span class="col-date">${r.date}</span>
            <span class="col-heure">${r.heure}</span>
            <span class="col-motif">${r.motif}</span>
            <span class="col-statut">
                <span class="badge ${badgeClass[r.statut] || ''}">${r.statut}</span>
            </span>
            <div class="col-actions rdv-actions">
                <button class="btn-view" onclick="confirmerRdv(${r.id})">Confirmer</button>
                <button class="btn-modify" onclick="ouvrirConsultation(${r.id})">Consulter</button>
                <button class="btn-delete" onclick="annulerRdv(${r.id})">Annuler</button>
            </div>
        `;
        container.appendChild(row);
    });
}

async function confirmerRdv(id) {
    await UpdateRendezVousStatut(id, 'Confirmé');
    loadMesRdv();
}

async function annulerRdv(id) {
    if (confirm('Annuler ce rendez-vous ?')) {
        await UpdateRendezVousStatut(id, 'Annulé');
        loadMesRdv();
    }
}

function ouvrirConsultation(rdvId) {
    currentRdvIdForConsultation = rdvId;
    openModal('modal-overlay-consultation');
}

window.confirmerRdv = confirmerRdv;
window.annulerRdv = annulerRdv;
window.ouvrirConsultation = ouvrirConsultation;

// ---------- MES CONSULTATIONS ----------

async function loadMesConsultations() {
    const consultations = await GetConsultations();
    const container = document.querySelector('.consultations-list');
    document.querySelectorAll('.consultation-row').forEach(row => row.remove());

    consultations.forEach(c => {
        const row = document.createElement('div');
        row.className = 'consultation-row';
        row.innerHTML = `
            <span class="col-date">${c.date_consultation}</span>
            <span class="col-diagnostic">${c.diagnostic}</span>
            <span class="col-statut">${c.statut}</span>
            <div class="col-actions">
                <button class="btn-view" onclick="terminerConsultation(${c.id})">Terminer</button>
                <button class="btn-delete" onclick="supprimerConsultation(${c.id})">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}

async function terminerConsultation(id) {
    await UpdateConsultationStatut(id, 'Terminee');
    loadMesConsultations();
}

async function supprimerConsultation(id) {
    if (confirm('Supprimer cette consultation ?')) {
        await DeleteConsultation(id);
        loadMesConsultations();
    }
}

window.terminerConsultation = terminerConsultation;
window.supprimerConsultation = supprimerConsultation;