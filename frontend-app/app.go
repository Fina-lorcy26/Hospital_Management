package main

import (
	"context"
	"fmt"
)


type App struct {
	ctx context.Context
}

// Patient représente un patient dans la base de données
type Patient struct {
	ID         int    `json:"id"`
	Nom        string `json:"nom"`
	Prenom     string `json:"prenom"`
	Specialite string `json:"specialite"`
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

// GetPatients récupère tous les patients depuis la base de données
func (a *App) GetPatients() []Patient {
	rows, err := db.Query("SELECT id, nom, prenom, specialite FROM patients")
	if err != nil {
		fmt.Println("Erreur récupération patients:", err)
		return []Patient{}
	}
	defer rows.Close()

	var patients []Patient
	for rows.Next() {
		var p Patient
		err := rows.Scan(&p.ID, &p.Nom, &p.Prenom, &p.Specialite)
		if err != nil {
			fmt.Println("Erreur lecture patient:", err)
			continue
		}
		patients = append(patients, p)
	}

	return patients
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
	Date       string `json:"date"`
	Heure      string `json:"heure"`
	Statut     string `json:"statut"`
}

func (a *App) GetMedecins() []Medecin {
	rows, err := db.Query("SELECT matricule, nom, prenom, specialite, telephone, email FROM medecins")
	if err != nil {
		fmt.Println("Erreur récupération médecins:", err)
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


func (a *App) GetRendezVous() []RendezVous {
	rows, err := db.Query("SELECT id, patient_nom, medecin_nom, date, heure, statut FROM rendez_vous")
	if err != nil {
		fmt.Println("Erreur récupération rendez-vous:", err)
		return []RendezVous{}
	}
	defer rows.Close()

	var rdvs []RendezVous
	for rows.Next() {
		var r RendezVous
		rows.Scan(&r.ID, &r.PatientNom, &r.MedecinNom, &r.Date, &r.Heure, &r.Statut)
		rdvs = append(rdvs, r)
	}
	return rdvs
}
