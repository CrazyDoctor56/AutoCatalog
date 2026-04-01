// =======================
// script.js
// =======================

// ---- РЕНДЕР КАРТОК З API ----
async function loadCars(params = {}) {
    const grid = document.getElementById("carsGrid");
    if (!grid) return;

    grid.innerHTML = `<p style="color:#aaa">Завантаження...</p>`;

    const query = new URLSearchParams(params).toString();
    const url   = "/api/cars" + (query ? "?" + query : "");

    try {
        const res  = await fetch(url);
        const cars = await res.json();

        grid.innerHTML = "";

        if (cars.length === 0) {
            grid.innerHTML = `<p style="color:#aaa">Нічого не знайдено</p>`;
            return;
        }

        cars.forEach(car => {
            const img = car.main_image
                ? `/static/pic/${car.main_image}`
                : "/static/pic/no-image.webp";

            const card = document.createElement("a");
            card.href  = `/car?id=${car.id}`;
            card.innerHTML = `
                <div class="car-card">
                    <img src="${img}" alt="${car.title}" onerror="this.style.display='none'">
                    <div class="car-card-info">
                        <h3>${car.title}</h3>
                        <p>${car.year} • ${car.fuel || ""} • ${car.city || ""}</p>
                        <p class="price">$${car.price.toLocaleString()}</p>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.error("Помилка завантаження авто:", e);
        grid.innerHTML = `<p style="color:#aaa">Помилка завантаження</p>`;
    }
}

// ---- ПОШУК ----
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keypress", e => {
            if (e.key === "Enter") applyFilters();
        });
    }

    // Запускаємо завантаження тільки один раз
    if (document.getElementById("carsGrid")) {
        loadCars();
    }
});

// ---- ФІЛЬТРИ (анімація) ----
function toggleFilters() {
    const f = document.getElementById("filters");
    if (f) f.classList.toggle("active");
}

// ---- ФІЛЬТРИ (логіка) ----
function applyFilters() {
    const params = {};

    const search = document.getElementById("searchInput")?.value.trim();
    const brand  = document.getElementById("filterBrand")?.value.trim();
    const yFrom  = document.getElementById("filterYearFrom")?.value.trim();
    const yTo    = document.getElementById("filterYearTo")?.value.trim();
    const pFrom  = document.getElementById("filterPriceFrom")?.value.trim();
    const pTo    = document.getElementById("filterPriceTo")?.value.trim();
    const fuel   = document.getElementById("filterFuel")?.value;

    if (search) params.search     = search;
    if (brand)  params.brand      = brand;
    if (yFrom)  params.year_from  = yFrom;
    if (yTo)    params.year_to    = yTo;
    if (pFrom)  params.price_from = pFrom;
    if (pTo)    params.price_to   = pTo;
    if (fuel)   params.fuel       = fuel;

    loadCars(params);
}

// ---- ОБРАНЕ ----
function addToFavorites(carId) {
    let fav = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!fav.includes(String(carId))) {
        fav.push(String(carId));
        localStorage.setItem("favorites", JSON.stringify(fav));
        showToast("Додано в обране ❤️");
    } else {
        showToast("Вже в обраному");
    }
}

// ---- КОШИК ----
function addToCart(carId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.includes(String(carId))) {
        cart.push(String(carId));
        localStorage.setItem("cart", JSON.stringify(cart));
        showToast("Додано в кошик 🛒");
    } else {
        showToast("Вже в кошику");
    }
}

// ---- TOAST ----
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