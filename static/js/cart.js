// ---- КОШИК ----

async function loadCartItems() {
    const cartList       = document.getElementById("cartList");
    const cartTotal      = document.getElementById("cartTotal");
    const cartTotalPrice = document.getElementById("cartTotalPrice");
    if (!cartList) return;

    const res = await fetch("/api/cart");

    if (res.status === 401) {
        cartList.innerHTML = `<p style="color:#aaa;margin-top:20px">Увійдіть щоб побачити кошик. <a href="/login" style="color:var(--accent)">Увійти</a></p>`;
        return;
    }

    const cart = await res.json();

    if (cart.length === 0) {
        cartList.innerHTML = `<p style="color:#aaa;margin-top:20px">Кошик порожній</p>`;
        return;
    }

    let total = 0;
    cartList.innerHTML = "";

    cart.forEach(car => {
        const img = car.main_image ? `/static/pic/${car.main_image}` : "";
        total += car.price;

        const item = document.createElement("div");
        item.className = "cart-item";
        item.innerHTML = `
            ${img ? `<img src="${img}" alt="${car.title}">` : ""}
            <div class="cart-item-info">
                <h3>${car.title}</h3>
                <p class="price">$${car.price.toLocaleString()}</p>
            </div>
            <button class="btn btn-outline" onclick="removeFromCart(${car.id}, this)">✕</button>
        `;
        cartList.appendChild(item);
    });

    if (cartTotal) {
        cartTotal.style.display = "block";
        cartTotalPrice.textContent = `$${total.toLocaleString()}`;
    }
}

async function removeFromCart(carId, btn) {
    const res = await fetch(`/api/cart/${carId}`, { method: "DELETE" });
    if (!res.ok) return;
    const item = btn.closest(".cart-item");
    if (item) item.remove();

    const remaining = document.querySelectorAll(".cart-item");
    if (remaining.length === 0) {
        const cartTotal = document.getElementById("cartTotal");
        if (cartTotal) cartTotal.style.display = "none";
        const cartList = document.getElementById("cartList");
        if (cartList) cartList.innerHTML = `<p style="color:#aaa;margin-top:20px">Кошик порожній</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadCartItems);