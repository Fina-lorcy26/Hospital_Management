package main

import (
	"context"
	"fmt"
)

// L'appli principale, conserve le contexte d'execution de wails
type App struct {
	ctx context.Context
}

// Representation d'un patient
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
	TotalPatients         int `json:"total_patients"`
	TotalMedecins         int `json:"total_medecins"`
	TotalRdv              int `json:"total_rdv"`
	RdvEnAttente          int `json:"rdv_en_attente"`
	RdvConfirmes          int `json:"rdv_confirmes"`
	ConsultationEnAttente int `json:"consultation_attente"`
}

type Consultation struct {
	ID               int    `json:"id"`
	RdvID            int    `json:"rdv_id"`
	Diagnostic       string `json:"diagnostic"`
	Traitement       string `json:"traitement"`
	Observation      string `json:"observation"`
	DateConsultation string `json:"date_consultation"`
	Statut           string `json:"statut"`
}

type ConsultationDetail struct {
	ID               int    `json:"id"`
	RdvID            int    `json:"rdv_id"`
	PatientNom       string `json:"patient_nom"`
	DateRdv          string `json:"date_rdv"`
	DateConsultation string `json:"date_consultation"`
	Diagnostic       string `json:"diagnostic"`
	Traitement       string `json:"traitement"`
	Observation      string `json:"observation"`
	Statut           string `json:"statut"`
}

// Constructeur de App qui va initialiser et retourner une nouvelle instance de app
func NewApp() *App {
	return &App{}
}

// Stockage de contexte et initialisation de la BD
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	initDatabase()
}

// Message de bienvenu
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ---------- GESTION DES PATIENTS ----------

// Affichage de la liste
func (a *App) GetPatients() []Patient {
	rows, err := db.Query("SELECT id, nom, prenom, sexe, telephone, date_naissance, adresse, motif FROM patients")
	if err != nil {
		fmt.Println("Erreur recuperation patients:", err)
		return []Patient{}
	}

	defer rows.Close() //ferme la connexion aux resultats a la fin de la fonction

	//recuperation des données de chaque ligne de patient
	var patients []Patient
	for rows.Next() {
		var p Patient
		rows.Scan(&p.ID, &p.Nom, &p.Prenom, &p.Sexe, &p.Telephone, &p.DateNaissance, &p.Adresse, &p.Motif)
		patients = append(patients, p) // Affectation aux champs de la structure Patient
	}
	return patients
}

// Insertion d'un nouveau patient
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

// Mises à jour d'un patient pour modification
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

