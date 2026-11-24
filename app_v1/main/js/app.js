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

  document.title = site.siteName;

  /* ---------- header ---------- */

  const header = document.getElementById("site-header");
  header.style.backgroundImage = 'url("' + imageUrl(site.titleBarImage) + '")';

  const name = document.createElement("span");
  name.className = "site-name";
  name.textContent = site.siteName;
  header.appendChild(name);

  if (Array.isArray(site.nav) && site.nav.length > 0) {
    const nav = document.createElement("nav");
    for (const item of site.nav) {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      nav.appendChild(link);
    }
    header.appendChild(nav);
  }

  /* ---------- hero ---------- */

  const main = document.getElementById("site-main");

  const hero = document.createElement("section");
  hero.className = "hero";

  const photo = document.createElement("img");
  photo.src = imageUrl(site.heroImage);
  photo.alt = "";
  hero.appendChild(photo);

  if (Array.isArray(site.heroText) && site.heroText.length > 0) {
    const text = document.createElement("div");
    text.className = "hero-text";
    site.heroText.forEach((line, index) => {
      const p = document.createElement("p");
      p.className = index === 0 ? "hero-lead" : "hero-sub";
      p.textContent = line;
      text.appendChild(p);
    });
    hero.appendChild(text);
  }

  main.appendChild(hero);
})();
