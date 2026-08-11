package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
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
	ID              int    `json:"id"`
	PatientId       string `json:"patient_id"`
	MedecinMat      string `json:"medecin_mat"`
	Motif           string `json:"motif"`
	Date            string `json:"date"`
	Heure           string `json:"heure"`
	Statut          string `json:"statut"`
	PatientNom      string `json:"patient_nom"`
	MedecinNom      string `json:"medecin_nom"`
	MotifAnnulation string `json:"motif_annulation"`
}

type DashboardStats struct {
	TotalPatients          int `json:"total_patients"`
	TotalMedecins          int `json:"total_medecins"`
	RdvDujour              int `json:"rdv_du_jour"`
	RdvEnAttente           int `json:"rdv_en_attente"`
	RdvProgrammes          int `json:"rdv_programmes"`
	ConsultationsTerminees int `json:"consultations_terminees"`
}

type Consultation struct {
	ID               int    `json:"id"`
	RdvID            int    `json:"rdv_id"`
	Diagnostic       string `json:"diagnostic"`
	Traitement       string `json:"traitement"`
	Observation      string `json:"observation"`
	DateConsultation string `json:"date_consultation"`
}
type ConsultationDetail struct {
	ID               int    `json:"id"`
	RdvID            int    `json:"rdv_id"`
	PatientId        string `json:"patient_id"`
	PatientNom       string `json:"patient_nom"`
	DateRdv          string `json:"date_rdv"`
	DateConsultation string `json:"date_consultation"`
	Diagnostic       string `json:"diagnostic"`
	Traitement       string `json:"traitement"`
	Observation      string `json:"observation"`
}
type Utilisateur struct {
	ID         int    `json:"id"`
	Login      string `json:"login"`
	MotDePasse string `json:"mot_de_passe"`
	Role       string `json:"role"`
	NomComplet string `json:"nom_complet"`
	MedecinMat string `json:"medecin_mat"`
	Telephone  string `json:"telephone"`
	Email      string `json:"email"`
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
	return fmt.Sprintf("Hello %s", name)
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
	_, err := db.Exec("DELETE FROM patients WHERE id=?", id)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

// ---------- GESTION DES MEDECINS ----------
// Affiche Medecin
func (a *App) GetMedecins() []Medecin {
	rows, err := db.Query("SELECT matricule, nom, prenom, specialite, telephone, email FROM medecins")
	if err != nil {
		fmt.Println("Erreur recuperation medecins:", err)
		return []Medecin{}
	}
	defer rows.Close()
	//Recuperation des données
	var medecins []Medecin = []Medecin{}
	for rows.Next() {
		var m Medecin
		rows.Scan(&m.Matricule, &m.Nom, &m.Prenom, &m.Specialite, &m.Telephone, &m.Email)
		medecins = append(medecins, m) // Affectation d'un nouveau medecin dans la structure des medecins
	}
	return medecins
}

// Ajout d'un medecin
func (a *App) AddMedecin(matricule, nom, prenom, specialite, telephone, email string) string {

	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM medecins WHERE matricule = ?",
		matricule,
	).Scan(&count)

	if err != nil {
		return "Erreur : " + err.Error()
	}

	if count > 0 {
		return "Un médecin avec ce matricule existe déjà."
	}

	var countTel int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE telephone = ?", telephone).Scan(&countTel)
	if countTel > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre médecin."
	}

	var countEmail int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE email = ?", email).Scan(&countEmail)
	if countEmail > 0 {
		return "Cet email est déjà utilisé par un autre médecin."
	}

	_, err = db.Exec(
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
	var countTel int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE telephone = ? AND matricule != ?", telephone, matricule).Scan(&countTel)
	if countTel > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre médecin."
	}

	var countEmail int
	db.QueryRow("SELECT COUNT(*) FROM medecins WHERE email = ? AND matricule != ?", email, matricule).Scan(&countEmail)
	if countEmail > 0 {
		return "Cet email est déjà utilisé par un autre médecin."
	}

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
	var countRdv int
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE medecin_mat = ?", matricule).Scan(&countRdv)
	if countRdv > 0 {
		return "Impossible de supprimer ce médecin : il a des rendez-vous enregistrés dans l'historique."
	}

	var countUtilisateur int
	db.QueryRow("SELECT COUNT(*) FROM utilisateurs WHERE medecin_mat = ?", matricule).Scan(&countUtilisateur)
	if countUtilisateur > 0 {
		return "Impossible de supprimer ce médecin : un compte utilisateur lui est associé."
	}

	_, err := db.Exec("DELETE FROM medecins WHERE matricule=?", matricule)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"
}

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

