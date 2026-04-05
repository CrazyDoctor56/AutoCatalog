let currentSlide = 0;
let totalSlides  = 0;

function buildGallery(images) {
    const track  = document.getElementById("galleryTrack");
    const dots   = document.getElementById("galleryDots");
    const thumbs = document.getElementById("galleryThumbs");
    if (!track) return;
    totalSlides = images.length;
    images.forEach((img, i) => {
        const src = `/static/pic/${img.filename}`;
        const slide = document.createElement("img");
        slide.src = src;
        slide.alt = `Фото ${i + 1}`;
        track.appendChild(slide);
        const dot = document.createElement("button");
        dot.className = "gallery-dot" + (i === 0 ? " active" : "");
        dot.onclick = () => goToSlide(i);
        dots.appendChild(dot);
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.alt = `Фото ${i + 1}`;
        thumb.className = i === 0 ? "active" : "";
        thumb.onclick = () => goToSlide(i);
        thumbs.appendChild(thumb);
    });
    if (images.length <= 1) {
        document.querySelectorAll(".gallery-btn").forEach(b => b.style.display = "none");
        dots.style.display = "none";
    }
}

function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    const track = document.getElementById("galleryTrack");
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll(".gallery-dot").forEach((d, i) =>
        d.classList.toggle("active", i === currentSlide));
    document.querySelectorAll(".gallery-thumbs img").forEach((t, i) =>
        t.classList.toggle("active", i === currentSlide));
}

function galleryMove(dir) { goToSlide(currentSlide + dir); }

document.addEventListener("touchstart", e => { window._touchX = e.touches[0].clientX; });
document.addEventListener("touchend", e => {
    const diff = (window._touchX || 0) - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) galleryMove(diff > 0 ? 1 : -1);
});
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  galleryMove(-1);
    if (e.key === "ArrowRight") galleryMove(1);
});

const urlParams = new URLSearchParams(window.location.search);
const carId = urlParams.get("id");

async function loadCar() {
    if (!carId) {
        document.getElementById("carName").textContent = "Авто не знайдено";
        return;
    }
    try {
        const res = await fetch(`/api/cars/${carId}`);
        if (!res.ok) throw new Error();
        const car = await res.json();
        document.title = `AutoCatalog — ${car.title}`;
        const nameEl  = document.getElementById("carName");
        const priceEl = document.getElementById("carPrice");
        const specsEl = document.getElementById("carSpecs");
        const sellerEl = document.getElementById("sellerInfo");
        const btnCart = document.getElementById("btnCart");
        const btnFav  = document.getElementById("btnFav");
        if (nameEl)  nameEl.textContent  = car.title;
        if (priceEl) priceEl.textContent = `$${car.price.toLocaleString()}`;
        if (specsEl) {
            specsEl.innerHTML = `
                <li><span>Рік</span> ${car.year || "—"}</li>
                <li><span>Пробіг</span> ${car.mileage ? car.mileage.toLocaleString() + " км" : "—"}</li>
                <li><span>Паливо</span> ${car.fuel || "—"}</li>
                <li><span>Двигун</span> ${car.engine ? car.engine + " л" : "—"}</li>
                <li><span>КПП</span> ${car.transmission || "—"}</li>
                <li><span>Колір</span> ${car.color || "—"}</li>
                <li><span>Місто</span> ${car.city || "—"}</li>
            `;
        }
        if (sellerEl && car.seller_name) {
            sellerEl.innerHTML = `
                <div class="seller-block">
                    <p class="seller-label">Продавець</p>
                    <p class="seller-name">${car.seller_name}</p>
                    ${car.seller_phone ? `<a href="tel:${car.seller_phone}" class="seller-phone">${car.seller_phone}</a>` : ""}
                </div>
            `;
        }
        if (btnCart) btnCart.onclick = () => addToCart(carId);
        if (btnFav)  btnFav.onclick  = () => addToFavorites(carId);
        if (car.images && car.images.length > 0) buildGallery(car.images);
    } catch (e) {
        document.getElementById("carName").textContent = "Авто не знайдено";
    }
}

document.addEventListener("DOMContentLoaded", loadCar);