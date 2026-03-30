// =======================
// cart.js — сторінка кошика
// =======================

// Імпортуємо базу авто (тимчасово, потім буде API)
// Для уникнення дублювання — carsDB визначений у car.js
// Тут дублюємо тільки потрібні поля
const carsMini = {
    bmw_3_series_1986:  { name: "BMW 3 Series",  price: 2200,  image: "../static/pic/bmw_3-series_1986_1.webp" },
    bmw_7_series_1999:  { name: "BMW 7 Series",  price: 2800,  image: "../static/pic/bmw_7-series_1999_1.webp" },
    skoda_enyaq_iv_2025:{ name: "Skoda Enyaq IV",price: 42437, image: "../static/pic/skoda-enyaq-iv_2025_1.webp" }
};

document.addEventListener("DOMContentLoaded", () => {
    const cartList  = document.getElementById("cartList");
    const cartTotal = document.getElementById("cartTotal");
    const cartTotalPrice = document.getElementById("cartTotalPrice");

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cartList) return;

    if (cart.length === 0) {
        cartList.innerHTML = `<p style="color:#aaa; margin-top:20px" data-lang="cart_empty">Кошик порожній</p>`;
        return;
    }

    let total = 0;

    cart.forEach(id => {
        const car = carsMini[id];
        if (!car) return;

        total += car.price;

        const item = document.createElement("div");
        item.className = "cart-item";
        item.innerHTML = `
            <img src="${car.image}" alt="${car.name}">
            <div class="cart-item-info">
                <h3>${car.name}</h3>
                <p class="price">$${car.price.toLocaleString()}</p>
            </div>
            <button class="btn btn-outline" onclick="removeFromCart('${id}', this)">✕</button>
        `;
        cartList.appendChild(item);
    });

    if (cartTotal) {
        cartTotal.style.display = "block";
        cartTotalPrice.textContent = `$${total.toLocaleString()}`;
    }
});

function removeFromCart(carId, btn) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(id => id !== carId);
    localStorage.setItem("cart", JSON.stringify(cart));
    btn.closest(".cart-item").remove();

    // Перераховуємо суму
    const remaining = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;
    remaining.forEach(id => { if (carsMini[id]) total += carsMini[id].price; });
    const tp = document.getElementById("cartTotalPrice");
    if (tp) tp.textContent = `$${total.toLocaleString()}`;

    if (remaining.length === 0) {
        const cartTotal = document.getElementById("cartTotal");
        if (cartTotal) cartTotal.style.display = "none";
    }
}