// Mise à jour d'un rendez-vous
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

	// Vérifier si la date, l'heure ou le médecin ont changé
	dateChangee := date != ancienneDate
	heureChangee := heure != ancienneHeure
	medecinChange := medecinMat != ancienMedecinMat

	// il redevient "En attente"
	nouveauStatut := ancienStatut

	if ancienStatut == "Annulé" &&
		(dateChangee || heureChangee || medecinChange) {

		nouveauStatut = "En attente"
	}

	// Vérifier les conflits de date/heure
	var count int

	err = db.QueryRow(`
		SELECT COUNT(*)
		FROM rendez_vous
		WHERE date = ?
		AND heure = ?
		AND id != ?
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

// ---------- DASHBOARD ----------

func (a *App) GetDashboardStats() DashboardStats {
	var stats DashboardStats
	db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&stats.TotalPatients)
	db.QueryRow("SELECT COUNT(*) FROM medecins").Scan(&stats.TotalMedecins)
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE date = date('now')").Scan(&stats.RdvDujour)
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous").Scan(&stats.RdvProgrammes)
	db.QueryRow("SELECT COUNT(*) FROM rendez_vous WHERE statut = ?", "En attente").Scan(&stats.RdvEnAttente)
	db.QueryRow("SELECT COUNT(*) FROM consultations").Scan(&stats.ConsultationsTerminees)
	return stats
}

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
       SELECT  c.id, c.rdv_id, r.patient_id, (p.nom || ' ' || COALESCE(p.prenom, '')) AS patient_nom,
    r.date AS date_rdv, c.date_consultation,  c.diagnostic, c.traitement, c.observation 
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

// AUTHENTIFICATION--------------
func (a *App) Login(login, password string) (Utilisateur, error) {

	var user Utilisateur
	err := db.QueryRow(
		`SELECT id, login, mot_de_passe, role, nom_complet, COALESCE(medecin_mat, '') AS medecin_mat, telephone, email
		 FROM utilisateurs
		 WHERE login = ?`,
		login,
	).Scan(
		&user.ID,
		&user.Login,
		&user.MotDePasse,
		&user.Role,
		&user.NomComplet,
		&user.MedecinMat,
		&user.Telephone,
		&user.Email,
	)

	if err == sql.ErrNoRows {
		return Utilisateur{}, errors.New("Utilisateur introuvable")
	}

	if err != nil {
		return Utilisateur{}, err
	}

	if user.MotDePasse != password {
		return Utilisateur{}, errors.New("Mot de passe incorrect")
	}

	return user, nil
}
func (a *App) Register(nomComplet, login, telephone, matricule, motDePasse, email string) string {

	// 1. Déterminer le rôle et, pour un médecin, générer automatiquement le login
	role := "admin"
	if matricule != "" {
		var medCount int
		db.QueryRow("SELECT COUNT(*) FROM medecins WHERE matricule = ?", matricule).Scan(&medCount)
		if medCount == 0 {
			return "Matricule médecin introuvable."
		}
		role = "medecin"

		mots := strings.Fields(strings.TrimSpace(nomComplet))
		if len(mots) == 0 {
			return "Le nom complet est requis pour générer le login."
		}
		login = mots[0] + "_" + matricule
	}

	// 2. Unicité du login
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM utilisateurs WHERE login = ?", login).Scan(&count)
	if err != nil {
		return "Erreur : " + err.Error()
	}
	if count > 0 {
		return "Ce login existe déjà."
	}

	// 3. Unicité téléphone et email
	var countTel int
	db.QueryRow("SELECT COUNT(*) FROM utilisateurs WHERE telephone = ?", telephone).Scan(&countTel)
	if countTel > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre compte."
	}

	var countEmail int
	db.QueryRow("SELECT COUNT(*) FROM utilisateurs WHERE email = ?", email).Scan(&countEmail)
	if countEmail > 0 {
		return "Cet email est déjà utilisé par un autre compte."
	}

	// 4. Insertion
	_, err = db.Exec(
		"INSERT INTO utilisateurs (login, mot_de_passe, role, nom_complet, medecin_mat, telephone, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
		login, motDePasse, role, nomComplet, matricule, telephone, email,
	)
	if err != nil {
		return "Erreur: " + err.Error()
	}
	return "ok"

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
