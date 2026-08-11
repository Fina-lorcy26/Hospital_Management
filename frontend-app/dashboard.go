package main

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
