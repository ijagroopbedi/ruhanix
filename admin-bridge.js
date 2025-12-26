(function(){
  const ctx = window.__RC_CONTEXT || {};
  const ORIGIN = window.location.origin;

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function applyPageJson(pageJson){
    if(!pageJson) return;

    // Title
    if(pageJson.meta && pageJson.meta.title) document.title = pageJson.meta.title;

    // HERO mappings (template-specific to fashion-minimal-light)
    const hero = qs("section.hero");
    if(hero && pageJson.hero){
      const pillSpan = qs(".pill span:last-child", hero);
      if(pillSpan && pageJson.hero.pill) pillSpan.textContent = pageJson.hero.pill;

      const h1 = qs("h1.h1", hero);
      if(h1 && pageJson.hero.h1) h1.innerHTML = pageJson.hero.h1.replace(/\n/g,"<br>");

      const p = qs("p.p", hero);
      if(p && pageJson.hero.p) p.textContent = pageJson.hero.p;

      const a1 = qs("a.btn.primary", hero);
      if(a1 && pageJson.hero.ctaPrimary){
        if(pageJson.hero.ctaPrimary.text) a1.textContent = pageJson.hero.ctaPrimary.text;
        if(pageJson.hero.ctaPrimary.href) a1.setAttribute("href", pageJson.hero.ctaPrimary.href);
      }

      const a2 = qsa("a.btn:not(.primary)", hero)[0];
      if(a2 && pageJson.hero.ctaSecondary){
        if(pageJson.hero.ctaSecondary.text) a2.textContent = pageJson.hero.ctaSecondary.text;
        if(pageJson.hero.ctaSecondary.href) a2.setAttribute("href", pageJson.hero.ctaSecondary.href);
      }

      // KPIs
      if(Array.isArray(pageJson.hero.kpis)){
        const kpis = qsa(".kpis .kpi", hero);
        pageJson.hero.kpis.forEach((k,i)=>{
          const box = kpis[i];
          if(!box) return;
          const b = qs("b", box);
          const s = qs("span", box);
          if(b && k.value) b.textContent = k.value;
          if(s && k.label) s.textContent = k.label;
        });
      }
    }

    // Sections by mount IDs
    const sections = pageJson.sections || {};
    const shopSec = qs("#homeCats")?.closest("section");
    if(shopSec && sections.shopByCategory){
      const h2 = qs(".h2", shopSec);
      const p = qs(".p", shopSec);
      const link = qs("a.btn", shopSec);
      if(h2 && sections.shopByCategory.h2) h2.textContent = sections.shopByCategory.h2;
      if(p && sections.shopByCategory.p) p.textContent = sections.shopByCategory.p;
      if(link && sections.shopByCategory.link){
        if(sections.shopByCategory.link.text) link.textContent = sections.shopByCategory.link.text;
        if(sections.shopByCategory.link.href) link.setAttribute("href", sections.shopByCategory.link.href);
      }
    }

    const featSec = qs("#featuredGrid")?.closest("section");
    if(featSec && sections.featured){
      const h2 = qs(".h2", featSec);
      const p = qs(".p", featSec);
      const link = qs("a.btn", featSec);
      if(h2 && sections.featured.h2) h2.textContent = sections.featured.h2;
      if(p && sections.featured.p) p.textContent = sections.featured.p;
      if(link && sections.featured.link){
        if(sections.featured.link.text) link.textContent = sections.featured.link.text;
        if(sections.featured.link.href) link.setAttribute("href", sections.featured.link.href);
      }
    }

    const newsSec = qs("input.input")?.closest("section");
    if(newsSec && sections.newsletter){
      const h2 = qs(".h2", newsSec);
      const p = qs(".p", newsSec);
      const input = qs("input.input", newsSec);
      const btn = qs("button.btn", newsSec);
      if(h2 && sections.newsletter.h2) h2.textContent = sections.newsletter.h2;
      if(p && sections.newsletter.p) p.textContent = sections.newsletter.p;
      if(input && sections.newsletter.placeholder) input.setAttribute("placeholder", sections.newsletter.placeholder);
      if(btn && sections.newsletter.buttonText) btn.textContent = sections.newsletter.buttonText;
    }
  }

  function applyTheme(payload){
    if(!payload) return;
    // background / font are template-wide style tweaks.
    if(payload.background){
      const bg = payload.background;
      if(bg.type === "color" && bg.color){
        document.body.style.background = bg.color;
        document.body.style.backgroundImage = "";
      }
      if(bg.type === "image" && bg.imageDataUrl){
        const overlayOpacity = Number(bg.overlayOpacity || 0);
        const overlayColor = bg.overlayColor || "#000000";
        const overlay = overlayOpacity > 0
          ? `linear-gradient(${hexToRgba(overlayColor, overlayOpacity)}, ${hexToRgba(overlayColor, overlayOpacity)}), `
          : "";
        document.body.style.backgroundImage = `${overlay}url(${bg.imageDataUrl})`;
        document.body.style.backgroundSize = bg.size || "cover";
        document.body.style.backgroundPosition = bg.position || "center";
        document.body.style.backgroundRepeat = "no-repeat";
      }
    }

    if(payload.font){
      const f = payload.font;
      document.documentElement.style.fontFamily = f.family || "";
      document.body.style.color = f.textColor || "";
      document.documentElement.style.setProperty("--rc-base-size", (f.baseSize||16)+"px");
      document.documentElement.style.setProperty("--rc-heading-size", (f.headingSize||30)+"px");
      document.documentElement.style.setProperty("--rc-line-height", String(f.lineHeight||1.6));
      document.documentElement.style.setProperty("--rc-radius", (f.buttonRadius||14)+"px");
    }
  }

  function hexToRgba(hex, alpha){
    const raw = String(hex || "").replace("#", "").trim();
    const full = raw.length === 3
      ? raw.split("").map((c)=>c+c).join("")
      : raw.padEnd(6, "0").slice(0, 6);
    const num = parseInt(full, 16);
    if(Number.isNaN(num)) return `rgba(0,0,0,${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function applyLogo(logo){
    if(!logo) return;

    const brandBlocks = qsa('[data-brand], .brand, .logo');
    const images = qsa('[data-edit="site.logo"], img.logo, .logo img, .brand img, .site-logo img');
    const marks = qsa(".mark");
    const brandNames = qsa('[data-edit="site.brand"]');

    if(logo.imgDataUrl){
      images.forEach(img => { img.src = logo.imgDataUrl; });
      marks.forEach(mark => {
        mark.style.backgroundImage = `url(${logo.imgDataUrl})`;
        mark.style.backgroundSize = "cover";
        mark.style.backgroundPosition = "center";
      });
    }

    images.forEach(img => {
      img.style.width = logo.imgSize ? `${logo.imgSize}px` : "";
      img.style.height = logo.imgSize ? `${logo.imgSize}px` : "";
      img.style.display = logo.showImage ? "" : "none";
    });

    marks.forEach(mark => {
      mark.style.width = logo.imgSize ? `${logo.imgSize}px` : "";
      mark.style.height = logo.imgSize ? `${logo.imgSize}px` : "";
      mark.style.display = logo.showImage ? "" : "none";
    });

    brandNames.forEach(el => { el.textContent = logo.brandName || el.textContent; });

    brandBlocks.forEach(block => {
      block.style.gap = logo.gap ? `${logo.gap}px` : "";
      if(logo.align === "center"){
        block.style.justifyContent = "center";
        block.style.textAlign = "center";
      }else if(logo.align === "right"){
        block.style.justifyContent = "flex-end";
        block.style.textAlign = "right";
      }else{
        block.style.justifyContent = "flex-start";
        block.style.textAlign = "left";
      }

      const nameEl = block.querySelector('[data-edit="site.brand"], b, strong, .brand-name');
      if(nameEl && logo.brandName) nameEl.textContent = logo.brandName;
      if(nameEl){
        nameEl.style.color = logo.textColor || "";
        nameEl.style.fontSize = logo.textSize ? `${logo.textSize}px` : "";
        nameEl.style.display = logo.showText ? "" : "none";
      }
    });
  }

  function applyPageOverrides(page){
    if(!page || !page.overrides) return;
    const { docTitle, h1, intro, cta } = page.overrides;

    if(docTitle) document.title = docTitle;

    if(h1){
      const h1El = document.querySelector("main h1, h1");
      if(h1El) h1El.textContent = h1;
    }

    if(intro){
      const pEl = document.querySelector("main p, p");
      if(pEl) pEl.textContent = intro;
    }

    if(cta){
      const ctaEl = document.querySelector("main a.btn, main button.btn, main a, main button");
      if(ctaEl) ctaEl.textContent = cta;
    }
  }

  function readPageData(){
    const docTitle = document.title || "";
    const h1El = document.querySelector("main h1, h1");
    const introEl = document.querySelector("main p, p");
    const ctaEl = document.querySelector("main a.btn, main button.btn, main a, main button");

    return {
      docTitle,
      h1: h1El ? h1El.textContent.trim() : "",
      intro: introEl ? introEl.textContent.trim() : "",
      cta: ctaEl ? ctaEl.textContent.trim() : ""
    };
  }

  window.addEventListener("message", (ev)=>{
    if(ev.origin !== ORIGIN) return;
    const msg = ev.data || {};
    if(msg.type === "RUHANIX_APPLY"){
      applyTheme(msg.payload);
      applyLogo(msg.payload?.logo);
      applyPageOverrides(msg.payload?.page);
      if(msg.payload?.pageJson) applyPageJson(msg.payload.pageJson);
    }
    if(msg.type === "RUHANIX_PAGE_DATA_REQUEST"){
      try{
        const payload = readPageData();
        window.parent.postMessage({ type:"RUHANIX_PAGE_DATA", payload }, ORIGIN);
      }catch(e){}
    }
  });

  // tell parent we are ready
  try{
    window.parent.postMessage({ type:"RUHANIX_IFRAME_READY", ctx }, ORIGIN);
  }catch(e){}
})();
