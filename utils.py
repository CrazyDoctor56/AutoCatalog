import os
import uuid
from PIL import Image

UPLOAD_FOLDER = "static/pic/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

def ensure_upload_folder():
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_photo(file):
    ensure_upload_folder()

    ext      = file.filename.rsplit(".", 1)[1].lower()
    tmp_name = f"{uuid.uuid4()}.{ext}"
    tmp_path = os.path.join(UPLOAD_FOLDER, tmp_name)
    file.save(tmp_path)

    webp_name = f"{uuid.uuid4()}.webp"
    webp_path = os.path.join(UPLOAD_FOLDER, webp_name)

    img = Image.open(tmp_path)
    img = img.convert("RGB")

    max_size = (1920, 1080)
    img.thumbnail(max_size, Image.LANCZOS)
    img.save(webp_path, "webp", quality=85)

    os.remove(tmp_path)

    return f"uploads/{webp_name}"