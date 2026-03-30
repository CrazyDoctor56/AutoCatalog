// =======================
// car.js — сторінка окремого авто
// =======================

// Тимчасова база (потім замінимо на fetch до Flask API)
const carsDB = {
    bmw_3_series_1986: {
        name: "BMW 3 Series",
        price: 2200,
        year: 1986,
        fuel: "бензин",
        mileage: "180 000 км",
        engine: "1.8 л",
        transmission: "Механіка",
        color: "Чорний",
        image: "../static/pic/bmw_3-series_1986_1.webp"
    },
    bmw_7_series_1999: {
        name: "BMW 7 Series",
        price: 2800,
        year: 1999,
        fuel: "бензин",
        mileage: "220 000 км",
        engine: "3.0 л",
        transmission: "Автомат",
        color: "Сірий",
        image: "../static/pic/bmw_7-series_1999_1.webp"
    },
    skoda_enyaq_iv_2025: {
        name: "Skoda Enyaq IV",
        price: 42437,
        year: 2025,
        fuel: "електро",
        mileage: "5 000 км",
        engine: "електро 204 к.с.",
        transmission: "Автомат",
        color: "Білий",
        image: "../static/pic/skoda-enyaq-iv_2025_1.webp"
    }
};

// Зчитуємо ?car= з URL
const urlParams = new URLSearchParams(window.location.search);
const carId = urlParams.get("car");

if (carId && carsDB[carId]) {
    const car = carsDB[carId];

    // Назва у вкладці браузера
    document.title = `AutoCatalog — ${car.name}`;

    // Заповнюємо елементи
    const nameEl  = document.getElementById("carName");
    const priceEl = document.getElementById("carPrice");
    const imgEl   = document.getElementById("carMainImage");
    const specsEl = document.getElementById("carSpecs");

    if (nameEl)  nameEl.textContent  = car.name;
    if (priceEl) priceEl.textContent = `$${car.price.toLocaleString()}`;
    if (imgEl)   imgEl.src           = car.image;

    if (specsEl) {
        specsEl.innerHTML = `
            <li><span>Рік</span> ${car.year}</li>
            <li><span>Пробіг</span> ${car.mileage}</li>
            <li><span>Паливо</span> ${car.fuel}</li>
            <li><span>Двигун</span> ${car.engine}</li>
            <li><span>КПП</span> ${car.transmission}</li>
            <li><span>Колір</span> ${car.color}</li>
        `;
    }
} else {
    // Авто не знайдено
    const nameEl = document.getElementById("carName");
    if (nameEl) nameEl.textContent = "Авто не знайдено";
}