async function register() {
    const name     = document.getElementById("registerName")?.value.trim();
    const email    = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value;
    const confirm  = document.getElementById("registerPasswordConfirm")?.value;

    if (!name || !email || !password || !confirm) { showToast("Заповніть всі поля"); return; }
    if (password !== confirm) { showToast("Паролі не співпадають"); return; }
    if (password.length < 6)  { showToast("Пароль мінімум 6 символів"); return; }

    try {
        const res  = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error); return; }
        showToast(`Ласкаво просимо, ${data.name}!`);
        setTimeout(() => window.location.href = "/", 1200);
    } catch (e) {
        showToast("Помилка сервера");
    }
}

async function login() {
    const email    = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) { showToast("Заповніть всі поля"); return; }

    try {
        const res  = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error); return; }
        showToast(`Ласкаво просимо, ${data.name}!`);
        setTimeout(() => window.location.href = "/", 1200);
    } catch (e) {
        showToast("Помилка сервера");
    }
}

if (typeof showToast === "undefined") {
    function showToast(msg) { alert(msg); }
}