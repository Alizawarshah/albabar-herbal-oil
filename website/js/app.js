/* =========================================================
   البابر Herbal Oil — shared layout + page behaviour
   Every page loads data.js then this file.
   <body data-page="home|shop|product|cart|checkout|thanks|contact|about|policy|search|account|notfound">
   ========================================================= */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("albabar." + k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem("albabar." + k, JSON.stringify(v)); },
  };
  const PAGE = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  // Supabase client (null if the library or config failed to load: the site still browses, but orders can't be placed)
  const sb = window.supabase && typeof SUPABASE_URL !== "undefined" ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  let lang = store.get("lang", "en");
  let cart = store.get("cart", []); // [{id, qty}]

  const L = (pair) => (Array.isArray(pair) ? pair[lang === "ur" ? 1 : 0] : pair);
  const t = (key, vars = {}) => {
    let s = T[key] ? L(T[key]) : key;
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
    return s;
  };
  const rs = (n) => "Rs." + Math.round(n).toLocaleString("en-PK");
  const product = (id) => PRODUCTS.find((p) => p.id === id);
  const savePct = (p) => Math.round((1 - p.price / p.compare) * 100);
  // Unsplash id → URL; anything with "/" or "." is treated as a local file path
  const img = (id, w = 800, h) => (/[\/.]/.test(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=75`);
  const waLink = (text = "") => `https://wa.me/${SITE.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>',
    bag: '<path d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4M12 12v8"/>',
    home: '<path d="M3 11l9-7 9 7v9H3z M9 20v-6h6v6"/>',
    check: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    heart: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"/>',
    share: '<path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
  };
  const ic = (k, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24">${ICON[k]}</svg>`;
  const WA_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.2.5.2.6.3.1.2.1.8-.1 1.4z"/></svg>';
  const SOCIAL_ICONS = { facebook: ["Facebook", "M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v7h4v-7h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"], instagram: ["Instagram", "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm5.5-4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"], tiktok: ["TikTok", "M16 3c.4 2.4 1.9 3.9 4 4v3.2c-1.5 0-2.8-.4-4-1.2V15a6 6 0 1 1-6-6v3.3A2.7 2.7 0 1 0 12.7 15V3z"], youtube: ["YouTube", "M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3z"] };
  // only networks with a real link in data.js → SITE.social are shown
  const SOCIAL = Object.entries(SITE.social || {}).filter(([k, url]) => url && SOCIAL_ICONS[k])
    .map(([k, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${SOCIAL_ICONS[k][0]}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SOCIAL_ICONS[k][1]}"/></svg></a>`).join("");

  /* =========================================================
     Shared layout (header, footer, cart drawer)
     ========================================================= */
  const NAV = [
    { href: "index.html", key: "nav.home", match: () => PAGE === "home" },
    { href: "product.html?id=oil-200", key: "nav.oil", match: () => PAGE === "product" },
    { href: "shop.html?c=bundles", key: "nav.bundles", match: () => PAGE === "shop" && params.get("c") === "bundles" },
    { href: "shop.html", key: "nav.all", match: () => PAGE === "shop" && params.get("c") !== "bundles" },
    { href: "about.html", key: "nav.about", match: () => PAGE === "about" },
    { href: "contact.html", key: "nav.contact", match: () => PAGE === "contact" },
  ];

  function buildLayout() {
    const minimal = document.body.dataset.layout === "minimal";
    const logo = `<a href="index.html" class="logo" aria-label="البابر Herbal Oil"><span class="logo__ar">البابر</span><span class="logo__en">Herbal Oil</span></a>`;

    const header = minimal
      ? `<header class="header header--minimal"><div class="container header__inner">${logo}
          <div class="header__actions"><button class="lang-btn" data-act="lang" data-i18n="lang.toggle"></button>
          <a class="icon-btn" href="cart.html" aria-label="Cart">${ic("bag", "")}</a></div></div></header>`
      : `
      <div class="announce"><div class="container announce__inner">
        <span class="announce__item hide-md">${ic("mail")}<a href="mailto:${SITE.email}">${SITE.email}</a></span>
        <span class="announce__center"><span data-i18n="announce.ship"></span></span>
        <span class="announce__social hide-md">${SOCIAL}</span>
      </div></div>
      <header class="header" id="header"><div class="container header__inner">
        <button class="icon-btn header__burger" data-act="menu" aria-label="Menu" aria-expanded="false" aria-controls="nav">${ic("menu", "")}</button>
        ${logo}
        <nav class="nav" id="nav">
          <div class="nav__head">${logo}<button class="icon-btn" data-act="menu-close" aria-label="Close">${ic("close", "")}</button></div>
          ${NAV.map((n) => `<a href="${n.href}" class="${n.match() ? "is-active" : ""}" data-i18n="${n.key}"></a>`).join("")}
          <a href="account.html" class="nav__login">${ic("user")}<span data-i18n="nav.login"></span></a>
          <div class="nav__social">${SOCIAL}</div>
        </nav>
        <div class="header__actions">
          <button class="lang-btn" data-act="lang" data-i18n="lang.toggle"></button>
          <button class="icon-btn" data-act="search" aria-label="Search">${ic("search", "")}</button>
          <a class="icon-btn hide-sm" id="accountIcon" href="account.html" aria-label="Log in" title="Log in">${ic("user", "")}</a>
          <button class="icon-btn cart-btn" data-act="cart" aria-label="Cart">${ic("bag", "")}<span class="cart-count" id="cartCount">0</span></button>
        </div>
      </div>
      <div class="search-modal" id="searchModal" hidden><div class="container">
        <form class="search-modal__form" action="search.html">
          <input type="search" name="q" id="searchInput" data-i18n-ph="search.ph" autocomplete="off" />
          <button type="submit" class="icon-btn" aria-label="Search">${ic("search", "")}</button>
          <button type="button" class="icon-btn" data-act="search-close" aria-label="Close">${ic("close", "")}</button>
        </form>
        <div class="search-results" id="searchResults"></div>
      </div></div>
      </header>`;

    const footer = minimal ? "" : `
      <footer class="footer"><div class="container footer__grid">
        <div>
          <a href="index.html" class="logo logo--light"><span class="logo__ar">البابر</span><span class="logo__en">Herbal Oil</span></a>
          <p data-i18n="foot.about"></p>
          <p class="footer__cod">${ic("cash")}<span data-i18n="foot.cod"></span></p>
          <div class="footer__social">${SOCIAL}</div>
        </div>
        <div><h4 data-i18n="foot.quick"></h4>
          <a href="shop.html" data-i18n="nav.all"></a>
          <a href="shop.html?c=bundles" data-i18n="nav.bundles"></a>
          <a href="about.html" data-i18n="nav.about"></a>
          <a href="contact.html" data-i18n="nav.contact"></a>
        </div>
        <div><h4 data-i18n="foot.help"></h4>
          <a href="account.html" data-i18n="ac.myaccount"></a>
          <a href="policy.html?p=shipping">${L(POLICIES.shipping.title)}</a>
          <a href="policy.html?p=refund">${L(POLICIES.refund.title)}</a>
          <a href="policy.html?p=privacy">${L(POLICIES.privacy.title)}</a>
          <a href="policy.html?p=terms">${L(POLICIES.terms.title)}</a>
        </div>
        <div><h4 data-i18n="foot.contact"></h4>
          <a href="${waLink()}" target="_blank" rel="noopener">${ic("phone")} ${SITE.whatsappText}</a>
          <a href="mailto:${SITE.email}">${ic("mail")} ${SITE.email}</a>
          <p>${ic("clock")} <span data-i18n="foot.hours"></span></p>
          <label class="newsletter__label" for="newsEmail" data-i18n="foot.news"></label>
          <form class="newsletter" id="newsletter"><input id="newsEmail" type="email" required autocomplete="email" data-i18n-ph="foot.newsph" /><button class="btn btn--gold" type="submit" data-i18n="foot.join"></button></form>
        </div>
      </div>
      <div class="container footer__bottom"><span>© 2026 البابر Herbal Oil. <span data-i18n="foot.rights"></span></span>
        <span class="footer__pay">${ic("cash")} <span data-i18n="foot.pay"></span></span></div>
      </footer>`;

    const drawer = `
      <div class="overlay" id="overlay" hidden></div>
      <aside class="drawer" id="cartDrawer" aria-hidden="true">
        <div class="drawer__head"><h3 data-i18n="cart.title"></h3><button class="icon-btn" data-act="cart-close" aria-label="Close">${ic("close", "")}</button></div>
        <div class="drawer__body" id="drawerItems"></div>
        <div class="drawer__foot" id="drawerFoot">
          <div class="drawer__sub"><span data-i18n="cart.estimated"></span><b id="drawerSubtotal"></b></div>
          <p class="muted small" data-i18n="cart.note"></p>
          <a href="checkout.html" class="btn btn--green btn--block" data-i18n="cart.checkout"></a>
          <a href="cart.html" class="btn btn--outline btn--block" data-i18n="cart.view"></a>
        </div>
      </aside>
      <a class="fab-wa" href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_SVG}</a>
      <div class="proto-note" data-i18n="proto.note"></div>
      <div class="toast" id="toast" role="status"></div>`;

    $("#site-header")?.remove(); $("#site-footer")?.remove(); $("#site-extras")?.remove();
    document.body.insertAdjacentHTML("afterbegin", `<div id="site-header"><a class="skip" href="#main" data-i18n="skip"></a>${header}</div>`);
    document.body.insertAdjacentHTML("beforeend", `<div id="site-footer">${footer}</div><div id="site-extras">${drawer}</div>`);
  }

  /* ---------- i18n + images ---------- */
  function applyText(root = document) {
    $$("[data-i18n]", root).forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]", root).forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$("img[data-img]", root).forEach((el) => { if (!el.src) el.src = img(el.dataset.img, +el.dataset.w || 900, +el.dataset.h || undefined); });
  }

  function setLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    buildLayout();
    applyText();
    updateCartUI();
    updateAuthUI();
    PAGES[PAGE]?.render?.();
    observeReveal();
  }

  /* =========================================================
     Reusable pieces
     ========================================================= */
  function productCard(p) {
    const badge = p.badge ? `<span class="tag tag--gold">${t("badge." + p.badge)}</span>` : "";
    return `<article class="tile">
      <a href="product.html?id=${p.id}" class="tile__media" aria-label="${L(p.name)}">
        <img src="${img(p.imgs[0], 600, 600)}" alt="${L(p.name)}" loading="lazy" width="600" height="600" />
        <img class="tile__alt" src="${img(p.imgs[1], 600, 600)}" alt="" loading="lazy" width="600" height="600" />
        <span class="tile__tags"><span class="tag">${t("badge.save")} ${savePct(p)}%</span>${badge}</span>
      </a>
      <a href="product.html?id=${p.id}" class="tile__name">${L(p.name)}</a>
      <p class="tile__meta"><span class="stars" aria-hidden="true">★★★★★</span> ${p.sold} ${t("pd.reviews")}</p>
      <p class="price"><b>${rs(p.price)}</b><s aria-label="was">${rs(p.compare)}</s></p>
      ${p.inStock === false ? `<button class="btn btn--line tile__btn" disabled>${t("badge.sold")}</button>` : `<button class="btn btn--line tile__btn" data-add="${p.id}">${t("card.add")}</button>`}
    </article>`;
  }

  function accItem(title, body, open = false, icon = "") {
    return `<div class="acc ${open ? "is-open" : ""}">
      <button class="acc__btn" type="button" aria-expanded="${open}"><span class="acc__icon">${icon}${title}</span><span class="acc__plus">+</span></button>
      <div class="acc__panel"><div>${body}</div></div></div>`;
  }

  const reviewCards = (list) => list.map((r) => `
    <figure class="quote"><span class="stars" aria-label="5 out of 5">★★★★★</span>
      <blockquote>${L(r.t)}</blockquote>
      <figcaption><b>${r.n}</b>, ${L(r.c)} <small>${t("rev.verified")}</small></figcaption>
    </figure>`).join("");

  /* =========================================================
     Cart
     ========================================================= */
  const cartLines = () => cart.map((l) => ({ ...l, p: product(l.id) })).filter((l) => l.p);
  const subtotal = () => cartLines().reduce((s, l) => s + l.p.price * l.qty, 0);
  const cartQty = () => cart.reduce((s, l) => s + l.qty, 0);

  function saveCart() {
    store.set("cart", cart);
    updateCartUI(true);
    if (PAGE === "cart" || PAGE === "checkout") PAGES[PAGE].render();
  }

  function addToCart(id, qty = 1) {
    const line = cart.find((l) => l.id === id);
    line ? (line.qty += qty) : cart.push({ id, qty });
    saveCart();
    openDrawer(true, true);
  }

  function changeQty(id, d) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.qty += d;
    if (line.qty < 1) cart = cart.filter((l) => l !== line);
    saveCart();
  }

  function updateCartUI(bump = false) {
    const c = $("#cartCount");
    if (c) {
      c.textContent = cartQty();
      c.hidden = !cartQty();
      if (bump) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    }
    const items = $("#drawerItems");
    if (!items) return;
    const lines = cartLines();
    $("#drawerFoot").hidden = !lines.length;
    items.innerHTML = lines.length
      ? lines.map((l) => `
        <div class="cart-item">
          <a href="product.html?id=${l.id}" class="cart-item__img"><img src="${img(l.p.imgs[0], 200, 200)}" alt="" /></a>
          <div class="cart-item__info">
            <a href="product.html?id=${l.id}"><b>${L(l.p.name)}</b></a>
            <div class="price"><s>${rs(l.p.compare)}</s><b>${rs(l.p.price)}</b></div>
            <div class="cart-item__row">
              <div class="qty qty--sm"><button data-cq="-1" data-id="${l.id}">−</button><span>${l.qty}</span><button data-cq="1" data-id="${l.id}">+</button></div>
              <button class="link-btn" data-remove="${l.id}">${t("cart.remove")}</button>
            </div>
          </div>
        </div>`).join("")
      : `<div class="cart-empty">${ic("bag", "")}<p>${t("cart.empty")}</p><a href="shop.html" class="btn btn--gold">${t("cart.continue")}</a></div>`;
    $("#drawerSubtotal").textContent = rs(subtotal());
  }

  let drawerReturnFocus = null;
  function openDrawer(open = true, added = false) {
    const d = $("#cartDrawer");
    if (!d) return;
    const wasOpen = d.classList.contains("is-open");
    if (added) toast(t("cart.added"));
    d.classList.toggle("is-open", open);
    d.setAttribute("aria-hidden", !open);
    $("#overlay").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    // keyboard users: move focus into the drawer, and back where they were when it closes
    if (open && !wasOpen) { drawerReturnFocus = document.activeElement; setTimeout(() => d.querySelector('[data-act="cart-close"]')?.focus(), 50); }
    if (!open && wasOpen && drawerReturnFocus?.isConnected) drawerReturnFocus.focus();
  }

  /* =========================================================
     Pages
     ========================================================= */
  const PAGES = {};

  /* ---------- Home ---------- */
  PAGES.home = {
    render() {
      // hero: one image or one video (set in data.js → HERO)
      const hero = $("#heroMedia");
      if (hero && !hero.dataset.ready) {
        hero.dataset.ready = "1";
        const media = HERO.type === "video"
          ? `<video src="${HERO.src}" ${HERO.poster ? `poster="${img(HERO.poster, 1920, 800)}"` : ""} muted playsinline loop ${matchMedia("(prefers-reduced-motion: reduce)").matches ? "" : "autoplay"} aria-label="البابر Herbal Oil"></video>`
          : `<img src="${img(HERO.src, 1920, 800)}" alt="البابر Herbal Oil" width="1920" height="800" fetchpriority="high" />`;
        hero.innerHTML = HERO.link ? `<a href="${HERO.link}">${media}</a>` : media;
      }

      $("#dealsGrid").innerHTML = PRODUCTS.filter((p) => p.collection === "bundles").concat(PRODUCTS.filter((p) => p.collection !== "bundles")).slice(0, 4).map(productCard).join("");
      $("#bestGrid").innerHTML = [...PRODUCTS].sort((a, b) => b.sold - a.sold).map(productCard).join("");
      $("#galleryGrid").innerHTML = CUSTOMER_PHOTOS.slice(0, 9).map((id, i) => `<figure class="mosaic__item ${i === 0 ? "mosaic__item--big" : ""}"><img src="${img(id, i === 0 ? 800 : 400, i === 0 ? 800 : 400)}" alt="" loading="lazy" /></figure>`).join("");

      $("#vidTrack").innerHTML = VIDEOS.map((v) => `
        <button class="vid" data-video aria-label="Play video from ${v.h}">
          <img src="${img(v.img, 500, 890)}" alt="" loading="lazy" />
          <span class="vid__play" aria-hidden="true">${ic("play", "")}</span>
          <span class="vid__meta"><b>${v.h}</b><span class="stars" aria-hidden="true">★★★★★</span></span>
        </button>`).join("");

      $("#processGrid").innerHTML = processCards();

      $("#baGrid").innerHTML = BEFORE_AFTER.map((x) => `
        <div class="ba">
          <div class="ba__stage" dir="ltr">
            <img class="ba__img" src="${img(x.before, 700, 700)}" alt="${t("ba.before")}" loading="lazy" />
            <img class="ba__img ba__img--after" src="${img(x.after, 700, 700)}" alt="${t("ba.after")}" loading="lazy" />
            <span class="ba__label ba__label--b">${t("ba.before")}</span>
            <span class="ba__label ba__label--a">${t("ba.after")}</span>
            <div class="ba__line"><span class="ba__knob">‹ ›</span></div>
            <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Before / after" />
          </div>
          <div class="ba__foot"><span class="stars">★★★★★</span><small>${t("ba.after_weeks", { n: x.w })}</small></div>
        </div>`).join("");

      $("#reviewGrid").innerHTML = reviewCards(REVIEWS);
      $("#faqList").innerHTML = FAQS.map((f, i) => accItem(L(f.q), `<p>${L(f.a)}</p>`, i === 0)).join("");
      $$(".js-wa").forEach((a) => (a.href = waLink()));
    },
  };
  const processCards = () => PROCESS.map((s, i) => `
    <li class="process__step"><div class="process__img"><img src="${img(s.img, 500, 620)}" alt="${L(s.t)}" loading="lazy" width="500" height="620" /></div>
      <span class="steps__n">${i + 1}</span><h3>${L(s.t)}</h3><p>${L(s.d)}</p>
    </li>`).join("");


  /* ---------- Collection / shop ---------- */
  const shopState = { type: new Set(), inStock: false, min: "", max: "", sort: params.get("sort") || "featured" };
  PAGES.shop = {
    render() {
      const c = params.get("c") || "all";
      const titleKey = T["col." + c] ? "col." + c : "col.all";
      $("#colTitle").textContent = t(titleKey);
      $("#colSub").textContent = t(c === "bundles" ? "col.bundles.sub" : "col.all.sub");
      document.title = `${t(titleKey)} – البابر Herbal Oil`;
      $("#crumbCol").textContent = t(titleKey);
      $("#typeFilter").hidden = c !== "all";
      $("#fltTypes").innerHTML = ["hair-oil", "bundles"].map((k) => `<label class="check"><input type="checkbox" value="${k}" ${shopState.type.has(k) ? "checked" : ""} data-flt="type" /> ${t("col." + k)} (${PRODUCTS.filter((p) => p.collection === k).length})</label>`).join("");
      $("#sortSel").innerHTML = ["featured", "best", "az", "low", "high"].map((k) => `<option value="${k}" ${shopState.sort === k ? "selected" : ""}>${t("sort." + k)}</option>`).join("");
      $("#instockCount").textContent = `(${PRODUCTS.filter((p) => p.inStock).length})`;
      this.list();
    },
    list() {
      const c = params.get("c") || "all";
      let list = PRODUCTS.filter((p) => c === "all" || p.collection === c);
      if (shopState.type.size) list = list.filter((p) => shopState.type.has(p.collection));
      if (shopState.inStock) list = list.filter((p) => p.inStock);
      if (shopState.min !== "") list = list.filter((p) => p.price >= +shopState.min);
      if (shopState.max !== "") list = list.filter((p) => p.price <= +shopState.max);
      const s = shopState.sort;
      if (s === "best") list.sort((a, b) => b.sold - a.sold);
      if (s === "az") list.sort((a, b) => L(a.name).localeCompare(L(b.name)));
      if (s === "low") list.sort((a, b) => a.price - b.price);
      if (s === "high") list.sort((a, b) => b.price - a.price);
      $("#colCount").textContent = t("col.count", { n: list.length });
      $("#colGrid").innerHTML = list.length ? list.map(productCard).join("") : `<p class="empty-note">${t("col.empty")} <button class="link-btn" data-act="clear-filters">${t("col.clear")}</button></p>`;
      const active = shopState.type.size || shopState.inStock || shopState.min !== "" || shopState.max !== "";
      $("#clearFilters").hidden = !active;
      observeReveal();
    },
  };

  /* ---------- Product ---------- */
  const pd = { id: product(params.get("id")) ? params.get("id") : "oil-200", qty: 1, view: 0 };
  PAGES.product = {
    render() {
      const p = product(pd.id);
      document.title = `${L(p.name)} – البابر Herbal Oil`;
      $("#pdCrumb").textContent = L(p.name);
      $("#pdTitle").textContent = L(p.name);
      $("#pdCompare").textContent = rs(p.compare);
      $("#pdPrice").textContent = rs(p.price);
      $("#pdOff").textContent = `${savePct(p)}% ${t("pd.off")}`;
      $("#pdQtyVal").textContent = pd.qty;
      // sold-out state comes from the database (admin → Prices and stock)
      const soldOut = p.inStock === false;
      $(".pd__stock").innerHTML = soldOut ? `<span class="dot dot--off"></span><span>${t("pd.soldout")}</span>` : `<span class="dot"></span><span>${t("pd.stock")}</span>`;
      $(".pd__stock").classList.toggle("pd__stock--off", soldOut);
      $('[data-act="pd-add"]').disabled = soldOut;
      $('[data-act="pd-buy"]').disabled = soldOut;
      $('[data-act="pd-add"]').textContent = soldOut ? t("badge.sold") : t("pd.add");
      $("#pdMain").innerHTML = `<img src="${img(p.imgs[pd.view], 1000, 1000)}" alt="${L(p.name)}" />
        <button class="pd__nav pd__nav--prev" data-view="${(pd.view + p.imgs.length - 1) % p.imgs.length}" aria-label="Previous">‹</button>
        <button class="pd__nav pd__nav--next" data-view="${(pd.view + 1) % p.imgs.length}" aria-label="Next">›</button>`;
      $("#pdThumbs").innerHTML = p.imgs.map((id, i) => `<button class="pd__thumb ${i === pd.view ? "is-active" : ""}" data-view="${i}" aria-label="Photo ${i + 1} of ${p.imgs.length}" ${i === pd.view ? 'aria-current="true"' : ""}><img src="${img(id, 200, 200)}" alt="" /></button>`).join("");
      $("#packOptions").innerHTML = PRODUCTS.map((x) => `
        <button type="button" class="pack ${x.id === p.id ? "is-active" : ""}" data-pack="${x.id}" aria-pressed="${x.id === p.id}">${x.badge ? `<em>${t("badge." + x.badge)}</em>` : ""}
          <b>${L(x.pack)}</b><span>${rs(x.price)}</span><small>${x.inStock === false ? t("badge.sold") : `${t("badge.save")} ${savePct(x)}%`}</small></button>`).join("");

      const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short" }); };
      $("#pdEta").textContent = `${d(2)} – ${d(5)}`;
      $("#tl1").textContent = d(0); $("#tl2").textContent = `${d(0)} – ${d(1)}`; $("#tl3").textContent = `${d(2)} – ${d(5)}`;

      $("#pdAccordion").innerHTML = [
        accItem(t("pd.acc.use"), `<ul><li>${t("use.d1")}</li><li>${t("use.d2")}</li><li>${t("use.d3")}</li></ul>`, false, ic("check")),
        accItem(t("pd.acc.how"), `<p>${t("pd.how.body")}</p>`, false, ic("bolt")),
        accItem(t("pd.acc.ing"), `<p>${INGREDIENTS.map((g) => L(g.n)).join(" • ")} — ${t("ing.more")}</p>`, false, ic("leaf")),
        accItem(t("pd.acc.ben"), `<ul>${t("pd.ben.list").split("|").map((b) => `<li>${b}</li>`).join("")}</ul>`, false, ic("heart")),
        accItem(t("pd.acc.ret"), `<ul>${L(POLICIES.refund.body).map((b) => `<li>${b}</li>`).join("")}</ul>`, false, ic("help")),
      ].join("");
      $("#pdWa").href = waLink(t("pd.wa.msg", { p: L(p.name), q: pd.qty }));
      $("#pdReviews").innerHTML = reviewCards(REVIEWS.slice(0, 3));
      $("#pdRelated").innerHTML = PRODUCTS.filter((x) => x.id !== p.id).map(productCard).join("");
    },
  };

  /* ---------- Cart page ---------- */
  PAGES.cart = {
    render() {
      const lines = cartLines();
      $("#cartEmpty").hidden = !!lines.length;
      $("#cartFull").hidden = !lines.length;
      $("#cartRows").innerHTML = lines.map((l) => `
        <div class="cart-row">
          <div class="cart-row__prod">
            <a href="product.html?id=${l.id}" class="cart-row__img"><img src="${img(l.p.imgs[0], 240, 240)}" alt="" /></a>
            <div><a href="product.html?id=${l.id}" class="cart-row__name">${L(l.p.name)}</a><div class="price"><s>${rs(l.p.compare)}</s><b>${rs(l.p.price)}</b></div></div>
          </div>
          <div class="cart-row__qty"><div class="qty"><button data-cq="-1" data-id="${l.id}">−</button><span>${l.qty}</span><button data-cq="1" data-id="${l.id}">+</button></div>
            <button class="icon-btn" data-remove="${l.id}" aria-label="${t("cart.remove")}"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>
          <div class="cart-row__total">${rs(l.p.price * l.qty)}</div>
        </div>`).join("");
      $("#cartPageSub").textContent = rs(subtotal());
    },
  };

  /* ---------- Checkout ---------- */
  let discount = 0, discountCode = "";
  PAGES.checkout = {
    render() {
      const lines = cartLines();
      $("#coItems").innerHTML = lines.length
        ? lines.map((l) => `<div class="line-item"><div class="line-item__img"><img src="${img(l.p.imgs[0], 140, 140)}" alt="" /><span class="line-item__qty">${l.qty}</span></div>
            <span class="line-item__name">${L(l.p.name)}</span><span class="line-item__price">${rs(l.p.price * l.qty)}</span></div>`).join("")
        : `<p class="co-empty">${t("co.empty")} <a href="shop.html">${t("cart.continue")}</a></p>`;
      const sub = subtotal(), disc = sub * discount;
      $("#coSub").textContent = rs(sub);
      $("#coDiscRow").hidden = !discount;
      $("#coDisc").textContent = "− " + rs(disc);
      $("#coTotal").textContent = rs(sub - disc);
      const city = $("#fCity"), cur = city.value;
      city.innerHTML = `<option value="">${t("co.city")}</option>` + CITIES.map((c) => `<option ${c === cur ? "selected" : ""}>${c}</option>`).join("");
      // account: signed-in customers get their email and saved address filled in
      $("#coAccount").innerHTML = user
        ? `${t("co.signedInAs")} <b>${user.email}</b>`
        : `${t("co.haveAccount")} <button type="button" class="link-btn link-btn--strong" data-act="signin-checkout">${t("nav.login")}</button>`;
      $("#fEmail").readOnly = !!user;
      $("#saveDetailsRow").hidden = !user;
      if (user) {
        $("#fEmail").value = user.email;
        if (!this.prefilled) {
          this.prefilled = true;
          sb.from("customer_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
            if (!data) return;
            const fill = (id, v) => { const el = $(id); if (el && !el.value && v) el.value = v; };
            fill("#fName", data.full_name); fill("#fPhone", data.phone); fill("#fAddress", data.address); fill("#fLandmark", data.landmark);
            if (data.city && !$("#fCity").value) $("#fCity").value = data.city;
          });
        }
      }
    },
  };

  /* ---------- Thank you ---------- */
  PAGES.thanks = {
    render() {
      const o = store.get("lastOrder", null);
      $("#tyHas").hidden = !o; $("#tyNone").hidden = !!o;
      if (!o) return;
      $("#tyOrder").textContent = o.no;
      // what happens next, and where to follow the order
      $("#tyNext").innerHTML = user
        ? `<p>${t("ty.signedIn")}</p><div class="thanks__btns"><a href="account.html" class="btn btn--green">${t("ty.viewOrders")}</a><a href="shop.html" class="btn btn--line">${t("ty.home")}</a></div>`
        : `<p>${t("ty.guest", { e: o.email || "" })}</p><div class="thanks__btns"><button type="button" class="btn btn--green" data-act="signin-thanks">${t("ty.signInToFollow")}</button><a href="shop.html" class="btn btn--line">${t("ty.home")}</a></div>`;
      $("#tyItems").innerHTML = o.lines.map((l) => { const p = product(l.id); return p ? `<div class="line-item"><div class="line-item__img"><img src="${img(p.imgs[0], 140, 140)}" alt="" /><span class="line-item__qty">${l.qty}</span></div><span class="line-item__name">${L(p.name)}</span><span class="line-item__price">${rs(p.price * l.qty)}</span></div>` : ""; }).join("")
        + `<div class="totals"><div class="totals__grand"><span>${t("co.total")}</span><span>${rs(o.total)}</span></div></div>`;
    },
  };

  /* ---------- About ---------- */
  PAGES.about = { render() { $("#processGrid").innerHTML = processCards(); } };

  /* ---------- Contact ---------- */
  PAGES.contact = {
    render() {
      $("#ctWa").href = waLink();
      $("#ctWaText").textContent = SITE.whatsappText;
      $("#ctEmailLink").href = "mailto:" + SITE.email;
      $("#ctEmailText").textContent = SITE.email;
    },
  };
  PAGES.notfound = { render() {} };

  /* ---------- Policy ---------- */
  PAGES.policy = {
    render() {
      const pol = POLICIES[params.get("p")] || POLICIES.shipping;
      $("#polTitle").textContent = L(pol.title);
      document.title = `${L(pol.title)} – البابر Herbal Oil`;
      $("#polBody").innerHTML = `<ul>${L(pol.body).map((b) => `<li>${b}</li>`).join("")}</ul>`;
      $("#polNav").innerHTML = Object.entries(POLICIES).map(([k, v]) => `<a href="policy.html?p=${k}" class="${(params.get("p") || "shipping") === k ? "is-active" : ""}">${L(v.title)}</a>`).join("");
    },
  };

  /* ---------- Search ---------- */
  const searchMatch = (q) => PRODUCTS.filter((p) => !q || [...p.name, ...p.pack, ...p.tag].join(" ").toLowerCase().includes(q.toLowerCase()));
  PAGES.search = {
    render() {
      const q = params.get("q") || "";
      $("#searchPageInput").value = q;
      const res = searchMatch(q);
      $("#searchInfo").textContent = q ? t("search.count", { n: res.length, q }) : t("col.count", { n: res.length });
      $("#searchGrid").innerHTML = res.length ? res.map(productCard).join("") : `<p class="empty-note">${t("search.none")}</p>`;
    },
  };

  /* ---------- Customer accounts (email code sign-in, like Shopify) ---------- */
  let user = null;
  const STEPS = ["new", "confirmed", "dispatched", "delivered"];
  const fmtDate = (d) => new Date(d).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  function progressBar(status) {
    if (status === "cancelled") return `<p class="myorder__cancel">${t("stepnote.cancelled")}</p>`;
    const at = STEPS.indexOf(status);
    return `<ol class="progress" aria-label="${t("ac.progress")}">${STEPS.map((s, i) =>
      `<li class="${i <= at ? "is-done" : ""} ${i === at ? "is-current" : ""}" ${i === at ? 'aria-current="step"' : ""}><span class="progress__dot" aria-hidden="true"></span><span>${t("step." + s)}</span></li>`).join("")}</ol>
      <p class="myorder__note">${t("stepnote." + status)}</p>`;
  }
  function updateAuthUI() {
    const lbl = user ? t("ac.myaccount") : t("nav.login");
    $$("#accountIcon").forEach((a) => { a.setAttribute("aria-label", lbl); a.title = lbl; });
    $$(".nav__login span").forEach((s) => (s.textContent = lbl));
  }
  let authReady = false;
  // Where a password-reset email brings the customer back to (must be allowed in Supabase → Auth → URL Configuration)
  const authRedirect = () => location.origin + (location.hostname === "localhost" ? "/account.html" : "/account");
  // A used or expired emailed link comes back with an error in the address (#error_code=otp_expired …)
  let linkError = "", recovering = false;
  {
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get("error_code") || h.get("error")) {
      linkError = h.get("error_code") === "otp_expired" ? "ac.err.linkUsed" : "ac.err.link";
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (h.get("type") === "recovery") recovering = true;
  }
  // A guest order placed in this browser can be attached to the account with its secret key
  async function claimLastOrder() {
    const o = store.get("lastOrder", null);
    if (!o?.claimToken) return;
    const { data } = await sb.rpc("claim_order", { p_order_no: o.no, p_token: o.claimToken });
    if (data !== null) { delete o.claimToken; store.set("lastOrder", o); }
  }
  async function afterSignIn() {
    await claimLastOrder();
    const next = sessionStorage.getItem("albabar.next");
    sessionStorage.removeItem("albabar.next");
    sessionStorage.removeItem("albabar.signinEmail");
    if (next && !location.pathname.startsWith("/" + next.replace(/\.html$/, ""))) { location.href = next; return true; }
    return false;
  }
  async function initAuth() {
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    user = data.session?.user || null;
    authReady = true;
    updateAuthUI();
    if (["account", "checkout", "thanks"].includes(PAGE)) PAGES[PAGE].render();
    sb.auth.onAuthStateChange((event, session) => {
      // opened from a password-reset email: show "choose a new password"
      if (event === "PASSWORD_RECOVERY") { recovering = true; user = session?.user || null; setTimeout(() => PAGES.account?.render(), 0); return; }
      const changed = (session?.user?.id || null) !== (user?.id || null);
      user = session?.user || null;
      // never call Supabase directly inside this callback; defer instead
      if (changed) setTimeout(async () => {
        if (event === "SIGNED_IN" && (await afterSignIn())) return;
        updateAuthUI(); if (["account", "checkout", "thanks"].includes(PAGE)) PAGES[PAGE].render();
        if (event === "SIGNED_IN" && PAGE === "account") toast(t("ac.welcome"));
      }, 0);
    });
  }
  const goSignIn = (email, next) => {
    if (email) sessionStorage.setItem("albabar.signinEmail", email);
    if (next) sessionStorage.setItem("albabar.next", next);
    location.href = "account.html";
  };

  const showAuthTab = (tab) => {
    $$("#acctAuth [data-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
    $$("#acctAuth [data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tab));
  };
  // turn Supabase's English error messages into clear, translated ones
  const authError = (error) => {
    const m = (error?.message || "").toLowerCase();
    if (/invalid login credentials/.test(m)) return t("ac.err.wrong");
    if (/email not confirmed/.test(m)) return t("ac.err.notConfirmed");
    if (/already registered|already been registered|user already exists/.test(m)) return t("ac.err.exists");
    if (/password/.test(m) && /(short|least|weak|characters)/.test(m)) return t("ac.err.passShort");
    if (/rate|seconds|security purposes|too many/.test(m)) return t("ac.err.wait");
    return t("err.network");
  };
  const showErr = (id, msg) => { const el = $(id); el.hidden = !msg; el.textContent = msg || ""; };

  PAGES.account = {
    render() {
      if (!$("#acctAuth")) return;
      // wait for the saved session check, so signed-in customers don't see the sign-in form flash
      if (sb && !authReady && !recovering) { $("#acctAuth").hidden = true; $("#acctDash").hidden = true; $("#acctReset").hidden = true; return; }
      $("#acctReset").hidden = !recovering;
      if (recovering) { $("#acctAuth").hidden = true; $("#acctDash").hidden = true; return; }
      $("#acctAuth").hidden = !!user; $("#acctDash").hidden = !user;
      if (!user) {
        if (linkError) { showErr("#siError", t(linkError)); linkError = ""; }
        const pre = sessionStorage.getItem("albabar.signinEmail");
        if (pre) {
          if (!$("#siEmail").value) $("#siEmail").value = pre;
          if (!$("#suEmail").value) $("#suEmail").value = pre;
        }
        // coming from a guest order: most likely they don't have an account yet
        if (sessionStorage.getItem("albabar.preferSignup") && !this.tabChosen) { this.tabChosen = true; sessionStorage.removeItem("albabar.preferSignup"); showAuthTab("signup"); }
        return;
      }
      $("#acctEmail").textContent = user.email;
      this.loadOrders(); this.loadProfile();
    },
    async loadOrders() {
      const box = $("#myOrders");
      box.innerHTML = `<p class="muted">${t("ac.loading")}</p>`;
      const { data, error } = await sb.from("orders")
        .select("id, order_no, status, created_at, total, discount, payment_method, city, address, order_items(product_id, name, qty, line_total)")
        .order("created_at", { ascending: false });
      if (error) { box.innerHTML = `<p class="form-error">${t("err.network")}</p>`; return; }
      if (!data.length) { box.innerHTML = `<div class="cart-empty"><p>${t("ac.noOrders")}</p><a href="shop.html" class="btn btn--gold">${t("cart.continue")}</a></div>`; return; }
      const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      box.innerHTML = data.map((o) => `
        <article class="myorder">
          <header class="myorder__head">
            <div><h3>${t("ac.order")} ${esc(o.order_no)}</h3><span class="muted small">${t("ac.placedOn", { d: fmtDate(o.created_at) })}</span></div>
            <b class="myorder__total">${rs(o.total)}</b>
          </header>
          ${progressBar(o.status)}
          <ul class="myorder__items">${o.order_items.map((i) => `<li><span>${product(i.product_id) ? L(product(i.product_id).name) : esc(i.name)} × ${i.qty}</span><span>${rs(i.line_total)}</span></li>`).join("")}</ul>
          <p class="muted small">${t("ac.deliverTo")}: ${esc(o.address)}, ${esc(o.city)}. ${t(o.payment_method === "cod" ? "co.cod" : "co.bank")}.</p>
        </article>`).join("");
    },
    async loadProfile() {
      const { data } = await sb.from("customer_profiles").select("*").eq("user_id", user.id).maybeSingle();
      const city = $("#pCity");
      city.innerHTML = `<option value="">${t("co.city")}</option>` + CITIES.map((c) => `<option ${c === data?.city ? "selected" : ""}>${c}</option>`).join("");
      $("#pName").value = data?.full_name || ""; $("#pPhone").value = data?.phone || "";
      $("#pAddress").value = data?.address || ""; $("#pLandmark").value = data?.landmark || "";
    },
  };
  async function saveProfile(fields) {
    if (!sb || !user) return { error: true };
    return sb.from("customer_profiles").upsert({ user_id: user.id, ...fields });
  }

  /* =========================================================
     Helpers: toast, reveal, form validation
     ========================================================= */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  let io;
  function observeReveal() {
    if (!("IntersectionObserver" in window)) return $$(".reveal").forEach((e) => e.classList.add("is-in"));
    io ??= new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.08 });
    $$(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  }

  const RULES = {
    phone: (v) => /^(03\d{9}|\+?923\d{9})$/.test(v.replace(/[\s-]/g, "")),
    phoneOpt: (v) => !v.trim() || /^(03\d{9}|\+?923\d{9})$/.test(v.replace(/[\s-]/g, "")),
    code: (v) => /^\d{6,10}$/.test(v.trim()),
    email: (v) => /^\S+@\S+\.\S+$/.test(v),
    emailOpt: (v) => !v || /^\S+@\S+\.\S+$/.test(v),
    name: (v) => v.trim().length >= 3,
    city: (v) => !!v,
    address: (v) => v.trim().length >= 8,
    message: (v) => v.trim().length >= 3,
    password: (v) => v.length >= 8,
    passwordAny: (v) => v.length >= 1,
    order: (v) => /^ALB-?\d{4,6}$/i.test(v.trim()),
  };
  // fields carry data-rule="phone" and data-err-key="err.phone"
  function validate(form) {
    let ok = true, first = null;
    $$("[data-rule]", form).forEach((el) => {
      const good = RULES[el.dataset.rule](el.value);
      const field = el.closest(".field");
      field.classList.toggle("has-error", !good);
      const errEl = field.querySelector(".err"); if (!errEl.id) errEl.id = (el.id || "f" + Math.random().toString(36).slice(2, 7)) + "-err";
      el.setAttribute("aria-invalid", !good); el.setAttribute("aria-describedby", errEl.id);
      field.querySelector(".err").textContent = good ? "" : t(el.dataset.errKey);
      if (!good) { ok = false; first ??= el; }
    });
    first?.focus();
    return ok;
  }

  /* =========================================================
     Events
     ========================================================= */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("button, a, [data-video]");
    if (!el) return;
    const act = el.dataset.act;

    if (el.dataset.add) return addToCart(el.dataset.add);
    if (el.dataset.cq) return changeQty(el.dataset.id, +el.dataset.cq);
    if (el.dataset.remove) { cart = cart.filter((l) => l.id !== el.dataset.remove); return saveCart(); }
    if (el.dataset.pack) {
      pd.id = el.dataset.pack; pd.qty = 1; pd.view = 0;
      history.replaceState(null, "", "product.html?id=" + pd.id);
      return PAGES.product.render();
    }
    if (el.dataset.view) { pd.view = +el.dataset.view; return PAGES.product.render(); }
    if (el.dataset.q) { pd.qty = Math.max(1, pd.qty + +el.dataset.q); $("#pdQtyVal").textContent = pd.qty; $("#pdWa").href = waLink(t("pd.wa.msg", { p: L(product(pd.id).name), q: pd.qty })); return; }
    if (el.classList.contains("acc__btn")) { const o = el.parentElement.classList.toggle("is-open"); return el.setAttribute("aria-expanded", o); }
    if (el.hasAttribute("data-video")) return toast(t("vid.soon"));
    if (el.dataset.tab) {
      const scope = el.closest("section") || document;
      $("[data-tab]", scope).forEach((b) => b.classList.toggle("is-active", b === el));
      $("[data-panel]", scope).forEach((p) => (p.hidden = p.dataset.panel !== el.dataset.tab));
      return;
    }

    switch (act) {
      case "lang": lang = lang === "en" ? "ur" : "en"; store.set("lang", lang); return setLang();
      case "cart": return openDrawer(true);
      case "cart-close": return openDrawer(false);
      case "menu": $("#nav").classList.add("is-open"); $("#overlay").hidden = false; el.setAttribute("aria-expanded", "true"); setTimeout(() => $('#nav [data-act="menu-close"]')?.focus(), 50); return;
      case "menu-close": $("#nav").classList.remove("is-open"); $("#overlay").hidden = true; $('[data-act="menu"]')?.setAttribute("aria-expanded", "false"); $('[data-act="menu"]')?.focus(); return;
      case "search": { const m = $("#searchModal"); m.hidden = false; $("#searchInput").focus(); predictive(); return; }
      case "search-close": $("#searchModal").hidden = true; return;
      case "vid-prev": case "vid-next": { const tr = $("#vidTrack"); const w = tr.querySelector(".vid").offsetWidth + 20; tr.scrollBy({ left: act === "vid-next" ? w : -w, behavior: "smooth" }); return; }
      case "pd-add": if (product(pd.id).inStock === false) return; return addToCart(pd.id, pd.qty);
      case "pd-buy": { if (product(pd.id).inStock === false) return; const line = cart.find((l) => l.id === pd.id); line ? (line.qty = Math.max(line.qty, pd.qty)) : cart.push({ id: pd.id, qty: pd.qty }); store.set("cart", cart); location.href = "checkout.html"; return; }
      case "share":
        if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(() => {});
        else navigator.clipboard?.writeText(location.href).then(() => toast(t("pd.copied")));
        return;
      case "clear-filters": shopState.type.clear(); shopState.inStock = false; shopState.min = shopState.max = ""; $("#fltStock").checked = false; $("#fltMin").value = $("#fltMax").value = ""; return PAGES.shop.render();
      case "co-apply": {
        const code = $("#coCode").value.trim().toUpperCase();
        const msg = $("#coCodeMsg");
        if (!code) return;
        el.disabled = true;
        (async () => {
          let pct = 0;
          if (sb) { const { data, error } = await sb.rpc("check_discount", { p_code: code }); if (error) { msg.textContent = t("err.network"); el.disabled = false; return; } pct = data || 0; }
          else pct = code === "WELCOME10" ? 10 : 0;
          discount = pct / 100; discountCode = pct ? code : "";
          msg.textContent = pct ? t("co.goodcode", { n: pct }) : t("co.badcode");
          msg.style.color = pct ? "var(--leaf)" : "var(--danger)";
          el.disabled = false;
          PAGES.checkout.render();
        })();
        return;
      }
      case "signin-checkout": return goSignIn("", "checkout.html");
      case "signin-thanks": sessionStorage.setItem("albabar.preferSignup", "1"); return goSignIn(store.get("lastOrder", {}).email || "", "account.html");
      case "go-signup": return showAuthTab("signup");
      case "go-signin": return showAuthTab("signin");
      case "show-forgot": $("#signinForm").hidden = true; $("#forgotForm").hidden = false; $("#fgEmail").value = $("#siEmail").value; $("#fgEmail").focus(); return;
      case "hide-forgot": $("#forgotForm").hidden = true; $("#signinForm").hidden = false; return;
      case "signout": sb.auth.signOut().then(() => { user = null; updateAuthUI(); PAGES.account.render(); toast(t("ac.signedOut")); }); return;
      case "filters-toggle": $("#filters").classList.toggle("is-open"); return;
    }
  });

  document.addEventListener("click", (e) => { if (e.target.id === "overlay") { openDrawer(false); $("#nav")?.classList.remove("is-open"); } });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    openDrawer(false);
    const m = $("#searchModal"); if (m && !m.hidden) { m.hidden = true; $('[data-act="search"]')?.focus(); }
    if ($("#nav")?.classList.contains("is-open")) { $("#nav").classList.remove("is-open"); $("#overlay").hidden = true; $('[data-act="menu"]')?.focus(); }
  });
  // close the search box when clicking anywhere outside it
  document.addEventListener("click", (e) => {
    const m = $("#searchModal");
    if (m && !m.hidden && !e.target.closest("#searchModal, [data-act='search']")) m.hidden = true;
  });

  // inputs: before/after, filters, predictive search, clear errors
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.classList.contains("ba__range")) {
      const st = el.closest(".ba__stage");
      st.querySelector(".ba__img--after").style.clipPath = `inset(0 0 0 ${el.value}%)`;
      st.querySelector(".ba__line").style.left = el.value + "%";
      return;
    }
    if (el.id === "searchInput") return predictive();
    if (el.dataset.flt === "type") { el.checked ? shopState.type.add(el.value) : shopState.type.delete(el.value); return PAGES.shop.list(); }
    if (el.id === "fltStock") { shopState.inStock = el.checked; return PAGES.shop.list(); }
    if (el.id === "fltMin") { shopState.min = el.value; return PAGES.shop.list(); }
    if (el.id === "fltMax") { shopState.max = el.value; return PAGES.shop.list(); }
    const f = el.closest(".field.has-error");
    if (f) { f.classList.remove("has-error"); f.querySelector(".err").textContent = ""; }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "sortSel") {
      shopState.sort = e.target.value;
      params.set("sort", shopState.sort);
      history.replaceState(null, "", "?" + params.toString());
      PAGES.shop.list();
    }
  });

  function predictive() {
    const q = $("#searchInput").value.trim();
    const res = searchMatch(q);
    $("#searchResults").innerHTML = res.length
      ? res.map((p) => `<a href="product.html?id=${p.id}"><img src="${img(p.imgs[0], 120, 120)}" alt="" /><span>${L(p.name)}</span><b>${rs(p.price)}</b></a>`).join("")
      : `<p class="muted">${t("search.none")}</p>`;
  }

  // forms (saved to Supabase)
  const busy = (f, on) => { const b = f.querySelector('[type="submit"]'); if (b) { b.disabled = on; b.setAttribute("aria-busy", on); b.style.opacity = on ? ".6" : ""; } };
  const serverError = (error) => {
    const key = "err.srv." + ((error?.message || "").match(/[a-z_]+/)?.[0] || "");
    return T[key] ? t(key) : t("err.network");
  };
  document.addEventListener("submit", async (e) => {
    const f = e.target;
    if (f.id === "checkoutForm") {
      e.preventDefault();
      if (!cartLines().length) return toast(t("co.empty"));
      if (!validate(f)) return;
      if (!sb) return toast(t("err.network"));
      busy(f, true);
      const { data, error } = await sb.rpc("place_order", {
        p_items: cart.map((l) => ({ id: l.id, qty: l.qty })),
        p_customer: { name: $("#fName").value, phone: $("#fPhone").value, email: $("#fEmail").value, city: $("#fCity").value,
                      address: $("#fAddress").value, landmark: $("#fLandmark").value, notes: $("#fNotes").value },
        p_code: discountCode || null,
        p_payment: f.querySelector('[name="pay"]:checked').value,
        p_lang: lang,
      });
      busy(f, false);
      if (error || !data?.length) { busy(f, false); $("#coError").hidden = false; $("#coError").textContent = serverError(error); return; }
      if (user && $("#saveDetails")?.checked) {
        await saveProfile({ full_name: $("#fName").value.trim(), phone: $("#fPhone").value.trim(), city: $("#fCity").value,
                            address: $("#fAddress").value.trim(), landmark: $("#fLandmark").value.trim() || null });
      }
      store.set("lastOrder", { no: data[0].order_no, claimToken: data[0].claim_token || null, lines: cart, total: data[0].total, email: user ? user.email : $("#fEmail").value.trim().toLowerCase() });
      cart = []; store.set("cart", cart);
      location.href = "thank-you.html";
    }
    if (f.id === "contactForm") {
      e.preventDefault();
      if (!validate(f)) return;
      busy(f, true);
      const { error } = sb ? await sb.from("contact_messages").insert({
        name: $("#ct1").value.trim(), email: $("#ct2").value.trim(), phone: $("#ct3").value.trim() || null, message: $("#ct4").value.trim(),
      }) : { error: true };
      busy(f, false);
      if (error) return toast(serverError(error));
      f.reset(); $("#ctSent").hidden = false;
    }
    // Sign in with email + password
    if (f.id === "signinForm") {
      e.preventDefault();
      showErr("#siError", "");
      if (!validate(f) || !sb) return;
      busy(f, true);
      const { error } = await sb.auth.signInWithPassword({ email: $("#siEmail").value.trim().toLowerCase(), password: $("#siPass").value });
      busy(f, false);
      if (error) return showErr("#siError", authError(error));
      // the auth listener finishes the job (claims this browser's guest order, then shows My account)
    }
    // Create an account: signed in straight away (no email needed)
    if (f.id === "signupForm") {
      e.preventDefault();
      showErr("#suError", "");
      if (!validate(f) || !sb) return;
      busy(f, true);
      const name = $("#suName").value.trim();
      const { data, error } = await sb.auth.signUp({ email: $("#suEmail").value.trim().toLowerCase(), password: $("#suPass").value });
      if (error) { busy(f, false); return showErr("#suError", authError(error)); }
      // Supabase hides "email already registered" by returning a user with no identities
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) { busy(f, false); return showErr("#suError", t("ac.err.exists")); }
      if (!data.session) { busy(f, false); return showErr("#suError", t("ac.err.needsConfirm")); }
      user = data.user;
      await saveProfile({ full_name: name });
      busy(f, false);
    }
    // Forgot password: email a reset link (limited until an email service is connected)
    if (f.id === "forgotForm") {
      e.preventDefault();
      showErr("#fgError", ""); $("#fgDone").hidden = true;
      if (!validate(f) || !sb) return;
      busy(f, true);
      const { error } = await sb.auth.resetPasswordForEmail($("#fgEmail").value.trim().toLowerCase(), { redirectTo: authRedirect() });
      busy(f, false);
      if (error) return showErr("#fgError", /rate|seconds|too many/i.test(error.message) ? t("ac.err.resetLimit") : t("err.network"));
      $("#fgDone").hidden = false; $("#fgDone").textContent = t("ac.forgot.sent");
    }
    // Choose a new password (after opening the reset email)
    if (f.id === "resetForm") {
      e.preventDefault();
      showErr("#rsError", "");
      if (!validate(f)) return;
      busy(f, true);
      const { error } = await sb.auth.updateUser({ password: $("#rsPass").value });
      busy(f, false);
      if (error) return showErr("#rsError", authError(error));
      recovering = false;
      const { data } = await sb.auth.getSession(); user = data.session?.user || null;
      updateAuthUI(); PAGES.account.render(); toast(t("ac.reset.done"));
    }
    if (f.id === "profileForm") {
      e.preventDefault();
      if (!validate(f)) return;
      busy(f, true);
      const { error } = await saveProfile({ full_name: $("#pName").value.trim() || null, phone: $("#pPhone").value.trim() || null,
        city: $("#pCity").value || null, address: $("#pAddress").value.trim() || null, landmark: $("#pLandmark").value.trim() || null });
      busy(f, false);
      toast(error ? t("err.network") : t("ac.saved"));
    }
    if (f.id === "newsletter") {
      e.preventDefault();
      const email = f.querySelector("input").value.trim().toLowerCase();
      const { error } = sb ? await sb.from("newsletter_subscribers").insert({ email }) : { error: true };
      if (error && error.code !== "23505") return toast(t("err.network")); // 23505 = already subscribed
      f.reset(); toast(t("foot.subscribed"));
    }
  });

  /* ---------- Live prices and stock from Supabase ---------- */
  async function loadProducts() {
    if (!sb) return;
    const { data, error } = await sb.from("products").select("id, price, compare_price, in_stock, sold, name_en, name_ur").order("sort");
    if (error || !data) return;
    data.forEach((r) => {
      const p = product(r.id);
      if (!p) return;
      Object.assign(p, { price: r.price, compare: r.compare_price || r.price, inStock: r.in_stock, sold: r.sold, name: [r.name_en, r.name_ur] });
    });
    updateCartUI();
    PAGES[PAGE]?.render?.();
  }

  // header shadow
  addEventListener("scroll", () => $("#header")?.classList.toggle("is-scrolled", scrollY > 10), { passive: true });

  /* ---------- Boot ---------- */
  setLang();
  loadProducts();
  initAuth();
})();
