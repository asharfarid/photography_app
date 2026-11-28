#!/usr/bin/env python3
"""weshoot - app server (static site + photo API).

    python server.py

Deployable as-is: one process, Python's own HTTP server, no framework.
Everything a host needs to change is an environment variable:

    HOST             127.0.0.1 locally, 0.0.0.0 in a container
    PORT             8000
    STORAGE_ROOT     ../Storage locally, a mounted disk or blob later
    MAX_UPLOAD_MB    500
    MAX_PIXELS_MP    200
    DISPLAY_MAX_PX   1600
    THUMB_MAX_PX     400

Routes
    GET  /                      the site (app_v1/main)
    GET  /api/photos            every photo of the signed-in user
    GET  /api/trash             deleted photos that can still be restored
    POST /api/upload            multipart: file, name, category, description
    POST /api/delete            JSON: category, ids[]
    POST /api/restore           JSON: id, category, name, description
    GET  /media/<owner>/<cat>/<id>/<file>         live photo bytes
    GET  /trash-media/<owner>/<cat>/<id>/<file>   deleted photo thumbnails
    GET  /api/health            liveness

The owner is resolved on the server, never taken from the browser. Today that
is site.json -> currentUser; when login arrives, only current_owner() changes.
"""

from __future__ import annotations

import io
import json
import mimetypes
import mmap
import os
import re
import shutil
import threading
import traceback
import uuid
import warnings
from datetime import datetime, timedelta, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

from PIL import Image, ImageOps

from storage import DiskStorage, StorageError

try:  # HEIC/HEIF support (one-time install, see requirements.txt)
    import pillow_heif

    pillow_heif.register_heif_opener()
except Exception:  # pragma: no cover - optional at import time
    pillow_heif = None

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "main"
STORAGE_ROOT = Path(
    os.environ.get("STORAGE_ROOT", str(ROOT.parent.parent / "Storage"))
).resolve()
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))
MAX_UPLOAD = int(float(os.environ.get("MAX_UPLOAD_MB", "500")) * 1024 * 1024)
MAX_PIXELS = int(float(os.environ.get("MAX_PIXELS_MP", "200")) * 1_000_000)
DISPLAY_MAX = int(os.environ.get("DISPLAY_MAX_PX", "1600"))
THUMB_MAX = int(os.environ.get("THUMB_MAX_PX", "400"))
TRASH_HOURS = int(os.environ.get("TRASH_RETENTION_HOURS", "48"))
TRASH_PURGE = os.environ.get("TRASH_PURGE", "app")

Image.MAX_IMAGE_PIXELS = MAX_PIXELS

storage = DiskStorage(STORAGE_ROOT)

SAFE_ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,80}$")
SAFE_NAME = re.compile(r"^[a-z0-9_]{1,40}$")
SAFE_FILE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,60}$")

# The shape a new user starts with. Lives in code, not in the site folder,
# so per-user data never ships with the website (SP-32).
DEFAULT_CATEGORIES = (
    ("abstract", "Abstract"),
    ("birds_animals", "Birds & Animals"),
    ("landscape", "Landscape"),
    ("life_style", "Life Style"),
    ("micro_lense", "Micro Lense"),
    ("portraits", "Portraits"),
    ("sky", "Sky"),
    ("travel", "Travel"),
)

EXT = {
    "jpeg": "jpg",
    "png": "png",
    "webp": "webp",
    "gif": "gif",
    "heif": "heic",
    "tiff": "tif",
    "raw": "raw",
}

RAW_EXT = {
    "cr2", "cr3", "nef", "nrw", "arw", "srf", "sr2", "dng",
    "raf", "rw2", "orf", "pef", "srw", "raw", "3fr", "fff",
}

ALLOWED = set(EXT)

upload_lock = threading.Lock()


class UploadError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


# ---------------------------------------------------------------- config

def load_json(path, default):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return default


def site_config():
    return load_json(SITE / "data" / "site.json", {})


def current_owner():
    """The single identity seam. Login will change only this function."""
    return str(site_config().get("currentUser") or "786")


def default_gallery():
    return {
        "firstName": "Ashar",
        "categories": [
            {"id": cid, "label": label, "cover": None}
            for cid, label in DEFAULT_CATEGORIES
        ],
    }


