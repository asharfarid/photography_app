"""weshoot - the storage seam.

This is the only module that knows where photo files live. Everything else
asks it: save, list, open, move to retention, restore, purge. Swapping local
disk for Azure Blob later means writing one more class with the same methods -
no page or route changes.

Layout (one folder per photo):

    <root>/public_photos/<owner>/gallery.json      per-user preferences
    <root>/public_photos/<owner>/<category>/<photo-id>/
        photo.json      written LAST - its presence means "upload finished"
        original.<ext>  full resolution, GPS stripped where possible
        display.webp    ~1600 px, for viewing
        thumb.webp      ~400 px, for grids and covers

Deleted photos keep their whole folder, one level over:

    <root>/Retention/<owner>/<category>/<photo-id>/
        ... the same files, plus deleted.json (deleted_at, UTC)
"""

from __future__ import annotations

import json
import os
import shutil
from datetime import datetime, timedelta, timezone
from math import ceil
from pathlib import Path

CONTAINERS = ("public_photos", "store_photos", "event_photos", "Retention")

RETENTION_HOURS = 48


class StorageError(Exception):
    pass


def utc_now():
    return datetime.now(timezone.utc)


def read_json(path, default=None):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path, payload):
    """Write beside the target, then swap it in - never a half file."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(temp, path)


class DiskStorage:
    """Local disk backend. Paths never leave this class."""

    def __init__(self, root):
        self.root = Path(root).resolve()

    # -- paths ---------------------------------------------------------

    def container(self, kind):
        if kind not in CONTAINERS:
            raise StorageError("unknown container: %s" % kind)
        return self.root / kind

    def photo_dir(self, kind, owner, category, photo_id):
        return self.container(kind) / owner / category / photo_id

    def file_path(self, kind, owner, category, photo_id, filename):
        base = self.photo_dir(kind, owner, category, photo_id).resolve()
        target = (base / filename).resolve()
        if target.parent != base:
            raise StorageError("path escapes the photo folder")
        return target

    # -- per-user preferences ------------------------------------------

    def gallery_path(self, owner):
        return self.container("public_photos") / owner / "gallery.json"

    def load_gallery(self, owner):
        return read_json(self.gallery_path(owner))

    def save_gallery(self, owner, data):
        write_json(self.gallery_path(owner), data)

    # -- write ---------------------------------------------------------

    def save(self, kind, owner, category, photo_id, files, meta):
        """Move prepared files into place, then write photo.json last.

        `files` is {destination name: source Path}. The whole folder is built
        in a temporary directory and renamed into place, so a failed upload
        never leaves a half photo in the gallery.
        """
        target = self.photo_dir(kind, owner, category, photo_id)
        target.parent.mkdir(parents=True, exist_ok=True)
        staging = target.with_name(photo_id + ".tmp")
        if staging.exists():
            shutil.rmtree(staging)
        staging.mkdir(parents=True)

        try:
            for name, source in files.items():
                shutil.move(str(source), str(staging / name))
            write_json(staging / "photo.json", meta)
            if target.exists():
                shutil.rmtree(target)
            staging.rename(target)
        except Exception:
            shutil.rmtree(staging, ignore_errors=True)
            raise

        return target

    # -- read ----------------------------------------------------------

    def list(self, kind, owner):
        """Every complete photo folder for one owner, oldest first."""
        base = self.container(kind) / owner
        if not base.is_dir():
            return []

        photos = []
        for category_dir in sorted(p for p in base.iterdir() if p.is_dir()):
            for photo_dir in sorted(p for p in category_dir.iterdir() if p.is_dir()):
                meta_file = photo_dir / "photo.json"
                if not meta_file.is_file():
                    continue  # unfinished upload - never shown
                meta = read_json(meta_file, {})
                meta.setdefault("id", photo_dir.name)
                meta.setdefault("category", category_dir.name)
                meta.setdefault("name", "Untitled")
                meta.setdefault("files", {})
                photos.append(meta)
        return photos

    def read_bytes(self, kind, owner, category, photo_id, filename):
        return self.file_path(kind, owner, category, photo_id, filename).read_bytes()

    # -- retention -----------------------------------------------------

    def trash(self, owner, category, photo_id, deleted_at=None):
        """Move one photo folder to Retention, stamped with the delete time."""
        source = self.photo_dir("public_photos", owner, category, photo_id)
        if not (source / "photo.json").is_file():
            raise StorageError("photo not found")

        target = self.photo_dir("Retention", owner, category, photo_id)
        if target.exists():
            raise StorageError("already in retention")

        stamp = (deleted_at or utc_now()).isoformat(timespec="seconds")
        marker = {"id": photo_id, "category": category, "deleted_at": stamp}
        write_json(source / "deleted.json", marker)

        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(source), str(target))
        except Exception:
            (source / "deleted.json").unlink(missing_ok=True)
            raise

        try:
            source.parent.rmdir()  # tidy the now-empty category folder
        except OSError:
            pass
        return target

    def list_trash(self, owner, hours=RETENTION_HOURS):
        """Deleted photos that can still be restored, newest first."""
        base = self.container("Retention") / owner
        if not base.is_dir():
            return []

        now = utc_now()
        found = []
        for category_dir in sorted(p for p in base.iterdir() if p.is_dir()):
            for folder in sorted(p for p in category_dir.iterdir() if p.is_dir()):
                marker = read_json(folder / "deleted.json")
                if not marker or not marker.get("deleted_at"):
                    continue  # no stamp - treated as expired, never offered
                try:
                    deleted_at = datetime.fromisoformat(marker["deleted_at"])
                except ValueError:
                    continue
                if deleted_at.tzinfo is None:
                    deleted_at = deleted_at.replace(tzinfo=timezone.utc)

                left = (deleted_at + timedelta(hours=hours)) - now
                if left.total_seconds() <= 0:
                    continue

                meta = read_json(folder / "photo.json", {})
                meta.setdefault("id", folder.name)
                meta.setdefault("category", category_dir.name)
                meta.setdefault("name", "Untitled")
                meta.setdefault("files", {})
                meta["deleted_at"] = deleted_at.isoformat(timespec="seconds")
                meta["hours_left"] = max(0, ceil(left.total_seconds() / 3600))
                found.append(meta)

        found.sort(key=lambda item: item["deleted_at"], reverse=True)
        return found

    def restore(self, owner, category, photo_id, target_category, name, description=None):
        """Move a deleted photo back, under the chosen name and category."""
        source = self.photo_dir("Retention", owner, category, photo_id)
        if not (source / "photo.json").is_file():
            raise StorageError("not found")

        target = self.photo_dir("public_photos", owner, target_category, photo_id)
        if target.exists():
            raise StorageError("already exists")

        meta = read_json(source / "photo.json", {})
        meta["category"] = target_category
        meta["name"] = name
        meta["description"] = description or None

        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(source), str(target))
        except Exception:
            raise StorageError("could not move the folder back")

        # The move is done; record the new category and drop the delete stamp.
        write_json(target / "photo.json", meta)
        (target / "deleted.json").unlink(missing_ok=True)
        try:
            source.parent.rmdir()  # tidy the now-empty retention folder
        except OSError:
            pass
        return meta

    def purge_trash(self, hours=RETENTION_HOURS, owner=None):
        """Reclaim expired folders. Only disk housekeeping - never a read rule."""
        base = self.container("Retention")
        if owner:
            base = base / owner
        if not base.is_dir():
            return 0

        cutoff = utc_now() - timedelta(hours=hours)
        removed = 0
        for folder in list(base.glob("*/*/*")):
            if not folder.is_dir():
                continue
            marker = read_json(folder / "deleted.json")
            expired = not marker or not marker.get("deleted_at")
            if not expired:
                try:
                    deleted_at = datetime.fromisoformat(marker["deleted_at"])
                    if deleted_at.tzinfo is None:
                        deleted_at = deleted_at.replace(tzinfo=timezone.utc)
                    expired = deleted_at <= cutoff
                except ValueError:
                    expired = True
            if expired:
                shutil.rmtree(folder, ignore_errors=True)
                removed += 1
                try:
                    folder.parent.rmdir()
                except OSError:
                    pass
        return removed

    # -- permanent delete (purge only) ---------------------------------

    def delete(self, kind, owner, category, photo_id):
        target = self.photo_dir(kind, owner, category, photo_id)
        if target.is_dir():
            shutil.rmtree(target)
            return True
        return False
