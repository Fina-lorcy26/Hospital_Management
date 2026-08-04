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

	// Active la gestion des clés étrangères dans SQLite
	db.Exec("PRAGMA foreign_keys = ON;")

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

	createUtilisateursTable := `
CREATE TABLE IF NOT EXISTS utilisateurs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	login TEXT UNIQUE NOT NULL,
	mot_de_passe TEXT NOT NULL,
	role TEXT NOT NULL,
	nom_complet TEXT,
	medecin_mat TEXT,
	telephone TEXT,
	email TEXT,
	FOREIGN KEY(medecin_mat) REFERENCES medecins(matricule)
);`

	_, err = db.Exec(createUtilisateursTable)
	if err != nil {
		log.Println("Erreur création utilisateurs :", err)
	}

	createRdvTable := `
	CREATE TABLE IF NOT EXISTS rendez_vous (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		patient_id INTEGER,
		medecin_mat TEXT,
		motif TEXT,
		date TEXT,
		heure TEXT,
		statut TEXT,
		PatientNom string,
		MedecinNom string,
		FOREIGN KEY(patient_id) REFERENCES patients(id),
		FOREIGN KEY(medecin_mat) REFERENCES medecins(matricule)
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
		statut TEXT,
		FOREIGN KEY(rdv_id) REFERENCES rendez_vous(id)
	);`
	db.Exec(createConsultationsTable)

	// Ingestion des données initiales si les tables sont vides
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

	var countUtilisateurs int
	db.QueryRow("SELECT COUNT(*) FROM utilisateurs").Scan(&countUtilisateurs)

	if countUtilisateurs == 0 {
		insertSeedUtilisateurs()
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

func insertSeedUtilisateurs() {
	utilisateurs := []struct {
		Login, MotDePasse, Role, NomComplet, MedecinMat, Telephone, Email string
	}{
		{"admin", "admin123", "admin", "FINA LORCY", "", "", ""},
		{"clara", "1234", "medecin", "Clara Sophie", "MED-001", "", ""},
		{"iris", "1234", "medecin", "Iris Julie", "MED-002", "", ""},
	}

	for _, u := range utilisateurs {
		_, err := db.Exec(
			`INSERT INTO utilisateurs 
				(login, mot_de_passe, role, nom_complet, medecin_mat, telephone, email) 
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			u.Login, u.MotDePasse, u.Role, u.NomComplet, u.MedecinMat, u.Telephone, u.Email)
		if err != nil {
			log.Println("Erreur insertion utilisateur:", err)
		}
	}
}

func insertSeedRdv() {
	rdvs := []struct {
		PatientId                              int
		MedecinMat, Motif, Date, Heure, Statut string
	}{
		{1, "MED-001", "Douleurs thoraciques", "22/07/2026", "09:30", "Confirmé"},
		{2, "MED-002", "Fievre", "22/07/2026", "11:00", "En attente"},
		{3, "MED-003", "Controle", "21/07/2026", "15:45", "Annulé"},
	}
	for _, r := range rdvs {
		db.Exec("INSERT INTO rendez_vous (patient_id, medecin_mat, motif, date, heure, statut) VALUES (?, ?, ?, ?, ?, ?)",
			r.PatientId, r.MedecinMat, r.Motif, r.Date, r.Heure, r.Statut)
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
