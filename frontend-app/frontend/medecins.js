// GESTION DES MÉDECINS

import { GetMedecins, AddMedecin, UpdateMedecin, DeleteMedecin } from './wailsjs/go/main/App.js';
import { openModal, closeModal } from './modal-utils.js';

// ---------- MODALE IDENTIFIANTS GÉNÉRÉS ----------

function afficherIdentifiants(login, motDePasse) {
    document.getElementById('identifiant-login-valeur').textContent = login;
    document.getElementById('identifiant-mdp-valeur').textContent = motDePasse;
    openModal('modal-identifiants-medecin');
}

document.addEventListener('DOMContentLoaded', () => {
    const btnCopier = document.getElementById('btn-copier-identifiants');
    if (btnCopier) {
        btnCopier.addEventListener('click', async () => {
            const login = document.getElementById('identifiant-login-valeur').textContent;
            const mdp = document.getElementById('identifiant-mdp-valeur').textContent;
            const texte = `Login : ${login}\nMot de passe : ${mdp}`;

            try {
                await navigator.clipboard.writeText(texte);
                btnCopier.textContent = '✅ Copié !';
                btnCopier.classList.add('copie');
                setTimeout(() => {
                    btnCopier.textContent = '📋 Copier les identifiants';
                    btnCopier.classList.remove('copie');
                }, 2000);
            } catch (err) {
                alert("Impossible de copier automatiquement. Identifiants :\n" + texte);
            }
        });
    }

    const btnFermer = document.getElementById('btn-fermer-identifiants');
    if (btnFermer) {
        btnFermer.addEventListener('click', () => closeModal('modal-identifiants-medecin'));
    }
});

// recupere et injecte tous les medecins dans la liste
let allMedecins = [];

export async function loadMedecins() {
    allMedecins = await GetMedecins();
    renderMedecins(allMedecins);
    setupMedecinsSearch();
}

function renderMedecins(medecins) {
    const container = document.getElementById('medecins-list-body');
    if (!container) return;
    container.innerHTML = '';

    if (medecins.length === 0) {
        container.innerHTML = '<div class="no-results">Aucun médecin trouvé.</div>';
        return;
    }

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

function setupMedecinsSearch() {
    const searchInput = document.getElementById('medecins-search');
    if (!searchInput || searchInput.dataset.bound) return;
    searchInput.dataset.bound = 'true';

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = allMedecins.filter(m =>
            `${m.nom} ${m.prenom}`.toLowerCase().includes(q) ||
            (m.specialite || '').toLowerCase().includes(q)
        );
        renderMedecins(filtered);
    });
}

// fonction pour le select medecin dans rendez-vous
export async function remplirListeMedecins(selectId) {
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

// ---------- SUPPRESSION ----------

async function deleteMedecinHandler(matricule) {
    if (confirm('Supprimer ce médecin ?')) {
        const result = await DeleteMedecin(matricule);
        if (result === 'ok') {
            loadMedecins();
        } else {
            alert(result);
        }
    }
}
window.deleteMedecinHandler = deleteMedecinHandler;

// ---------- MODIFIER MEDECIN ----------

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

// ---------- FORMULAIRES ----------
document.addEventListener('DOMContentLoaded', () => {
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
        if (result.success) {
            closeModal('modal-overlay-medecin');
            e.target.reset();
            loadMedecins();
            afficherIdentifiants(result.login, result.mot_de_passe);
        } else {
            alert(result.message);
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
});
