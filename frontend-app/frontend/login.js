document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const matricule = document.getElementById("matricule").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    try {
        const message = await AddUtilisateur(email, password, matricule);

        if (message !== "ok") {
            alert(message);
            return;
        }

        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        window.location.href = "index.html"; // adapte selon le nom réel de ta page de connexion

    } catch (err) {
        alert("Erreur : " + err);
        console.error(err);
    }
});