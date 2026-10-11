/* ============================================================
   Monji Games — main.js
   Shared chrome (header/footer/modals), i18n engine (FA/EN),
   live data layer (Google Sheet via Apps Script or local JSON),
   and per-page renderers.
   ============================================================ */
(function () {
  "use strict";

  const MJ = (window.MJ = window.MJ || {});
  MJ.config = Object.assign({ apiUrl: "", dataUrl: "data/site-data.json" }, window.MJ_CONFIG || {});
  MJ.lang = (localStorage.getItem("mj_lang") || "fa").toLowerCase() === "en" ? "en" : "fa";

  const I18N = (window.MJ_I18N = window.MJ_I18N || {});
  /* FA strings that exist only in JS-rendered markup (DOM keys are captured at init) */
  I18N.fa = Object.assign(I18N.fa || {}, {
    "army.cycle.short": "چرخه‌ی برتری",
    "army.cycle.center": "×۱.۵ قدرت مؤثر",
    "news.featured": "جدیدترین Devlog",
    "news.none": "هنوز پستی در این دسته نیست.",
    "news.video.ph": "پیش‌نمایش ویدیو به‌زودی — لینک نهایی از داده‌ی زنده خوانده می‌شود.",
    "news.watch": "مشاهده‌ی ویدیو"
  });

  /* ---------- tiny helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
  const faDigits = (s) => String(s).replace(/\d/g, (d) => FA_DIGITS[+d]);
  const fmtPct = (n) => (MJ.lang === "fa" ? faDigits(n) + "٪" : n + "%");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pick = (o, field) => {
    const v = MJ.lang === "en" ? o[field + "_en"] : o[field + "_fa"];
    if (v !== undefined && v !== "") return v;
    return MJ.lang === "en" ? o[field + "_fa"] || "" : o[field + "_en"] || "";
  };
  const label = (key) => {
    const v = (I18N[MJ.lang] || {})[key];
    if (v !== undefined) return v;
    const f = (I18N.fa || {})[key];
    return f !== undefined ? f : key;
  };

  /* ---------- line icons (spec §2.4: line-style, copper) ---------- */
  const P = {
    star8: '<rect x="7.2" y="7.2" width="9.6" height="9.6"/><rect x="7.2" y="7.2" width="9.6" height="9.6" transform="rotate(45 12 12)"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M8.5 5.8v12.4L19 12z" fill="currentColor" stroke="none"/>',
    chevron: '<path d="M9.5 6l6 6-6 6"/>',
    arrow: '<path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9"/>',
    dome: '<path d="M5.5 20v-6a6.5 6.5 0 0 1 13 0v6"/><path d="M3.5 20h17"/><path d="M12 7.5V4.8"/><circle cx="12" cy="3.8" r="1"/><path d="M12 20v-4.5"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7.8l3.2 4.2-3.2 4.2L8.8 12z"/>',
    sword: '<path d="M5.5 18.5l2 .5L18.5 8l-2.5-2.5L6 16.5l-.5 2z"/><path d="M14.5 4.5l5 5"/>',
    map: '<path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5l-6-2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    wheat: '<path d="M12 21V8"/><path d="M12 12c-2.8 0-4-1.6-4-4 2.8 0 4 1.6 4 4z"/><path d="M12 12c2.8 0 4-1.6 4-4-2.8 0-4 1.6-4 4z"/><path d="M12 16c-2.8 0-4-1.6-4-4 2.8 0 4 1.6 4 4z"/><path d="M12 16c2.8 0 4-1.6 4-4-2.8 0-4 1.6-4 4z"/><path d="M12 8c0-2 .6-3.4 1.8-4.5.3 2-.4 3.5-1.8 4.5z"/>',
    wood: '<ellipse cx="7.5" cy="12" rx="3" ry="5.5"/><path d="M7.5 6.5h9.5a3 3 0 0 1 0 11H7.5"/><path d="M7.5 17.5a3 5.5 0 0 1 0-11"/>',
    stone: '<path d="M8 4.5l6 1 5 5.5-2 8-8.5 1L4 14z"/><path d="M12 5.5L10 12l-5.5 2"/><path d="M10 12l7.5 1"/>',
    iron: '<path d="M7.5 9.5h9L20 17.5H4z"/><path d="M10 5h4l1.2 4.5H8.8z"/>',
    silver: '<circle cx="12" cy="12" r="8"/><path d="M14.5 8.3a4.7 4.7 0 1 0 0 7.4"/>',
    ruby: '<path d="M8.5 4.5h7L19.5 9l-7.5 10.5L4.5 9z"/><path d="M4.5 9h15M12 4.5L9.5 9l2.5 10.5L14.5 9z"/>',
    spear: '<path d="M4.5 19.5l12-12"/><path d="M13.5 5.5l5 5-2.6.4L14 8.1z"/>',
    bow: '<path d="M6.5 4.5c5.5 2.5 5.5 12.5 0 15"/><path d="M6.5 4.5v15"/><path d="M6.5 12h11"/><path d="M17.5 12l-2.2-2.2M17.5 12l-2.2 2.2"/>',
    horse: '<path d="M7.5 21c0-4.5 1-7.5 3.5-9.5L12.5 7l.8 2c2.8.6 4.2 2.4 4.2 4.6l-2.8-.9-.7 2.4c-.5 3.3-2.3 4.9-4.5 4.9z"/><circle cx="14.6" cy="11.2" r=".6" fill="currentColor" stroke="none"/><path d="M12.5 7l1-2.5 1.5 2"/>',
    trebuchet: '<path d="M4.5 20L12 6.5l7.5 13.5"/><path d="M3.5 20h17"/><path d="M12 6.5l5.5-3.2"/><circle cx="18.5" cy="3.3" r="1.4"/><path d="M12 6.5l-4 2"/>',
    market: '<path d="M5 20V9l2.5-4h9L19 9v11"/><path d="M3.5 9h17"/><path d="M9.5 20v-5.5h5V20"/><path d="M3.5 20h17"/>',
    alliance: '<circle cx="9.2" cy="12" r="5.3"/><circle cx="14.8" cy="12" r="5.3"/>',
    fort: '<path d="M6.5 20V8L8 9.2 9.5 8l1.5 1.2L12.5 8l1.5 1.2L15.5 8 17 9.2V20"/><path d="M4 20h16"/><path d="M10.5 20v-5h3v5"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
    telegram: '<path d="M20.5 4.5L3.8 11.2l4.7 1.9L10.5 18l2.6-3.2 4.6 3.4z"/><path d="M8.5 13.1L17 6"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none"/>',
    x: '<path d="M4.5 4.5l15 15M19.5 4.5l-15 15"/>'
  };
  const svg = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;

  /* ---------- navigation (spec §3, §4) ---------- */
  const NAV = [
    ["index.html", "home", "خانه"],
    ["city.html", "city", "شهر"],
    ["resources.html", "resources", "منابع"],
    ["army.html", "army", "ارتش و نبرد"],
    ["world.html", "world", "جهان بازی"],
    ["progress.html", "progress", "روند توسعه"],
    ["news.html", "news", "اخبار"],
    ["team.html", "team", "تیم"]
  ];

  /* ---------- chrome injection ---------- */
  function headerHTML() {
    const page = document.body.dataset.page;
    const links = NAV.map(([href, key, fa]) =>
      `<a class="nav-link" href="${href}" data-i18n="nav.${key}"${key === page ? ' aria-current="page"' : ""}>${fa}</a>`
    ).join("");
    const mmLinks = NAV.map(([href, key, fa]) =>
      `<a class="mm-link" href="${href}" data-i18n="nav.${key}"${key === page ? ' aria-current="page"' : ""}>${fa}</a>`
    ).join("");
    const langSwitch = `
      <div class="lang-switch" role="group" aria-label="Language / زبان">
        <button type="button" class="lang-btn" data-lang="fa" aria-pressed="true">فا</button>
        <button type="button" class="lang-btn" data-lang="en" aria-pressed="false">EN</button>
      </div>`;
    return `
    <div class="header-inner container">
      <a class="logo" href="index.html" aria-label="Monji Games">
        <span class="logo-mark">${svg("star8")}</span>
        <span class="logo-text"><b>منجی گیمز</b><i>MONJI&nbsp;GAMES</i></span>
      </a>
      <nav class="main-nav" aria-label="ناوبری اصلی">${links}</nav>
      <div class="header-actions">
        ${langSwitch}
        <button type="button" class="btn btn-primary btn-sm js-follow" data-i18n="cta.follow">دنبال‌کردن پروژه</button>
        <button type="button" class="menu-btn js-menu" aria-label="باز کردن منو" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <div class="mm-top">
        ${langSwitch}
        <button type="button" class="btn btn-primary btn-sm js-follow" data-i18n="cta.follow">دنبال‌کردن پروژه</button>
      </div>
      ${mmLinks}
    </div>`;
  }

  function footerHTML() {
    const links = NAV.map(([href, key, fa]) =>
      `<li><a href="${href}" data-i18n="nav.${key}">${fa}</a></li>`
    ).join("");
    const social = (icon, name) =>
      `<a class="social-btn" href="#" aria-label="${name}" title="به‌زودی">${svg(icon)}</a>`;
    return `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="index.html" aria-label="Monji Games">
            <span class="logo-mark">${svg("star8")}</span>
            <span class="logo-text"><b>منجی گیمز</b><i>MONJI&nbsp;GAMES</i></span>
          </a>
          <p data-i18n="footer.desc">استودیوی منجی گیمز — یک بازی حکومت‌سازی تاریخی، در حال ساخت در ایران‌زمین.</p>
        </div>
        <div class="footer-col">
          <h4 data-i18n="footer.links">پیوندهای سریع</h4>
          <ul class="footer-links">${links}</ul>
        </div>
        <div class="footer-col">
          <h4 data-i18n="footer.social">شبکه‌های اجتماعی</h4>
          <div class="social-row">
            ${social("telegram", "تلگرام")}${social("youtube", "یوتیوب")}${social("instagram", "اینستاگرام")}${social("x", "ایکس")}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span id="footerRights">© ۱۴۰۵ منجی گیمز. تمام حقوق محفوظ است.</span>
        <span class="footer-tagline" data-i18n="footer.tagline">ساخته‌شده برای آینده‌ای بهتر ✦</span>
      </div>
    </div>`;
  }

  function modalsHTML() {
    return `
    <div class="modal" id="followModal" role="dialog" aria-modal="true" aria-labelledby="followTitle">
      <div class="modal-backdrop js-modal-close"></div>
      <div class="modal-panel">
        <div class="modal-head">
          <h3 id="followTitle" data-i18n="follow.title">دنبال‌کردن پروژه</h3>
          <button type="button" class="modal-close js-modal-close" aria-label="بستن">${svg("close")}</button>
        </div>
        <div class="follow-body">
          <p class="follow-sub" data-i18n="follow.sub">اطلاعاتت را بگذار تا با شروع بتا، اولین نفری باشی که می‌دانی.</p>
          <form id="followForm" novalidate>
            <div class="field">
              <label for="fName" data-i18n="follow.name">نام و نام‌خانوادگی</label>
              <input type="text" id="fName" name="name" autocomplete="name" data-i18n-ph="follow.name.ph" placeholder="مثلاً: امین کریمی" required>
            </div>
            <div class="field">
              <label for="fEmail" data-i18n="follow.email">ایمیل</label>
              <input type="email" id="fEmail" name="email" autocomplete="email" data-i18n-ph="follow.email.ph" placeholder="you@example.com" required>
            </div>
            <div class="field">
              <label for="fLang" data-i18n="follow.lang">زبان ترجیحی</label>
              <select id="fLang" name="preferredLanguage">
                <option value="FA" selected>فارسی</option>
                <option value="EN">English</option>
              </select>
            </div>
            <div class="check-field">
              <label class="check">
                <input type="checkbox" id="fConsent" name="consent">
                <span data-i18n="follow.consent">کپی از اخبار و Devlog به ایمیل‌م بفرست (اختیاری)</span>
              </label>
            </div>
            <button type="submit" class="btn btn-primary" data-i18n="follow.submit">ثبت درخواست</button>
            <p class="form-status" id="followStatus" role="status"></p>
            <p class="demo-note" data-i18n="follow.demoNote">حالت نمایش — در اتصال نهایی، داده‌ها در گوگل‌شیت تیم ذخیره می‌شوند.</p>
          </form>
          <div class="success-box" id="followSuccess" hidden>
            <span class="s-icon">${svg("check")}</span>
            <p data-i18n="follow.success">درخواستت ثبت شد؛ منتظر خبرهای منجی باش.</p>
            <button type="button" class="btn btn-outline btn-sm js-modal-close" data-i18n="modal.close">بستن</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal" id="videoModal" role="dialog" aria-modal="true" aria-labelledby="videoTitle">
      <div class="modal-backdrop js-modal-close"></div>
      <div class="modal-panel">
        <div class="modal-head">
          <h3 id="videoTitle">Devlog</h3>
          <button type="button" class="modal-close js-modal-close" aria-label="بستن">${svg("close")}</button>
        </div>
        <div id="videoBody"></div>
      </div>
    </div>`;
  }

  function injectChrome() {
    const h = $("#siteHeader");
    const f = $("#siteFooter");
    const m = $("#modals");
    if (h) h.innerHTML = headerHTML();
    if (f) f.innerHTML = footerHTML();
    if (m) m.innerHTML = modalsHTML();
  }

  /* ---------- i18n ---------- */
  function captureFa() {
    I18N.fa = I18N.fa || {};
    $$("[data-i18n]").forEach((el) => {
      const k = el.dataset.i18n;
      if (I18N.fa[k] === undefined) I18N.fa[k] = el.textContent;
    });
    $$("[data-i18n-html]").forEach((el) => {
      const k = el.dataset.i18nHtml;
      if (I18N.fa[k] === undefined) I18N.fa[k] = el.innerHTML;
    });
  }

  function applyI18n() {
    const root = document.documentElement;
    root.lang = MJ.lang;
    root.dir = MJ.lang === "fa" ? "rtl" : "ltr";
    const dict = I18N[MJ.lang] || {};
    $$("[data-i18n]").forEach((el) => {
      const v = dict[el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });
    $$("[data-i18n-html]").forEach((el) => {
      const v = dict[el.dataset.i18nHtml];
      if (v !== undefined) el.innerHTML = v;
    });
    $$("[data-i18n-ph]").forEach((el) => {
      const v = dict[el.dataset.i18nPh];
      if (v !== undefined) el.placeholder = v;
    });
    $$(".lang-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === MJ.lang)));
  }

  function setFooterRights() {
    const el = document.getElementById("footerRights");
    if (!el) return;
    try {
      if (MJ.lang === "fa") {
        const y = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());
        el.textContent = `© ${y} منجی گیمز. تمام حقوق محفوظ است.`;
      } else {
        const y = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(new Date());
        el.textContent = `© ${y} Monji Games. All rights reserved.`;
      }
    } catch (e) {
      el.textContent = MJ.lang === "fa" ? "© منجی گیمز" : "© Monji Games";
    }
  }

  function setLang(lang) {
    if (lang !== "fa" && lang !== "en" || lang === MJ.lang) return;
    MJ.lang = lang;
    localStorage.setItem("mj_lang", lang);
    applyI18n();
    setFooterRights();
    renderDynamic();
  }

  /* ---------- data layer (spec §7) ---------- */
  async function loadData() {
    if (MJ.data) return MJ.data;
    let data = null;
    if (MJ.config.apiUrl) {
      try {
        const r = await fetch(MJ.config.apiUrl, { cache: "no-store" });
        if (r.ok) data = await r.json();
      } catch (e) {
        console.warn("[Monji] live API unavailable, falling back to local data.", e);
      }
    }
    if (!data) {
      try {
        const r = await fetch(MJ.config.dataUrl, { cache: "no-store" });
        data = await r.json();
      } catch (e) {
        data = window.MJ_FALLBACK_DATA || null;
      }
    }
    MJ.data = data || { progress: null, team: [], devlogs: [], buildings: [] };
    return MJ.data;
  }

  /* ---------- modals ---------- */
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("open");
    document.body.classList.add("no-scroll");
    const c = m.querySelector(".modal-close");
    if (c) c.focus({ preventScroll: true });
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove("open");
    const iframe = m.querySelector("iframe");
    if (iframe) iframe.src = "about:blank";
    if (!document.querySelector(".modal.open")) document.body.classList.remove("no-scroll");
  }
  function ytId(url) {
    const m = String(url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function openVideo(log) {
    const body = document.getElementById("videoBody");
    const title = document.getElementById("videoTitle");
    if (title) title.textContent = pick(log, "title");
    const id = ytId(log.video);
    body.innerHTML = id
      ? `<div class="vm-frame"><iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="${esc(pick(log, "title"))}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : `<div class="vm-ph"><img src="${esc(log.thumbnail)}" alt=""><p>${esc(label("news.video.ph"))}</p></div>`;
    openModal("videoModal");
  }

  /* ---------- chrome behaviour ---------- */
  function bindChrome() {
    const header = $("#siteHeader");
    const onScroll = () => header.classList.toggle("solid", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const menuBtn = $(".menu-btn");
    const menu = document.getElementById("mobileMenu");
    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      menuBtn.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("no-scroll", open);
    };
    menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$(".mm-link", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

    $$(".lang-btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  }

  function bindInteractions() {
    document.addEventListener("click", (e) => {
      const play = e.target.closest(".js-play");
      if (play) {
        e.preventDefault();
        const idx = +play.dataset.idx;
        const log = MJ._newsList && MJ._newsList[idx];
        if (log) openVideo(log);
        return;
      }
      const close = e.target.closest(".js-modal-close");
      if (close) {
        closeModal(close.closest(".modal"));
        return;
      }
      const follow = e.target.closest(".js-follow");
      if (follow) {
        openModal("followModal");
        const sel = document.getElementById("fLang");
        if (sel) sel.value = MJ.lang.toUpperCase();
        const form = document.getElementById("followForm");
        const done = document.getElementById("followSuccess");
        if (form && done) {
          form.hidden = false;
          done.hidden = true;
          const st = document.getElementById("followStatus");
          if (st) { st.textContent = ""; st.className = "form-status"; }
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const m = document.querySelector(".modal.open");
        if (m) closeModal(m);
        return;
      }
      const t = e.target;
      if (t && t.classList && t.classList.contains("js-play") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        const idx = +t.dataset.idx;
        const log = MJ._newsList && MJ._newsList[idx];
        if (log) openVideo(log);
      }
    });

    const form = document.getElementById("followForm");
    if (form) form.addEventListener("submit", onFollowSubmit);
  }

  async function onFollowSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const status = document.getElementById("followStatus");
    const payload = {
      name: document.getElementById("fName").value.trim(),
      email: document.getElementById("fEmail").value.trim(),
      preferredLanguage: document.getElementById("fLang").value,
      consent: document.getElementById("fConsent").checked
    };
    if (!payload.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      if (status) { status.textContent = label("follow.error"); status.className = "form-status err"; }
      return;
    }
    if (status) status.textContent = "";
    try {
      if (MJ.config.apiUrl) {
        /* text/plain avoids a CORS preflight (Apps Script cannot answer OPTIONS) */
        const r = await fetch(MJ.config.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
        const j = await r.json().catch(() => ({}));
        if (!j.ok) throw new Error("api");
      } else {
        console.info("[Monji] demo mode — registration payload:", payload);
        await new Promise((res) => setTimeout(res, 450));
      }
      form.hidden = true;
      document.getElementById("followSuccess").hidden = false;
    } catch (err) {
      console.error("[Monji] registration failed", err);
      if (status) { status.textContent = label("follow.error"); status.className = "form-status err"; }
    }
  }

  /* ---------- reveal + ring animation ---------- */
  function initReveal() {
    const els = $$(".reveal:not(.in)");
    const finish = (el) => {
      el.classList.add("in");
      if (el.querySelector && el.querySelector("#ringFg")) animateRing();
    };
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(finish);
      return;
    }
    const io = new IntersectionObserver(
      (ents) => ents.forEach((en) => {
        if (!en.isIntersecting) return;
        finish(en.target);
        io.unobserve(en.target);
      }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  function animateRing() {
    if (MJ._ringDone) return;
    MJ._ringDone = true;
    const fg = document.getElementById("ringFg");
    const num = document.getElementById("ringNum");
    if (!fg || !MJ._ringPct) return;
    const C = 2 * Math.PI * 86;
    const target = C * (1 - MJ._ringPct / 100);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fg.style.strokeDashoffset = String(target);
    }));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (num) num.textContent = fmtPct(MJ._ringPct);
      return;
    }
    const t0 = performance.now();
    const dur = 1500;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      if (num) num.textContent = fmtPct(Math.round(MJ._ringPct * eased));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- page renderers ---------- */
  function renderDynamic() {
    const page = document.body.dataset.page;
    if (page === "home") renderHome();
    if (page === "city") renderCity();
    if (page === "army") renderCycle();
    if (page === "progress") renderProgress();
    if (page === "team") renderTeam();
    if (page === "news") renderNews();
  }

  function renderHome() {
    const d = MJ.data && MJ.data.progress;
    if (!d) return;
    const bar = $("#homeBar .tp-fill");
    if (bar) bar.style.setProperty("--p", d.overallPercent + "%");
    const pct = document.getElementById("homeBarPct");
    if (pct) pct.textContent = fmtPct(d.overallPercent);
  }

  function renderCity() {
    const wrap = document.getElementById("buildingsGrid");
    const tabs = $$("#cityTabs .tab");
    if (!wrap) return;
    const active = MJ._cityTab || "government";
    tabs.forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.tab === active));
      tab.addEventListener("click", () => {
        if (MJ._cityTab === tab.dataset.tab) return;
        MJ._cityTab = tab.dataset.tab;
        renderCity();
      });
    });
    const items = (MJ.data.buildings || []).filter((b) => b.category === active);
    wrap.innerHTML = items.length
      ? items.map(itemCard).join("")
      : `<p class="center">—</p>`;
  }

  function itemCard(b) {
    return `
    <article class="card item-card">
      <span class="ic-media"><img src="${esc(b.image)}" alt="${esc(pick(b, "name"))}" loading="lazy" ${b.filter ? `style="filter:${esc(b.filter)}"` : ""}></span>
      <span class="ic-body">
        <h3 class="ic-name">${esc(pick(b, "name"))}</h3>
        <p class="ic-line">${esc(pick(b, "line"))}</p>
        <span class="ic-chevron">${svg("chevron")}</span>
      </span>
    </article>`;
  }

  function renderCycle() {
    const host = document.getElementById("cycleSvg");
    if (!host) return;
    const nodes = [
      { key: "army.u1.t", icon: "spear", x: 210, y: 82 },
      { key: "army.u2.t", icon: "bow", x: 320.85, y: 274 },
      { key: "army.u3.t", icon: "horse", x: 99.15, y: 274 }
    ];
    const badges = [
      { x: 320.8, y: 146 },
      { x: 210, y: 338 },
      { x: 99.2, y: 146 }
    ];
    const arcs = [
      "M 266.1 94.9 A 128 128 0 0 1 337.7 218.9",
      "M 281.6 316.1 A 128 128 0 0 1 138.4 316.1",
      "M 82.3 218.9 A 128 128 0 0 1 153.9 94.9"
    ];
    const x15 = MJ.lang === "fa" ? "×۱.۵" : "×1.5";
    const iconG = (n) =>
      `<g transform="translate(${n.x - 19} ${n.y - 27}) scale(1.58)" fill="none" stroke="#C17A4C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${P[n.icon]}</g>`;
    host.innerHTML = `
    <svg viewBox="0 0 420 420" role="img" aria-label="${esc(label("army.cycle.h"))}">
      <defs>
        <marker id="cycArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#C17A4C"></path>
        </marker>
      </defs>
      ${arcs.map((d) => `<path d="${d}" fill="none" stroke="rgba(193,122,76,.55)" stroke-width="2.5" marker-end="url(#cycArr)"/>`).join("")}
      ${badges.map((b) => `
        <circle cx="${b.x}" cy="${b.y}" r="17" fill="#0B1F1A" stroke="rgba(193,122,76,.5)" stroke-width="1.2"></circle>
        <text x="${b.x}" y="${b.y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#DA9762">${x15}</text>`).join("")}
      ${nodes.map((n) => `
        <circle cx="${n.x}" cy="${n.y}" r="52" fill="#122A24" stroke="rgba(193,122,76,.55)" stroke-width="1.5"></circle>
        ${iconG(n)}
        <text x="${n.x}" y="${n.y + 37}" text-anchor="middle" font-size="13" font-weight="700" fill="#E8D9B3">${esc(label(n.key))}</text>`).join("")}
      <text x="210" y="204" text-anchor="middle" font-size="13" fill="#E8D9B3" font-weight="700">${esc(label("army.cycle.short"))}</text>
      <text x="210" y="226" text-anchor="middle" font-size="12" fill="#DA9762" font-weight="900">${esc(label("army.cycle.center"))}</text>
    </svg>`;
  }

  function renderProgress() {
    const d = MJ.data && MJ.data.progress;
    if (!d) return;
    MJ._ringPct = d.overallPercent;
    const fg = document.getElementById("ringFg");
    if (fg) {
      const C = 2 * Math.PI * 86;
      fg.style.strokeDashoffset = String(C * (1 - d.overallPercent / 100));
    }
    const num = document.getElementById("ringNum");
    if (num) num.textContent = fmtPct(d.overallPercent);
    const rows = document.getElementById("progressRows");
    if (rows) {
      rows.innerHTML = (d.sections || []).map((s) => `
        <div class="thin-progress">
          <span class="tp-name">${esc(pick(s, "name"))}</span>
          <span class="tp-bar"><span class="tp-fill" style="--p:${s.percent}%"></span></span>
          <span class="tp-pct">${fmtPct(s.percent)}</span>
        </div>`).join("");
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("cardFocus", pick(d, "currentFocus"));
    set("cardLast", pick(d, "lastChange"));
    set("cardNext", pick(d, "nextStep"));
    if (!MJ._ringDone) animateRing();
  }

  function renderTeam() {
    const grid = document.getElementById("teamGrid");
    if (!grid) return;
    const team = (MJ.data.team || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const card = (m) => {
      const portrait = m.portrait || (m.gender === "F" ? "images/team-sil-female.png" : "images/team-sil-male.png");
      return `
      <figure class="team-card">
        <span class="tc-media"><img src="${esc(portrait)}" alt="${esc(pick(m, "name"))}" loading="lazy"></span>
        <figcaption>
          <h3>${esc(pick(m, "name"))}</h3>
          <p>${esc(pick(m, "role"))}</p>
        </figcaption>
      </figure>`;
    };
    grid.innerHTML = `
      <div class="team-row team-row-5">${team.slice(0, 5).map(card).join("")}</div>
      <div class="team-row team-row-4">${team.slice(5).map(card).join("")}</div>`;
  }

  function renderNews() {
    const slot = document.getElementById("featuredSlot");
    const grid = document.getElementById("devlogGrid");
    if (!slot || !grid) return;
    const logs = MJ.data.devlogs || [];
    const cat = MJ._newsCat || "all";
    const filtered = cat === "all" ? logs : logs.filter((l) => l.category === cat);
    MJ._newsList = filtered;
    $$("#newsFilters .pill").forEach((p) => p.classList.toggle("active", p.dataset.cat === cat));
    const featured = filtered.find((l) => l.featured) || filtered[0];
    const rest = filtered.filter((l) => l !== featured);
    slot.innerHTML = featured ? featuredCard(featured, filtered.indexOf(featured)) : `<p class="center" style="padding:20px">${esc(label("news.none"))}</p>`;
    grid.innerHTML = rest.map((l) => thumbCard(l, filtered.indexOf(l))).join("");
  }

  function catChip(l) {
    return `<span class="chip">${esc(label("news.f." + l.category))}</span>`;
  }
  function fmtDate(iso) {
    const d = new Date(String(iso).slice(0, 10) + "T12:00:00");
    try {
      if (isNaN(d.getTime())) return String(iso);
      if (MJ.lang === "fa") return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(d);
      return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
    } catch (e) {
      return String(iso);
    }
  }

  function featuredCard(l, idx) {
    return `
    <div class="feat-media js-play" data-idx="${idx}" role="button" tabindex="0" aria-label="${esc(label("news.watch"))}: ${esc(pick(l, "title"))}">
      <img src="${esc(l.thumbnail)}" alt="${esc(pick(l, "title"))}">
      <span class="play-btn">${svg("play")}</span>
    </div>
    <div class="feat-body">
      <div class="feat-meta">${catChip(l)}<span>${esc(fmtDate(l.date))}</span></div>
      <p class="feat-label">${esc(label("news.featured"))}</p>
      <h3>${esc(pick(l, "title"))}</h3>
      <p>${esc(pick(l, "description"))}</p>
      <button type="button" class="btn btn-primary btn-sm js-play" data-idx="${idx}">${esc(label("news.watch"))}</button>
    </div>`;
  }

  function thumbCard(l, idx) {
    return `
    <article class="card thumb-card js-play" data-idx="${idx}" role="button" tabindex="0" aria-label="${esc(label("news.watch"))}: ${esc(pick(l, "title"))}">
      <span class="t-media">
        <img src="${esc(l.thumbnail)}" alt="${esc(pick(l, "title"))}" loading="lazy">
        <span class="t-play">${svg("play")}</span>
      </span>
      <span class="t-body">
        <div class="feat-meta">${catChip(l)}<span>${esc(fmtDate(l.date))}</span></div>
        <h3>${esc(pick(l, "title"))}</h3>
        <p>${esc(pick(l, "description"))}</p>
      </span>
    </article>`;
  }

  /* ---------- init ---------- */
  function init() {
    injectChrome();
    captureFa();
    applyI18n();
    setFooterRights();
    bindChrome();
    bindInteractions();

    $$("#newsFilters .pill").forEach((p) =>
      p.addEventListener("click", () => {
        MJ._newsCat = p.dataset.cat;
        renderNews();
      })
    );

    loadData()
      .then(() => {
        renderDynamic();
        initReveal();
      })
      .catch((e) => console.error("[Monji] data load failed", e));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
