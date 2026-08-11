package main

import (
	"database/sql"
	"errors"
	"strings"
)

// AUTHENTIFICATION--------------
func (a *App) Login(login, password string) (Utilisateur, error) {

	var user Utilisateur
	err := db.QueryRow(
		`SELECT id, login, mot_de_passe, role, nom_complet, COALESCE(medecin_mat, '') AS medecin_mat, telephone, email
		 FROM utilisateurs
		 WHERE login = ?  COLLATE NOCASE `,
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
	// Détermine le rôle
	role := "admin"

	// Si un matricule est fourni, il s'agit d'un médecin
	if matricule != "" {

		// 1. Vérifier que le matricule correspond bien à un médecin
		var medCount int
		err := db.QueryRow(
			"SELECT COUNT(*) FROM medecins WHERE matricule = ?",
			matricule,
		).Scan(&medCount)

		if err != nil {
			return "Erreur lors de la vérification du matricule : " + err.Error()
		}

		if medCount == 0 {
			return "Matricule médecin introuvable."
		}

		role = "medecin"

		// Génération automatique du login
		mots := strings.Fields(strings.TrimSpace(nomComplet))

		if len(mots) == 0 {
			return "Le nom complet est requis pour générer le login."
		}

		login = mots[0] + "_" + matricule

		// 2. Vérifier que ce matricule n'a pas déjà un compte
		var matriculeCount int
		err = db.QueryRow(
			"SELECT COUNT(*) FROM utilisateurs WHERE medecin_mat = ?",
			matricule,
		).Scan(&matriculeCount)

		if err != nil {
			return "Erreur lors de la vérification du matricule : " + err.Error()
		}

		if matriculeCount > 0 {
			return "Ce matricule possède déjà un compte utilisateur."
		}
	}

	// 3. Vérifier l'unicité du login
	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM utilisateurs WHERE login = ? COLLATE NOCASE",
		login,
	).Scan(&count)

	if err != nil {
		return "Erreur : " + err.Error()
	}

	if count > 0 {
		return "Ce login existe déjà."
	}

	// 4. Vérifier l'unicité du téléphone
	var countTel int
	err = db.QueryRow(
		"SELECT COUNT(*) FROM utilisateurs WHERE telephone = ?",
		telephone,
	).Scan(&countTel)

	if err != nil {
		return "Erreur lors de la vérification du téléphone : " + err.Error()
	}

	if countTel > 0 {
		return "Ce numéro de téléphone est déjà utilisé par un autre compte."
	}

	// 5. Vérifier l'unicité de l'email
	var countEmail int
	err = db.QueryRow(
		"SELECT COUNT(*) FROM utilisateurs WHERE email = ?",
		email,
	).Scan(&countEmail)

	if err != nil {
		return "Erreur lors de la vérification de l'email : " + err.Error()
	}

	if countEmail > 0 {
		return "Cet email est déjà utilisé par un autre compte."
	}

	// 6. Insérer le nouvel utilisateur
	_, err = db.Exec(
		`INSERT INTO utilisateurs
		(login, mot_de_passe, role, nom_complet, medecin_mat, telephone, email)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		login,
		motDePasse,
		role,
		nomComplet,
		matricule,
		telephone,
		email,
	)

	if err != nil {
		return "Erreur : " + err.Error()
	}

	return "ok"
}

