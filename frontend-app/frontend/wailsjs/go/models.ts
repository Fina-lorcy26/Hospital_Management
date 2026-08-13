export namespace main {
	
	export class AjoutMedecinResult {
	    success: boolean;
	    message: string;
	    login: string;
	    mot_de_passe: string;
	
	    static createFrom(source: any = {}) {
	        return new AjoutMedecinResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.login = source["login"];
	        this.mot_de_passe = source["mot_de_passe"];
	    }
	}
	export class ConsultationDetail {
	    id: number;
	    rdv_id: number;
	    patient_id: string;
	    patient_nom: string;
	    date_rdv: string;
	    date_consultation: string;
	    diagnostic: string;
	    traitement: string;
	    observation: string;
	    medecin_nom: string;
	
	    static createFrom(source: any = {}) {
	        return new ConsultationDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.rdv_id = source["rdv_id"];
	        this.patient_id = source["patient_id"];
	        this.patient_nom = source["patient_nom"];
	        this.date_rdv = source["date_rdv"];
	        this.date_consultation = source["date_consultation"];
	        this.diagnostic = source["diagnostic"];
	        this.traitement = source["traitement"];
	        this.observation = source["observation"];
	        this.medecin_nom = source["medecin_nom"];
	    }
	}
	export class DashboardStats {
	    total_patients: number;
	    total_medecins: number;
	    rdv_du_jour: number;
	    rdv_en_attente: number;
	    rdv_programmes: number;
	    consultations_terminees: number;
	
	    static createFrom(source: any = {}) {
	        return new DashboardStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_patients = source["total_patients"];
	        this.total_medecins = source["total_medecins"];
	        this.rdv_du_jour = source["rdv_du_jour"];
	        this.rdv_en_attente = source["rdv_en_attente"];
	        this.rdv_programmes = source["rdv_programmes"];
	        this.consultations_terminees = source["consultations_terminees"];
	    }
	}
	export class Medecin {
	    matricule: string;
	    nom: string;
	    prenom: string;
	    specialite: string;
	    telephone: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new Medecin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.matricule = source["matricule"];
	        this.nom = source["nom"];
	        this.prenom = source["prenom"];
	        this.specialite = source["specialite"];
	        this.telephone = source["telephone"];
	        this.email = source["email"];
	    }
	}
	export class Patient {
	    id: number;
	    nom: string;
	    prenom: string;
	    sexe: string;
	    telephone: string;
	    date_naissance: string;
	    adresse: string;
	    motif: string;
	
	    static createFrom(source: any = {}) {
	        return new Patient(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nom = source["nom"];
	        this.prenom = source["prenom"];
	        this.sexe = source["sexe"];
	        this.telephone = source["telephone"];
	        this.date_naissance = source["date_naissance"];
	        this.adresse = source["adresse"];
	        this.motif = source["motif"];
	    }
	}
	export class RendezVous {
	    id: number;
	    patient_id: string;
	    medecin_mat: string;
	    motif: string;
	    date: string;
	    heure: string;
	    statut: string;
	    patient_nom: string;
	    medecin_nom: string;
	    motif_annulation: string;
	
	    static createFrom(source: any = {}) {
	        return new RendezVous(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.patient_id = source["patient_id"];
	        this.medecin_mat = source["medecin_mat"];
	        this.motif = source["motif"];
	        this.date = source["date"];
	        this.heure = source["heure"];
	        this.statut = source["statut"];
	        this.patient_nom = source["patient_nom"];
	        this.medecin_nom = source["medecin_nom"];
	        this.motif_annulation = source["motif_annulation"];
	    }
	}
	export class Utilisateur {
	    id: number;
	    login: string;
	    mot_de_passe: string;
	    role: string;
	    nom_complet: string;
	    medecin_mat: string;
	    telephone: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new Utilisateur(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.login = source["login"];
	        this.mot_de_passe = source["mot_de_passe"];
	        this.role = source["role"];
	        this.nom_complet = source["nom_complet"];
	        this.medecin_mat = source["medecin_mat"];
	        this.telephone = source["telephone"];
	        this.email = source["email"];
	    }
	}

}

