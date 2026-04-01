import sqlite3

DB_PATH = "cars.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS cars (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            title        TEXT NOT NULL,
            price        INTEGER NOT NULL,
            year         INTEGER NOT NULL,
            mileage      INTEGER,
            fuel         TEXT,
            engine       REAL,
            transmission TEXT,
            color        TEXT,
            city         TEXT,
            description  TEXT,
            user_id      INTEGER,
            status       TEXT DEFAULT 'active'
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS car_images (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id   INTEGER NOT NULL,
            filename TEXT NOT NULL,
            is_main  INTEGER DEFAULT 0,
            FOREIGN KEY (car_id) REFERENCES cars(id)
        )
    """)
    conn.commit()
    conn.close()

# ---- АПІ ----

def get_all_cars(search="", brand="", year_from=None, year_to=None,
                 price_from=None, price_to=None, fuel=""):
    conn = get_connection()
    c = conn.cursor()
    query = """
        SELECT cars.*, car_images.filename as main_image
        FROM cars
        LEFT JOIN car_images ON cars.id = car_images.car_id AND car_images.is_main = 1
        WHERE cars.status = 'active'
    """
    params = []
    if search:
        query += " AND (LOWER(cars.title) LIKE ? OR LOWER(cars.city) LIKE ?)"
        params += [f"%{search.lower()}%", f"%{search.lower()}%"]
    if brand:
        query += " AND LOWER(cars.title) LIKE ?"
        params.append(f"%{brand.lower()}%")
    if year_from:
        query += " AND cars.year >= ?"
        params.append(year_from)
    if year_to:
        query += " AND cars.year <= ?"
        params.append(year_to)
    if price_from:
        query += " AND cars.price >= ?"
        params.append(price_from)
    if price_to:
        query += " AND cars.price <= ?"
        params.append(price_to)
    if fuel:
        query += " AND LOWER(cars.fuel) = ?"
        params.append(fuel.lower())
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_car_by_id(car_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM cars WHERE id = ?", (car_id,))
    car = c.fetchone()
    if not car:
        conn.close()
        return None
    car = dict(car)
    c.execute("SELECT filename, is_main FROM car_images WHERE car_id = ? ORDER BY is_main DESC", (car_id,))
    car["images"] = [dict(r) for r in c.fetchall()]
    conn.close()
    return car

def add_car(title, price, year, mileage, fuel, engine,
            transmission, color, city, description, user_id=None):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO cars (title, price, year, mileage, fuel, engine,
                          transmission, color, city, description, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (title, price, year, mileage, fuel, engine,
          transmission, color, city, description, user_id))
    car_id = c.lastrowid
    conn.commit()
    conn.close()
    return car_id

def add_car_image(car_id, filename, is_main=False):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM car_images WHERE car_id = ?", (car_id,))
    if c.fetchone()[0] >= 25:
        conn.close()
        return False, "Максимум 25 фото"
    c.execute("INSERT INTO car_images (car_id, filename, is_main) VALUES (?, ?, ?)",
              (car_id, filename, 1 if is_main else 0))
    conn.commit()
    conn.close()
    return True, "OK"

def delete_car(car_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE cars SET status = 'deleted' WHERE id = ?", (car_id,))
    conn.commit()
    conn.close()

init_db()