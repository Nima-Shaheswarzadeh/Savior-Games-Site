/* Monji Games — runtime v2 (rebuilt to match the reference screenshots).
   Injects chrome (header/footer/modals), applies i18n, loads live data
   (Google Sheet → local JSON → fallback) and renders every dynamic section. */
(function () {
  'use strict';

  /* ---------- config ---------- */
  var MJ = window.MJ_CONFIG || {};
  var I18N = window.MJ_I18N || { fa: {}, en: {} };
  var DATA_URL = 'data/site-data.json';
  var LS_LANG = 'mj_lang';
  var lang = 'fa';
  try { lang = (localStorage.getItem(LS_LANG) === 'en') ? 'en' : 'fa'; } catch (e) {}

  var t = function (key) {
    return (I18N[lang] && I18N[lang][key]) != null ? I18N[lang][key] : ((I18N.fa && I18N.fa[key]) != null ? I18N.fa[key] : key);
  };
  var L = function (obj, base) {
    if (!obj) return '';
    return (lang === 'fa' ? obj[base + '_fa'] : obj[base + '_en']) || (lang === 'fa' ? obj[base + '_en'] : obj[base + '_fa']) || '';
  };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- icons ---------- */
  var FILLED = { crown: 1, play: 1 };
  var ICONS = {
    crown: '<path d="M2.6 18.6 4.2 8.2l4.4 3.6L12 4.6l3.4 7.2 4.4-3.6 1.6 10.4zM3.6 20h16.8"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    arrow: '<path d="M4 12h14M13 6l6 6-6 6"/>',
    diamond: '<path d="M12 3l7 9-7 9-7-9z"/>',
    rook: '<path d="M6 13V6h3v2.5h2V6h2v2.5h2V6h3v7l-2.2 2.2V20H8.2v-4.8zM8.2 20h7.6M4 20h16"/>',
    coins: '<circle cx="9" cy="9" r="5.5"/><path d="M14.8 8.2a5.5 5.5 0 1 1-6.6 6.6M9 6.8v4.4l3 1.7"/>',
    swords: '<path d="M3.5 3.5 11 11M3.5 3.5v3M3.5 3.5h3M20.5 3.5 13 11M20.5 3.5v3M20.5 3.5h-3M7.5 13.5 3.5 17.5l3 3 4-4M16.5 13.5l4 4-3 3-4-4M8.5 15.5l-3 3M15.5 15.5l3 3"/>',
    wheat: '<path d="M12 22V8M12 8C9 8 7.5 6 7.5 3 10.5 3 12 5 12 8zM12 8c3 0 4.5-2 4.5-5C13.5 3 12 5 12 8zM12 13c-3 0-4.5-2-4.5-5 3 0 4.5 2 4.5 5zM12 13c3 0 4.5-2 4.5-5-3 0-4.5 2-4.5 5zM12 18c-3 0-4.5-2-4.5-5 3 0 4.5 2 4.5 5zM12 18c3 0 4.5-2 4.5-5-3 0-4.5 2-4.5 5z"/>',
    wood: '<path d="M12 2.5 17 9h-3.2l4.2 6.5h-4l3.5 5.5H6.5L10 15.5H6L10.2 9H7zM12 21.5V23"/>',
    stone: '<path d="M3.5 20 9.5 6.5 13 13.5l2.5-4L20.5 20zM9.5 6.5 13 13.5"/>',
    iron: '<path d="M3 21l6.5-6.5M9 15l-2-2 4.5-4.5 4 4 2-2-6-6L7.5 8zM14.5 7.5l2-2 4 4-2 2z"/>',
    silver: '<path d="M4.5 14.5 7 8.5h4.5l2.5 6M12.5 14.5 15 8.5h4.5l2.5 6M4.5 14.5H14M12.5 14.5H22M5.5 14.5V19h7v-4.5M13.5 14.5V19h7v-4.5"/>',
    ruby: '<path d="M6.5 4h11L21 9 12 20.5 3 9zM3 9h18M6.5 4 9.5 9M17.5 4 14.5 9M9.5 9 12 20.5M14.5 9 12 20.5"/>',
    market: '<path d="M4 8.5 5.5 4h13L20 8.5M4 8.5h16v2.6a2.55 2.55 0 0 1-5.1 0 2.55 2.55 0 0 1-5.2 0A2.55 2.55 0 0 1 4 11.1zM5.5 13v7.5h13V13M10 20.5v-5h4v5"/>',
    alliance: '<path d="M6.5 21V4M6.5 5h10.5l-2.3 3.2L17 11.5H6.5M6.5 8.7h10.5"/>',
    fort: '<path d="M4 20.5V10l2-1.8V6h2.5v1.8h3V6h3v1.8h2.5V6H19v2.2l2 1.8v10.5M9.5 20.5v-5.5h5v5.5M2.5 20.5h19"/>',
    helmet: '<path d="M6 20a6.2 6.2 0 0 1-1.2-12A8.2 8.2 0 0 1 20 14.5V20H6zM4 13.5h2M18 13.5h2M9 12.5h6M9 16.5h6M12 5.8V3.5"/>',
    play: '<path d="M8 5.5v13l11-6.5z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.4 8.2-8 9.4C7.4 20.2 4 17 4 12V6z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><path d="M12 1.5V4M12 20v2.5M1.5 12H4M20 12h2.5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    steps: '<path d="M3.5 20.5h4.5v-4.5h4.5V11.5H17V7h4.5"/>'
  };

  function svg(name, cls) {
    var body = ICONS[name] || '';
    var attrs = FILLED[name]
      ? 'fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"'
      : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" ' + attrs + ' aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* ---------- data ---------- */
  var DATA = null;
  function loadData() {
    return fetch(DATA_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () {
        return Promise.resolve(window.MJ_FALLBACK_DATA || null);
      });
  }

  function postRecord(table, record) {
    if (MJ.apiUrl) {
      return fetch(MJ.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ table: table, record: record })
      })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch(function () { return storeLocal(table, record); });
    }
    return Promise.resolve(storeLocal(table, record));
  }
  function storeLocal(table, record) {
    try {
      var key = 'mj_records_' + table;
      var arr = JSON.parse(localStorage.getItem(key) || '[]');
      record._at = new Date().toISOString();
      arr.push(record);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* storage unavailable */ }
    return record;
  }

  /* ---------- chrome (header / footer / modals) ---------- */
  var NAV = [
    { key: 'nav.home', href: 'index.html', id: 'home' },
    { key: 'nav.about', href: 'index.html#about', id: 'about' },
    { key: 'nav.world', href: 'world.html', id: 'world' },
    { key: 'nav.members', href: 'team.html', id: 'members' },
    { key: 'nav.media', href: 'news.html', id: 'media' },
    { key: 'nav.contact', href: '#contact', id: 'contact' }
  ];

  function logoHtml() {
    return '<span class="logo-crown">' + svg('crown') + '</span>' +
      '<span class="logo-stack"><span class="logo-name">' + esc(lang === 'fa' ? 'منجی' : 'Monji') + '</span>' +
      '<span class="logo-sub">MANJI GAMES</span></span>';
  }

  function chromeHtml(pageId) {
    var navLinks = NAV.map(function (n) {
      var cur = n.id === pageId ? ' aria-current="page"' : '';
      var href = n.id === 'contact' ? '#' + n.id : n.href;
      return '<a class="nav-link" href="' + href + '"' + cur + ' data-i18n="' + n.key + '"></a>';
    }).join('');
    var mmLinks = NAV.map(function (n) {
      var cur = n.id === pageId ? ' aria-current="page"' : '';
      var href = n.id === 'contact' ? '#' + n.id : n.href;
      return '<a class="mm-link" href="' + href + '"' + cur + ' data-i18n="' + n.key + '"></a>';
    }).join('');

    return (
      '<a class="skip" href="#main" data-i18n="a11y.skip"></a>' +
      '<header class="site-header"><div class="container header-inner">' +
        '<a class="logo" href="index.html" aria-label="Monji Games">' + logoHtml() + '</a>' +
        '<nav class="nav-main" aria-label="Main navigation">' + navLinks + '</nav>' +
        '<div class="header-end">' +
          '<button class="lang-toggle" id="langBtn" data-i18n-aria="a11y.lang" type="button">' +
            svg('globe') + '<span class="lang-label"></span>' + svg('chevron', 'lang-chev') +
          '</button>' +
          '<button class="btn btn-gold btn-sm" type="button" data-open-modal="beta" data-i18n="nav.beta"></button>' +
          '<button class="menu-btn" id="menuBtn" aria-expanded="false" data-i18n-aria="a11y.menu" type="button"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div></header>' +
      '<nav class="mobile-menu" id="mobileMenu" aria-label="Main navigation mobile">' +
        '<div class="mm-top">' +
          '<a class="logo" href="index.html">' + logoHtml() + '</a>' +
          '<button class="btn btn-gold btn-sm" type="button" data-open-modal="beta" data-i18n="nav.beta"></button>' +
        '</div>' + mmLinks +
      '</nav>'
    );
  }

  function footerHtml() {
    return (
      '<footer class="site-footer" id="contact">' +
        '<div class="container">' +
          '<div class="footer-quote">' +
            '<div class="ornament">' + svg('diamond') + '</div>' +
            '<p class="f-text">' + svg('diamond') + '<span data-i18n="quote.text"></span></p>' +
            '<div class="q-en" data-i18n="quote.en"></div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<div class="footer-brand">' +
              '<a class="logo" href="index.html">' + logoHtml() + '</a>' +
              '<span class="fb-tag" data-i18n="footer.tag"></span>' +
            '</div>' +
            '<div class="footer-legal" data-i18n="footer.rights"></div>' +
          '</div>' +
        '</div>' +
      '</footer>'
    );
  }

  function modalsHtml() {
    return (
      '<div class="modal" id="betaModal" role="dialog" aria-modal="true" aria-labelledby="betaModalTitle">' +
        '<div class="modal-backdrop" data-close-modal></div>' +
        '<div class="modal-panel">' +
          '<div class="modal-head"><h3 id="betaModalTitle" data-i18n="modal.betaTitle"></h3>' +
          '<button class="modal-close" data-close-modal data-i18n-aria="a11y.close" type="button">' + svg('close') + '</button></div>' +
          '<div class="follow-body">' +
            '<p class="follow-sub" data-i18n="modal.betaSub"></p>' +
            '<form id="betaForm" novalidate>' +
              '<div class="field"><label for="betaName" data-i18n="modal.name"></label>' +
              '<input type="text" id="betaName" name="name" required autocomplete="name"></div>' +
              '<div class="field"><label for="betaEmail" data-i18n="modal.email"></label>' +
              '<input type="email" id="betaEmail" name="email" required autocomplete="email"></div>' +
              '<div class="field"><label for="betaRole" data-i18n="modal.role"></label>' +
              '<select id="betaRole" name="role">' +
                '<option value="government" data-i18n="role.government"></option>' +
                '<option value="military" data-i18n="role.military"></option>' +
                '<option value="economy" data-i18n="role.economy"></option>' +
                '<option value="defense" data-i18n="role.defense"></option>' +
              '</select></div>' +
              '<div class="check-field"><label class="check"><input type="checkbox" name="updates" checked>' +
              '<span data-i18n="modal.news"></span></label></div>' +
              '<p class="form-status" id="betaStatus" role="status"></p>' +
              '<p class="demo-note" data-i18n="modal.demoNote"></p>' +
              '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
                '<button class="btn btn-gold" type="submit" data-i18n="modal.submit"></button>' +
                '<button class="btn btn-ghost" type="button" data-close-modal data-i18n="modal.cancel"></button>' +
              '</div>' +
            '</form>' +
            '<div class="success-box" id="betaSuccess" hidden>' +
              '<span class="s-icon">' + svg('crown') + '</span>' +
              '<p data-i18n="modal.betaSuccess"></p>' +
              '<p class="follow-sub" style="text-align:center" data-i18n="modal.betaSuccessSub"></p>' +
              '<button class="btn btn-gold" type="button" data-close-modal data-i18n="a11y.close"></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal" id="videoModal" role="dialog" aria-modal="true" aria-label="Video player">' +
        '<div class="modal-backdrop" data-close-modal></div>' +
        '<div class="modal-panel">' +
          '<div class="modal-head"><h3 id="videoModalTitle"></h3>' +
          '<button class="modal-close" data-close-modal data-i18n-aria="a11y.close" type="button">' + svg('close') + '</button></div>' +
          '<div id="videoFrame" class="vm-frame"></div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ---------- i18n apply ---------- */
  function applyLang() {
    var doc = document;
    doc.documentElement.setAttribute('lang', lang);
    doc.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    doc.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    doc.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    var titleKey = doc.body.getAttribute('data-title-key');
    if (titleKey) {
      doc.title = t(titleKey) + ' — ' + (lang === 'fa' ? 'منجی گیمز' : 'Monji Games');
    }
    var lb = doc.querySelector('.lang-label');
    if (lb) lb.textContent = lang === 'fa' ? 'FA' : 'EN';
  }
  function toggleLang() {
    lang = lang === 'fa' ? 'en' : 'fa';
    try { localStorage.setItem(LS_LANG, lang); } catch (e) {}
    applyLang();
    renderDataSection();
  }

  /* ---------- reveal ---------- */
  function setupReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }
  function observeNew(scope) {
    (scope || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: 0.12 });
        io.observe(el);
      } else el.classList.add('in');
    });
  }

  /* ---------- page renderers ---------- */
  function renderHome() {
    if (!DATA) return;
    var p = DATA.progress.overallPercent;
    var num = document.getElementById('homeStripNum');
    if (num) num.textContent = p + '%';
    var arc = document.getElementById('homeStripArc');
    if (arc) arc.style.strokeDashoffset = (326.73 * (1 - p / 100)).toFixed(2);
  }

  function renderCity() {
    var root = document.getElementById('cityContent');
    if (!root || !DATA || !DATA.city) return;
    var city = DATA.city;
    var tabs = city.tabs;
    var state = root._mjState || (root._mjState = { tab: tabs[0].id });

    var hero = city.heroes[state.tab === 'military' ? 'military' : 'default'] || city.heroes.default;
    var heroEl = document.getElementById('cityHero');
    if (heroEl) {
      var hc = heroEl.querySelector('.hero-copy');
      if (hc) hc.classList.toggle('hero-copy--end', state.tab === 'military');
      var img = heroEl.querySelector('img');
      if (img) img.src = hero.bg;
      var tt = heroEl.querySelector('[data-hero-title]'); if (tt) tt.textContent = L(hero, 'title');
      var ss = heroEl.querySelector('[data-hero-sub]'); if (ss) ss.textContent = L(hero, 'sub');
      var pp = heroEl.querySelector('[data-hero-para]'); if (pp) pp.textContent = L(hero, 'para');
    }

    var tabsEl = document.getElementById('cityTabs');
    if (tabsEl) {
      tabsEl.innerHTML = tabs.map(function (tab) {
        var sel = tab.id === state.tab ? 'true' : 'false';
        return '<button class="tab" type="button" role="tab" aria-selected="' + sel + '" data-tab="' + tab.id + '">' +
          '<span class="tab-text"><span class="tab-title">' + esc(L(tab, 'title')) + '</span>' +
          '<span class="tab-sub">' + esc(L(tab, 'sub')) + '</span></span>' +
          '<span class="tab-icon">' + svg(tab.icon) + '</span></button>';
      }).join('');
    }

    var lvl = city.levels[state.tab === 'military' ? 'army' : 'city'] || city.levels.city;
    var band = document.getElementById('cityLevel');
    if (band) {
      var arrows = lvl.stages.slice(0, -1).map(function () {
        return '<span class="lb-arrow">' + svg('arrow') + '</span>';
      }).join('');
      band.innerHTML =
        '<div class="lb-head"><h3 class="lb-title"><span>' + esc(L(lvl, 'title_part1')) + '</span><br>' + esc(L(lvl, 'title_part2')) + '</h3>' +
        '<p class="lb-sub">' + esc(L(lvl, 'sub')) + '</p></div>' +
        '<div class="lb-stages">' +
          lvl.stages.map(function (s, i) {
            var stage = '<div class="lb-stage' + (s.sm ? ' lb-stage--sm' : '') + '">' +
              '<img src="' + esc(s.image) + '" alt="' + esc(L(s, 'label')) + '" loading="lazy">' +
              '<span class="lb-label">' + esc(L(s, 'label')) + '</span></div>';
            return i < lvl.stages.length - 1 ? stage + arrows[i] : stage;
          }).join('') +
        '</div>';
    }

    var grid = document.getElementById('buildingsGrid');
    if (grid) {
      var items = city.buildings.filter(function (b) { b._l = b.tab === state.tab; return b._l; });
      grid.className = 'buildings-grid' + (items.length === 3 ? ' buildings-grid--3' : '');
      grid.innerHTML = items.map(function (b) {
        return '<article class="b-card reveal in">' +
          '<div class="b-media"><img src="' + esc(b.image) + '" alt="' + esc(L(b, 'name')) + '" loading="lazy"' +
          (b.filter ? ' style="filter:' + esc(b.filter) + '"' : '') + '></div>' +
          '<div class="b-body"><h3 class="b-name">' + esc(L(b, 'name')) + '</h3>' +
          '<p class="b-line">' + esc(L(b, 'line')) + '</p>' +
          '<div class="b-foot"><span class="chev">' + svg('chevron') + '</span></div></div>' +
        '</article>';
      }).join('');
    }
  }

  function renderResources() {
    var grid = document.getElementById('resourceGrid');
    if (!grid || !DATA || !DATA.resources) return;
    grid.innerHTML = DATA.resources.cards.map(function (c) {
      return '<article class="res-card reveal">' +
        '<div class="rc-text"><div class="rc-head">' + svg(c.icon) +
          '<h3 class="rc-name">' + esc(L(c, 'name')) + '</h3></div>' +
          '<p class="rc-line">' + esc(L(c, 'line')) + '</p>' +
          '<div class="rc-foot"><span class="chev">' + svg('chevron') + '</span></div></div>' +
        '<div class="rc-media"><img src="' + esc(c.image) + '" alt="' + esc(L(c, 'name')) + '" loading="lazy"></div>' +
      '</article>';
    }).join('');
  }

  function renderWorld() {
    var grid = document.getElementById('worldCards');
    if (!grid || !DATA || !DATA.world) return;
    grid.innerHTML = DATA.world.cards.map(function (c) {
      return '<article class="w-card reveal">' +
        '<div class="w-media"><img src="' + esc(c.image) + '" alt="' + esc(L(c, 'name')) + '" loading="lazy">' +
        '<span class="w-hex">' + svg(c.icon) + '</span></div>' +
        '<div class="w-body"><h3>' + esc(L(c, 'name')) + '</h3>' +
        '<p>' + esc(L(c, 'line')) + '</p>' +
        '<a class="w-link" href="index.html#about">' + '<span data-i18n="world.more"></span>' + svg('arrow') + '</a></div>' +
      '</article>';
    }).join('');
    applyLang();
  }

  function renderProgress() {
    if (!DATA || !DATA.progress) return;
    var p = DATA.progress;
    var ring = document.getElementById('progRing');
    var num = document.getElementById('progNum');
    if (num) num.textContent = p.overallPercent + '%';
    if (ring) ring.style.strokeDashoffset = (540.354 * (1 - p.overallPercent / 100)).toFixed(2);

    var rows = document.getElementById('progRows');
    if (rows) {
      rows.innerHTML = p.sections.map(function (s) {
        return '<div class="thin-progress"><span class="tp-name">' + esc(L(s, 'name')) + '</span>' +
          '<div class="tp-bar"><span class="tp-fill" style="--p:' + esc(s.percent) + '%"></span></div>' +
          '<span class="tp-pct">' + esc(s.percent) + '%</span></div>';
      }).join('');
    }
    var focus = document.getElementById('progFocus'); if (focus) focus.textContent = L(p, 'currentFocus');
    var last = document.getElementById('progLast'); if (last) last.textContent = L(p, 'lastChange');
    var next = document.getElementById('progNext'); if (next) next.textContent = L(p, 'nextStep');
  }

  function renderTeam() {
    var grid = document.getElementById('teamGrid');
    if (!grid || !DATA || !DATA.team) return;
    var m = DATA.team.slice().sort(function (a, b) { return a.order - b.order; });
    var row5 = m.slice(0, 5), row4 = m.slice(5);
    function card(x) {
      return '<article class="t-card reveal">' +
        '<div class="t-media"><img src="' + esc(x.portrait) + '" alt="' + esc(L(x, 'name')) + '" loading="lazy"></div>' +
        '<div class="t-body"><h3>' + esc(L(x, 'name')) + '</h3><p>' + esc(L(x, 'role')) + '</p>' +
        '<span class="t-diamond"></span></div></article>';
    }
    grid.innerHTML =
      '<div class="team-row team-row-5">' + row5.map(card).join('') + '</div>' +
      '<div class="team-row team-row-4">' + row4.map(card).join('') + '</div>';
  }

  var CAT_MAP = { dev: 'dev', gameplay: 'dev', tech: 'dev', graphics: 'art', announce: 'announce', interview: 'interview' };
  var newsState = { filter: 'all' };

  function videoId(url) {
    if (!url) return '';
    var m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
    return m ? m[1] : (String(url).indexOf('/') < 0 ? url : '');
  }

  function openVideo(title, url, thumb) {
    var modal = document.getElementById('videoModal');
    if (!modal) return;
    var frame = document.getElementById('videoFrame');
    var yid = videoId(url);
    if (yid) {
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yid) +
        '?autoplay=1" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else {
      frame.className = 'vm-ph';
      frame.innerHTML = '<img src="' + esc(thumb || '') + '" alt="">' +
        '<p data-i18n="news.noVideo"></p>';
      applyLang();
    }
    frame.className = yid ? 'vm-frame' : 'vm-ph';
    var tm = document.getElementById('videoModalTitle');
    if (tm) tm.textContent = title;
    openModal(modal);
  }

  function renderNews() {
    var grid = document.getElementById('devlogGrid');
    var feat = document.getElementById('featuredCard');
    if (!grid || !DATA || !DATA.devlogs) return;
    var logs = DATA.devlogs.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var featured = logs.filter(function (l) { return l.featured; })[0] || logs[0];
    var rest = logs.filter(function (l) { return l !== featured; });

    if (feat && featured) {
      var fm = feat.querySelector('.feat-media img'); if (fm) fm.src = featured.thumbnail;
      var ft = feat.querySelector('.feat-title'); if (ft) ft.textContent = L(featured, 'title');
      var fd = feat.querySelector('.feat-desc'); if (fd) fd.textContent = L(featured, 'description');
      var fcat = feat.querySelector('.feat-cat'); if (fcat) fcat.dataset.cat = CAT_MAP[featured.category] || 'dev';
      feat.dataset.cat = CAT_MAP[featured.category] || 'dev';
      feat.dataset.thumb = featured.thumbnail;
      feat.dataset.video = featured.video;
      feat.dataset.title = L(featured, 'title');
      var dateEl = feat.querySelector('.feat-date');
      if (dateEl) dateEl.textContent = new Date(featured.date + 'T12:00:00').toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    var shown = rest.filter(function (l) {
      return newsState.filter === 'all' || (CAT_MAP[l.category] || 'dev') === newsState.filter;
    }).slice(0, 6);
    grid.innerHTML = shown.map(function (l) {
      var cat = CAT_MAP[l.category] || 'dev';
      return '<article class="thumb-card reveal in" data-cat="' + cat + '" data-video="' + esc(l.video) + '" data-thumb="' + esc(l.thumbnail) + '" data-title="' + esc(L(l, 'title')) + '" tabindex="0" role="button" data-i18n-aria="a11y.play">' +
        '<div class="t-media"><img src="' + esc(l.thumbnail) + '" alt="' + esc(L(l, 'title')) + '" loading="lazy">' +
        '<span class="t-play">' + svg('play') + '</span></div>' +
        '<div class="t-body"><span class="chip">' + esc(t('news.' + cat)) + '</span>' +
        '<h3>' + esc(L(l, 'title')) + '</h3>' +
        '<p>' + esc(L(l, 'description')) + '</p>' +
        '<span class="feat-meta"><span class="feat-date">' + new Date(l.date + 'T12:00:00').toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) + '</span></span>' +
      '</article>';
    }).join('');
    if (!shown.length) {
      grid.innerHTML = '<p class="lead" style="grid-column:1/-1;text-align:center">' + esc(t('common.error')) + '</p>';
    }
    applyLang();
  }

  function renderDataSection() {
    if (!DATA) return;
    var page = document.body.getAttribute('data-page') || '';
    if (page === 'home') renderHome();
    if (page === 'city') renderCity();
    if (page === 'resources') renderResources();
    if (page === 'world') renderWorld();
    if (page === 'progress') {
      renderProgress();
      observeNew(document);
    }
    if (page === 'team') renderTeam();
    if (page === 'news') renderNews();
  }

  /* ---------- modals ---------- */
  var lastFocused = null;
  function openModal(m) {
    if (!m) return;
    lastFocused = document.activeElement;
    m.classList.add('open');
    document.body.classList.add('no-scroll');
    var f = m.querySelector('input, button, select, a');
    if (f) f.focus();
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove('open');
    document.body.classList.remove('no-scroll');
    var vf = m.querySelector('iframe');
    if (vf) vf.removeAttribute('src');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ---------- init ---------- */
  function init() {
    var pageId = document.body.getAttribute('data-page') || 'home';
    var header = document.getElementById('siteHeader');
    var footer = document.getElementById('siteFooter');
    var modals = document.getElementById('modals');
    if (header) header.innerHTML = chromeHtml(pageId);
    if (footer) footer.innerHTML = footerHtml();
    if (modals) modals.innerHTML = modalsHtml();

    applyLang();

    /* language toggle */
    var langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', toggleLang);

    /* mobile menu */
    var menuBtn = document.getElementById('menuBtn');
    var mm = document.getElementById('mobileMenu');
    if (menuBtn && mm) {
      menuBtn.addEventListener('click', function () {
        var open = mm.classList.toggle('open');
        menuBtn.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('no-scroll', open);
      });
      mm.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          mm.classList.remove('open');
          menuBtn.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        }
      });
    }

    /* city tabs */
    var tabsEl = document.getElementById('cityTabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-tab]');
        if (!btn) return;
        var root = document.getElementById('cityContent');
        if (root && root._mjState) { root._mjState.tab = btn.getAttribute('data-tab'); renderCity(); }
      });
    }

    /* news filters */
    var pills = document.getElementById('newsPills');
    if (pills) {
      pills.addEventListener('click', function (e) {
        var b = e.target.closest('[data-filter]');
        if (!b) return;
        newsState.filter = b.getAttribute('data-filter');
        pills.querySelectorAll('.pill').forEach(function (p) { p.classList.toggle('active', p === b); });
        renderNews();
      });
    }
    var grid = document.getElementById('devlogGrid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var card = e.target.closest('.thumb-card');
        if (card) openVideo(card.dataset.title, card.dataset.video, card.dataset.thumb);
      });
      grid.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var card = e.target.closest('.thumb-card');
        if (card) { e.preventDefault(); openVideo(card.dataset.title, card.dataset.video, card.dataset.thumb); }
      });
    }
    var featEl = document.getElementById('featuredCard');
    if (featEl) {
      featEl.addEventListener('click', function () {
        openVideo(featEl.dataset.title, featEl.dataset.video, featEl.dataset.thumb);
      });
    }

    /* modal openers / closers (delegated) */
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-open-modal]');
      if (opener) {
        var m = document.getElementById(opener.getAttribute('data-open-modal') + 'Modal');
        openModal(m);
        return;
      }
      var closer = e.target.closest('[data-close-modal]');
      if (closer) closeModal(closer.closest('.modal'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = document.querySelector('.modal.open');
      if (open) closeModal(open);
      var mmOpen = document.getElementById('mobileMenu');
      if (mmOpen && mmOpen.classList.contains('open')) {
        mmOpen.classList.remove('open');
        var mb = document.getElementById('menuBtn');
        if (mb) { mb.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); }
      }
    });

    /* beta form */
    var form = document.getElementById('betaForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = document.getElementById('betaStatus');
        var name = form.name.value.trim();
        var email = form.email.value.trim();
        status.classList.remove('err');
        status.textContent = '';
        if (!name) { status.textContent = t('modal.name') + ' *'; status.classList.add('err'); form.name.focus(); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = t('contact.emailErr'); status.classList.add('err'); form.email.focus(); return; }
        var btn = form.querySelector('[type="submit"]');
        btn.disabled = true;
        btn.textContent = t('common.loading');
        postRecord('Registry', {
          form: 'beta', name: name, email: email,
          role: form.role.value, updates: form.updates.checked ? 'yes' : 'no'
        }).then(function () {
          form.hidden = true;
          var ok = document.getElementById('betaSuccess');
          if (ok) ok.hidden = false;
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = t('modal.submit');
          status.textContent = t('common.error');
          status.classList.add('err');
        });
      });
    }

    var coIcon = document.querySelector('.co-icon');
    if (coIcon && !coIcon.innerHTML) coIcon.innerHTML = svg('helmet');

    setupReveal();
    loadData().then(function (d) {
      DATA = d;
      renderDataSection();
      setupReveal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
