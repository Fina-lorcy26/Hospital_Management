// ============================================
// TABLEAU DE BORD & GRAPHIQUES
// ============================================
import { GetDashboardStats, GetPatients, GetRendezVous } from './wailsjs/go/main/App.js';

// Recuperations des informations en generale pour remplir les cartes du tableau de bord
export async function loadDashboard() {
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

//---Gerer la date du Tableau de bord-----

export function updateTopbarDate() {
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

export async function loadCharts() {
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
