// ---- МОЇ ОГОЛОШЕННЯ ----

async function loadMyCars() {
    const list = document.getElementById("myCarsList");
    if (!list) return;

    const res = await fetch("/api/my-cars");

    if (res.status === 401) {
        list.innerHTML = `<p style="color:#aaa">Увійдіть щоб побачити оголошення. <a href="/login" style="color:var(--accent)">Увійти</a></p>`;
        return;
    }

    const cars = await res.json();

    if (cars.length === 0) {
        list.innerHTML = `
            <p style="color:#aaa;margin-bottom:20px">У вас ще немає оголошень</p>
            <a href="/sell" class="btn btn-primary">+ Додати авто</a>
        `;
        return;
    }

    list.innerHTML = "";

    cars.forEach(car => {
        const img = car.main_image ? `/static/pic/${car.main_image}` : "";

        const item = document.createElement("div");
        item.className = "my-car-item";
        item.innerHTML = `
            ${img ? `<img src="${img}" alt="${car.title}">` : ""}
            <div class="my-car-item-info">
                <h3>${car.title}</h3>
                <p>${car.year} • ${car.fuel || ""} • ${car.city || ""}</p>
                <p class="price">$${car.price.toLocaleString()}</p>
            </div>
            <div class="my-car-actions">
                <a href="/car?id=${car.id}" class="btn btn-outline" style="padding:8px 18px;font-size:14px">Переглянути</a>
                <button class="btn" style="background:#ff4444;color:white;padding:8px 18px;font-size:14px;border-radius:var(--radius-btn)" onclick="deleteCar(${car.id}, this)">Видалити</button>
            </div>
        `;
        list.appendChild(item);
    });
}

async function deleteCar(carId, btn) {
    if (!confirm("Видалити це оголошення?")) return;

    const res = await fetch(`/api/my-cars/${carId}`, { method: "DELETE" });
    if (!res.ok) { showToast("Помилка видалення"); return; }

    btn.closest(".my-car-item").remove();
    showToast("Оголошення видалено");

    const list = document.getElementById("myCarsList");
    if (list && list.children.length === 0) {
        list.innerHTML = `
            <p style="color:#aaa;margin-bottom:20px">У вас ще немає оголошень</p>
            <a href="/sell" class="btn btn-primary">+ Додати авто</a>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadMyCars);