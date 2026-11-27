/* weshoot - app_v1
   Reads data/site.json and data/users_gallery.json and builds the page.
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

  function photosIn(categoryId) {
    return photos.filter((photo) => photo.category === categoryId);
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

    const add = document.createElement("button");
    add.type = "button";
    add.className = "gallery-action";
    add.textContent = "+";
    add.title = "Add photo";
    add.setAttribute("aria-label", "Add photo");
    add.addEventListener("click", () => openUploadMenu(add));
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
  }

  /* ---------- my gallery: upload menu ---------- */

  function closeMenu() {
    const menu = document.querySelector(".action-menu");
    if (menu) {
      menu.remove();
    }
    document
      .querySelectorAll(".menu-open")
      .forEach((element) => element.classList.remove("menu-open"));
  }

  function openUploadMenu(button) {
    if (document.querySelector(".action-menu")) {
      closeMenu();
      return;
    }
    closeMenu();

    const menu = document.createElement("div");
    menu.className = "action-menu";

    const item = document.createElement("button");
    item.type = "button";
    item.className = "action-menu-item";
    item.textContent = "Upload Photo";
    item.addEventListener("click", () => {
      closeMenu();
      openWizard();
    });
    menu.appendChild(item);

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
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return card;
  }

  function renderCategory(categoryId) {
    const category = (galleryUser.categories || []).find(
      (item) => item.id === categoryId
    );
    const list = photosIn(categoryId);

    const head = document.createElement("div");
    head.className = "category-view-head";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "btn-ghost";
    back.textContent = "\u2190 All categories";
    back.addEventListener("click", () => {
      activeCategory = null;
      render();
    });
    head.appendChild(back);

    const title = document.createElement("h2");
    title.textContent = category ? category.label : categoryId;
    head.appendChild(title);

    const tally = document.createElement("span");
    tally.className = "muted";
    tally.textContent = list.length + (list.length === 1 ? " photo" : " photos");
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

      tile.addEventListener("click", () => openLightbox(photo));
      grid.appendChild(tile);
    }

    content.appendChild(grid);
  }

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

  /* ---------- my gallery: upload wizard ---------- */

  function field(labelText, control) {
    const label = document.createElement("label");
    label.className = "field";

    const span = document.createElement("span");
    span.textContent = labelText;

    label.appendChild(span);
    label.appendChild(control);
    return label;
  }

  function uploadPhoto(file, name, category, onProgress) {
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
      request.send(form);
    });
  }

  function openWizard() {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "upload-title");

    const title = document.createElement("h2");
    title.id = "upload-title";
    title.textContent = "Upload Photo";
    modal.appendChild(title);

    const note = document.createElement("p");
    note.className = "modal-note";
    note.textContent =
      "One photo at a time. JPEG, PNG, WebP, HEIC, TIFF or RAW. Up to 500 MB.";
    modal.appendChild(note);

    const form = document.createElement("form");
    form.noValidate = true;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept =
      "image/*,.cr2,.cr3,.nef,.nrw,.arw,.dng,.raf,.rw2,.orf,.pef,.srw,.tif,.tiff";
    form.appendChild(field("Photo", fileInput));

    const preview = document.createElement("div");
    preview.className = "upload-preview";
    preview.hidden = true;
    form.appendChild(preview);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.maxLength = 80;
    nameInput.autocomplete = "off";
    nameInput.placeholder = "Give this photo a name";
    form.appendChild(field("Name", nameInput));

    const categorySelect = document.createElement("select");
    for (const category of galleryUser.categories || []) {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label;
      categorySelect.appendChild(option);
    }
    if (activeCategory) {
      categorySelect.value = activeCategory;
    }
    form.appendChild(field("Category", categorySelect));

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
    submit.textContent = "Upload";

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

    nameInput.addEventListener("input", () => {
      if (nameInput.value.trim()) {
        message.hidden = true;
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage("Choose a photo first.");
        return;
      }

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

      cancel.disabled = true;
      submit.disabled = true;
      progress.hidden = false;
      showMessage("Uploading\u2026", "working");

      try {
        const photo = await uploadPhoto(
          file,
          name,
          categorySelect.value,
          (fraction) => {
            progress.value = Math.round(fraction * 100);
          }
        );

        photos.push(photo);
        activeCategory = photo.category;
        closeModal();
        render();
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
    let gallery;
    try {
      gallery = await loadJson("data/users_gallery.json");
    } catch (error) {
      console.error(error);
      fail(
        "Could not load data/users_gallery.json (" +
          error.message +
          "). Start the site with serve.cmd, then open http://localhost:8000"
      );
      return;
    }

    galleryUser = gallery.users && gallery.users[getCurrentUser()];
    if (!galleryUser) {
      fail("No gallery data for user " + getCurrentUser() + ".");
      return;
    }

    try {
      const data = await loadJson("api/photos");
      photos = Array.isArray(data.photos) ? data.photos : [];
    } catch (error) {
      console.error(error);
      photos = [];
      fail(
        "Could not load your photos (" +
          error.message +
          "). Start the site with serve.cmd, then open http://localhost:8000"
      );
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
