document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-menu a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById('page-' + targetPage).classList.add('active');
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    updateTopbarDate();
});

//---Gerer la date du Tableau de bord-----

function updateTopbarDate() {
    const dateElement = document.querySelector('.topbar-date');
    if (!dateElement) return;
    
    const now = new Date();
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const jourSemaine = jours[now.getDay()];
    const jour = now.getDate();
    const moisNom = mois[now.getMonth()];
    const annee = now.getFullYear();
    
    dateElement.textContent = `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}