// ÉTAT PARTAGÉ ENTRE LES MODULES
// Contient les variables de session utilisées par plusieurs fichiers
// (auth.js, router.js, rendezvous.js, consultations.js...).
// On exporte des variables "let" (bindings vivants ES module) + des
// fonctions setter, pour que chaque fichier qui importe ces variables
// voie toujours leur valeur à jour.

export let UTILISATEUR_CONNECTE = null;
export let MEDECIN_NOM_ACTUEL = "";
export let MEDECIN_MAT_ACTUEL = "";

export function setUtilisateurConnecte(utilisateur) {
    UTILISATEUR_CONNECTE = utilisateur;
}

export function setMedecinNomActuel(nom) {
    MEDECIN_NOM_ACTUEL = nom;
}

export function setMedecinMatActuel(matricule) {
    MEDECIN_MAT_ACTUEL = matricule;
}
