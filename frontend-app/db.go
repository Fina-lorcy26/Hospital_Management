package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDatabase() {
	var err error
	db, err = sql.Open("sqlite", "hospital.db")
	if err != nil {
		log.Fatal("Erreur ouverture base de donnees:", err)
	}

	createPatientsTable := `
	CREATE TABLE IF NOT EXISTS patients (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nom TEXT NOT NULL,
		prenom TEXT,
		sexe TEXT,
		telephone TEXT,
		date_naissance TEXT,
		adresse TEXT,
		motif TEXT
	);`
	db.Exec(createPatientsTable)

	createMedecinsTable := `
	CREATE TABLE IF NOT EXISTS medecins (
		matricule TEXT PRIMARY KEY,
		nom TEXT NOT NULL,
		prenom TEXT,
		specialite TEXT,
		telephone TEXT,
		email TEXT
	);`
	db.Exec(createMedecinsTable)

	createRdvTable := `
	CREATE TABLE IF NOT EXISTS rendez_vous (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		patient_nom TEXT,
		medecin_nom TEXT,
		motif TEXT,
		date TEXT,
		heure TEXT,
		statut TEXT
	);`
	db.Exec(createRdvTable)

	createConsultationsTable := `
	CREATE TABLE IF NOT EXISTS consultations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		rdv_id INTEGER,
		diagnostic TEXT,
		traitement TEXT,
		observation TEXT,
		date_consultation TEXT,
		statut TEXT
	);`
	db.Exec(createConsultationsTable)

	var count int
	db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&count)
	if count == 0 {
		insertSeedData()
	}

	var countMedecins int
	db.QueryRow("SELECT COUNT(*) FROM medecins").Scan(&countMedecins)
	if countMedecins == 0 {
		insertSeedMedecins()
	}

	var countRdv int
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous").Scan(&countRdv)
	if countRdv == 0 {
		insertSeedRdv()
	}
		var countConsultations int
	db.QueryRow("SELECT COUNT(*) FROM consultations").Scan(&countConsultations)
	if countConsultations == 0 {
		insertSeedConsultations()
	}
}

func insertSeedData() {
	patients := []struct {
		Nom, Prenom, Sexe, Telephone, DateNaissance, Adresse, Motif string
	}{
		{"Lorcy", "Fifi", "F", "692623146", "18/08/2002", "Rue des manguiers", "Mal de ventre"},
		{"Rudy", "Jean", "M", "692111333", "02/03/1998", "Akwa", "Fievre"},
		{"Alix", "Marie", "F", "692555666", "10/10/1990", "Bonaberi", "Controle"},
	}
	for _, p := range patients {
		db.Exec("INSERT INTO patients (nom, prenom, sexe, telephone, date_naissance, adresse, motif) VALUES (?, ?, ?, ?, ?, ?, ?)",
			p.Nom, p.Prenom, p.Sexe, p.Telephone, p.DateNaissance, p.Adresse, p.Motif)
	}
}

func insertSeedMedecins() {
	medecins := []struct {
		Matricule, Nom, Prenom, Specialite, Telephone, Email string
	}{
		{"MED-001", "Clara", "Sophie", "Cardiologie", "692643784", "clara@hopital.com"},
		{"MED-002", "Iris", "Julie", "Pediatrie", "692111222", "iris@hopital.com"},
		{"MED-003", "Alix", "Marc", "Generaliste", "692333444", "alix@hopital.com"},
	}
	for _, m := range medecins {
		db.Exec("INSERT INTO medecins (matricule, nom, prenom, specialite, telephone, email) VALUES (?, ?, ?, ?, ?, ?)",
			m.Matricule, m.Nom, m.Prenom, m.Specialite, m.Telephone, m.Email)
	}
}

func insertSeedRdv() {
	rdvs := []struct {
		PatientNom, MedecinNom, Motif, Date, Heure, Statut string
	}{
		{"Lorcy", "Dr. Clara", "Douleurs thoraciques", "22/07/2026", "09:30", "Confirmé"},
		{"Rudy", "Dr. Iris", "Fievre", "22/07/2026", "11:00", "En attente"},
		{"Alix", "Dr. Clara", "Controle", "21/07/2026", "15:45", "Annulé"},
	}
	for _, r := range rdvs {
		db.Exec("INSERT INTO rendez_vous (patient_nom, medecin_nom, motif, date, heure, statut) VALUES (?, ?, ?, ?, ?, ?)",
			r.PatientNom, r.MedecinNom, r.Motif, r.Date, r.Heure, r.Statut)
	}
}
func insertSeedConsultations() {
	consultations := []struct {
		RdvID       int
		Diagnostic  string
		Traitement  string
		Observation string
		Date        string
		Statut      string
	}{
		{1, "Angine de poitrine suspectée", "Repos, examens complementaires", "Patient stable", "22/07/2026", "Terminee"},
	}
	for _, c := range consultations {
		db.Exec(
			"INSERT INTO consultations (rdv_id, diagnostic, traitement, observation, date_consultation, statut) VALUES (?, ?, ?, ?, ?, ?)",
			c.RdvID, c.Diagnostic, c.Traitement, c.Observation, c.Date, c.Statut,
		)
	}
}