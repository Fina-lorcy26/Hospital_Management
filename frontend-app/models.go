package main

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
	MedecinNom       string `json:"medecin_nom"`
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
// Résultat de l'ajout d'un médecin : succès + identifiants générés à communiquer
type AjoutMedecinResult struct {
	Success    bool   `json:"success"`
	Message    string `json:"message"`
	Login      string `json:"login"`
	MotDePasse string `json:"mot_de_passe"`
}
