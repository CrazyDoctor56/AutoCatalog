// ---- ОБРАНЕ ----

async function loadFavorites() {
    const list = document.getElementById("favoritesList");
    if (!list) return;

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        list.innerHTML = `<p style="color:#aaa;margin-top:20px">Обране порожнє</p>`;
        return;
    }

    list.innerHTML = "";

    for (const id of favorites) {
        try {
            const res = await fetch(`/api/cars/${id}`);
            if (!res.ok) continue;
            const car = await res.json();
            const img = car.images?.[0]?.filename
                ? `/static/pic/${car.images[0].filename}`
                : "/static/pic/no-image.webp";

            const wrapper = document.createElement("a");
            wrapper.href = `/car?id=${car.id}`;
            wrapper.innerHTML = `
                <div class="car-card">
                    <img src="${img}" alt="${car.title}" onerror="this.style.display='none'">
                    <div class="car-card-info">
                        <h3>${car.title}</h3>
                        <p>${car.year} • ${car.fuel || ""} • ${car.city || ""}</p>
                        <p class="price">$${car.price.toLocaleString()}</p>
                    </div>
                </div>
            `;
            list.appendChild(wrapper);
        } catch (e) {
            console.error(e);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadFavorites);