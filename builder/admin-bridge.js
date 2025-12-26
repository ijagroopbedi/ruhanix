(function () {
  const STYLE_ID = "ruhanix-admin-style";
  function ensureStyle() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement("style");
      s.id = STYLE_ID;
      document.head.appendChild(s);
    }
    return s;
  }

  function pickFirst(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function applyBrand(logo) {
    const img = pickFirst([
      "[data-ruhanix-logo-img]",
      "header img[alt*='logo' i]",
      ".logo img",
      ".navbar-brand img",
      "header img",
      "img.logo"
    ]);

    const textEl = pickFirst([
      "[data-ruhanix-logo-text]",
      ".logo-text",
      ".brand",
      ".navbar-brand",
      "header .logo",
      "header a"
    ]);

    if (img) {
      if (logo.showImage && logo.imgDataUrl) {
        img.src = logo.imgDataUrl;
        img.style.display = "";
        img.style.width = (logo.imgSize || 34) + "px";
        img.style.height = (logo.imgSize || 34) + "px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "12px";
      } else {
        img.style.display = "none";
      }
    }

    if (textEl) {
      if (logo.showText) {
        if (textEl.children.length === 0) textEl.textContent = logo.brandName || "";
        textEl.style.color = logo.textColor || "#111827";
        textEl.style.fontWeight = "900";
        textEl.style.letterSpacing = ".6px";
        textEl.style.fontSize = (logo.textSize || 18) + "px";
        textEl.style.display = "";
      } else {
        if (textEl.children.length === 0) textEl.style.display = "none";
      }
    }

    const container = img?.parentElement || textEl?.parentElement || null;
    if (container) {
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = (logo.gap || 10) + "px";
      const align = logo.align || "left";
      container.style.justifyContent =
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
    }
  }

  function applyGlobalStyles(st) {
    const style = ensureStyle();
    const bg = st.background || {};
    const font = st.font || {};

    let bgCss = "";
    if (bg.type === "image" && bg.imageDataUrl) {
      bgCss = `
        body{
          background-image:url('${bg.imageDataUrl}');
          background-size:${bg.size || "cover"};
          background-position:${bg.position || "center"};
          background-repeat:no-repeat;
        }`;
    } else {
      bgCss = `
        body{
          background-color:${bg.color || "#f3f4f6"};
          background-image:none;
        }`;
    }

    style.textContent = `
      body{
        font-family:${font.family || "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"};
        font-size:${(font.baseSize || 16)}px;
        line-height:${(font.lineHeight || 1.6)};
        color:${(font.textColor || "#111827")};
      }
      h1{ font-size:${(font.headingSize || 30)}px; }
      button, .btn{
        border-radius:${(font.buttonRadius || 14)}px !important;
      }
      ${bgCss}
    `;

    // overlay (optional)
    const op = Math.max(0, Math.min(1, Number(bg.overlayOpacity || 0)));
    let overlay = document.getElementById("ruhanix-bg-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "ruhanix-bg-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "1";
      document.body.prepend(overlay);
    }
    overlay.style.background = bg.overlayColor || "#000";
    overlay.style.opacity = String(op);
    overlay.style.display = op > 0 ? "block" : "none";
  }

  // Best-effort page overrides (first title / h1 / p / button/link)
  function applyPageOverrides(page) {
    if (!page || !page.overrides) return;
    const o = page.overrides;

    if (o.docTitle) document.title = o.docTitle;

    if (o.h1) {
      const h1 = document.querySelector("h1");
      if (h1) h1.textContent = o.h1;
    }
    if (o.intro) {
      const p = document.querySelector("p");
      if (p) p.textContent = o.intro;
    }
    if (o.cta) {
      const btn = document.querySelector("button, a.button, a.btn, a[class*='btn']");
      if (btn) btn.textContent = o.cta;
    }
  }

  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data !== "object") return;

    if (e.data.type === "RUHANIX_APPLY") {
      const st = e.data.payload || {};
      try {
        applyGlobalStyles(st);
        if (st.logo) applyBrand(st.logo);
        if (st.page) applyPageOverrides(st.page);
      } catch {}
    }
  });
})();
