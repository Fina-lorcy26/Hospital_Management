package main

import (
	"fmt"
	"regexp"
)

// ---------- GESTION DES PATIENTS ----------

// Affichage de la liste
func (a *App) GetPatients() []Patient {
rows, err := db.Query("SELECT id, nom, prenom, sexe, telephone, date_naissance, adresse, motif FROM patients ORDER BY id DESC")
	if err != nil {
		fmt.Println("Erreur recuperation patients:", err)
		return []Patient{}
	}
	defer rows.Close() //ferme la connexion aux resultats a la fin de la fonction
	//recuperation des données de chaque ligne de patient
	var patients []Patient = []Patient{} // Initialisé vide pour éviter `null` en JS
	for rows.Next() {
		var p Patient
		rows.Scan(&p.ID, &p.Nom, &p.Prenom, &p.Sexe, &p.Telephone, &p.DateNaissance, &p.Adresse, &p.Motif)
		patients = append(patients, p) // Affectation aux champs de la structure Patient
	}
	return patients
}

// Insertion d'un nouveau patient
func (a *App) AddPatient(nom, prenom, sexe, telephone, dateNaissance, adresse, motif string) string {

	matched, _ := regexp.MatchString(`^\d{8,15}$`, telephone) // Validation du numero

	if !matched {
		return "Le numéro de téléphone doit contenir exactement 9 chiffres."
	}

	if sexe != "M" && sexe != "F" {
		return "Le sexe doit être 'M' ou 'F'."
	}

	var count int
	db.QueryRow("SELECT COUNT(*) FROM patients WHERE telephone = ?", telephone).Scan(&count)
	if count > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre patient."
	}

	_, err := db.Exec(
		"INSERT INTO patients (nom, prenom, sexe, telephone, date_naissance, adresse, motif) VALUES (?, ?, ?, ?, ?, ?, ?)",
		nom, prenom, sexe, telephone, dateNaissance, adresse, motif,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Mises à jour d'un patient pour modification
func (a *App) UpdatePatient(id int, nom, prenom, sexe, telephone, dateNaissance, adresse, motif string) string {
	
	matched, _ := regexp.MatchString(`^\d{8,15}$`, telephone)
	if !matched {
		return "Le numéro de téléphone doit contenir exactement 9 chiffres."
	}
	if sexe != "M" && sexe != "F" {
		return "Le sexe doit être 'M' ou 'F'."
	}

	var count int
	db.QueryRow("SELECT COUNT(*) FROM patients WHERE telephone = ? AND id != ?", telephone, id).Scan(&count)
	if count > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre patient."
	}
	_, err := db.Exec(
		"UPDATE patients SET nom=?, prenom=?, sexe=?, telephone=?, date_naissance=?, adresse=?, motif=? WHERE id=?",
		nom, prenom, sexe, telephone, dateNaissance, adresse, motif, id,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Suppression definitive d'un patient grace a son ID
func (a *App) DeletePatient(id int) string {
	var countRdv int
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE patient_id = ?", id).Scan(&countRdv)
	if countRdv > 0 {
		return "Impossible de supprimer ce patient : il a des rendez-vous enregistrés dans l'historique."
	}
	var countConsult int
	db.QueryRow("SELECT COUNT(*) FROM consultations WHERE patient_id = ?", id).Scan(&countConsult)
	if countConsult > 0 {
		return "Impossible de supprimer ce patient : il a des consultations enregistrées dans l'historique."
	}
	_, err := db.Exec("DELETE FROM patients WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}