def gallery_for(owner):
    """Per-user preferences live beside the photos, not in the site folder."""
    data = storage.load_gallery(owner)
    if not isinstance(data, dict) or not data.get("categories"):
        data = default_gallery()
        storage.save_gallery(owner, data)
    data.setdefault("firstName", owner)
    return data


def categories_for(owner):
    return [
        c for c in gallery_for(owner).get("categories", [])
        if isinstance(c, dict) and c.get("id")
    ]


def set_cover(owner, category, photo_id):
    """Point a category at one photo; None falls back to the first photo."""
    gallery = gallery_for(owner)
    changed = False
    for entry in gallery.get("categories", []):
        if entry.get("id") == category and entry.get("cover") != photo_id:
            entry["cover"] = photo_id
            changed = True
    if changed:
        storage.save_gallery(owner, gallery)


def clear_cover(owner, photo_id):
    """A deleted photo must never stay the cover (SP-30)."""
    gallery = gallery_for(owner)
    changed = False
    for entry in gallery.get("categories", []):
        if entry.get("cover") == photo_id:
            entry["cover"] = None
            changed = True
    if changed:
        storage.save_gallery(owner, gallery)


# ---------------------------------------------------------------- images

def detect_format(path, filename):
    """Trust the bytes, not the extension."""
    with open(path, "rb") as handle:
        head = handle.read(32)
    if not head:
        return None
    if head[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if head[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    if head[4:8] == b"ftyp":
        brand = head[8:12]
        if brand in (b"heic", b"heix", b"hevc", b"heim", b"heis", b"mif1", b"msf1", b"avif", b"avis"):
            return "heif"
    if head[:15] == b"FUJIFILMCCD-RAW":
        return "raw"
    if head[:4] == b"\x76\x2f\x31\x01":
        return "raw"  # Panasonic RW2
    if head[:4] in (b"II*\x00", b"MM\x00*"):
        suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        return "raw" if suffix in RAW_EXT else "tiff"
    return None


def read_exif(image):
    """A small, display-friendly summary. Never includes location."""
    info = {}
    try:
        exif = image.getexif()
    except Exception:
        return info
    if not exif:
        return info

    def top(tag):
        value = exif.get(tag)
        return value if value not in (None, "") else None

    make, model = top(271), top(272)
    if make or model:
        info["camera"] = " ".join(str(part) for part in (make, model) if part)

    try:
        sub = exif.get_ifd(0x8769)
    except Exception:
        sub = {}

    def deep(tag):
        return sub.get(tag) if sub else None

    exposure = deep(33434)
    if exposure:
        try:
            seconds = float(exposure)
            if 0 < seconds < 1:
                info["shutter"] = "1/%d s" % round(1 / seconds)
            else:
                info["shutter"] = "%g s" % seconds
        except Exception:
            pass

    aperture = deep(33437)
    if aperture:
        try:
            info["aperture"] = "f/%.1f" % float(aperture)
        except Exception:
            pass

    iso = deep(34855)
    if iso:
        try:
            info["iso"] = "ISO %d" % int(iso)
        except Exception:
            info["iso"] = "ISO %s" % iso

    focal = deep(37386)
    if focal:
        try:
            info["focal"] = "%g mm" % float(focal)
        except Exception:
            pass

    lens = deep(42036)
    if lens:
        info["lens"] = str(lens)

    taken = top(306)
    if taken:
        info["taken"] = str(taken)

    return info


def has_gps(image):
    try:
        return 0x8825 in image.getexif()
    except Exception:
        return False


def strip_jpeg_gps(path):
    """Remove the GPS block from a JPEG without re-encoding the pixels.

    Orientation and camera settings stay; the pointer to the GPS IFD is
    dropped and a fresh EXIF block is spliced in.
    """
    try:
        with Image.open(path) as image:
            exif = image.getexif()
            if 0x8825 not in exif:
                return False
            del exif[0x8825]
            payload = b"Exif\x00\x00" + exif.tobytes()
    except Exception:
        return False

    data = path.read_bytes()
    if data[:2] != b"\xff\xd8":
        return False

    out = bytearray(data[:2])
    index = 2
    replaced = False

    while index < len(data) - 1:
        if data[index] != 0xFF:
            out += data[index:]
            break
        marker = data[index + 1]
        if marker == 0xDA:  # start of scan: copy the rest untouched
            out += data[index:]
            break
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            out += data[index:index + 2]
            index += 2
            continue
        if index + 4 > len(data):
            out += data[index:]
            break
        length = int.from_bytes(data[index + 2:index + 4], "big")
        end = index + 2 + length
        segment = data[index:end]
        if marker == 0xE1 and segment[4:10] == b"Exif\x00\x00" and not replaced:
            out += b"\xff\xe1" + (len(payload) + 2).to_bytes(2, "big") + payload
            replaced = True
        else:
            out += segment
        index = end

    if not replaced:
        return False
    path.write_bytes(bytes(out))
    return True


def load_image(path, fmt):
    """Return (image, exif summary). RAW uses its embedded preview when it can."""
    if fmt == "raw":
        import rawpy

        with rawpy.imread(str(path)) as raw:
            try:
                thumb = raw.extract_thumb()
                if thumb.format == rawpy.ThumbFormat.JPEG:
                    image = Image.open(io.BytesIO(thumb.data))
                else:
                    image = Image.fromarray(thumb.data)
            except Exception:
                image = Image.fromarray(raw.postprocess(half_size=True, use_camera_wb=True))
            return image, {}

    image = Image.open(path)
    info = read_exif(image)
    if fmt == "jpeg":
        image.draft("RGB", (DISPLAY_MAX * 2, DISPLAY_MAX * 2))
    return image, info


def make_copies(source, workdir, fmt):
    """Write display.webp and thumb.webp. Returns (width, height, exif)."""
    try:
        image, exif = load_image(source, fmt)
    except Image.DecompressionBombError:
        raise UploadError(
            413, "That photo has too many pixels (limit ~%d MP)." % (MAX_PIXELS // 1_000_000)
        )
    try:
        if image.width * image.height > MAX_PIXELS:
            raise UploadError(413, "That photo is too large to process (%d x %d)." % (image.width, image.height))
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
        width, height = image.size

        display = image.copy()
        display.thumbnail((DISPLAY_MAX, DISPLAY_MAX), Image.LANCZOS)
        display.save(workdir / "display.webp", "WEBP", quality=82, method=4)

        thumb = image.copy()
        thumb.thumbnail((THUMB_MAX, THUMB_MAX), Image.LANCZOS)
        thumb.save(workdir / "thumb.webp", "WEBP", quality=78, method=4)
    finally:
        try:
            image.close()
        except Exception:
            pass
    return width, height, exif


# ---------------------------------------------------------------- multipart

def parse_headers(raw):
    headers = {}
    for line in raw.decode("latin-1").split("\r\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            headers[key.strip().lower()] = value.strip()
    return headers


def disposition(value):
    name = filename = None
    for piece in value.split(";"):
        piece = piece.strip()
        if piece.lower().startswith("name="):
            name = piece[5:].strip().strip('"')
        elif piece.lower().startswith("filename="):
            filename = piece[9:].strip().strip('"')
    return name, filename


def read_body(rfile, length, destination):
    remaining = length
    with open(destination, "wb") as out:
        while remaining > 0:
            chunk = rfile.read(min(1024 * 1024, remaining))
            if not chunk:
                break
            out.write(chunk)
            remaining -= len(chunk)
    return length - remaining


def read_parts(path, boundary, tmpdir):
    """Stream one multipart body into fields and temp files (memory-safe)."""
    delimiter = b"--" + boundary
    fields = {}
    files = []

    with open(path, "rb") as handle:
        mapped = mmap.mmap(handle.fileno(), 0, access=mmap.ACCESS_READ)
        try:
            position = mapped.find(delimiter)
            while position != -1:
                start = position + len(delimiter)
                if mapped[start:start + 2] == b"--":
                    break
                if mapped[start:start + 2] == b"\r\n":
                    start += 2
                head_end = mapped.find(b"\r\n\r\n", start)
                if head_end == -1:
                    break
                headers = parse_headers(mapped[start:head_end])
                body_start = head_end + 4
                body_end = mapped.find(b"\r\n" + delimiter, body_start)
                if body_end == -1:
                    body_end = len(mapped)

                name, filename = disposition(headers.get("content-disposition", ""))
                if filename is not None:
                    target = tmpdir / ("part-%d" % len(files))
                    with open(target, "wb") as out:
                        cursor = body_start
                        while cursor < body_end:
                            stop = min(cursor + 1024 * 1024, body_end)
                            out.write(mapped[cursor:stop])
                            cursor = stop
                    files.append({"field": name, "filename": filename, "path": target})
                elif name:
                    fields[name] = mapped[body_start:body_end].decode("utf-8", "replace")

                position = mapped.find(delimiter, body_end)
        finally:
            mapped.close()

    return fields, files


# ---------------------------------------------------------------- photos

def public_view(owner, meta):
    category = meta.get("category", "")
    photo_id = meta.get("id", "")
    urls = {}
    for variant, filename in (meta.get("files") or {}).items():
        urls[variant] = "/media/%s/%s/%s/%s" % (
            quote(owner), quote(category), quote(photo_id), quote(filename)
        )
    return {
        "id": photo_id,
        "name": meta.get("name", "Untitled"),
        "category": category,
        "added": meta.get("added"),
        "width": meta.get("width"),
        "height": meta.get("height"),
        "exif": meta.get("exif") or {},
        "description": meta.get("description") or "",
        "urls": urls,
    }


def new_id():
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return "%s-%s" % (stamp, uuid.uuid4().hex[:4])


def clean_name(raw):
    name = " ".join(str(raw or "").split())
    if not name:
        raise UploadError(400, "Please give the photo a name.")
    if len(name) > 80:
        raise UploadError(400, "The name is too long (80 characters maximum).")
    if any(ord(ch) < 32 for ch in name):
        raise UploadError(400, "The name contains characters we cannot store.")
    return name


def clean_description(raw):
    text = " ".join(str(raw or "").split())
    if len(text) > 300:
        raise UploadError(400, "The description is too long (300 characters maximum).")
    return text or None


def name_taken(owner, name):
    wanted = name.casefold()
    return any(p.get("name", "").casefold() == wanted for p in storage.list("public_photos", owner))


# ---------------------------------------------------------------- handler

class Handler(SimpleHTTPRequestHandler):
    server_version = "weshoot/1.0"

    def end_headers(self):
        if not getattr(self, "_own_cache", False):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # -- helpers -------------------------------------------------------

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def fail(self, status, message):
        self.send_json({"error": message}, status)

    # -- GET -----------------------------------------------------------

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/health":
            return self.send_json({"ok": True})
        if path == "/api/photos":
            return self.handle_photos()
        if path == "/api/trash":
            return self.handle_trash()
        if path.startswith("/media/"):
            return self.handle_media(path)
        if path.startswith("/trash-media/"):
            return self.handle_trash_media(path)
        return super().do_GET()

    def handle_photos(self):
        owner = current_owner()
        gallery = gallery_for(owner)
        photos = [public_view(owner, meta) for meta in storage.list("public_photos", owner)]
        return self.send_json({
            "user": owner,
            "firstName": gallery.get("firstName") or owner,
            "categories": [
                {"id": c["id"], "label": c.get("label", c["id"]), "cover": c.get("cover")}
                for c in categories_for(owner)
            ],
            "photos": photos,
        })

    def handle_trash(self):
        owner = current_owner()
        items = []
        for meta in storage.list_trash(owner, TRASH_HOURS):
            view = public_view(owner, meta)
            category = view["category"]
            photo_id = view["id"]
            thumb = (meta.get("files") or {}).get("thumb")
            view["urls"] = {
                "thumb": "/trash-media/%s/%s/%s/%s"
                % (quote(owner), quote(category), quote(photo_id), quote(thumb))
            } if thumb else {}
            view["deleted_at"] = meta.get("deleted_at")
            view["hours_left"] = meta.get("hours_left", 0)
            items.append(view)
        return self.send_json({"photos": items})

    def send_file(self, target, cache):
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        size = target.stat().st_size
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(size))
        self.send_header("Cache-Control", cache)
        self._own_cache = True
        self.end_headers()
        with open(target, "rb") as source:
            shutil.copyfileobj(source, self.wfile)

    def handle_media(self, path):
        parts = [unquote(p) for p in path.strip("/").split("/")]
        if len(parts) != 5 or parts[0] != "media":
            return self.fail(404, "Not found")
        _, owner, category, photo_id, filename = parts
        if not (SAFE_ID.match(owner) and SAFE_NAME.match(category) and SAFE_ID.match(photo_id)):
            return self.fail(404, "Not found")
        try:
            target = storage.file_path("public_photos", owner, category, photo_id, filename)
        except StorageError:
            return self.fail(404, "Not found")
        if not target.is_file():
            return self.fail(404, "Not found")
        return self.send_file(target, "public, max-age=31536000, immutable")

    def handle_trash_media(self, path):
        """Thumbnails for the restore tray - the owner only, never a live photo."""
        parts = [unquote(p) for p in path.strip("/").split("/")]
        if len(parts) != 5 or parts[0] != "trash-media":
            return self.fail(404, "Not found")
        _, owner, category, photo_id, filename = parts
        if owner != current_owner():
            return self.fail(404, "Not found")
        if not (
            SAFE_ID.match(owner)
            and SAFE_NAME.match(category)
            and SAFE_ID.match(photo_id)
            and SAFE_FILE.match(filename)
        ):
            return self.fail(404, "Not found")
        if filename in ("photo.json", "deleted.json"):
            return self.fail(404, "Not found")
        try:
            target = storage.file_path("Retention", owner, category, photo_id, filename)
        except StorageError:
            return self.fail(404, "Not found")
        if not target.is_file():
            return self.fail(404, "Not found")
        return self.send_file(target, "private, max-age=60")

    # -- POST ----------------------------------------------------------

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == "/api/upload":
            return self.handle_upload()
        if path == "/api/delete":
            return self.handle_delete()
        if path == "/api/restore":
            return self.handle_restore()
        return self.fail(404, "Not found")

    def read_json_body(self, limit=1024 * 1024):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > limit:
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return None

    def handle_delete(self):
        payload = self.read_json_body()
        if not isinstance(payload, dict):
            return self.fail(400, "Expected a JSON body.")

        owner = current_owner()
        category = str(payload.get("category") or "").strip()
        if category not in {c["id"] for c in categories_for(owner)}:
            return self.fail(400, "Choose a category.")
        ids = payload.get("ids")
        if not isinstance(ids, list) or not ids:
            return self.fail(400, "Tick at least one photo.")
        if len(ids) > 200:
            return self.fail(400, "Too many photos in one go.")

        deleted, failed = [], []
        with upload_lock:
            for raw_id in ids:
                photo_id = str(raw_id)
                if not SAFE_ID.match(photo_id):
                    failed.append({"id": photo_id, "error": "Not found"})
                    continue
                try:
                    storage.trash(owner, category, photo_id)
                except Exception as error:
                    print("  ! delete failed for %s: %s" % (photo_id, error))
                    failed.append({"id": photo_id, "error": "Could not delete that photo."})
                    continue
                clear_cover(owner, photo_id)
                deleted.append(photo_id)

        return self.send_json({"deleted": deleted, "failed": failed})

    def handle_restore(self):
        payload = self.read_json_body()
        if not isinstance(payload, dict):
            return self.fail(400, "Expected a JSON body.")

        owner = current_owner()
        photo_id = str(payload.get("id") or "")
        category = str(payload.get("category") or "").strip()
        if category not in {c["id"] for c in categories_for(owner)}:
            return self.fail(400, "Choose a category for this photo.")
        if not SAFE_ID.match(photo_id):
            return self.fail(404, "That photo is no longer in the deleted list.")

        try:
            name = clean_name(payload.get("name"))
            description = clean_description(payload.get("description"))
        except UploadError as error:
            return self.fail(error.status, error.message)

        with upload_lock:
            entry = next(
                (item for item in storage.list_trash(owner, TRASH_HOURS)
                 if item.get("id") == photo_id),
                None,
            )
            if not entry:
                return self.fail(410, "That photo is no longer in the deleted list.")
            if name_taken(owner, name):
                return self.fail(409, "You already have a photo called \"%s\"." % name)

            was_empty = not any(
                photo.get("category") == category
                for photo in storage.list("public_photos", owner)
            )
            try:
                meta = storage.restore(
                    owner, entry["category"], photo_id, category, name, description
                )
            except StorageError:
                return self.fail(409, "That photo could not be restored.")
            if was_empty:
                set_cover(owner, category, photo_id)

        return self.send_json({"photo": public_view(owner, meta)})

    def handle_upload(self):
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type or "boundary=" not in content_type:
            return self.fail(400, "Expected a multipart upload.")
        boundary = content_type.split("boundary=", 1)[1].strip().strip('"').encode("latin-1")

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self.fail(411, "Missing upload size.")
        if length <= 0:
            return self.fail(411, "Missing upload body.")
        if length > MAX_UPLOAD + 4 * 1024 * 1024:
            return self.fail(413, "That file is larger than the %d MB limit." % (MAX_UPLOAD // (1024 * 1024)))

        incoming = STORAGE_ROOT / ".incoming"
        incoming.mkdir(parents=True, exist_ok=True)
        work = incoming / uuid.uuid4().hex
        work.mkdir(parents=True)
        body_file = work / "body"

        try:
            received = read_body(self.rfile, length, body_file)
            if received != length:
                return self.fail(400, "The upload was interrupted.")

            fields, files = read_parts(body_file, boundary, work)
            if not files:
                return self.fail(400, "No file was received.")

            owner = current_owner()
            name = clean_name(fields.get("name"))
            description = clean_description(fields.get("description"))
            category = (fields.get("category") or "").strip()
            allowed_categories = {c["id"] for c in categories_for(owner)}
            if category not in allowed_categories:
                return self.fail(400, "Choose a category for this photo.")

            uploaded = files[0]
            fmt = detect_format(uploaded["path"], uploaded["filename"])
            if fmt not in ALLOWED:
                return self.fail(
                    415,
                    "That file type is not supported. Use JPEG, PNG, WebP, HEIC, TIFF or RAW.",
                )

            with upload_lock:
                if name_taken(owner, name):
                    return self.fail(409, "You already have a photo called \"%s\"." % name)
                photo_id = new_id()

                photo_work = work / "photo"
                photo_work.mkdir()

                original_name = "original." + EXT[fmt]
                original_path = photo_work / original_name
                shutil.copyfile(uploaded["path"], original_path)

                gps_stripped = False
                if fmt == "jpeg":
                    gps_stripped = strip_jpeg_gps(original_path)

                files_out = {"original": original_name}
                width = height = None
                exif = {}
                try:
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore")
                        width, height, exif = make_copies(original_path, photo_work, fmt)
                    files_out["display"] = "display.webp"
                    files_out["thumb"] = "thumb.webp"
                except UploadError:
                    raise
                except Exception as error:  # a bad file must never lose the upload
                    print("  ! copies failed for %s: %s" % (photo_id, error))

                meta = {
                    "id": photo_id,
                    "name": name,
                    "description": description,
                    "category": category,
                    "added": datetime.now().isoformat(timespec="seconds"),
                    "files": files_out,
                    "width": width,
                    "height": height,
                    "exif": exif,
                    "gps_stripped": gps_stripped,
                    "bytes": original_path.stat().st_size,
                }
                sources = {filename: photo_work / filename for filename in files_out.values()}
                storage.save("public_photos", owner, category, photo_id, sources, meta)

            return self.send_json({"photo": public_view(owner, meta)}, 201)

        except UploadError as error:
            return self.fail(error.status, error.message)
        except Exception:
            traceback.print_exc()
            return self.fail(500, "The upload failed on the server.")
        finally:
            shutil.rmtree(work, ignore_errors=True)


# ---------------------------------------------------------------- main

def main():
    mimetypes.add_type("image/webp", ".webp")
    mimetypes.add_type("image/heic", ".heic")

    for container in ("public_photos", "store_photos", "event_photos", "Retention"):
        (STORAGE_ROOT / container).mkdir(parents=True, exist_ok=True)

    if TRASH_PURGE == "app":
        removed = storage.purge_trash(TRASH_HOURS)
        if removed:
            print("  purged   %d expired retention folder(s)" % removed)

    handler = partial(Handler, directory=str(SITE))
    server = ThreadingHTTPServer((HOST, PORT), handler)

    print("")
    print("  weshoot")
    print("  site     http://%s:%d" % ("localhost" if HOST in ("127.0.0.1", "0.0.0.0") else HOST, PORT))
    print("  storage  %s" % STORAGE_ROOT)
    print("  limits   %d MB, %d MP, display %d px, thumb %d px"
          % (MAX_UPLOAD // (1024 * 1024), MAX_PIXELS // 1_000_000, DISPLAY_MAX, THUMB_MAX))
    print("  Ctrl+C to stop")
    print("")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  stopped")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
