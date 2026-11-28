/* weshoot - app_v1
   Reads data/site.json and the photo API and builds the page.
   CSS never touches the data; this file is the only one that does. */

(async function () {
  "use strict";

  const errorBox = document.getElementById("load-error");

  function fail(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(path + " (" + response.status + " " + response.statusText + ")");
    }
    return response.json();
  }

  async function sendJson(path, payload) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body = {};
    try {
      body = await response.json();
    } catch (error) {
      body = {};
    }
    if (!response.ok) {
      throw new Error(body.error || "Request failed (" + response.status + ")");
    }
    return body;
  }

  let site;
  try {
    site = await loadJson("data/site.json");
  } catch (error) {
    console.error(error);
    fail(
      "Could not load data/site.json (" +
        error.message +
        "). Start the site with serve.cmd, then open http://localhost:8000"
    );
    return;
  }

  /* Every image path goes through this, so moving to Azure Blob later
     is one change: "imageBase" in site.json. */
  const base = site.imageBase || "";
  const imageUrl = (path) => (path ? base + path : "");

  /* The single seam for identity: today a constant in site.json,
     later the value comes from a login session. Pages never change. */
  function getCurrentUser() {
    return site.currentUser;
  }

  /* ---------- header (every page) ---------- */

  function buildHeader() {
    const header = document.getElementById("site-header");
    header.style.backgroundImage =
      'url("' + imageUrl(site.titleBarImage) + '")';

    const name = document.createElement("span");
    name.className = "site-name";

    const link = document.createElement("a");
    link.href = site.siteNameHref || "index.html";
    link.textContent = site.siteName;
    name.appendChild(link);

    header.appendChild(name);

    if (Array.isArray(site.nav) && site.nav.length > 0) {
      const nav = document.createElement("nav");
      for (const item of site.nav) {
        const navLink = document.createElement("a");
        navLink.href = item.href;
        navLink.textContent = item.label;
        nav.appendChild(navLink);
      }
      header.appendChild(nav);
    }

    const where = document.createElement("span");
    where.className = "site-where";
    where.id = "site-where";
    header.appendChild(where);
  }

  function setWhere(text) {
    const where = document.getElementById("site-where");
    if (where) {
      where.textContent = text || "";
    }
  }

  /* ---------- home page only ---------- */

  function buildHero() {
    const main = document.getElementById("site-main");

    const hero = document.createElement("section");
    hero.className = "hero";

    const photo = document.createElement("img");
    photo.className = "hero-photo";
    photo.src = imageUrl(site.heroImage);
    photo.alt = "";
    hero.appendChild(photo);

    if (Array.isArray(site.heroText) && site.heroText.length > 0) {
      const text = document.createElement("div");
      text.className = "hero-text";
      for (const line of site.heroText) {
        const p = document.createElement("p");
        p.textContent = line;
        text.appendChild(p);
      }
      hero.appendChild(text);
    }

    if (Array.isArray(site.buttons) && site.buttons.length > 0) {
      const nav = document.createElement("nav");
      nav.className = "hero-buttons";
      nav.setAttribute("aria-label", "Main sections");

      for (const item of site.buttons) {
        const button = document.createElement("a");
        button.className = "big-button";
        button.href = item.href;
        button.textContent = item.label;
        nav.appendChild(button);
      }

      hero.appendChild(nav);
    }

    main.appendChild(hero);
  }

  /* ---------- my gallery: state ---------- */

  let galleryUser = null;
  let photos = [];
  let activeCategory = null;
  let content = null;
  let selecting = false;
  const selected = new Set();

  let binButton = null;
  let deleteBar = null;
  let deleteLabel = null;
  let deleteButton = null;
  let selectAllButton = null;

  function photosIn(categoryId) {
    return photos.filter((photo) => photo.category === categoryId);
  }

  function categoryLabel(categoryId) {
    const category = (galleryUser.categories || []).find(
      (item) => item.id === categoryId
    );
    return category ? category.label : categoryId;
  }

  function coverPhoto(category) {
    const list = photosIn(category.id);
    if (list.length === 0) {
      return null;
    }
    const chosen = category.cover
      ? list.find((photo) => photo.id === category.cover)
      : null;
    return chosen || list[0];
  }

  function thumbUrl(photo) {
    return photo && photo.urls && photo.urls.thumb ? photo.urls.thumb : "";
  }

  function formatBytes(bytes) {
    if (!bytes) {
      return "0 KB";
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return Math.round(bytes / 1024) + " KB";
  }

  function formatExif(photo) {
    const info = photo.exif || {};
    return [info.camera, info.lens, info.aperture, info.shutter, info.iso, info.focal]
      .filter(Boolean)
      .join(" \u00b7 ");
  }

  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  /* ---------- my gallery: toolbar ---------- */

  function buildGalleryToolbar(user) {
    const main = document.getElementById("site-main");

    const bar = document.createElement("div");
    bar.className = "gallery-toolbar";

    const who = document.createElement("span");
    who.className = "gallery-user";
    who.textContent = user.firstName + " \u00b7 " + getCurrentUser();
    bar.appendChild(who);

    const search = document.createElement("div");
    search.className = "gallery-search";

    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = "Search photos";
    input.setAttribute("aria-label", "Search photos");
    input.autocomplete = "off";
    search.appendChild(input);

    bar.appendChild(search);

    const actions = document.createElement("div");
    actions.className = "gallery-actions";

    binButton = document.createElement("button");
    binButton.type = "button";
    binButton.className = "gallery-action gallery-action-danger";
    binButton.textContent = "\u{1F5D1}\uFE0F";
    binButton.title = "Delete photos";
    binButton.setAttribute("aria-label", "Delete photos");
    binButton.hidden = true;
    binButton.addEventListener("click", () => setSelecting(!selecting));
    actions.appendChild(binButton);

    const add = document.createElement("button");
    add.type = "button";
    add.className = "gallery-action";
    add.textContent = "+";
    add.title = "Add photo";
    add.setAttribute("aria-label", "Add photo");
    add.addEventListener("click", () => openAddMenu(add));
    actions.appendChild(add);

    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "gallery-action";
    settings.textContent = "\u2699";
    settings.title = "Manage photos and settings (coming soon)";
    settings.setAttribute("aria-label", "Manage photos and settings");
    actions.appendChild(settings);

    bar.appendChild(actions);
    main.appendChild(bar);

    /* the delete bar sits below the toolbar, under the bin/+ pair */
    deleteBar = document.createElement("div");
    deleteBar.className = "delete-bar";
    deleteBar.hidden = true;

    selectAllButton = document.createElement("button");
    selectAllButton.type = "button";
    selectAllButton.className = "delete-select-all";
    selectAllButton.textContent = "Select all";
    selectAllButton.addEventListener("click", toggleSelectAll);
    deleteBar.appendChild(selectAllButton);

    deleteLabel = document.createElement("span");
    deleteLabel.className = "delete-count";
    deleteBar.appendChild(deleteLabel);

    deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.disabled = true;
    deleteButton.addEventListener("click", deleteSelected);
    deleteBar.appendChild(deleteButton);

    main.appendChild(deleteBar);
  }

  function setSelecting(on) {
    selecting = on;
    selected.clear();
    updateDeleteBar();
    render();
  }

  function toggleSelected(photoId) {
    if (selected.has(photoId)) {
      selected.delete(photoId);
    } else {
      selected.add(photoId);
    }
    updateDeleteBar();
    render();
  }

  function toggleSelectAll() {
    const list = photosIn(activeCategory);
    if (selected.size === list.length && list.length > 0) {
      selected.clear();
    } else {
      list.forEach((photo) => selected.add(photo.id));
    }
    updateDeleteBar();
    render();
  }

  function updateDeleteBar() {
    if (!deleteBar) {
      return;
    }
    deleteBar.hidden = !selecting;
    if (binButton) {
      binButton.hidden = !activeCategory;
      binButton.classList.toggle("is-active", selecting);
    }
    if (!selecting) {
      return;
    }
    const total = photosIn(activeCategory).length;
    const count = selected.size;
    deleteLabel.textContent = count + " selected";
    deleteButton.disabled = count === 0;
    deleteButton.classList.toggle("armed", count > 0);
    selectAllButton.textContent =
      count > 0 && count === total ? "Clear all" : "Select all";
  }

  /* ---------- my gallery: add menu ---------- */

  function closeMenu() {
    const menu = document.querySelector(".action-menu");
    if (menu) {
      menu.remove();
    }
    document
      .querySelectorAll(".menu-open")
      .forEach((element) => element.classList.remove("menu-open"));
  }

  function openAddMenu(button) {
    if (document.querySelector(".action-menu")) {
      closeMenu();
      return;
    }
    closeMenu();

    const menu = document.createElement("div");
    menu.className = "action-menu";

    const upload = document.createElement("button");
    upload.type = "button";
    upload.className = "action-menu-item";
    upload.textContent = "Upload from device";
    upload.addEventListener("click", () => {
      closeMenu();
      openWizard({ mode: "upload" });
    });
    menu.appendChild(upload);

    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "action-menu-item";
    restore.textContent = "Restore deleted photos";
    restore.addEventListener("click", () => {
      closeMenu();
      openTrash();
    });
    menu.appendChild(restore);

    button.parentElement.classList.add("menu-open");
    button.parentElement.appendChild(menu);
  }

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".action-menu") &&
      !event.target.closest(".gallery-action")
    ) {
      closeMenu();
    }
  });

  /* ---------- my gallery: cards and category view ---------- */

  function render() {
    if (!content) {
      return;
    }
    content.textContent = "";
    setWhere(activeCategory ? categoryLabel(activeCategory) : "My Gallery");
    updateDeleteBar();
    if (activeCategory) {
      renderCategory(activeCategory);
    } else {
      renderCards();
    }
  }

  function renderCards() {
    const categories = Array.isArray(galleryUser.categories)
      ? galleryUser.categories
      : [];
    const withPhotos = categories.filter(
      (category) => photosIn(category.id).length > 0
    );

    if (withPhotos.length === 0) {
      const hint = document.createElement("p");
      hint.className = "empty-hint";
      hint.textContent = "No photos yet. Use + to upload your first photo.";
      content.appendChild(hint);
      return;
    }

    const list = document.createElement("div");
    list.className = "category-list";

    for (const category of withPhotos) {
      list.appendChild(buildCategoryCard(category));
    }

    content.appendChild(list);
  }

  function buildCategoryCard(category) {
    const cover = coverPhoto(category);
    const count = photosIn(category.id).length;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "category-card";

    const art = document.createElement("span");
    art.className = "category-art";

    if (cover && thumbUrl(cover)) {
      const photo = document.createElement("img");
      photo.src = imageUrl(thumbUrl(cover));
      photo.alt = "";
      photo.loading = "lazy";
      art.appendChild(photo);
    }

    const label = document.createElement("span");
    label.className = "category-label";

    const name = document.createElement("span");
    name.textContent = category.label;
    label.appendChild(name);

    const tally = document.createElement("span");
    tally.className = "category-count";
    tally.textContent = count + (count === 1 ? " photo" : " photos");
    label.appendChild(tally);

    card.appendChild(art);
    card.appendChild(label);

    card.addEventListener("click", () => {
      activeCategory = category.id;
      selecting = false;
      selected.clear();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return card;
  }

  function renderCategory(categoryId) {
    const list = photosIn(categoryId);

    const head = document.createElement("div");
    head.className = "category-view-head";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "btn-ghost";
    back.textContent = "\u2190 All categories";
    back.addEventListener("click", () => {
      activeCategory = null;
      selecting = false;
      selected.clear();
      render();
    });
    head.appendChild(back);

    const title = document.createElement("h2");
    title.textContent = categoryLabel(categoryId);
    head.appendChild(title);

    const tally = document.createElement("span");
    tally.className = "muted";
    tally.textContent = plural(list.length, "photo");
    head.appendChild(tally);

    content.appendChild(head);

    if (list.length === 0) {
      const hint = document.createElement("p");
      hint.className = "empty-hint";
      hint.textContent = "No photos in this category yet.";
      content.appendChild(hint);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "photo-grid";

    for (const photo of list) {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "photo-tile";

      if (thumbUrl(photo)) {
        const image = document.createElement("img");
        image.src = imageUrl(thumbUrl(photo));
        image.alt = photo.name;
        image.loading = "lazy";
        tile.appendChild(image);
      } else {
        const placeholder = document.createElement("span");
        placeholder.className = "photo-placeholder";
        placeholder.textContent = photo.name;
        tile.appendChild(placeholder);
      }

      const caption = document.createElement("span");
      caption.className = "photo-caption";
      caption.textContent = photo.name;
      tile.appendChild(caption);

      if (selecting) {
        tile.classList.add("selectable");
        const checked = selected.has(photo.id);
        if (checked) {
          tile.classList.add("selected");
        }
        const box = document.createElement("span");
        box.className = "photo-check";
        box.setAttribute("aria-hidden", "true");
        box.textContent = checked ? "\u2713" : "";
        tile.appendChild(box);
        tile.setAttribute("aria-pressed", checked ? "true" : "false");
        tile.addEventListener("click", () => toggleSelected(photo.id));
      } else {
        tile.addEventListener("click", () => openLightbox(photo));
      }

      grid.appendChild(tile);
    }

    content.appendChild(grid);
  }

  /* ---------- my gallery: lightbox ---------- */

  function openLightbox(photo) {
    const urls = photo.urls || {};

    const backdrop = document.createElement("div");
    backdrop.className = "lightbox";

    const figure = document.createElement("figure");
    figure.className = "lightbox-figure";

    const image = document.createElement("img");
    image.src = imageUrl(urls.display || urls.original || urls.thumb || "");
    image.alt = photo.name;
    figure.appendChild(image);

    const caption = document.createElement("figcaption");

    const name = document.createElement("strong");
    name.textContent = photo.name;
    caption.appendChild(name);

    const details = formatExif(photo);
    if (details) {
      const line = document.createElement("span");
      line.className = "lightbox-exif";
      line.textContent = details;
      caption.appendChild(line);
    }

    if (photo.description) {
      const note = document.createElement("p");
      note.className = "lightbox-description";
      note.textContent = photo.description;
      caption.appendChild(note);
    }

    if (urls.original) {
      const download = document.createElement("a");
      download.className = "btn-primary";
      download.href = imageUrl(urls.original);
      download.download = photo.name;
      download.textContent = "Download original";
      caption.appendChild(download);
    }

    figure.appendChild(caption);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "lightbox-close";
    close.textContent = "\u00d7";
    close.setAttribute("aria-label", "Close");

    backdrop.appendChild(close);
    backdrop.appendChild(figure);
    document.body.appendChild(backdrop);
    document.body.classList.add("no-scroll");

    function dismiss() {
      backdrop.remove();
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKey);
    }

    function onKey(event) {
      if (event.key === "Escape") {
        dismiss();
      }
    }

    close.addEventListener("click", dismiss);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        dismiss();
      }
    });
    document.addEventListener("keydown", onKey);
  }

  /* ---------- my gallery: small dialogs ---------- */

  function toast(message, isError) {
    const note = document.createElement("p");
    note.className = "toast" + (isError ? " error" : "");
    note.textContent = message;
    document.body.appendChild(note);
    window.setTimeout(() => note.remove(), 4500);
  }

  function confirmDialog(title, note) {
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop";

      const modal = document.createElement("div");
      modal.className = "modal confirm";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");

      const heading = document.createElement("h2");
      heading.textContent = title;
      modal.appendChild(heading);

      const text = document.createElement("p");
      text.className = "modal-note";
      text.textContent = note;
      modal.appendChild(text);

      const actions = document.createElement("div");
      actions.className = "wizard-actions";

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "btn-ghost";
      cancel.textContent = "Cancel";

      const confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "btn-danger";
      confirm.textContent = "Delete";

      actions.appendChild(cancel);
      actions.appendChild(confirm);
      modal.appendChild(actions);

      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
      document.body.classList.add("no-scroll");
      confirm.focus();

      function finish(answer) {
        backdrop.remove();
        document.body.classList.remove("no-scroll");
        document.removeEventListener("keydown", onKey);
        resolve(answer);
      }

      function onKey(event) {
        if (event.key === "Escape") {
          finish(false);
        }
      }

      document.addEventListener("keydown", onKey);
      cancel.addEventListener("click", () => finish(false));
      confirm.addEventListener("click", () => finish(true));
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) {
          finish(false);
        }
      });
    });
  }

  async function deleteSelected() {
    if (!activeCategory || selected.size === 0) {
      return;
    }
    const ids = Array.from(selected);
    const confirmed = await confirmDialog(
      "Delete " + plural(ids.length, "photo") + "?",
      "They move to Retention for 48 hours. You can bring them back from + \u2192 Restore deleted photos."
    );
    if (!confirmed) {
      return;
    }

    deleteButton.disabled = true;
    deleteLabel.textContent = "Deleting\u2026";

    try {
      const result = await sendJson("api/delete", {
        category: activeCategory,
        ids,
      });
      const done = (result.deleted || []).length;
      const failed = (result.failed || []).length;

      selecting = false;
      selected.clear();
      await refreshPhotos();

      toast(
        done + " deleted" + (failed ? " \u00b7 " + failed + " failed" : ""),
        failed > 0
      );
    } catch (error) {
      toast(error.message, true);
      deleteButton.disabled = false;
      updateDeleteBar();
    }
  }

  async function refreshPhotos() {
    const data = await loadJson("api/photos");
    photos = Array.isArray(data.photos) ? data.photos : [];
    galleryUser.categories = Array.isArray(data.categories) ? data.categories : [];
    if (activeCategory && photosIn(activeCategory).length === 0) {
      activeCategory = null;
    }
    render();
  }

  /* ---------- my gallery: trash tray ---------- */

  async function openTrash() {
    let items = [];
    try {
      const data = await loadJson("api/trash");
      items = Array.isArray(data.photos) ? data.photos : [];
    } catch (error) {
      toast(error.message, true);
      return;
    }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal trash-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const heading = document.createElement("h2");
    heading.textContent = "Deleted photos";
    modal.appendChild(heading);

    const note = document.createElement("p");
    note.className = "modal-note";
    note.textContent =
      "Kept for 48 hours. Restoring puts the photo back in your gallery.";
    modal.appendChild(note);

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-hint";
      empty.textContent = "Nothing deleted in the last 48 hours.";
      modal.appendChild(empty);
    } else {
      const list = document.createElement("div");
      list.className = "trash-list";

      for (const item of items) {
        const row = document.createElement("div");
        row.className = "trash-row";

        const thumb = document.createElement("span");
        thumb.className = "trash-thumb";
        if (item.urls && item.urls.thumb) {
          const image = document.createElement("img");
          image.src = imageUrl(item.urls.thumb);
          image.alt = "";
          image.loading = "lazy";
          thumb.appendChild(image);
        }
        row.appendChild(thumb);

        const meta = document.createElement("span");
        meta.className = "trash-meta";

        const name = document.createElement("strong");
        name.textContent = item.name;
        meta.appendChild(name);

        const line = document.createElement("span");
        line.className = "trash-line";
        line.textContent =
          categoryLabel(item.category) +
          " \u00b7 " +
          plural(item.hours_left, "hour") +
          " left";
        meta.appendChild(line);

        row.appendChild(meta);

        const restore = document.createElement("button");
        restore.type = "button";
        restore.className = "btn-primary";
        restore.textContent = "Restore";
        restore.addEventListener("click", () => {
          close();
          openWizard({ mode: "restore", photo: item });
        });
        row.appendChild(restore);

        list.appendChild(row);
      }

      modal.appendChild(list);
    }

    const actions = document.createElement("div");
    actions.className = "wizard-actions";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-ghost";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", close);
    actions.appendChild(closeButton);

    modal.appendChild(actions);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.classList.add("no-scroll");

    function close() {
      backdrop.remove();
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKey);
    }

    function onKey(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        close();
      }
    });
  }

  /* ---------- my gallery: upload / restore form ---------- */

  function field(labelText, control) {
    const label = document.createElement("label");
    label.className = "field";

    const span = document.createElement("span");
    span.textContent = labelText;

    label.appendChild(span);
    label.appendChild(control);
    return label;
  }

  function uploadPhoto(file, name, category, description, onProgress) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", "api/upload");

      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded / event.total);
        }
      });

      request.addEventListener("load", () => {
        let body = {};
        try {
          body = JSON.parse(request.responseText);
        } catch (error) {
          body = {};
        }
        if (request.status >= 200 && request.status < 300 && body.photo) {
          resolve(body.photo);
        } else {
          reject(new Error(body.error || "Upload failed (" + request.status + ")"));
        }
      });

      request.addEventListener("error", () => {
        reject(new Error("Could not reach the server. Is serve.cmd running?"));
      });

      const form = new FormData();
      form.append("file", file);
      form.append("name", name);
      form.append("category", category);
      form.append("description", description || "");
      request.send(form);
    });
  }

  function openWizard(options) {
    const settings = options || {};
    const restoring = settings.mode === "restore";
    const source = settings.photo || null;

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "upload-title");

    const title = document.createElement("h2");
    title.id = "upload-title";
    title.textContent = restoring ? "Restore Photo" : "Upload Photo";
    modal.appendChild(title);

    const note = document.createElement("p");
    note.className = "modal-note";
    note.textContent = restoring
      ? "This photo is in Retention. Choose its name, category and description."
      : "One photo at a time. JPEG, PNG, WebP, HEIC, TIFF or RAW. Up to 500 MB.";
    modal.appendChild(note);

    const form = document.createElement("form");
    form.noValidate = true;

    let fileInput = null;
    let preview = null;

    if (restoring) {
      preview = document.createElement("div");
      preview.className = "upload-preview";
      if (source && source.urls && source.urls.thumb) {
        const image = document.createElement("img");
        image.src = imageUrl(source.urls.thumb);
        image.alt = "";
        preview.appendChild(image);
      }
      form.appendChild(preview);
    } else {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept =
        "image/*,.cr2,.cr3,.nef,.nrw,.arw,.dng,.raf,.rw2,.orf,.pef,.srw,.tif,.tiff";
      form.appendChild(field("Photo", fileInput));

      preview = document.createElement("div");
      preview.className = "upload-preview";
      preview.hidden = true;
      form.appendChild(preview);
    }

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.maxLength = 80;
    nameInput.autocomplete = "off";
    nameInput.placeholder = "Give this photo a name";
    if (restoring && source) {
      nameInput.value = source.name || "";
    }
    form.appendChild(field("Name", nameInput));

    const categorySelect = document.createElement("select");
    for (const category of galleryUser.categories || []) {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label;
      categorySelect.appendChild(option);
    }
    if (restoring && source && source.category) {
      categorySelect.value = source.category;
    } else if (activeCategory) {
      categorySelect.value = activeCategory;
    }
    form.appendChild(field("Category", categorySelect));

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.maxLength = 300;
    descriptionInput.placeholder = "Optional - what should people know about this photo?";
    if (restoring && source) {
      descriptionInput.value = source.description || "";
    }
    form.appendChild(field("Description (optional)", descriptionInput));

    const message = document.createElement("p");
    message.className = "wizard-message";
    message.hidden = true;
    form.appendChild(message);

    const progress = document.createElement("progress");
    progress.className = "upload-progress";
    progress.max = 100;
    progress.value = 0;
    progress.hidden = true;
    form.appendChild(progress);

    const actions = document.createElement("div");
    actions.className = "wizard-actions";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "btn-ghost";
    cancel.textContent = "Cancel";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn-primary";
    submit.textContent = restoring ? "Restore" : "Upload";

    actions.appendChild(cancel);
    actions.appendChild(submit);
    form.appendChild(actions);

    modal.appendChild(form);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.classList.add("no-scroll");
    nameInput.focus();

    function showMessage(text, kind) {
      message.hidden = false;
      message.textContent = text;
      message.className = "wizard-message" + (kind ? " " + kind : "");
    }

    function closeModal() {
      backdrop.remove();
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKey);
    }

    function onKey(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", onKey);
    cancel.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        preview.textContent = "";
        preview.hidden = true;
        if (!file) {
          return;
        }

        if (!nameInput.value.trim()) {
          nameInput.value = file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[_-]+/g, " ")
            .trim();
        }

        const isRaw = /\.(cr2|cr3|nef|nrw|arw|srf|sr2|dng|raf|rw2|orf|pef|srw|raw|3fr|fff)$/i.test(
          file.name
        );
        const isHeic = /\.(heic|heif)$/i.test(file.name);

        if (isRaw || isHeic) {
          const line = document.createElement("span");
          line.className = "preview-note";
          line.textContent =
            file.name +
            " \u00b7 " +
            formatBytes(file.size) +
            " \u00b7 preview appears after upload";
          preview.appendChild(line);
          preview.hidden = false;
          return;
        }

        const url = URL.createObjectURL(file);
        const image = document.createElement("img");
        image.src = url;
        image.alt = "";
        image.onload = () => URL.revokeObjectURL(url);
        image.onerror = () => {
          URL.revokeObjectURL(url);
          preview.hidden = true;
        };
        preview.appendChild(image);
        preview.hidden = false;
      });
    }

    nameInput.addEventListener("input", () => {
      if (nameInput.value.trim()) {
        message.hidden = true;
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = nameInput.value.trim();
      if (!name) {
        showMessage("Give the photo a name.");
        return;
      }

      const clash = photos.some(
        (photo) => photo.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      );
      if (clash) {
        showMessage("You already have a photo called \u201c" + name + "\u201d.");
        return;
      }

      const file = fileInput ? fileInput.files && fileInput.files[0] : null;
      if (!restoring && !file) {
        showMessage("Choose a photo first.");
        return;
      }

      cancel.disabled = true;
      submit.disabled = true;
      progress.hidden = restoring;
      showMessage(restoring ? "Restoring\u2026" : "Uploading\u2026", "working");

      try {
        let photo;
        if (restoring) {
          const body = await sendJson("api/restore", {
            id: source.id,
            name,
            category: categorySelect.value,
            description: descriptionInput.value,
          });
          photo = body.photo;
        } else {
          photo = await uploadPhoto(
            file,
            name,
            categorySelect.value,
            descriptionInput.value,
            (fraction) => {
              progress.value = Math.round(fraction * 100);
            }
          );
        }

        activeCategory = photo.category;
        selecting = false;
        selected.clear();
        closeModal();
        await refreshPhotos();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        cancel.disabled = false;
        submit.disabled = false;
        progress.hidden = true;
        showMessage(error.message, "error");
      }
    });
  }

  /* ---------- my gallery: boot ---------- */

  async function buildMyGallery() {
    try {
      const data = await loadJson("api/photos");
      galleryUser = {
        firstName: data.firstName || data.user || "",
        categories: Array.isArray(data.categories) ? data.categories : [],
      };
      photos = Array.isArray(data.photos) ? data.photos : [];
    } catch (error) {
      console.error(error);
      fail(
        "Could not load your gallery (" +
          error.message +
          "). Start the site with serve.cmd, then open http://localhost:8000"
      );
      return;
    }

    buildGalleryToolbar(galleryUser);

    content = document.createElement("div");
    content.className = "gallery-content";
    document.getElementById("site-main").appendChild(content);

    render();
  }

  /* ---------- run ---------- */

  document.body.dataset.user = getCurrentUser();

  const page = document.body.dataset.page;
  if (page === "home") {
    document.title = site.siteName;
  }

  buildHeader();
  if (page === "home") {
    buildHero();
  }
  if (page === "my-gallery") {
    await buildMyGallery();
  }
})();
