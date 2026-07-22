document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-menu a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetPage = link.getAttribute('data-page');

            // Cache toutes les pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Affiche la page ciblée
            document.getElementById('page-' + targetPage).classList.add('active');

            // Met à jour le lien actif dans le menu
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
});