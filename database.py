import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = "cars.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT NOT NULL,
            email         TEXT NOT NULL UNIQUE,
            phone         TEXT,
            password_hash TEXT NOT NULL,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
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
    c.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            car_id  INTEGER NOT NULL,
            UNIQUE(user_id, car_id)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS cart (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            car_id  INTEGER NOT NULL,
            UNIQUE(user_id, car_id)
        )
    """)
    conn.commit()
    conn.close()

def create_user(name, email, phone, password):
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
            (name, email, phone, generate_password_hash(password))
        )
        conn.commit()
        return True, "OK"
    except sqlite3.IntegrityError:
        return False, "Email вже зареєстровано"
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def verify_user(email, password):
    user = get_user_by_email(email)
    if user and check_password_hash(user["password_hash"], password):
        return user
    return None

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
    c.execute("""
        SELECT cars.*, users.name as seller_name, users.phone as seller_phone
        FROM cars
        LEFT JOIN users ON cars.user_id = users.id
        WHERE cars.id = ?
    """, (car_id,))
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

def get_favorites(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT cars.*, car_images.filename as main_image
        FROM favorites
        JOIN cars ON favorites.car_id = cars.id
        LEFT JOIN car_images ON cars.id = car_images.car_id AND car_images.is_main = 1
        WHERE favorites.user_id = ? AND cars.status = 'active'
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_favorite(user_id, car_id):
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO favorites (user_id, car_id) VALUES (?, ?)", (user_id, car_id))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def remove_favorite(user_id, car_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM favorites WHERE user_id = ? AND car_id = ?", (user_id, car_id))
    conn.commit()
    conn.close()

def get_cart(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT cars.*, car_images.filename as main_image
        FROM cart
        JOIN cars ON cart.car_id = cars.id
        LEFT JOIN car_images ON cars.id = car_images.car_id AND car_images.is_main = 1
        WHERE cart.user_id = ? AND cars.status = 'active'
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_to_cart(user_id, car_id):
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO cart (user_id, car_id) VALUES (?, ?)", (user_id, car_id))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def remove_from_cart(user_id, car_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM cart WHERE user_id = ? AND car_id = ?", (user_id, car_id))
    conn.commit()
    conn.close()

def get_user_cars(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT cars.*, car_images.filename as main_image
        FROM cars
        LEFT JOIN car_images ON cars.id = car_images.car_id AND car_images.is_main = 1
        WHERE cars.user_id = ? AND cars.status = 'active'
        ORDER BY cars.id DESC
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_user_car(car_id, user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE cars SET status = 'deleted' WHERE id = ? AND user_id = ?", (car_id, user_id))
    conn.commit()
    conn.close()

init_db()