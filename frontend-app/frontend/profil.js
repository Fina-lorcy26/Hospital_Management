// PROFIL UTILISATEUR (consultation + modification des infos personnelles)
import { openModal, closeModal } from './modal-utils.js';
import { UTILISATEUR_CONNECTE, setUtilisateurConnecte, setMedecinNomActuel } from './state.js';
import { UpdateUtilisateur, ChangerMotDePasse } from './wailsjs/go/main/App.js';
function remplirProfil() {
    const user = UTILISATEUR_CONNECTE;
    if (!user) return;

    document.getElementById('profil-nom-complet').value = user.nom_complet || '';
    document.getElementById('profil-login').value = user.login || '';
    document.getElementById('profil-email').value = user.email || '';
    document.getElementById('profil-tel').value = user.telephone || '';

    const champMatricule = document.getElementById('profil-champ-matricule');
    if (user.role === 'medecin') {
        champMatricule.style.display = 'block';
        document.getElementById('profil-matricule').value = user.medecin_mat || '';
    } else {
        champMatricule.style.display = 'none';
    }

    basculerModeEdition(false);
}

function basculerModeEdition(actif) {
    const champs = ['profil-nom-complet', 'profil-login', 'profil-email', 'profil-tel'];    champs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !actif;
    });

    document.getElementById('profil-password-section').style.display = actif ? 'block' : 'none';
    document.getElementById('btn-modifier-profil').style.display = actif ? 'none' : 'inline-block';
    document.getElementById('btn-sauver-profil').style.display = actif ? 'inline-block' : 'none';
    document.getElementById('btn-annuler-profil').style.display = actif ? 'inline-block' : 'none';

    if (!actif) {
        document.getElementById('profil-ancien-mdp').value = '';
        document.getElementById('profil-nouveau-mdp').value = '';
        document.getElementById('profil-confirm-mdp').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.querySelector('.topbar-avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.title = 'Voir mon profil';
        avatar.addEventListener('click', () => {
            remplirProfil();
            openModal('modal-profil');
        });
    }

    const btnModifier = document.getElementById('btn-modifier-profil');
    if (btnModifier) btnModifier.addEventListener('click', () => basculerModeEdition(true));

    const btnAnnuler = document.getElementById('btn-annuler-profil');
    if (btnAnnuler) btnAnnuler.addEventListener('click', remplirProfil);
});

function rafraichirAffichageUtilisateur(user) {
    const initiale = user.nom_complet.trim().charAt(0).toUpperCase();
    document.querySelector('.topbar-avatar').textContent = initiale;

    const footerName = document.getElementById('footer-name');
    if (footerName) {
        footerName.textContent = (user.role === 'medecin' ? 'DR : ' : 'ADMIN : ') + user.nom_complet;
    }

    const welcomeTitle = document.getElementById('dashboard-welcome');
    if (welcomeTitle) welcomeTitle.textContent = "Bonjour, " + user.nom_complet;

    if (user.role === 'medecin') {
        setMedecinNomActuel(user.nom_complet);
    }
}

const formProfil = document.getElementById('profil-form');
if (formProfil) {
    formProfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = UTILISATEUR_CONNECTE;
        if (!user) return;

        const nomComplet = document.getElementById('profil-nom-complet').value.trim();
        const login = document.getElementById('profil-login').value.trim();
        const email = document.getElementById('profil-email').value.trim();
        const telephone = document.getElementById('profil-tel').value.trim();

        const ancienMdp = document.getElementById('profil-ancien-mdp').value;
        const nouveauMdp = document.getElementById('profil-nouveau-mdp').value;
        const confirmMdp = document.getElementById('profil-confirm-mdp').value;

        const changementMdpDemande = ancienMdp || nouveauMdp || confirmMdp;
        if (changementMdpDemande) {
            if (!ancienMdp) {
                alert("Merci de saisir votre mot de passe actuel pour le changer.");
                return;
            }
            if (nouveauMdp !== confirmMdp) {
                alert("Les nouveaux mots de passe ne correspondent pas.");
                return;
            }
        }

        // 1. Mise à jour des infos personnelles
        const resultInfos = await UpdateUtilisateur(user.id, nomComplet, login, telephone, email);
        if (resultInfos !== 'ok') {
            alert(resultInfos);
            return;
        }

        // 2. Changement de mot de passe si demandé
        if (changementMdpDemande) {
            const resultMdp = await ChangerMotDePasse(user.id, ancienMdp, nouveauMdp);
            if (resultMdp !== 'ok') {
                alert("Infos enregistrées, mais erreur sur le mot de passe : " + resultMdp);
                return;
            }
        }

        // 3. Mise à jour de l'état local + affichage
        const userMisAJour = { ...user, nom_complet: nomComplet, login, telephone, email };
        setUtilisateurConnecte(userMisAJour);
        window.UTILISATEUR_CONNECTE = userMisAJour;
        rafraichirAffichageUtilisateur(userMisAJour);

        basculerModeEdition(false);
        alert("Profil mis à jour avec succès.");
    });
}