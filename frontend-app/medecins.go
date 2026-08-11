package main

import "fmt"

// ---------- GESTION DES MEDECINS ----------
// Affiche Medecin
func (a *App) GetMedecins() []Medecin {
	rows, err := db.Query("SELECT matricule, nom, prenom, specialite, telephone, email FROM medecins")
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

// Ajout d'un medecin
func (a *App) AddMedecin(matricule, nom, prenom, specialite, telephone, email string) string {

	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM medecins WHERE matricule = ?",
		matricule,
	).Scan(&count)

	if err != nil {
		return "Erreur : " + err.Error()
	}

	if count > 0 {
		return "Un médecin avec ce matricule existe déjà."
	}

	var countTel int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE telephone = ?", telephone).Scan(&countTel)
	if countTel > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre médecin."
	}

	var countEmail int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE email = ?", email).Scan(&countEmail)
	if countEmail > 0 {
		return "Cet email est déjà utilisé par un autre médecin."
	}

	_, err = db.Exec(
		"INSERT INTO medecins (matricule, nom, prenom, specialite, telephone, email) VALUES (?, ?, ?, ?, ?, ?)",
		matricule, nom, prenom, specialite, telephone, email,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
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
