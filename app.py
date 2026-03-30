# =======================
# app.py — Flask сервер
# =======================

from flask import Flask, render_template, jsonify, request
from database import get_all_cars, get_car_by_id, search_cars

app = Flask(__name__)

# ---- Сторінки ----

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/cars")
def cars():
    return render_template("cars.html")

@app.route("/car")
def car():
    return render_template("car.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/cart")
def cart():
    return render_template("cart.html")

@app.route("/favorites")
def favorites():
    return render_template("favorites.html")


# ---- API (JSON для фронтенду) ----

@app.route("/api/cars")
def api_cars():
    """Повертає всі авто або результати пошуку/фільтрів"""
    query      = request.args.get("search", "").strip()
    brand      = request.args.get("brand", "").strip()
    year_from  = request.args.get("year_from", type=int)
    year_to    = request.args.get("year_to", type=int)
    price_from = request.args.get("price_from", type=int)
    price_to   = request.args.get("price_to", type=int)
    fuel       = request.args.get("fuel", "").strip()

    cars = get_all_cars(
        search=query,
        brand=brand,
        year_from=year_from,
        year_to=year_to,
        price_from=price_from,
        price_to=price_to,
        fuel=fuel
    )
    return jsonify(cars)


@app.route("/api/cars/<car_id>")
def api_car(car_id):
    """Повертає одне авто за ID"""
    car = get_car_by_id(car_id)
    if car:
        return jsonify(car)
    return jsonify({"error": "Авто не знайдено"}), 404


if __name__ == "__main__":
    app.run(debug=True)