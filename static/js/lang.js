const DEFAULT_LANG = "ua";

async function loadLang(lang) {
    try {
        const res = await fetch(`/static/lang/${lang}.json`);
        const translations = await res.json();
        applyTranslations(translations);
        localStorage.setItem("lang", lang);
        document.querySelectorAll(".lang-select").forEach(s => s.value = lang);
    } catch (e) {
        console.error("Не вдалось завантажити мову:", e);
    }
}

function applyTranslations(t) {
    document.querySelectorAll("[data-lang]").forEach(el => {
        const key = el.getAttribute("data-lang");
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
        const key = el.getAttribute("data-lang-placeholder");
        if (t[key]) el.placeholder = t[key];
    });
}

function changeLang(lang) {
    loadLang(lang);
}

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("lang") || DEFAULT_LANG;
    loadLang(saved);
});