// =======================
// lang.js — перемикач мови
// =======================

const DEFAULT_LANG = "ua";

async function loadLang(lang) {
    try {
        const res = await fetch(`../static/lang/${lang}.json`);
        const translations = await res.json();
        applyTranslations(translations);
        localStorage.setItem("lang", lang);
    } catch (e) {
        console.error("Не вдалось завантажити мову:", e);
    }
}

function applyTranslations(t) {
    // Текст елементів
    document.querySelectorAll("[data-lang]").forEach(el => {
        const key = el.getAttribute("data-lang");
        if (t[key]) el.textContent = t[key];
    });

    // Placeholder для input/textarea
    document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
        const key = el.getAttribute("data-lang-placeholder");
        if (t[key]) el.placeholder = t[key];
    });
}

function changeLang(lang) {
    loadLang(lang);
    // Синхронізуємо всі select на сторінці
    document.querySelectorAll(".lang-select").forEach(s => s.value = lang);
}

// Завантажуємо мову при старті сторінки
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("lang") || DEFAULT_LANG;
    document.querySelectorAll(".lang-select").forEach(s => s.value = saved);
    loadLang(saved);
});