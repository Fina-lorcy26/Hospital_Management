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


    // Pour les modals
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                overlay.classList.remove('active');
            }
        });
    });
});

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.openModal = openModal;
window.closeModal = closeModal;

function showProfile(type) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-profil-' + type).classList.add('active');
}

function navigateBack(targetPage) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-' + targetPage).classList.add('active');

    // Remet le bon lien actif dans le menu
    document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${targetPage}"]`).classList.add('active');
}

window.showProfile = showProfile;
window.navigateBack = navigateBack;