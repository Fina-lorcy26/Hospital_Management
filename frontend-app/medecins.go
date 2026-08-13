package main

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
)

// ---------- GESTION DES MEDECINS ----------

// Génère un mot de passe temporaire à 6 chiffres, facile à dicter par téléphone
func genererMotDePasse6Chiffres() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// Affiche Medecin
func (a *App) GetMedecins() []Medecin {
    rows, err := db.Query("SELECT matricule, nom, prenom, specialite, telephone, email FROM medecins ORDER BY rowid DESC")
		if err != nil {
		fmt.Println("Erreur recuperation medecins:", err)
		return []Medecin{}
	}
	defer rows.Close()
	//Recuperation des données
	var medecins []Medecin = []Medecin{}
	for rows.Next() {
		var m Medecin
		rows.Scan(&m.Matricule, &m.Nom, &m.Prenom, &m.Specialite, &m.Telephone, &m.Email)
		medecins = append(medecins, m) // Affectation d'un nouveau medecin dans la structure des medecins
	}
	return medecins
}

// Ajout d'un medecin : crée aussi automatiquement son compte utilisateur (login + mot de passe générés)
func (a *App) AddMedecin(matricule, nom, prenom, specialite, telephone, email string) AjoutMedecinResult {

	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM medecins WHERE matricule = ?",
		matricule,
	).Scan(&count)
	if err != nil {
		return AjoutMedecinResult{Message: "Erreur : " + err.Error()}
	}
	if count > 0 {
		return AjoutMedecinResult{Message: "Un médecin avec ce matricule existe déjà."}
	}
	var countTel int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE telephone = ?", telephone).Scan(&countTel)
	if countTel > 0 {
		return AjoutMedecinResult{Message: "Ce numéro de téléphone est déjà utilisé par un autre médecin."}
	}
	var countEmail int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE email = ?", email).Scan(&countEmail)
	if countEmail > 0 {
		return AjoutMedecinResult{Message: "Cet email est déjà utilisé par un autre médecin."}
	}

	// Génération du login : premier prénom + matricule (même format que l'ancienne auto-inscription)
	premierPrenom := prenom
	if mots := strings.Fields(prenom); len(mots) > 0 {
		premierPrenom = mots[0]
	}
	login := premierPrenom + "_" + matricule

	var countLogin int
	db.QueryRow("SELECT COUNT(*) FROM utilisateurs WHERE login = ? COLLATE NOCASE", login).Scan(&countLogin)
	if countLogin > 0 {
		return AjoutMedecinResult{Message: "Un compte avec le login '" + login + "' existe déjà. Vérifiez le matricule."}
	}

	motDePasse, err := genererMotDePasse6Chiffres()
	if err != nil {
		return AjoutMedecinResult{Message: "Erreur lors de la génération du mot de passe : " + err.Error()}
	}

	// Transaction : le médecin ET son compte utilisateur sont créés ensemble, ou pas du tout
	tx, err := db.Begin()
	if err != nil {
		return AjoutMedecinResult{Message: "Erreur : " + err.Error()}
	}

	_, err = tx.Exec(
		"INSERT INTO medecins (matricule, nom, prenom, specialite, telephone, email) VALUES (?, ?, ?, ?, ?, ?)",
		matricule, nom, prenom, specialite, telephone, email,
	)
	if err != nil {
		tx.Rollback()
		return AjoutMedecinResult{Message: "Erreur: " + err.Error()}
	}

	nomComplet := strings.TrimSpace(prenom + " " + nom)
	_, err = tx.Exec(
		`INSERT INTO utilisateurs (login, mot_de_passe, role, nom_complet, medecin_mat, telephone, email)
		 VALUES (?, ?, 'medecin', ?, ?, ?, ?)`,
		login, motDePasse, nomComplet, matricule, telephone, email,
	)
	if err != nil {
		tx.Rollback()
		return AjoutMedecinResult{Message: "Erreur lors de la création du compte utilisateur : " + err.Error()}
	}

	if err := tx.Commit(); err != nil {
		return AjoutMedecinResult{Message: "Erreur : " + err.Error()}
	}

	return AjoutMedecinResult{
		Success:    true,
		Message:    "ok",
		Login:      login,
		MotDePasse: motDePasse,
	}
}

// Mises à jour
func (a *App) UpdateMedecin(matricule, nom, prenom, specialite, telephone, email string) string {
	var countTel int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE telephone = ? AND matricule != ?", telephone, matricule).Scan(&countTel)
	if countTel > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre médecin."
	}

	var countEmail int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE email = ? AND matricule != ?", email, matricule).Scan(&countEmail)
	if countEmail > 0 {
		return "Cet email est déjà utilisé par un autre médecin."
	}
	_, err := db.Exec(
		"UPDATE medecins SET nom=?, prenom=?, specialite=?, telephone=?, email=? WHERE matricule=?",
		nom, prenom, specialite, telephone, email, matricule,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Suppression d'un medecin
func (a *App) DeleteMedecin(matricule string) string {
	var countRdv int
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE medecin_mat = ?", matricule).Scan(&countRdv)
	if countRdv > 0 {
		return "Impossible de supprimer ce médecin : il a des rendez-vous enregistrés dans l'historique."
	}

	var countUtilisateur int
	db.QueryRow("SELECT COUNT(*) FROM utilisateurs WHERE medecin_mat = ?", matricule).Scan(&countUtilisateur)
	if countUtilisateur > 0 {
		return "Impossible de supprimer ce médecin : un compte utilisateur lui est associé."
	}

	_, err := db.Exec("DELETE FROM medecins WHERE matricule=?", matricule)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}
