// POINT D'ENTRÉE PRINCIPAL
// Il importe tous les modules (pour que leurs écouteurs
// d'événements s'enregistrent), puis lance le chargement
// initial des données.

import './state.js';
import './modal-utils.js';
import './router.js';
import './auth.js';
import './consultations.js';
import './profil.js';
import { loadPatients } from './patients.js';
import { loadMedecins } from './medecins.js';
import { loadRendezVous } from './rendezvous.js';
import { loadDashboard, updateTopbarDate } from './dashboard.js';

// Chargement de toutes les données des le demarrage de l'appli
document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
    loadMedecins();
    loadRendezVous();
    loadDashboard();
    updateTopbarDate();
});
