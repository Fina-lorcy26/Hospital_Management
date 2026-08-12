// TABLEAU DE BORD & GRAPHIQUES
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

    const tranches = ['0-17 ans', '18-30 ans', '31-45 ans', '46-60 ans', '61-75 ans', '76+ ans'];
    const counts = new Array(tranches.length).fill(0);
    const aujourdHui = new Date();

    patients.forEach(p => {
        if (!p.date_naissance) return;
        const naissance = parseDateFr(p.date_naissance);
        if (!naissance || isNaN(naissance.getTime())) return;

        let age = aujourdHui.getFullYear() - naissance.getFullYear();
        const decalageMois = aujourdHui.getMonth() - naissance.getMonth();
        if (decalageMois < 0 || (decalageMois === 0 && aujourdHui.getDate() < naissance.getDate())) {
            age--;
        }

        if (age < 18) counts[0]++;
        else if (age <= 30) counts[1]++;
        else if (age <= 45) counts[2]++;
        else if (age <= 60) counts[3]++;
        else if (age <= 75) counts[4]++;
        else counts[5]++;
    });

    if (chartPatients) chartPatients.destroy();

    chartPatients = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: tranches,
            datasets: [{
                data: counts,
                backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6'],
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#5a6b85', boxWidth: 14, padding: 12, font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: '#1a2b4c',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => `${ctx.label} : ${ctx.parsed} patient(s)`
                    }
                }
            }
        }
    });
}

// --------------------------------------------
// Graphique 2 : Activité de la semaine (barres)
// --------------------------------------------
function getSemaineActuelle() {
    const now = new Date();
    const jourActuel = now.getDay(); // 0 = dimanche
    const decalage = jourActuel === 0 ? -6 : 1 - jourActuel;

    const lundi = new Date(now);
    lundi.setDate(now.getDate() + decalage);
    lundi.setHours(0, 0, 0, 0);

    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);
    dimanche.setHours(23, 59, 59, 999);

    return { lundi, dimanche };
}

function createSemaineChart(rdvs) {
    const ctx = document.getElementById('chart-semaine');
    if (!ctx) return;

    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const counts = new Array(7).fill(0);
    const { lundi, dimanche } = getSemaineActuelle();

    rdvs.forEach(rdv => {
        if (rdv.date) {
            const date = parseDateFr(rdv.date);
            if (!date || isNaN(date.getTime())) return;
            if (date < lundi || date > dimanche) return; // hors semaine en cours

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
                backgroundColor: 'rgba(46, 204, 113, 0.75)',
                hoverBackgroundColor: 'rgba(46, 204, 113, 1)',
                borderColor: '#27ae60',
                borderWidth: 1.5,
                borderRadius: 8,
                maxBarThickness: 42
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a2b4c',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y} rendez-vous`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#7a8ba3' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: { color: '#7a8ba3' },
                    grid: { display: false }
                }
            }
        }
    });
}
