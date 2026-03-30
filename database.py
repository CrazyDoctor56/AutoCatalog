# =======================
# database.py — робота з SQLite
# =======================

import sqlite3
import os

DB_PATH = "cars.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # щоб отримувати dict замість tuple
    return conn


def init_db():
    """Створює таблицю і додає тестові дані якщо БД порожня"""
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS cars (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            price       INTEGER NOT NULL,
            year        INTEGER NOT NULL,
            fuel        TEXT NOT NULL,
            mileage     TEXT,
            engine      TEXT,
            transmission TEXT,
            color       TEXT,
            image       TEXT
        )
    """)

    # Додаємо тестові авто якщо таблиця порожня
    c.execute("SELECT COUNT(*) FROM cars")
    if c.fetchone()[0] == 0:
        test_cars = [
            (
                "bmw_3_series_1986", "BMW 3 Series", 2200, 1986,
                "бензин", "180 000 км", "1.8 л", "Механіка", "Чорний",
                "static/pic/bmw_3-series_1986_1.webp"
            ),
            (
                "bmw_7_series_1999", "BMW 7 Series", 2800, 1999,
                "бензин", "220 000 км", "3.0 л", "Автомат", "Сірий",
                "static/pic/bmw_7-series_1999_1.webp"
            ),
            (
                "skoda_enyaq_iv_2025", "Skoda Enyaq IV", 42437, 2025,
                "електро", "5 000 км", "204 к.с.", "Автомат", "Білий",
                "static/pic/skoda-enyaq-iv_2025_1.webp"
            ),
        ]
        c.executemany("""
            INSERT INTO cars (id, name, price, year, fuel, mileage, engine, transmission, color, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, test_cars)

    conn.commit()
    conn.close()


def get_all_cars(search="", brand="", year_from=None, year_to=None,
                  price_from=None, price_to=None, fuel=""):
    """Повертає авто з фільтрами"""
    conn = get_connection()
    c = conn.cursor()

    query = "SELECT * FROM cars WHERE 1=1"
    params = []

    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(fuel) LIKE ?)"
        params += [f"%{search.lower()}%", f"%{search.lower()}%"]
    if brand:
        query += " AND LOWER(name) LIKE ?"
        params.append(f"%{brand.lower()}%")
    if year_from:
        query += " AND year >= ?"
        params.append(year_from)
    if year_to:
        query += " AND year <= ?"
        params.append(year_to)
    if price_from:
        query += " AND price >= ?"
        params.append(price_from)
    if price_to:
        query += " AND price <= ?"
        params.append(price_to)
    if fuel:
        query += " AND LOWER(fuel) = ?"
        params.append(fuel.lower())

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_car_by_id(car_id):
    """Повертає одне авто за ID"""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM cars WHERE id = ?", (car_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def search_cars(query):
    """Простий текстовий пошук"""
    return get_all_cars(search=query)


# Ініціалізуємо БД при імпорті
init_db()