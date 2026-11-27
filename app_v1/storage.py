"""weshoot - the storage seam.

This is the only module that knows where photo files live. Everything else
asks it: save, list, open, delete. Swapping local disk for Azure Blob later
means writing one more class with the same four methods - no page or route
changes.

Layout (one folder per photo):

    <root>/public_photos/<owner>/<category>/<photo-id>/
        photo.json      written LAST - its presence means "upload finished"
        original.<ext>  full resolution, GPS stripped where possible
        display.webp    ~1600 px, for viewing
        thumb.webp      ~400 px, for grids and covers
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

CONTAINERS = ("public_photos", "store_photos", "event_photos")


class StorageError(Exception):
    pass


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
            (staging / "photo.json").write_text(
                json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
            )
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
                try:
                    meta = json.loads(meta_file.read_text(encoding="utf-8"))
                except Exception:
                    meta = {}
                meta.setdefault("id", photo_dir.name)
                meta.setdefault("category", category_dir.name)
                meta.setdefault("name", "Untitled")
                meta.setdefault("files", {})
                photos.append(meta)
        return photos

    def read_bytes(self, kind, owner, category, photo_id, filename):
        return self.file_path(kind, owner, category, photo_id, filename).read_bytes()

    # -- delete (used by later screens, kept here so it is one seam) ----

    def delete(self, kind, owner, category, photo_id):
        target = self.photo_dir(kind, owner, category, photo_id)
        if target.is_dir():
            shutil.rmtree(target)
            return True
        return False
