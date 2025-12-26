/* =========================================================
   main.js (plain JS)
   - Off-canvas menu: overlay, close icon, ESC, link click
   - Home slider: data-bg, auto-slide (5s), next/prev, dots
   - Package carousel: auto-slide (5s), next/prev, dots
   - Package destinations preview
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const body = document.body;

  // -------------------------
  // Off-canvas menu
  // -------------------------
  const overlay = $("#overlay");
  const openBtn = $("#menuBtn");
  const closeBtn = $("#sidebarClose");
  const sidebar = $("#sidebar");

  function openNav() {
    body.classList.add("nav-open");
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    body.classList.remove("nav-open");
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
  }

  if (openBtn) openBtn.addEventListener("click", openNav);
  if (closeBtn) closeBtn.addEventListener("click", closeNav);
  if (overlay) overlay.addEventListener("click", closeNav);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  if (sidebar) {
    $$("#sidebar a").forEach((a) => a.addEventListener("click", closeNav));
  }

  // -------------------------
  // Footer year
  // -------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // -------------------------
  // Home background slider (data-bg)
  // -------------------------
  function initBgSlider(rootSel, {
    intervalMs = 5000,
    slideSel = ".slide",
    prevSel = ".slider-prev",
    nextSel = ".slider-next",
    dotsSel = ".slider-dots"
  } = {}) {
    const root = $(rootSel);
    if (!root) return;

    const slides = $$(slideSel, root);
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    // Apply data-bg backgrounds
    slides.forEach((s) => {
      const bg = s.getAttribute("data-bg");
      if (bg) s.style.backgroundImage = `url('${bg}')`;
    });

    const dotsWrap = $(dotsSel, root);
    const dots = [];

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.className = "slider-dot";
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function paint() {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      paint();
      restart();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    const prevBtn = $(prevSel, root);
    const nextBtn = $(nextSel, root);
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    function start() {
      stop();
      timer = window.setInterval(next, intervalMs);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }
    function restart() { start(); }

    paint();
    start();
  }

  initBgSlider("#homeSlider", { intervalMs: 5000 });

  // -------------------------
  // Package carousel (img slides)
  // -------------------------
  function initPkgCarousel() {
    const mount = $("#packageHero");
    if (!mount) return;

    const slides = $$(".pkg-hero-slide", mount);
    if (!slides.length) return;

    let idx = 0;
    let timer = null;

    // controls
    const prevBtn = document.createElement("button");
    prevBtn.className = "pkg-hero-nav pkg-hero-prev";
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Previous image");
    prevBtn.textContent = "‹";

    const nextBtn = document.createElement("button");
    nextBtn.className = "pkg-hero-nav pkg-hero-next";
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Next image");
    nextBtn.textContent = "›";

    const dots = document.createElement("div");
    dots.className = "pkg-hero-dots";

    // mount
    mount.appendChild(prevBtn);
    mount.appendChild(nextBtn);
    mount.appendChild(dots);

    const dotBtns = slides.map((_, i) => {
      const b = document.createElement("button");
      b.className = "pkg-hero-dot";
      b.type = "button";
      b.setAttribute("aria-label", `Go to image ${i + 1}`);
      b.addEventListener("click", () => go(i));
      dots.appendChild(b);
      return b;
    });

    function paint() {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dotBtns.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    }

    function go(i) {
      idx = (i + slides.length) % slides.length;
      paint();
      restart();
    }

    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);

    function start() {
      stop();
      timer = window.setInterval(next, 5000);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }
    function restart() { start(); }

    paint();
    start();
  }

  // -------------------------
  // Package destinations preview
  // -------------------------
  function initPkgDestinations() {
    const list = $("#pkgAllDestinations");
    const preview = $("#pkgDestinationPreview");
    if (!list || !preview) return;

    const cards = $$(".pkg-tour-card", list);
    if (!cards.length) return;

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function activate(card) {
      cards.forEach((c) => c.classList.toggle("is-active", c === card));

      const title = $(".dest-title", card)?.textContent?.trim() || "Destination";
      const desc = $(".dest-desc", card)?.textContent?.trim() || "";
      const dayItems = $$(".dest-day", card).map((node) => ({
        time: node.getAttribute("data-time") || "",
        label: node.textContent.trim()
      }));

      preview.innerHTML = `
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(desc)}</p>
        <div class="pkg-timeline">
          ${dayItems.map((it) => `
            <div class="pkg-time-item">
              <span>${escapeHtml(it.time)}</span>
              <strong>${escapeHtml(it.label)}</strong>
            </div>
          `).join("")}
        </div>
      `;
    }

    cards.forEach((c) => c.addEventListener("click", () => activate(c)));
    activate(cards[0]);
  }

  initPkgCarousel();
  initPkgDestinations();
})();
