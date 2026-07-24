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
		log.Fatal("Erreur ouverture base de données:", err)
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS patients (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nom TEXT NOT NULL,
		prenom TEXT,
		specialite TEXT
	);
	`
	_, err = db.Exec(createTable)
	if err != nil {
		log.Fatal("Erreur création table patients:", err)
	}

	createMedecinsTable := `
	CREATE TABLE IF NOT EXISTS medecins (
		matricule TEXT PRIMARY KEY,
		nom TEXT NOT NULL,
		prenom TEXT,
		specialite TEXT,
		telephone TEXT,
		email TEXT
	);
	`
	_, err = db.Exec(createMedecinsTable)
if err != nil {
    log.Fatal("Erreur création table medecins:", err)
}

	createRdvTable := `
	CREATE TABLE IF NOT EXISTS rendez_vous (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		patient_nom TEXT,
		medecin_nom TEXT,
		date TEXT,
		heure TEXT,
		statut TEXT
	);
	`
	_, err = db.Exec(createRdvTable)
if err != nil {
    log.Fatal("Erreur création table rendez_vous:", err)
}

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
}

func insertSeedData() {
	patients := []struct {
		Nom        string
		Prenom     string
		Specialite string
	}{
		{"Lorcy", "Fifi", "Cardiologie"},
		{"Rudy", "Jean", "Pédiatrie"},
		{"Alix", "Marie", "Généraliste"},
	}

	for _, p := range patients {
		_, err := db.Exec(
			"INSERT INTO patients (nom, prenom, specialite) VALUES (?, ?, ?)",
			p.Nom, p.Prenom, p.Specialite,
		)
		if err != nil {
			log.Println("Erreur insertion patient:", err)
		}
	}
}

func insertSeedMedecins() {
	medecins := []struct {
		Matricule  string
		Nom        string
		Prenom     string
		Specialite string
		Telephone  string
		Email      string
	}{
		{"MED-001", "Clara", "Sophie", "Cardiologie", "692643784", "clara@hopital.com"},
		{"MED-002", "Iris", "Julie", "Pédiatrie", "692111222", "iris@hopital.com"},
		{"MED-003", "Alix", "Marc", "Généraliste", "692333444", "alix@hopital.com"},
	}

	for _, m := range medecins {
		db.Exec(
			"INSERT INTO medecins (matricule, nom, prenom, specialite, telephone, email) VALUES (?, ?, ?, ?, ?, ?)",
			m.Matricule, m.Nom, m.Prenom, m.Specialite, m.Telephone, m.Email,
		)
	}
}

func insertSeedRdv() {
	rdvs := []struct {
		PatientNom string
		MedecinNom string
		Date       string
		Heure      string
		Statut     string
	}{
		{"Lorcy", "Dr. Clara", "22/07/2026", "09:30", "Confirmé"},
		{"Rudy", "Dr. Iris", "22/07/2026", "11:00", "En attente"},
		{"Alix", "Dr. Clara", "21/07/2026", "15:45", "Annulé"},
	}

	for _, r := range rdvs {
		db.Exec(
			"INSERT INTO rendez_vous (patient_nom, medecin_nom, date, heure, statut) VALUES (?, ?, ?, ?, ?)",
			r.PatientNom, r.MedecinNom, r.Date, r.Heure, r.Statut,
		)
	}
}