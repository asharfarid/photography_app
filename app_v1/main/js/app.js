/* weshoot - app_v1
   Reads data/site.json and builds the page.
   CSS never touches the data; this file is the only one that does. */

(async function () {
  "use strict";

  const errorBox = document.getElementById("load-error");

  function fail(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  let site;
  try {
    const response = await fetch("data/site.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(response.status + " " + response.statusText);
    }
    site = await response.json();
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

  /* ---------- run ---------- */

  document.body.dataset.user = getCurrentUser();

  const isHome = document.body.dataset.page === "home";
  if (isHome) {
    document.title = site.siteName;
  }

  buildHeader();
  if (isHome) {
    buildHero();
  }
})();
