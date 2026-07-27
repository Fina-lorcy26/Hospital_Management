export namespace main {
	
	export class DashboardStats {
	    total_patients: number;
	    total_medecins: number;
	    total_rdv: number;
	    rdv_en_attente: number;
	    rdv_confirmes: number;
	
	    static createFrom(source: any = {}) {
	        return new DashboardStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_patients = source["total_patients"];
	        this.total_medecins = source["total_medecins"];
	        this.total_rdv = source["total_rdv"];
	        this.rdv_en_attente = source["rdv_en_attente"];
	        this.rdv_confirmes = source["rdv_confirmes"];
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
	    patient_nom: string;
	    medecin_nom: string;
	    motif: string;
	    date: string;
	    heure: string;
	    statut: string;
	
	    static createFrom(source: any = {}) {
	        return new RendezVous(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.patient_nom = source["patient_nom"];
	        this.medecin_nom = source["medecin_nom"];
	        this.motif = source["motif"];
	        this.date = source["date"];
	        this.heure = source["heure"];
	        this.statut = source["statut"];
	    }
	}

}

