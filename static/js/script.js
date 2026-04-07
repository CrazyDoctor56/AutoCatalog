async function loadCars(params = {}) {
    const grid = document.getElementById("carsGrid");
    if (!grid) return;

    grid.innerHTML = `<p style="color:#aaa">Завантаження...</p>`;

    const query = new URLSearchParams(params).toString();
    const url   = "/api/cars" + (query ? "?" + query : "");

    try {
        const res  = await fetch(url);
        const cars = await res.json();

        let favIds  = [];
        let cartIds = [];
        try {
            const [favRes, cartRes] = await Promise.all([
                fetch("/api/favorites"),
                fetch("/api/cart")
            ]);
            if (favRes.ok)  favIds  = (await favRes.json()).map(c => c.id);
            if (cartRes.ok) cartIds = (await cartRes.json()).map(c => c.id);
        } catch {}

        grid.innerHTML = "";

        if (cars.length === 0) {
            grid.innerHTML = `<p style="color:#aaa">Нічого не знайдено</p>`;
            return;
        }

        cars.forEach(car => {
            const img    = car.main_image ? `/static/pic/${car.main_image}` : "";
            const isFav  = favIds.includes(car.id);
            const inCart = cartIds.includes(car.id);

            const card = document.createElement("a");
            card.href  = `/car?id=${car.id}`;
            card.innerHTML = `
                <div class="car-card">
                    ${img ? `<img src="${img}" alt="${car.title}" onerror="this.style.display='none'">` : ""}
                    <div class="car-card-info">
                        <h3>${car.title}</h3>
                        <p>${car.year} • ${car.fuel || ""} • ${car.city || ""}</p>
                        <p class="price">$${car.price.toLocaleString()}</p>
                        <div class="car-card-badges">
                            ${isFav  ? `<span class="badge badge-fav">❤️ Обране</span>` : ""}
                            ${inCart ? `<span class="badge badge-cart">🛒 В кошику</span>` : ""}
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        grid.innerHTML = `<p style="color:#aaa">Помилка завантаження</p>`;
    }
}

function goSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const value = input.value.trim();
    window.location.href = value ? `/cars?search=${encodeURIComponent(value)}` : "/cars";
}

function toggleFilters() {
    const f = document.getElementById("filters");
    if (f) f.classList.toggle("active");
}

function applyFilters() {
    const params  = {};
    const search  = document.getElementById("searchInput")?.value.trim();
    const brand   = document.getElementById("filterBrand")?.value.trim();
    const yFrom   = document.getElementById("filterYearFrom")?.value.trim();
    const yTo     = document.getElementById("filterYearTo")?.value.trim();
    const pFrom   = document.getElementById("filterPriceFrom")?.value.trim();
    const pTo     = document.getElementById("filterPriceTo")?.value.trim();
    const fuel    = document.getElementById("filterFuel")?.value;

    if (search) params.search     = search;
    if (brand)  params.brand      = brand;
    if (yFrom)  params.year_from  = yFrom;
    if (yTo)    params.year_to    = yTo;
    if (pFrom)  params.price_from = pFrom;
    if (pTo)    params.price_to   = pTo;
    if (fuel)   params.fuel       = fuel;

    loadCars(params);
}

async function addToFavorites(carId) {
    const res = await fetch(`/api/favorites/${carId}`, { method: "POST" });
    if (res.ok) showToast("Додано в обране ❤️");
    else if (res.status === 401) showToast("Увійдіть щоб додати в обране");
    else showToast("Вже в обраному");
}

async function addToCart(carId) {
    const res = await fetch(`/api/cart/${carId}`, { method: "POST" });
    if (res.ok) showToast("Додано в кошик 🛒");
    else if (res.status === 401) showToast("Увійдіть щоб додати в кошик");
    else showToast("Вже в кошику");
}

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

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                if (document.getElementById("carsGrid")) applyFilters();
                else goSearch();
            }
        });
    }

    if (document.getElementById("carsGrid")) {
        const params = new URLSearchParams(window.location.search);
        const search = params.get("search");
        if (search) {
            if (searchInput) searchInput.value = search;
            loadCars({ search });
        } else {
            loadCars();
        }
    }
});