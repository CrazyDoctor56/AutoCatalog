// =======================
// script.js — головний файл
// Пошук, фільтри, кошик/обране (базові функції)
// =======================

// ---- ПОШУК ----
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") goSearch();
    });
}

function goSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const value = input.value.toLowerCase().trim();
    if (value) window.location.href = "cars.html?search=" + encodeURIComponent(value);
}

// ---- ФІЛЬТРИ (анімація) ----
function toggleFilters() {
    const f = document.getElementById("filters");
    if (!f) return;
    f.classList.toggle("active");
}

// ---- ФІЛЬТРИ (логіка) ----
function applyFilters() {
    const brand     = document.getElementById("filterBrand")?.value.toLowerCase().trim() || "";
    const yearFrom  = parseInt(document.getElementById("filterYearFrom")?.value) || 0;
    const yearTo    = parseInt(document.getElementById("filterYearTo")?.value) || 9999;
    const priceFrom = parseInt(document.getElementById("filterPriceFrom")?.value) || 0;
    const priceTo   = parseInt(document.getElementById("filterPriceTo")?.value) || Infinity;
    const fuel      = document.getElementById("filterFuel")?.value.toLowerCase() || "";

    const cards = document.querySelectorAll(".car-card");
    cards.forEach(card => {
        const wrapper = card.closest("a") || card;
        const name  = card.querySelector("h3")?.innerText.toLowerCase() || "";
        const info  = card.querySelector("p")?.innerText.toLowerCase() || "";
        const priceText = card.querySelector(".price")?.innerText.replace(/[^\d]/g, "") || "0";
        const price = parseInt(priceText);

        // Рік — витягуємо з тексту типу "1986 • бензин"
        const yearMatch = info.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : 0;

        const matchBrand = !brand || name.includes(brand);
        const matchYear  = year >= yearFrom && year <= yearTo;
        const matchPrice = price >= priceFrom && price <= priceTo;
        const matchFuel  = !fuel || info.includes(fuel);

        wrapper.style.display = (matchBrand && matchYear && matchPrice && matchFuel) ? "" : "none";
    });
}

// ---- ПОШУК НА cars.html ----
const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("search");
if (searchQuery) {
    // Чекаємо поки DOM завантажиться
    document.addEventListener("DOMContentLoaded", () => {
        const allCards = document.querySelectorAll(".car-card");
        allCards.forEach(card => {
            const text = card.innerText.toLowerCase();
            const wrapper = card.closest("a") || card;
            if (!text.includes(searchQuery.toLowerCase())) {
                wrapper.style.display = "none";
            }
        });
        // Вставляємо запит в поле пошуку якщо воно є
        const si = document.getElementById("searchInput");
        if (si) si.value = searchQuery;
    });
}

// ---- ОБРАНЕ ----
function addToFavorites(carId) {
    let fav = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!fav.includes(carId)) {
        fav.push(carId);
        localStorage.setItem("favorites", JSON.stringify(fav));
        showToast("Додано в обране ❤️");
    } else {
        showToast("Вже в обраному");
    }
}

// ---- КОШИК ----
function addToCart(carId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.includes(carId)) {
        cart.push(carId);
        localStorage.setItem("cart", JSON.stringify(cart));
        showToast("Додано в кошик 🛒");
    } else {
        showToast("Вже в кошику");
    }
}

// ---- TOAST (замість alert) ----
function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `
            position: fixed; bottom: 30px; right: 30px;
            background: #1a1a1a; color: white;
            padding: 14px 22px; border-radius: 10px;
            border: 1px solid #00ff99; font-size: 15px;
            z-index: 9999; opacity: 0;
            transition: opacity 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}