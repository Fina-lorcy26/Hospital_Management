package main

import "fmt"

// ---------- GESTION DES RENDEZ-VOUS ----------
// liste complete de rendez-vous
func (a *App) GetRendezVous() []RendezVous {
	rows, err := db.Query(`
		SELECT 
			rv.id, 
			rv.patient_id, 
			rv.medecin_mat, 
			rv.motif, 
			rv.date, 
			rv.heure, 
			rv.statut,
			rv.motif_annulation,
			(p.nom || ' ' || COALESCE(p.prenom, '')) AS patient_nom,
			(m.nom || ' ' || COALESCE(m.prenom, '')) AS medecin_nom
		FROM rendez_vous rv
		JOIN patients p ON rv.patient_id = p.id
		JOIN medecins m ON rv.medecin_mat = m.matricule
		ORDER BY rv.id DESC
	`)
	if err != nil {
		fmt.Println("Erreur recuperation rendez-vous:", err)
		return []RendezVous{}
	}
	defer rows.Close()
	var rdvs []RendezVous
	for rows.Next() {
		var r RendezVous
		rows.Scan(
			&r.ID, &r.PatientId, &r.MedecinMat, &r.Motif, &r.Date, &r.Heure, &r.Statut,
			&r.MotifAnnulation,
			&r.PatientNom, &r.MedecinNom,
		)
		rdvs = append(rdvs, r)
	}
	return rdvs
}

// Ajouter un rdv
func (a *App) AddRendezVous(PatientId, MedecinMat, motif, date, heure string) string {
	var count int
	err := db.QueryRow(
		`SELECT COUNT(*) FROM rendez_vous
     WHERE date = ?
     AND heure = ?
     AND (medecin_mat = ? OR patient_id = ?)`,
		date,
		heure,
		MedecinMat,
		PatientId,
	).Scan(&count)

	if err != nil {
		return "Erreur : " + err.Error()
	}

	if count > 0 {
		return "Impossible de créer ce rendez-vous : le médecin ou le patient est déjà occupé à cette date et cette heure."
	}
	_, err = db.Exec(
		"INSERT INTO rendez_vous (patient_id, medecin_mat, motif, date, heure, statut) VALUES (?, ?, ?, ?, ?, ?)",
		PatientId, MedecinMat, motif, date, heure, "En attente",
	) // le statut est par defaut en attente
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Mises à jour d'un rdv
func (a *App) UpdateRendezVous(id int, PatientId, medecinMat, motif, date, heure string) string {

	// Récupérer les informations actuelles du rendez-vous
	var ancienStatut string
	var ancienPatientID string
	var ancienMedecinMat string
	var ancienneDate string
	var ancienneHeure string

	err := db.QueryRow(`
		SELECT statut, patient_id, medecin_mat, date, heure
		FROM rendez_vous
		WHERE id = ?
	`, id).Scan(
		&ancienStatut,
		&ancienPatientID,
		&ancienMedecinMat,
		&ancienneDate,
		&ancienneHeure,
	)

	if err != nil {
		return "Erreur lors de la récupération du rendez-vous : " + err.Error()
	}

	// Un rendez-vous confirmé ne peut plus être modifié
	if ancienStatut == "Confirmé" {
		return "Impossible de modifier ce rendez-vous : il est déjà confirmé."
	}

	// Un rendez-vous terminé ne peut plus être modifié
	if ancienStatut == "Terminée" {
		return "Impossible de modifier ce rendez-vous : il est déjà terminé."
	}

	// Vérifier si la date, l'heure, le médecin ou le patient ont changé
	dateChangee := date != ancienneDate
	heureChangee := heure != ancienneHeure
	medecinChange := medecinMat != ancienMedecinMat
	patientChange := PatientId != ancienPatientID

	// Un rdv annulé qu'on modifie redevient "En attente"
	nouveauStatut := ancienStatut

	if ancienStatut == "Annulé" &&
		(dateChangee || heureChangee || medecinChange || patientChange) {

		nouveauStatut = "En attente"
	}

	// Vérifier les conflits de date/heure
	// (on ignore les rendez-vous annulés : ils n'occupent plus le créneau)
	var count int

	err = db.QueryRow(`
		SELECT COUNT(*)
		FROM rendez_vous
		WHERE date = ?
		AND heure = ?
		AND id != ?
		AND statut != 'Annulé'
		AND (medecin_mat = ? OR patient_id = ?)
	`,
		date,
		heure,
		id,
		medecinMat,
		PatientId,
	).Scan(&count)

	if err != nil {
		return "Erreur lors de la vérification des disponibilités : " + err.Error()
	}

	if count > 0 {
		return "Impossible de modifier ce rendez-vous : le médecin ou le patient est déjà occupé à cette date et cette heure."
	}

	// Effectuer la modification
	_, err = db.Exec(`
		UPDATE rendez_vous
		SET patient_id = ?,
		    medecin_mat = ?,
		    motif = ?,
		    date = ?,
		    heure = ?,
		    statut = ?
		WHERE id = ?
	`,
		PatientId,
		medecinMat,
		motif,
		date,
		heure,
		nouveauStatut,
		id,
	)

	if err != nil {
		return "Erreur lors de la modification : " + err.Error()
	}

	return "ok"
}

// supression d'un rendez-vous
func (a *App) DeleteRendezVous(id int) string {
	_, err := db.Exec("DELETE FROM rendez_vous WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Mises a jour du statut d'un rdv
func (a *App) UpdateRendezVousStatut(id int, statut string) string {
	_, err := db.Exec("UPDATE rendez_vous SET statut=? WHERE id=?", statut, id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) AnnulerRendezVous(id int, motif string) string {
	_, err := db.Exec("UPDATE rendez_vous SET statut=?, motif_annulation=? WHERE id=?", "Annulé", motif, id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}
