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
  const imageUrl = (path) => base + path;

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

    const buttons = [
      { label: "+", title: "Add photo" },
      { label: "\u2699", title: "Manage photos and settings" },
    ];

    for (const item of buttons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-action";
      button.textContent = item.label;
      button.title = item.title;
      button.setAttribute("aria-label", item.title);
      actions.appendChild(button);
    }

    bar.appendChild(actions);
    main.appendChild(bar);
  }

  /* ---------- my gallery: category cards (dormant until photos exist) ---------- */

  function buildCategoryCard(category, cover) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "category-card";

    const art = document.createElement("span");
    art.className = "category-art";

    const photo = document.createElement("img");
    photo.src = imageUrl(cover);
    photo.alt = "";
    art.appendChild(photo);

    const label = document.createElement("span");
    label.className = "category-label";
    label.textContent = category.label;

    card.appendChild(art);
    card.appendChild(label);
    return card;
  }

  function buildCategoryCards(user) {
    const main = document.getElementById("site-main");

    const categories = Array.isArray(user.categories) ? user.categories : [];
    const withPhotos = categories.filter(
      (category) =>
        Array.isArray(category.photos) && category.photos.length > 0
    );

    if (withPhotos.length === 0) {
      return;
    }

    const list = document.createElement("div");
    list.className = "category-list";

    for (const category of withPhotos) {
      const cover = category.cover || category.photos[0];
      list.appendChild(buildCategoryCard(category, cover));
    }

    main.appendChild(list);
  }

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

    const user = gallery.users && gallery.users[getCurrentUser()];
    if (!user) {
      fail("No gallery data for user " + getCurrentUser() + ".");
      return;
    }

    buildGalleryToolbar(user);
    buildCategoryCards(user);
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
