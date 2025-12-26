(function () {
  // ===== Off-canvas mobile drawer =====
  const body = document.body;
  const openBtn = document.querySelector("[data-drawer-open]");
  const closeBtn = document.querySelector("[data-drawer-close]");
  const overlay = document.querySelector("[data-drawer-overlay]");

  function openDrawer() {
    body.classList.add("drawer-open");
    openBtn?.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    body.classList.remove("drawer-open");
    openBtn?.setAttribute("aria-expanded", "false");
  }

  openBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.classList.contains("drawer-open")) {
      closeDrawer();
    }
  });

  // ===== Hero carousel (moving) =====
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const prevBtn = document.querySelector("[data-hero-prev]");
  const nextBtn = document.querySelector("[data-hero-next]");
  let idx = 0;
  let timer = null;

  // Apply background images from data-bg
  slides.forEach((s) => {
    const bg = s.getAttribute("data-bg");
    if (bg) s.style.backgroundImage = `url('${bg}')`;
  });

  function show(i) {
    if (!slides.length) return;
    slides.forEach((s) => s.classList.remove("active"));
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add("active");
  }

  function start() {
    if (!slides.length) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => show(idx + 1), 4500);
  }

  if (slides.length) {
    show(0);
    start();
    prevBtn?.addEventListener("click", () => { show(idx - 1); start(); });
    nextBtn?.addEventListener("click", () => { show(idx + 1); start(); });
  }
})();
