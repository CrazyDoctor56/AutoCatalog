// =======================
// ПОШУК (всі сторінки)
// =======================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            goSearch();
        }
    });
}

function goSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const value = input.value.toLowerCase().trim();
    window.location.href = "cars.html?search=" + value;
}

// =======================
// БАЗА МАШИН
// =======================
const cars = {
    bmw_3_series_1986: {
        name: "BMW 3 Series",
        price: 2200,
        year: 1986,
        fuel: "бензин"
    },
    bmw_7_series_1999: {
        name: "BMW 7 Series",
        price: 2800,
        year: 1999,
        fuel: "бензин"
    },
    skoda_enyaq_iv_2025: {
        name: "Skoda Enyaq IV",
        price: 42437,
        year: 2025,
        fuel: "електро"
    }
};

// =======================
// СТОРІНКА АВТО
// =======================
const params = new URLSearchParams(window.location.search);
const carId = params.get("car");

if (carId && cars[carId]) {
    const car = cars[carId];

    const title = document.getElementById("title");
    const price = document.getElementById("price");

    if (title) title.textContent = car.name;
    if (price) price.textContent = "$" + car.price;
}

// =======================
// ПОШУК НА cars.html
// =======================
const searchQuery = params.get("search");

if (searchQuery) {
    const allCars = document.querySelectorAll(".car");

    allCars.forEach(card => {
        const text = card.innerText.toLowerCase();

        if (!text.includes(searchQuery)) {
            card.parentElement.style.display = "none";
        }
    });
}

// =======================
// ФІЛЬТРИ (анімація)
// =======================
function toggleFilters() {
    const f = document.getElementById("filters");
    if (!f) return;

    f.classList.toggle("active");
}

// =======================
// ОБРАНЕ
// =======================
function addToFavorites(carId) {
    let fav = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!fav.includes(carId)) {
        fav.push(carId);
        localStorage.setItem("favorites", JSON.stringify(fav));
        alert("Додано в обране");
    }
}

// =======================
// КОШИК
// =======================
function addToCart(carId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(carId);
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Додано в кошик");
}