// ---- КОШИК ----

async function loadCartItems() {
    const cartList       = document.getElementById("cartList");
    const cartTotal      = document.getElementById("cartTotal");
    const cartTotalPrice = document.getElementById("cartTotalPrice");
    if (!cartList) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        cartList.innerHTML = `<p style="color:#aaa;margin-top:20px" data-lang="cart_empty">Кошик порожній</p>`;
        return;
    }

    let total = 0;
    cartList.innerHTML = "";

    for (const id of cart) {
        try {
            const res = await fetch(`/api/cars/${id}`);
            if (!res.ok) continue;
            const car = await res.json();
            const img = car.images?.[0]?.filename
                ? `/static/pic/${car.images[0].filename}`
                : "/static/pic/no-image.webp";

            total += car.price;

            const item = document.createElement("div");
            item.className = "cart-item";
            item.innerHTML = `
                <img src="${img}" alt="${car.title}">
                <div class="cart-item-info">
                    <h3>${car.title}</h3>
                    <p class="price">$${car.price.toLocaleString()}</p>
                </div>
                <button class="btn btn-outline" onclick="removeFromCart('${id}', this)">✕</button>
            `;
            cartList.appendChild(item);
        } catch (e) {
            console.error(e);
        }
    }

    if (cartTotal && total > 0) {
        cartTotal.style.display = "block";
        cartTotalPrice.textContent = `$${total.toLocaleString()}`;
    }
}

function removeFromCart(carId, btn) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(id => id !== String(carId));
    localStorage.setItem("cart", JSON.stringify(cart));
    btn.closest(".cart-item").remove();

    if (cart.length === 0) {
        const cartTotal = document.getElementById("cartTotal");
        if (cartTotal) cartTotal.style.display = "none";
        const cartList = document.getElementById("cartList");
        if (cartList) cartList.innerHTML = `<p style="color:#aaa;margin-top:20px">Кошик порожній</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadCartItems);