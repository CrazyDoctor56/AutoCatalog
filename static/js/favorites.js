async function loadFavorites() {
    const list = document.getElementById("favoritesList");
    if (!list) return;

    const res = await fetch("/api/favorites");

    if (res.status === 401) {
        list.innerHTML = `<p style="color:#aaa;margin-top:20px">Увійдіть щоб побачити обране. <a href="/login" style="color:var(--accent)">Увійти</a></p>`;
        return;
    }

    const favorites = await res.json();

    if (favorites.length === 0) {
        list.innerHTML = `<p style="color:#aaa;margin-top:20px">Обране порожнє</p>`;
        return;
    }

    list.innerHTML = "";

    favorites.forEach(car => {
        const img = car.main_image ? `/static/pic/${car.main_image}` : "";

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.innerHTML = `
            <a href="/car?id=${car.id}">
                <div class="car-card">
                    ${img ? `<img src="${img}" alt="${car.title}" onerror="this.style.display='none'">` : ""}
                    <div class="car-card-info">
                        <h3>${car.title}</h3>
                        <p>${car.year} • ${car.fuel || ""} • ${car.city || ""}</p>
                        <p class="price">$${car.price.toLocaleString()}</p>
                    </div>
                </div>
            </a>
            <button class="remove-fav-btn" onclick="removeFromFavorites(${car.id}, this)" title="Видалити з обраного">✕</button>
        `;
        list.appendChild(wrapper);
    });
}

async function removeFromFavorites(carId, btn) {
    const res = await fetch(`/api/favorites/${carId}`, { method: "DELETE" });
    if (!res.ok) return;
    btn.closest("div").remove();

    const list = document.getElementById("favoritesList");
    if (list && list.children.length === 0) {
        list.innerHTML = `<p style="color:#aaa;margin-top:20px">Обране порожнє</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadFavorites);