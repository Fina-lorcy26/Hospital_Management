//---Import des fonctions depuis App----

import { GetPatients, AddPatient, UpdatePatient, DeletePatient,
         GetMedecins, AddMedecin, UpdateMedecin, DeleteMedecin,
         GetRendezVous, AddRendezVous, UpdateRendezVous, DeleteRendezVous,
         GetDashboardStats, Login, GetConsultations, AddConsultation,
          UpdateConsultationStatut, DeleteConsultation, UpdateRendezVousStatut,
           GetConsultationsByMedecin, Register, AnnulerRendezVous } from './wailsjs/go/main/App.js';

  let UTILISATEUR_CONNECTE = null;
  let MEDECIN_NOM_ACTUEL = "";
  let MEDECIN_MAT_ACTUEL = "";

    const badgeClass = {
        "Confirmé": "badge-confirme",
        "En attente": "badge-attente",
        "Annulé": "badge-annule"
};
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-menu a');

// Écouteurs d'événement pour afficher et cacher chaque page en fonction du lien sélectionné 
    links.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetPage = link.getAttribute('data-page');
        if (!targetPage) return;
        e.preventDefault();
        goToPage(targetPage);
        loadCharts(); // si toujours nécessaire pour le dashboard
    });
});
// code du clic en dehors de la modale pour la retirer 
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

    // ---------- Formulaire Modifier Medecin ----------

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

// ----------Ajouter une consultation-------------

document.getElementById('form-add-consultation').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rdvId = parseInt(document.getElementById('consult-rdv-select').value);
    const result = await AddConsultation(
        rdvId,
        document.getElementById('consult-diagnostic').value,
        document.getElementById('consult-traitement').value,
        document.getElementById('consult-observation').value,
        document.getElementById('consult-date').value
    );
    if (result === 'ok') {
        closeModal('modal-overlay-consultation');
        e.target.reset();
        loadMesConsultations();
        alert('Consultation enregistrée');
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
// Chargement de toutes les données des le demarrage de l'appli
    loadPatients();
    loadMedecins();
    loadRendezVous();
    loadDashboard();
    updateTopbarDate();
});

// Redirection vers la page de medecin, en masquant toutes les autres   
function goToPage(targetPage) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const pageTarget = document.getElementById('page-' + targetPage);
    if (pageTarget) {
        pageTarget.classList.add('active');
    }

    // Mise en surbrillance de la sidebar
    document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${targetPage}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Rechargement des données pour chaque page
    if (targetPage === 'mes-rdv') loadMesRdv();
    if (targetPage === 'mes-consultations') loadMesConsultations();
    if (targetPage === 'patients') loadPatients();
    if (targetPage === 'medecins') loadMedecins();
    if (targetPage === 'rendez-vous') loadRendezVous();
    if (targetPage === 'dashboard') loadDashboard();
    if (targetPage === 'consultations-effectuees') loadConsultationsEffectuees();
}
window.goToPage = goToPage;

// fonction qui charge les rdv du medecin connecté 
async function loadMesRdv() {
    const allRdvs = await GetRendezVous();
    console.log("MEDECIN_NOM_ACTUEL :", MEDECIN_NOM_ACTUEL);
    console.log("Tous les rdvs :", allRdvs);
    const mesRdvs = allRdvs.filter(r => r.medecin_mat === MEDECIN_MAT_ACTUEL);
    console.log("Rdvs filtrés :", mesRdvs);
    const container = document.getElementById('mes-rdv-list-body');
    if (!container) return;
    
    container.innerHTML = '';
    
    mesRdvs.forEach(r => {
        const row = document.createElement('div');
        row.className = 'rdv-row';
        row.innerHTML = `
            <span class="col-patient">${r.patient_nom}</span>
            <span class="col-date">${r.date}</span>
            <span class="col-heure">${r.heure}</span>
            <span class="col-motif">${r.motif}</span>
            <span class="col-statut"><span class="badge ${badgeClass[r.statut] || ''}">${r.statut}</span></span>
            <div class="col-actions rdv-actions">
                <button class="btn-view" onclick="confirmerRdv(${r.id})">Confirmer</button>
                <button class="btn-delete" onclick="annulerRdv(${r.id})">Annuler</button>
            </div>
        `;
        container.appendChild(row);
    });
}

// La fonction qui change l'interface admin en medecin 
function switchToMedecin() {
    document.getElementById('menu-admin').style.display = 'none';
    document.getElementById('menu-medecin').style.display = 'block';
    document.getElementById('footer-name').textContent = 'DR : ' + (MEDECIN_NOM_ACTUEL || 'Médecin');
    document.querySelector('.topbar-avatar').textContent = MEDECIN_NOM_ACTUEL.trim().charAt(0).toUpperCase();   
     goToPage('mes-rdv');
}
// La fonction qui change l'interface medecin en admin  
function switchToAdmin() {
    document.getElementById('menu-admin').style.display = 'block';
    document.getElementById('menu-medecin').style.display = 'none';
    document.getElementById('footer-name').textContent = 'ADMIN : ' + (UTILISATEUR_CONNECTE ? UTILISATEUR_CONNECTE.nom_complet : 'Admin');
    document.querySelector('.topbar-avatar').textContent = UTILISATEUR_CONNECTE.nom_complet.trim().charAt(0).toUpperCase();   
  goToPage('dashboard');
}

window.switchToMedecin = switchToMedecin;
window.switchToAdmin = switchToAdmin;

async function confirmerRdv(id) {
    await UpdateRendezVousStatut(id, 'Confirmé');
    loadMesRdv();
    loadRendezVous();
    loadDashboard();
}
window.confirmerRdv = confirmerRdv;

function ouvrirConsultation(rdvId) {
    populateRdvSelect(rdvId);
    openModal('modal-overlay-consultation');
}
window.ouvrirConsultation = ouvrirConsultation;

async function openAjoutConsultation() {
    await populateRdvSelect(null);
    openModal('modal-overlay-consultation');
}
window.openAjoutConsultation = openAjoutConsultation;

// Remplit la liste déroulante des RDV(confirmés et non consultés)
async function populateRdvSelect(preselectId) {
    const allRdvs = await GetRendezVous();
    const consultations = await GetConsultations();
    const rdvIdsAvecConsultation = consultations.map(c => c.rdv_id);

    //Les rdv du medecin n'ayant pas encore de eu de consultations
    const disponibles = allRdvs.filter(r =>
    r.medecin_mat === MEDECIN_MAT_ACTUEL &&
    r.statut === 'Confirmé' &&
    (!rdvIdsAvecConsultation.includes(r.id) || r.id === preselectId)
   );
    const select = document.getElementById('consult-rdv-select');
    select.innerHTML = '';
    disponibles.forEach(r => {
        const option = document.createElement('option');
        option.value = r.id;
        option.textContent = r.patient_id + ' - ' + r.date;
        select.appendChild(option);
    });
    if (preselectId) select.value = preselectId;
}

// Fonction pour charger les consultations en cours d'un medecin
async function loadMesConsultations() {
    const all = await GetConsultationsByMedecin(MEDECIN_MAT_ACTUEL);
    console.log('MEDECIN_MAT_ACTUEL utilisé :', MEDECIN_MAT_ACTUEL);
    console.log('Consultations reçues (à faire) :', all);
    const aFaire = all.filter(c => c.statut !== 'Terminee');
     if (!container) return;
    container.innerHTML = '';

    aFaire.forEach(c => {
        const row = document.createElement('div');
        row.className = 'consultation-row';
        row.innerHTML = `
            <span class="col-patient">${c.patient_nom}</span>
            <span class="col-date-rdv">${c.date_rdv}</span>
            <span class="col-date">${c.date_consultation}</span>
            <div class="col-actions">
                <button class="btn-view" onclick='showConsultationDetail(${JSON.stringify(c)})'>Voir</button>
            </div>
        `;
        container.appendChild(row);
    });
}

// charge les consultations déja éffectuées  
async function loadConsultationsEffectuees() {
    const all = await GetConsultationsByMedecin(MEDECIN_MAT_ACTUEL);
    console.log('MEDECIN_MAT_ACTUEL utilisé :', MEDECIN_MAT_ACTUEL);
    console.log('Consultations reçues :', all);
    const terminees = all.filter(c => c.statut === 'Terminee');
    
    const container = document.getElementById('consultations-effectuees-list-body');
    if (!container) return;
    container.innerHTML = '';

    terminees.forEach(c => {
        const row = document.createElement('div');
        row.className = 'consultation-row';
        row.innerHTML = `
            <span class="col-patient">${c.patient_nom}</span>
            <span class="col-date">${c.date_consultation}</span>
            <div class="col-actions">
                <button class="btn-view" onclick='showConsultationDetail(${JSON.stringify(c)})'>Voir</button>
            </div>
        `;
        container.appendChild(row);
    });
}

// Fonction pour avoir le compte rendu d'une consultation(voir)
function showConsultationDetail(c) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-consultation').classList.add('active');
    document.getElementById('consult-detail-patient').textContent = c.patient_nom;
    document.getElementById('consult-detail-statut').textContent = c.statut;
    document.getElementById('consult-detail-date-rdv').textContent = c.date_rdv;
    document.getElementById('consult-detail-date').textContent = c.date_consultation;
    document.getElementById('consult-detail-diagnostic').textContent = c.diagnostic;
    document.getElementById('consult-detail-traitement').textContent = c.traitement;
    document.getElementById('consult-detail-observation').textContent = c.observation;
}
window.showConsultationDetail = showConsultationDetail;



