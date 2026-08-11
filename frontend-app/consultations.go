package main

import (
	"fmt"
	"time"
)

// ---------- CONSULTATIONS ----------

// suppression d'une consultation
func (a *App) DeleteConsultation(id int) string {
	_, err := db.Exec("DELETE FROM consultations WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Jointure SQL entre consultation et rendez-vous pourn'afficher que les consultations concernant un medecin en particulier
func (a *App) GetConsultationsByMedecin(medecinMat string) []ConsultationDetail {
	rows, err := db.Query(`
       SELECT 
    c.id, c.rdv_id, r.patient_id, 
    (p.nom || ' ' || COALESCE(p.prenom, '')) AS patient_nom,
    r.date AS date_rdv, c.date_consultation, 
    c.diagnostic, c.traitement, c.observation 
FROM consultations c
        JOIN rendez_vous r ON c.rdv_id = r.id
        JOIN patients p ON r.patient_id = p.id
        WHERE r.medecin_mat = ?
    `, medecinMat)

	if err != nil {
		fmt.Println("Erreur recuperation consultations detaillees:", err)
		return []ConsultationDetail{}
	}
	defer rows.Close()

	var list []ConsultationDetail
	for rows.Next() {
		var c ConsultationDetail
		rows.Scan(&c.ID, &c.RdvID, &c.PatientId, &c.PatientNom, &c.DateRdv, &c.DateConsultation, &c.Diagnostic, &c.Traitement, &c.Observation)
		list = append(list, c)
	}
	return list
}

func (a *App) TerminerRendezVous(rdvID int, diagnostic string, traitement string, observation string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`UPDATE rendez_vous SET statut = 'Terminée' WHERE id = ?`, rdvID)
	if err != nil {
		tx.Rollback()
		return err
	}

	dateConsultation := time.Now().Format("2006-01-02 15:04:05")
	_, err = tx.Exec(`
		INSERT INTO consultations (rdv_id, diagnostic, traitement, observation, date_consultation)
		VALUES (?, ?, ?, ?, ?)`,
		rdvID, diagnostic, traitement, observation, dateConsultation)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}
