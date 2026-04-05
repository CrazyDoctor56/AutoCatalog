from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from datetime import timedelta
import database as db
import utils

app = Flask(__name__)
app.secret_key = "autocatalog_secret_key_2026"
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
app.permanent_session_lifetime = timedelta(days=30)

def current_user():
    user_id = session.get("user_id")
    if user_id:
        return db.get_user_by_id(user_id)
    return None

@app.route("/")
def index():
    return render_template("index.html", user=current_user())

@app.route("/cars")
def cars():
    return render_template("cars.html", user=current_user())

@app.route("/car")
def car():
    return render_template("car.html", user=current_user())

@app.route("/about")
def about():
    return render_template("about.html", user=current_user())

@app.route("/login")
def login_page():
    if current_user():
        return redirect(url_for("index"))
    return render_template("login.html")

@app.route("/register")
def register_page():
    if current_user():
        return redirect(url_for("index"))
    return render_template("register.html")

@app.route("/cart")
def cart():
    return render_template("cart.html", user=current_user())

@app.route("/favorites")
def favorites():
    return render_template("favorites.html", user=current_user())

@app.route("/sell")
def sell():
    if not current_user():
        return redirect(url_for("login_page"))
    return render_template("sell.html", user=current_user())

@app.route("/my-cars")
def my_cars():
    if not current_user():
        return redirect(url_for("login_page"))
    return render_template("my_cars.html", user=current_user())

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

@app.route("/api/register", methods=["POST"])
def api_register():
    data     = request.get_json()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip()
    phone    = data.get("phone", "").strip()
    password = data.get("password", "")
    if not name or not email or not password:
        return jsonify({"error": "Заповніть всі поля"}), 400
    if len(password) < 6:
        return jsonify({"error": "Пароль мінімум 6 символів"}), 400
    ok, msg = db.create_user(name, email, phone, password)
    if not ok:
        return jsonify({"error": msg}), 400
    user = db.get_user_by_email(email)
    session["user_id"] = user["id"]
    session.permanent = True
    return jsonify({"ok": True, "name": user["name"]})

@app.route("/api/login", methods=["POST"])
def api_login():
    data     = request.get_json()
    email    = data.get("email", "").strip()
    password = data.get("password", "")
    user = db.verify_user(email, password)
    if not user:
        return jsonify({"error": "Невірний email або пароль"}), 401
    session["user_id"] = user["id"]
    session.permanent = True
    return jsonify({"ok": True, "name": user["name"]})

@app.route("/api/me")
def api_me():
    user = current_user()
    if user:
        return jsonify({"id": user["id"], "name": user["name"], "email": user["email"]})
    return jsonify({"error": "Не авторизований"}), 401

@app.route("/api/cars")
def api_cars():
    result = db.get_all_cars(
        search=request.args.get("search", "").strip(),
        brand=request.args.get("brand", "").strip(),
        year_from=request.args.get("year_from", type=int),
        year_to=request.args.get("year_to", type=int),
        price_from=request.args.get("price_from", type=int),
        price_to=request.args.get("price_to", type=int),
        fuel=request.args.get("fuel", "").strip()
    )
    return jsonify(result)

@app.route("/api/cars/<int:car_id>")
def api_car(car_id):
    car = db.get_car_by_id(car_id)
    if car:
        return jsonify(car)
    return jsonify({"error": "Авто не знайдено"}), 404

@app.route("/api/sell", methods=["POST"])
def api_sell():
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    title        = request.form.get("title", "").strip()
    price        = request.form.get("price")
    year         = request.form.get("year")
    mileage      = request.form.get("mileage") or None
    engine       = request.form.get("engine") or None
    fuel         = request.form.get("fuel", "бензин")
    transmission = request.form.get("transmission", "механіка")
    color        = request.form.get("color", "").strip()
    city         = request.form.get("city", "").strip()
    description  = request.form.get("description", "").strip()
    if not title or not price or not year:
        return jsonify({"error": "Заповніть обов'язкові поля"}), 400
    car_id = db.add_car(
        title=title, price=int(price), year=int(year),
        mileage=int(mileage) if mileage else None,
        fuel=fuel, engine=float(engine) if engine else None,
        transmission=transmission, color=color,
        city=city, description=description,
        user_id=user["id"]
    )
    photos = request.files.getlist("photos")
    for i, photo in enumerate(photos[:25]):
        if photo and utils.allowed_file(photo.filename):
            filename = utils.save_photo(photo)
            db.add_car_image(car_id, filename, is_main=(i == 0))
    return jsonify({"ok": True, "car_id": car_id})

@app.route("/api/my-cars")
def api_my_cars():
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    return jsonify(db.get_user_cars(user["id"]))

@app.route("/api/my-cars/<int:car_id>", methods=["DELETE"])
def api_delete_car(car_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    db.delete_user_car(car_id, user["id"])
    return jsonify({"ok": True})

@app.route("/api/favorites")
def api_favorites():
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    return jsonify(db.get_favorites(user["id"]))

@app.route("/api/favorites/<int:car_id>", methods=["POST"])
def api_add_favorite(car_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    db.add_favorite(user["id"], car_id)
    return jsonify({"ok": True})

@app.route("/api/favorites/<int:car_id>", methods=["DELETE"])
def api_remove_favorite(car_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    db.remove_favorite(user["id"], car_id)
    return jsonify({"ok": True})

@app.route("/api/cart")
def api_cart():
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    return jsonify(db.get_cart(user["id"]))

@app.route("/api/cart/<int:car_id>", methods=["POST"])
def api_add_cart(car_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    db.add_to_cart(user["id"], car_id)
    return jsonify({"ok": True})

@app.route("/api/cart/<int:car_id>", methods=["DELETE"])
def api_remove_cart(car_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Не авторизований"}), 401
    db.remove_from_cart(user["id"], car_id)
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")