// Suppression definitive d'un patient grace a son ID
func (a *App) DeletePatient(id int) string {
	_, err := db.Exec("DELETE FROM patients WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// ---------- GESTION DES MEDECINS ----------
//Affiche Medecin
func (a *App) GetMedecins() []Medecin {
	rows, err := db.Query("SELECT matricule, nom, prenom, specialite, telephone, email FROM medecins")
	if err != nil {
		fmt.Println("Erreur recuperation medecins:", err)
		return []Medecin{}
	}
	defer rows.Close()
	//Recuperation des données 
	var medecins []Medecin
	for rows.Next() {
		var m Medecin
		rows.Scan(&m.Matricule, &m.Nom, &m.Prenom, &m.Specialite, &m.Telephone, &m.Email)
		medecins = append(medecins, m) // Affectation d'un nouveau medecin dans la structure des medecins
	}
	return medecins
}

// Ajout d'un medecin
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

// Mises à jour 
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

// Suppression d'un medecin
func (a *App) DeleteMedecin(matricule string) string {
	_, err := db.Exec("DELETE FROM medecins WHERE matricule=?", matricule)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// ---------- GESTION DES RENDEZ-VOUS ----------
//liste complete de rendez-vous
func (a *App) GetRendezVous() []RendezVous {
	rows, err := db.Query("SELECT id, patient_nom, medecin_nom, motif, date, heure, statut FROM rendez_vous")
	if err != nil {
		fmt.Println("Erreur recuperation rendez-vous:", err)
		return []RendezVous{}
	}
	defer rows.Close()
//recuperation des données
	var rdvs []RendezVous
	for rows.Next() {
		var r RendezVous
		rows.Scan(&r.ID, &r.PatientNom, &r.MedecinNom, &r.Motif, &r.Date, &r.Heure, &r.Statut)
		rdvs = append(rdvs, r) // insertion
	}
	return rdvs
}

//Ajouter un rdv
func (a *App) AddRendezVous(patientNom, medecinNom, motif, date, heure string) string {
	_, err := db.Exec(
		"INSERT INTO rendez_vous (patient_nom, medecin_nom, motif, date, heure, statut) VALUES (?, ?, ?, ?, ?, ?)",
		patientNom, medecinNom, motif, date, heure, "En attente",
	) // le statut est par defaut en attente 
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// Mises à jour d'un rdv
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

//supression d'un rendez-vous
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
	db.QueryRow("SELECT COUNT(*) FROM consultations WHERE statut = ?", "En cours").Scan(&stats.ConsultationEnAttente)
	return stats
}

// ---------- CONSULTATIONS ----------
//liste les consultations
func (a *App) GetConsultations() []Consultation {
	rows, err := db.Query("SELECT id, rdv_id, diagnostic, traitement, observation, date_consultation, statut FROM consultations")
	if err != nil {
		fmt.Println("Erreur recuperation consultations:", err)
		return []Consultation{}
	}
	defer rows.Close()

	// Recuperation des données
	var consultations []Consultation
	for rows.Next() {
		var c Consultation
		rows.Scan(&c.ID, &c.RdvID, &c.Diagnostic, &c.Traitement, &c.Observation, &c.DateConsultation, &c.Statut)
		consultations = append(consultations, c)// insertion des données
	}
	return consultations
}

//Ajout d'une consultation liée a un rdv
func (a *App) AddConsultation(rdvID int, diagnostic, traitement, observation, dateConsultation string) string {
	_, err := db.Exec(
		"INSERT INTO consultations (rdv_id, diagnostic, traitement, observation, date_consultation, statut) VALUES (?, ?, ?, ?, ?, ?)",
		rdvID, diagnostic, traitement, observation, dateConsultation, "En cours",
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

//Mises a jour du statut d'une consultation
func (a *App) UpdateConsultationStatut(id int, statut string) string {
	_, err := db.Exec("UPDATE consultations SET statut=? WHERE id=?", statut, id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

//suppression d'une consultation
func (a *App) DeleteConsultation(id int) string {
	_, err := db.Exec("DELETE FROM consultations WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

//Mises a jour du statut d'un rdv
func (a *App) UpdateRendezVousStatut(id int, statut string) string {
	_, err := db.Exec("UPDATE rendez_vous SET statut=? WHERE id=?", statut, id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}


// Jointure SQL entre consultation et rendez-vous pourn'afficher que les consultations concernant un medecin en particulier  
func (a *App) GetConsultationsByMedecin(medecinNom string) []ConsultationDetail {
	rows, err := db.Query(`
        SELECT c.id, c.rdv_id, r.patient_nom, r.date, c.date_consultation, c.diagnostic, c.traitement, c.observation, c.statut
        FROM consultations c
        JOIN rendez_vous r ON c.rdv_id = r.id
        WHERE r.medecin_nom = ?
    `, medecinNom)

	if err != nil {
		fmt.Println("Erreur recuperation consultations detaillees:", err)
		return []ConsultationDetail{}
	}
	defer rows.Close()

	var list []ConsultationDetail
	for rows.Next() {
		var c ConsultationDetail
		rows.Scan(&c.ID, &c.RdvID, &c.PatientNom, &c.DateRdv, &c.DateConsultation, &c.Diagnostic, &c.Traitement, &c.Observation, &c.Statut)
		list = append(list, c)
	}
	return list
}
