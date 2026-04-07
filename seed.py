import sqlite3
import os

DB_PATH = "cars.db"

cars_data = [
    {
        "title": "Mitsubishi Galant", "price": 2399, "year": 2000,
        "mileage": 210000, "fuel": "бензин", "engine": 2.4,
        "transmission": "автомат", "color": "Сріблястий", "city": "Київ",
        "description": "Надійний японський седан у гарному стані. Свіжо пройдене ТО.",
        "images": [
            "mitsubishi-galant_2000_1.webp",
            "mitsubishi-galant_2000_2.webp",
            "mitsubishi-galant_2000_3.webp",
            "mitsubishi-galant_2000_4.webp",
            "mitsubishi-galant_2000_5.webp",
            "mitsubishi-galant_2000_6.webp",
        ]
    },
    {
        "title": "Mercedes-Benz E-Class", "price": 2000, "year": 1996,
        "mileage": 280000, "fuel": "бензин", "engine": 2.0,
        "transmission": "механіка", "color": "Чорний", "city": "Харків",
        "description": "Класичний Mercedes W210. Відмінна база для реставрації.",
        "images": [
            "mercedes-benz-e-class_1996_1.webp",
            "mercedes-benz-e-class_1996_2.webp",
            "mercedes-benz-e-class_1996_3.webp",
            "mercedes-benz-e-class_1996_4.webp",
            "mercedes-benz-e-class_1996_5.webp",
        ]
    },
    {
        "title": "Kia Magentis", "price": 2950, "year": 2007,
        "mileage": 175000, "fuel": "бензин", "engine": 2.0,
        "transmission": "автомат", "color": "Синій", "city": "Одеса",
        "description": "Комфортний корейський седан. Все рідне, не битий, не фарбований.",
        "images": [
            "kia-magentis_2007_1.webp",
            "kia-magentis_2007_2.webp",
            "kia-magentis_2007_3.webp",
            "kia-magentis_2007_4.webp",
            "kia-magentis_2007_5.webp",
            "kia-magentis_2007_6.webp",
        ]
    },
    {
        "title": "Mercedes-Benz E-Class", "price": 2700, "year": 2001,
        "mileage": 240000, "fuel": "дизель", "engine": 2.2,
        "transmission": "автомат", "color": "Сірий", "city": "Дніпро",
        "description": "Mercedes W210 дизель. Економний і надійний варіант.",
        "images": [
            "mercedes-benz-e-class_2001_1.webp",
            "mercedes-benz-e-class_2001_2.webp",
            "mercedes-benz-e-class_2001_3.webp",
        ]
    },
    {
        "title": "Volkswagen ID. UNYX", "price": 28888, "year": 2025,
        "mileage": 100, "fuel": "електро", "engine": None,
        "transmission": "автомат", "color": "Білий", "city": "Київ",
        "description": "Новий електричний кросовер VW. Запас ходу 450 км. Гарантія виробника.",
        "images": [
            "volkswagen-id-unyx_2025_1.webp",
            "volkswagen-id-unyx_2025_2.webp",
            "volkswagen-id-unyx_2025_3.webp",
            "volkswagen-id-unyx_2025_4.webp",
            "volkswagen-id-unyx_2025_5.webp",
            "volkswagen-id-unyx_2025_6.webp",
        ]
    },
    {
        "title": "Skoda Enyaq IV", "price": 42437, "year": 2025,
        "mileage": 5000, "fuel": "електро", "engine": None,
        "transmission": "автомат", "color": "Білий", "city": "Одеса",
        "description": "Новий електромобіль з великим запасом ходу. Повна комплектація.",
        "images": [
            "skoda-enyaq-iv_2025_1.webp",
            "skoda-enyaq-iv_2025_2.webp",
            "skoda-enyaq-iv_2025_3.webp",
            "skoda-enyaq-iv_2025_4.webp",
            "skoda-enyaq-iv_2025_5.webp",
        ]
    },
    {
        "title": "BMW 7 Series", "price": 2800, "year": 1999,
        "mileage": 220000, "fuel": "бензин", "engine": 3.0,
        "transmission": "автомат", "color": "Сірий", "city": "Львів",
        "description": "Флагманський BMW E38. Комфортний і представницький автомобіль.",
        "images": [
            "bmw-7-series_1999_1.webp",
            "bmw-7-series_1999_2.webp",
            "bmw-7-series_1999_3.webp",
            "bmw-7-series_1999_4.webp",
            "bmw-7-series_1999_5.webp",
        ]
    },
    {
        "title": "BMW 3 Series", "price": 2200, "year": 1986,
        "mileage": 180000, "fuel": "бензин", "engine": 1.8,
        "transmission": "механіка", "color": "Чорний", "city": "Київ",
        "description": "Класичний BMW E30. Легенда серед любителів баварських авто.",
        "images": [
            "bmw-3-series_1986_1.webp",
            "bmw-3-series_1986_2.webp",
            "bmw-3-series_1986_3.webp",
        ]
    },
    {
        "title": "ВАЗ / Lada 21099", "price": 2000, "year": 2007,
        "mileage": 150000, "fuel": "бензин", "engine": 1.5,
        "transmission": "механіка", "color": "Червоний", "city": "Запоріжжя",
        "description": "Lada 21099 у робочому стані. Ідеально для міста та дачі.",
        "images": [
            "vaz-lada_21099_2007_1.webp",
            "vaz-lada_21099_2007_2.webp",
            "vaz-lada_21099_2007_3.webp",
            "vaz-lada_21099_2007_4.webp",
        ]
    },
    {
        "title": "Haval Dargo", "price": 24700, "year": 2022,
        "mileage": 35000, "fuel": "бензин", "engine": 2.0,
        "transmission": "автомат", "color": "Чорний", "city": "Київ",
        "description": "Стильний китайський кросовер. Повний привід, панорамний дах.",
        "images": [
            "haval-dargo_2022_1.webp",
            "haval-dargo_2022_2.webp",
            "haval-dargo_2022_3.webp",
            "haval-dargo_2022_4.webp",
            "haval-dargo_2022_5.webp",
            "haval-dargo_2022_6.webp",
            "haval-dargo_2022_7.webp",
        ]
    },
    {
        "title": "Jeep Compass", "price": 38122, "year": 2025,
        "mileage": 500, "fuel": "бензин", "engine": 1.3,
        "transmission": "автомат", "color": "Синій", "city": "Київ",
        "description": "Новий Jeep Compass 2025. Гарантія 3 роки. Повна комплектація.",
        "images": [
            "jeep-compass_2025_1.webp",
            "jeep-compass_2025_2.webp",
            "jeep-compass_2025_3.webp",
            "jeep-compass_2025_4.webp",
            "jeep-compass_2025_5.webp",
        ]
    },
    {
        "title": "Land Rover Range Rover Evoque", "price": 56192, "year": 2025,
        "mileage": 200, "fuel": "гібрид", "engine": 1.5,
        "transmission": "автомат", "color": "Зелений", "city": "Київ",
        "description": "Преміум кросовер Range Rover Evoque 2025. PHEV гібрид. Новий.",
        "images": [
            "range-rover-evoque_2025_1.webp",
            "range-rover-evoque_2025_2.webp",
            "range-rover-evoque_2025_3.webp",
            "range-rover-evoque_2025_4.webp",
            "range-rover-evoque_2025_5.webp",
        ]
    },
    {
        "title": "Mazda CX-60", "price": 52909, "year": 2025,
        "mileage": 300, "fuel": "гібрид", "engine": 3.3,
        "transmission": "автомат", "color": "Червоний", "city": "Одеса",
        "description": "Флагманський кросовер Mazda. Plug-in гібрид, преміум салон.",
        "images": [
            "mazda-cx-60_2025_1.webp",
            "mazda-cx-60_2025_2.webp",
            "mazda-cx-60_2025_3.webp",
            "mazda-cx-60_2025_4.webp",
            "mazda-cx-60_2025_5.webp",
        ]
    },
]

def seed():
    if not os.path.exists(DB_PATH):
        print("cars.db не знайдено. Спочатку запусти app.py.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    added = skipped = 0

    for car in cars_data:
        c.execute("SELECT id FROM cars WHERE title = ? AND year = ?",
                  (car["title"], car["year"]))
        if c.fetchone():
            print(f"Вже є: {car['title']} {car['year']}")
            skipped += 1
            continue

        c.execute("""
            INSERT INTO cars (title, price, year, mileage, fuel, engine,
                              transmission, color, city, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (car["title"], car["price"], car["year"], car["mileage"],
              car["fuel"], car["engine"], car["transmission"],
              car["color"], car["city"], car["description"]))
        car_id = c.lastrowid

        for i, filename in enumerate(car["images"]):
            c.execute("INSERT INTO car_images (car_id, filename, is_main) VALUES (?, ?, ?)",
                      (car_id, filename, 1 if i == 0 else 0))

        print(f"Додано: {car['title']} {car['year']} — {len(car['images'])} фото")
        added += 1

    conn.commit()
    conn.close()
    print(f"\nГотово! Додано: {added}, пропущено: {skipped}")

if __name__ == "__main__":
    seed()