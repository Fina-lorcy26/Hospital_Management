package main

import (
	"fmt"
	"time"
)

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
        SELECT c.id, c.rdv_id, r.patient_id,
            (p.nom || ' ' || COALESCE(p.prenom, '')) AS patient_nom,
            (m.nom || ' ' || COALESCE(m.prenom, '')) AS medecin_nom,
            r.date AS date_rdv, c.date_consultation, c.diagnostic, c.traitement, c.observation
        FROM consultations c
        JOIN rendez_vous r ON c.rdv_id = r.id
        JOIN patients p ON r.patient_id = p.id
        JOIN medecins m ON r.medecin_mat = m.matricule
        WHERE r.medecin_mat = ?
        ORDER BY c.date_consultation DESC
    `, medecinMat)

	if err != nil {
		fmt.Println("Erreur récupération consultations détaillées :", err)
		return []ConsultationDetail{}
	}
	defer rows.Close()
	var list []ConsultationDetail
	for rows.Next() {
		var c ConsultationDetail
		err := rows.Scan(&c.ID, &c.RdvID, &c.PatientId, &c.PatientNom,
			&c.MedecinNom, &c.DateRdv, &c.DateConsultation, &c.Diagnostic,
			&c.Traitement, &c.Observation,
		)
		if err != nil {
			fmt.Println("Erreur lecture consultation :", err)
			continue
		}
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

// Pour que l'admin ait une vue sur toutes les consultations
func (a *App) GetToutesLesConsultations() []ConsultationDetail {
	rows, err := db.Query(`
        SELECT c.id, c.rdv_id, r.patient_id,
            (p.nom || ' ' || COALESCE(p.prenom, '')) AS patient_nom,
            (m.nom || ' ' || COALESCE(m.prenom, '')) AS medecin_nom,
            r.date AS date_rdv, c.date_consultation, c.diagnostic, 
			c.traitement, c.observation
        FROM consultations c
       LEFT JOIN rendez_vous r ON c.rdv_id = r.id
       LEFT JOIN patients p ON r.patient_id = p.id
       LEFT JOIN medecins m ON r.medecin_mat = m.matricule
        ORDER BY c.date_consultation DESC
    `)
	if err != nil {
		fmt.Println("Erreur récupération consultations :", err)
		return []ConsultationDetail{}
	}
	defer rows.Close()
	var list []ConsultationDetail
	for rows.Next() {
		var c ConsultationDetail
		err := rows.Scan(&c.ID, &c.RdvID, &c.PatientId, &c.PatientNom, &c.MedecinNom,
			&c.DateRdv, &c.DateConsultation, &c.Diagnostic, &c.Traitement, &c.Observation,
		)
		if err != nil {
			fmt.Println("Erreur lecture consultation :", err)
			continue
		}
		list = append(list, c)
	}
	if err := rows.Err(); err != nil {
		fmt.Println("Erreur parcours consultations :", err)
	}
	return list
}
