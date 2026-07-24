export namespace main {
	
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
	    specialite: string;
	
	    static createFrom(source: any = {}) {
	        return new Patient(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nom = source["nom"];
	        this.prenom = source["prenom"];
	        this.specialite = source["specialite"];
	    }
	}
	export class RendezVous {
	    id: number;
	    patient_nom: string;
	    medecin_nom: string;
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
	        this.date = source["date"];
	        this.heure = source["heure"];
	        this.statut = source["statut"];
	    }
	}

}

