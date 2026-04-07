let selectedFiles = [];

function handlePhotos(input) {
    const files = Array.from(input.files);
    const remaining = 25 - selectedFiles.length;

    if (files.length > remaining) {
        showToast(`Можна додати ще ${remaining} фото`);
        return;
    }

    files.forEach(file => {
        if (selectedFiles.length >= 25) return;
        selectedFiles.push(file);
    });

    renderPreviews();
    input.value = "";
}

function renderPreviews() {
    const preview = document.getElementById("photoPreview");
    const count   = document.getElementById("photoCount");

    preview.innerHTML = "";
    count.textContent = `Вибрано фото: ${selectedFiles.length} / 25`;

    selectedFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = e => {
            const item = document.createElement("div");
            item.className = "photo-preview-item";
            item.innerHTML = `
                <img src="${e.target.result}" alt="фото ${i+1}">
                <button onclick="removePhoto(${i})">✕</button>
            `;
            preview.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
}

function removePhoto(index) {
    selectedFiles.splice(index, 1);
    renderPreviews();
}

async function submitCar() {
    const title        = document.getElementById("title")?.value.trim();
    const price        = document.getElementById("price")?.value;
    const year         = document.getElementById("year")?.value;
    const mileage      = document.getElementById("mileage")?.value;
    const engine       = document.getElementById("engine")?.value;
    const fuel         = document.getElementById("fuel")?.value;
    const transmission = document.getElementById("transmission")?.value;
    const color        = document.getElementById("color")?.value.trim();
    const city         = document.getElementById("city")?.value.trim();
    const description  = document.getElementById("description")?.value.trim();

    if (!title || !price || !year) {
        showToast("Заповніть обов'язкові поля (назва, ціна, рік)");
        return;
    }

    const formData = new FormData();
    formData.append("title",        title);
    formData.append("price",        price);
    formData.append("year",         year);
    formData.append("mileage",      mileage || "");
    formData.append("engine",       engine || "");
    formData.append("fuel",         fuel);
    formData.append("transmission", transmission);
    formData.append("color",        color);
    formData.append("city",         city);
    formData.append("description",  description);

    selectedFiles.forEach(file => {
        formData.append("photos", file);
    });

    try {
        showToast("Публікуємо...");
        const res  = await fetch("/api/sell", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || "Помилка");
            return;
        }

        showToast("Оголошення опубліковано!");
        setTimeout(() => window.location.href = `/car?id=${data.car_id}`, 1200);
    } catch (e) {
        showToast("Помилка сервера");
    }
}