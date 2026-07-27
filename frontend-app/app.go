package main

import (
	"context"
	"fmt"
)

type App struct {
	ctx context.Context
}

type Patient struct {
	ID            int    `json:"id"`
	Nom           string `json:"nom"`
	Prenom        string `json:"prenom"`
	Sexe          string `json:"sexe"`
	Telephone     string `json:"telephone"`
	DateNaissance string `json:"date_naissance"`
	Adresse       string `json:"adresse"`
	Motif         string `json:"motif"`
}

type Medecin struct {
	Matricule  string `json:"matricule"`
	Nom        string `json:"nom"`
	Prenom     string `json:"prenom"`
	Specialite string `json:"specialite"`
	Telephone  string `json:"telephone"`
	Email      string `json:"email"`
}

type RendezVous struct {
	ID         int    `json:"id"`
	PatientNom string `json:"patient_nom"`
	MedecinNom string `json:"medecin_nom"`
	Motif      string `json:"motif"`
	Date       string `json:"date"`
	Heure      string `json:"heure"`
	Statut     string `json:"statut"`
}

type DashboardStats struct {
	TotalPatients int `json:"total_patients"`
	TotalMedecins int `json:"total_medecins"`
	TotalRdv      int `json:"total_rdv"`
	RdvEnAttente  int `json:"rdv_en_attente"`
	RdvConfirmes  int `json:"rdv_confirmes"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	initDatabase()
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ---------- PATIENTS ----------

func (a *App) GetPatients() []Patient {
	rows, err := db.Query("SELECT id, nom, prenom, sexe, telephone, date_naissance, adresse, motif FROM patients")
	if err != nil {
		fmt.Println("Erreur recuperation patients:", err)
		return []Patient{}
	}
	defer rows.Close()

	var patients []Patient
	for rows.Next() {
		var p Patient
		rows.Scan(&p.ID, &p.Nom, &p.Prenom, &p.Sexe, &p.Telephone, &p.DateNaissance, &p.Adresse, &p.Motif)
		patients = append(patients, p)
	}
	return patients
}

func (a *App) AddPatient(nom, prenom, sexe, telephone, dateNaissance, adresse, motif string) string {
	_, err := db.Exec(
		"INSERT INTO patients (nom, prenom, sexe, telephone, date_naissance, adresse, motif) VALUES (?, ?, ?, ?, ?, ?, ?)",
		nom, prenom, sexe, telephone, dateNaissance, adresse, motif,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) UpdatePatient(id int, nom, prenom, sexe, telephone, dateNaissance, adresse, motif string) string {
	_, err := db.Exec(
		"UPDATE patients SET nom=?, prenom=?, sexe=?, telephone=?, date_naissance=?, adresse=?, motif=? WHERE id=?",
		nom, prenom, sexe, telephone, dateNaissance, adresse, motif, id,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) DeletePatient(id int) string {
	_, err := db.Exec("DELETE FROM patients WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// ---------- MEDECINS ----------

func (a *App) GetMedecins() []Medecin {
	rows, err := db.Query("SELECT matricule, nom, prenom, specialite, telephone, email FROM medecins")
	if err != nil {
		fmt.Println("Erreur recuperation medecins:", err)
		return []Medecin{}
	}
	defer rows.Close()

	var medecins []Medecin
	for rows.Next() {
		var m Medecin
		rows.Scan(&m.Matricule, &m.Nom, &m.Prenom, &m.Specialite, &m.Telephone, &m.Email)
		medecins = append(medecins, m)
	}
	return medecins
}

func (a *App) AddMedecin(matricule, nom, prenom, specialite, telephone, email string) string {
	_, err := db.Exec(
		"INSERT INTO medecins (matricule, nom, prenom, specialite, telephone, email) VALUES (?, ?, ?, ?, ?, ?)",
		matricule, nom, prenom, specialite, telephone, email,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) UpdateMedecin(matricule, nom, prenom, specialite, telephone, email string) string {
	_, err := db.Exec(
		"UPDATE medecins SET nom=?, prenom=?, specialite=?, telephone=?, email=? WHERE matricule=?",
		nom, prenom, specialite, telephone, email, matricule,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) DeleteMedecin(matricule string) string {
	_, err := db.Exec("DELETE FROM medecins WHERE matricule=?", matricule)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// ---------- RENDEZ-VOUS ----------

func (a *App) GetRendezVous() []RendezVous {
	rows, err := db.Query("SELECT id, patient_nom, medecin_nom, motif, date, heure, statut FROM rendez_vous")
	if err != nil {
		fmt.Println("Erreur recuperation rendez-vous:", err)
		return []RendezVous{}
	}
	defer rows.Close()

	var rdvs []RendezVous
	for rows.Next() {
		var r RendezVous
		rows.Scan(&r.ID, &r.PatientNom, &r.MedecinNom, &r.Motif, &r.Date, &r.Heure, &r.Statut)
		rdvs = append(rdvs, r)
	}
	return rdvs
}

func (a *App) AddRendezVous(patientNom, medecinNom, motif, date, heure string) string {
	_, err := db.Exec(
		"INSERT INTO rendez_vous (patient_nom, medecin_nom, motif, date, heure, statut) VALUES (?, ?, ?, ?, ?, ?)",
		patientNom, medecinNom, motif, date, heure, "En attente",
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) UpdateRendezVous(id int, patientNom, medecinNom, motif, date, heure string) string {
	_, err := db.Exec(
		"UPDATE rendez_vous SET patient_nom=?, medecin_nom=?, motif=?, date=?, heure=? WHERE id=?",
		patientNom, medecinNom, motif, date, heure, id,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

func (a *App) DeleteRendezVous(id int) string {
	_, err := db.Exec("DELETE FROM rendez_vous WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// ---------- DASHBOARD ----------

func (a *App) GetDashboardStats() DashboardStats {
	var stats DashboardStats
	db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&stats.TotalPatients)
	db.QueryRow("SELECT COUNT(*) FROM medecins").Scan(&stats.TotalMedecins)
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous").Scan(&stats.TotalRdv)
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE statut = ?", "En attente").Scan(&stats.RdvEnAttente)
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE statut = ?", "Confirmé").Scan(&stats.RdvConfirmes)
	return stats
}