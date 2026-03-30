// =======================
// favorites.js — сторінка обраного
// =======================

const favCarsMini = {
    bmw_3_series_1986:  { name: "BMW 3 Series",  price: 2200,  year: 1986, fuel: "бензин",  image: "../static/pic/bmw_3-series_1986_1.webp" },
    bmw_7_series_1999:  { name: "BMW 7 Series",  price: 2800,  year: 1999, fuel: "бензин",  image: "../static/pic/bmw_7-series_1999_1.webp" },
    skoda_enyaq_iv_2025:{ name: "Skoda Enyaq IV",price: 42437, year: 2025, fuel: "електро", image: "../static/pic/skoda-enyaq-iv_2025_1.webp" }
};

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("favoritesList");
    if (!list) return;

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        list.innerHTML = `<p style="color:#aaa; margin-top:20px">Обране порожнє</p>`;
        return;
    }

    favorites.forEach(id => {
        const car = favCarsMini[id];
        if (!car) return;

        const wrapper = document.createElement("a");
        wrapper.href = `car.html?car=${id}`;

        wrapper.innerHTML = `
            <div class="car-card">
                <img src="${car.image}" alt="${car.name}">
                <div class="car-card-info">
                    <h3>${car.name}</h3>
                    <p>${car.year} • ${car.fuel}</p>
                    <p class="price">$${car.price.toLocaleString()}</p>
                </div>
            </div>
        `;
        list.appendChild(wrapper);
    });
});