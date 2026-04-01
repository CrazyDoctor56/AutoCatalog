// ---- АВТОРИЗАЦІЯ (тимчасово localStorage, потім Flask API) ----

function login() {
    const email    = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) { showToast("Заповніть всі поля"); return; }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user  = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        showToast(`Ласкаво просимо, ${user.name}!`);
        setTimeout(() => window.location.href = "/", 1200);
    } else {
        showToast("Невірний email або пароль");
    }
}

function register() {
    const name    = document.getElementById("registerName")?.value.trim();
    const email   = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value;
    const confirm  = document.getElementById("registerPasswordConfirm")?.value;

    if (!name || !email || !password || !confirm) { showToast("Заповніть всі поля"); return; }
    if (password !== confirm) { showToast("Паролі не співпадають"); return; }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.email === email)) { showToast("Email вже зареєстровано"); return; }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    showToast("Реєстрація успішна!");
    setTimeout(() => window.location.href = "/login", 1200);
}

if (typeof showToast === "undefined") {
    function showToast(msg) { alert(msg); }
}