// Gestion des ouvertures et fermetures des modals
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.openModal = openModal;
window.closeModal = closeModal;

// ----AFFICHER LES DIFFERENTS PROFILS-----

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

// Affiche et rempli les informations sur le profil d'un medecin 

function showMedecinProfile(medecin) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page-profil-medecin').classList.add('active');

    const card = document.querySelector('#page-profil-medecin .profile-card');
    card.querySelector('.profile-avatar').textContent = medecin.nom.charAt(0);
    card.querySelector('.profile-title h2').textContent = 'Dr. ' + medecin.nom;

    const details = card.querySelectorAll('.detail-value');
    document.getElementById('profil-medecin-mat').textContent = medecin.matricule;
    document.getElementById('profil-medecin-prenom').textContent = medecin.prenom;
    document.getElementById('profil-medecin-specialite').textContent = medecin.specialite;
    document.getElementById('profil-medecin-tel').textContent = medecin.telephone;
    document.getElementById('profil-medecin-email').textContent = medecin.email;
}

window.showMedecinProfile = showMedecinProfile;
function navigateBack(targetPage) {
    goToPage(targetPage);
}
window.navigateBack = navigateBack;

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

// ---------- CHARGEMENT DES LISTES ----------
//recupere les patients
async function loadPatients() {
    const patients = await GetPatients();
    const container = document.getElementById('patients-list-body');
    if (!container) return;
    container.innerHTML = '';

    // injecte tous les patients dans la liste
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
// recupere et injecte tous les medecins dans la liste 
async function loadMedecins() {
    const medecins = await GetMedecins();
    const container = document.getElementById('medecins-list-body');
    if (!container) return;

    container.innerHTML = '';

    medecins.forEach(m => {
        const row = document.createElement('div');
        row.className = 'medecins-row';
        row.innerHTML = `
            <span class="medecins-name col-name">Dr. ${m.nom} ${m.prenom}</span>
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

//Fonction pour le select patient dans rendez-vous 
async function remplirListePatients(selectId) {
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
// fonction pour le select medecin dans rendez-vous 
async function remplirListeMedecins(selectId) {
    const medecins = await GetMedecins();
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";
    medecins.forEach(medecin => {
        const option = document.createElement("option");
        option.value = medecin.matricule; // Stocke le matricule unique
        option.textContent = `Dr. ${medecin.nom} ${medecin.prenom}`;
        select.appendChild(option);
    });
}
// recupere et injecte tous les rendez-vous dans leur liste
async function loadRendezVous() {
    const rdvs = await GetRendezVous();
    const container = document.getElementById('rdv-list-body');
    if (!container) return;

    container.innerHTML = '';

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
                ${r.statut === 'Annulé' && r.motif_annulation ? `<div class="motif-annulation-note">${r.motif_annulation}</div>` : ''}
            </span>
            <div class="col-actions rdv-actions">
                <button class="btn-modify" onclick='openEditRdv(${JSON.stringify(r)})'>Modifier</button>
                <button class="btn-delete" onclick="deleteRdvHandler(${r.id})">Supprimer</button>
            </div>
        `;
        container.appendChild(row);
    });
}
async function openAjoutRdv() {
    await remplirListePatients("rdv-patient-id");
    await remplirListeMedecins("rdv-medecin-mat");
    openModal("modal-overlay-rdv");
}

window.openAjoutRdv = openAjoutRdv;
// Recuperations des informations en generale pour remplir les cartes du tableau de bord 
async function loadDashboard() {
    const stats = await GetDashboardStats();
    // Hero
    document.getElementById("rdv-en-attente").textContent = stats.rdv_en_attente;

    // Cartes
    document.getElementById("total-patients").textContent = stats.total_patients;
    document.getElementById("total-medecins").textContent = stats.total_medecins;
    document.getElementById("total-rdv").textContent = stats.rdv_du_jour;
    document.getElementById("total-rdv-program").textContent = stats.rdv_programmes;
    document.getElementById("total-consultation").textContent = stats.consultations_terminees;
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

let currentEditMedecinMatricule = null;
// injection des données existantes 
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

// ============================================
// GRAPHIQUES SIMPLES
// ============================================

let chartPatients = null;
let chartSemaine = null;

function parseDateFr(dateString) {
    if (!dateString) return null;

    // Format français : jj/mm/aaaa
    if (dateString.includes("/")) {
        const [jour, mois, annee] = dateString.split("/");
        return new Date(annee, mois - 1, jour);
    }

    // Format HTML : aaaa-mm-jj
    return new Date(dateString);
}

async function loadCharts() {
    try {
        const [patients, rdvs] = await Promise.all([
            GetPatients(),
            GetRendezVous()
        ]);

        // 1. Graphique : Évolution des patients (par mois)
        createPatientChart(patients);
        
        // 2. Graphique : Activité de la semaine
        createSemaineChart(rdvs);
        
    } catch (error) {
        console.error('Erreur chargement graphiques:', error);
    }
}

// --------------------------------------------
// Graphique 1 : Évolution des patients (courbe)
// --------------------------------------------
function createPatientChart(patients) {
    const ctx = document.getElementById('chart-patients');
    if (!ctx) return;

    // Compter les patients par mois
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const counts = new Array(12).fill(0);
    
    patients.forEach(p => {
        if (p.date_naissance) {
            const date = parseDateFr(p.date_naissance);
            const month = date.getMonth();
            counts[month]++;
        }
    });

    if (chartPatients) chartPatients.destroy();

    chartPatients = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mois,
            datasets: [{
                label: 'Patients',
                data: counts,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// --------------------------------------------
// Graphique 2 : Activité de la semaine (barres)
// --------------------------------------------
function createSemaineChart(rdvs) {
    const ctx = document.getElementById('chart-semaine');
    if (!ctx) return;

    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const counts = new Array(7).fill(0);
    
    rdvs.forEach(rdv => {
        if (rdv.date) {
            const date = parseDateFr(rdv.date);
            if (!date || isNaN(date.getTime())) return;
            const day = date.getDay();
            const index = day === 0 ? 6 : day - 1;
            counts[index]++;
        }
    });

    if (chartSemaine) chartSemaine.destroy();

    chartSemaine = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: jours,
            datasets: [{
                label: 'Rendez-vous',
                data: counts,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: '#2ecc71',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// Melanger le travail de rudy
const form = document.getElementById("login-form");

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const login = document.getElementById("login").value.trim();
        const motDePasse = document.getElementById("password").value;

       try {
    const resultat = await Login(login, motDePasse);

    // Si on arrive ici, la connexion a réussi et resultat = l'objet Utilisateur
    UTILISATEUR_CONNECTE = resultat;
    window.UTILISATEUR_CONNECTE = resultat; // ligne temporaire de debug
    console.log('Utilisateur connecté :', resultat);

    document.getElementById("page-login").style.display = "none";
    document.getElementById("app").style.display = "block";

    initialiserApplication();

} catch (err) {
    console.error(err);
    alert(err.message || err || "Identifiants incorrects ou utilisateur introuvable.");
}
    });
}

function initialiserApplication() {
    const user = UTILISATEUR_CONNECTE;
    if (!user) return;

    const welcomeTitle = document.getElementById("dashboard-welcome");
    if (welcomeTitle) {
        welcomeTitle.textContent = "Bonjour, " + user.nom_complet;
    }

    if (user.role === 'admin' || user.role === 'administrateur') {
        switchToAdmin();
        goToPage("dashboard");
    } else if (user.role === "medecin") {
         MEDECIN_MAT_ACTUEL = user.medecin_mat;
         MEDECIN_NOM_ACTUEL = user.nom_complet;
        switchToMedecin();
        goToPage("mes-rdv");
    }
}
// Ouvrir la fenêtre de création de compte / inscription
document.addEventListener('DOMContentLoaded', () => {
    // Écouteur sur tout texte/bouton qui contient "CRÉER UN COMPTE"
    const links = document.querySelectorAll('a, button, span, p');
    links.forEach(el => {
        if (el.textContent.trim().toUpperCase().includes('CRÉER UN COMPTE')) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                e.preventDefault();
         
                const modalRegister = document.getElementById('modal-overlay-register');
                if (modalRegister) {
                    modalRegister.classList.add('active');
                } else {
                    alert("La modale d'inscription ('modal-overlay-register') n'existe pas encore dans le HTML.");
                }
            });
        }
    });
});

document.getElementById('Register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (document.getElementById('reg-password').value !== document.getElementById('reg-confirm-password').value) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    const result = await Register(
    document.getElementById('reg-nom-complet').value,
    document.getElementById('reg-login').value,        
    document.getElementById('reg-tel').value,
    document.getElementById('reg-matricule').value,
    document.getElementById('reg-password').value,
    document.getElementById('reg-email').value          
);

    if (result === 'ok') {
        closeModal('modal-overlay-register');
        e.target.reset();
        alert('Compte créé avec succès. Vous pouvez vous connecter.');
    } else {
        alert(result);
    }
});
function deconnexion() {
    UTILISATEUR_CONNECTE = null;
    MEDECIN_NOM_ACTUEL = null;

    document.getElementById('login').value = '';
    document.getElementById('password').value = '';

    document.getElementById('app').style.display = 'none';
    document.getElementById('page-login').style.display = 'block';
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', deconnexion);
}

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