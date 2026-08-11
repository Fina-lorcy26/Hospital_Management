// NAVIGATION ENTRE LES VUES (ROUTER)

import { loadMesRdv, loadRendezVous } from './rendezvous.js';
import { loadPatients } from './patients.js';
import { loadMedecins } from './medecins.js';
import { loadDashboard, loadCharts } from './dashboard.js';
import { loadConsultationsEffectuees } from './consultations.js';

// Redirection vers la page de medecin, en masquant toutes les autres
export function goToPage(targetPage) {
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
    if (targetPage === 'patients') loadPatients();
    if (targetPage === 'medecins') loadMedecins();
    if (targetPage === 'rendez-vous') loadRendezVous();
    if (targetPage === 'dashboard') loadDashboard();
    if (targetPage === 'consultations-effectuees') loadConsultationsEffectuees();
}
window.goToPage = goToPage;

export function navigateBack(targetPage) {
    goToPage(targetPage);
}
window.navigateBack = navigateBack;

// Écouteurs d'événement pour afficher et cacher chaque page en fonction du lien sélectionné
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetPage = link.getAttribute('data-page');
            if (!targetPage) return;
            e.preventDefault();
            goToPage(targetPage);
            loadCharts();
        });
    });
});
