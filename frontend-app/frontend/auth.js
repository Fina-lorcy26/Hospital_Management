// AUTHENTIFICATION & GESTION DE SESSION

import { Login, Register } from './wailsjs/go/main/App.js';
import { closeModal } from './modal-utils.js';
import { goToPage } from './router.js';
import { UTILISATEUR_CONNECTE, MEDECIN_NOM_ACTUEL,
         setUtilisateurConnecte, setMedecinNomActuel, setMedecinMatActuel } from './state.js';

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
         setMedecinMatActuel(user.medecin_mat);
         setMedecinNomActuel(user.nom_complet);
        switchToMedecin();
        goToPage("mes-rdv");
    }
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
    setUtilisateurConnecte(resultat);
    window.UTILISATEUR_CONNECTE = resultat; 
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
 
    // Retour vers la page de connexion depuis la modale d'inscription
    const linkToLogin = document.getElementById('link-to-login');
    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('modal-overlay-register');
        });
    }
    // Bouton flèche retour (en haut de la modale)
    const btnBackLogin = document.getElementById('btn-back-login');
    if (btnBackLogin) {
        btnBackLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('modal-overlay-register');
        });
    }

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
    setUtilisateurConnecte(null);
    setMedecinNomActuel(null);

    document.getElementById('login').value = '';
    document.getElementById('password').value = '';

    document.getElementById('app').style.display = 'none';
    document.getElementById('page-login').style.display = 'block';
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', deconnexion);
}
