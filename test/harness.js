/* Monji Games — DOM runtime harness (jsdom).
   Loads each page, executes i18n.js + data-fallback.js + inline config +
   main.js (+ page inline scripts), waits for data load, then runs a set of
   assertions per page in FA and EN (including a city-tab click + language
   toggle). Exits non-zero on any failure. */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'city.html', 'resources.html', 'army.html', 'world.html', 'progress.html', 'team.html', 'news.html'];

const dataJson = fs.readFileSync(path.join(ROOT, 'data', 'site-data.json'), 'utf8');

let failures = 0;
let checks = 0;
function assert(cond, label) {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✗ FAIL: ' + label);
  }
}
function tick(ms = 30) { return new Promise((r) => setTimeout(r, ms)); }

async function bootPage(file, lang) {
  let html = fs.readFileSync(path.join(ROOT, file), 'utf8');

  // extract scripts in order
  const scripts = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, body) => {
    const srcM = attrs.match(/src="([^"]+)"/);
    scripts.push(srcM ? { src: srcM[1] } : { inline: body });
    return '';
  });

  const dom = new JSDOM(html, {
    url: 'http://127.0.0.1:8000/' + file,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  const { document } = window;

  // localStorage seed
  try {
    window.localStorage.setItem('mj_lang', lang === 'en' ? 'en' : 'fa');
  } catch (e) {}

  // fetch stub → local data file
  window.fetch = (url) => {
    if (String(url).indexOf('site-data.json') !== -1) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(JSON.parse(dataJson))
      });
    }
    return Promise.reject(new Error('unexpected fetch: ' + url));
  };

  // IntersectionObserver stub: intersect immediately
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
    unobserve() {}
    disconnect() {}
  };

  const errors = [];
  window.addEventListener('error', (e) => errors.push(e.message));

  for (const s of scripts) {
    try {
      if (s.src) {
        const code = fs.readFileSync(path.join(ROOT, s.src), 'utf8');
        window.eval(code);
      } else if (s.inline.trim()) {
        window.eval(s.inline);
      }
    } catch (e) {
      errors.push('script error: ' + e.message);
    }
  }

  await tick(60); // let init + data promise resolve
  if (errors.length) {
    throw new Error('runtime errors: ' + errors.join(' | '));
  }
  return { window, document };
}

function txt(doc) { return doc.body ? doc.body.textContent : ''; }

(async () => {
  for (const page of PAGES) {
    for (const lang of ['fa', 'en']) {
      const label = page + ' [' + lang + ']';
      try {
        const { window, document } = await bootPage(page, lang);
        const doc = document;
        const dir = doc.documentElement.getAttribute('dir');
        assert(dir === (lang === 'fa' ? 'rtl' : 'ltr'), 'dir=' + dir);
        const nav = doc.querySelectorAll('.nav-link').length;
        assert(nav === 6, '6 nav links, got ' + nav);
        assert(txt(doc).indexOf('MANJI GAMES') !== -1, 'logo sub MANJI GAMES');
        const cta = txt(doc).indexOf(lang === 'fa' ? 'ثبت نام در بتا' : 'Register for Beta') !== -1;
        assert(cta, 'beta CTA visible');

        if (page === 'index.html') {
          const t = txt(doc);
          const hero = t.indexOf(lang === 'fa' ? 'منجی' : 'Monji') !== -1;
          assert(hero, 'hero title');
          assert(t.indexOf('68%') !== -1, 'home strip 68%');
        }

        if (page === 'city.html') {
          const tabs = doc.querySelectorAll('#cityTabs .tab');
          assert(tabs.length === 4, '4 city tabs, got ' + tabs.length);
          let t = txt(doc);
          if (lang === 'fa') {
            assert(t.indexOf('شفاخانه') !== -1, 'defense tab building (default)');
            assert(t.indexOf('سطح ۱') !== -1, 'level band labels');
          } else {
            assert(t.indexOf('Hospital') !== -1, 'defense tab building EN');
          }
          // click military tab (3rd button)
          if (tabs[2]) {
            tabs[2].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
            await tick(20);
            t = txt(doc);
            if (lang === 'fa') {
              assert(t.indexOf('سپاه نیروها') !== -1, 'military tab building');
              assert(t.indexOf('با ارتش قدرتمند') !== -1, 'military level band');
              assert(t.indexOf('سطح ۵') !== -1, '5 army levels');
            } else {
              assert(t.indexOf('Army of Forces') !== -1, 'military building EN');
            }
          }
        }

        if (page === 'resources.html') {
          const cards = doc.querySelectorAll('#resourceGrid .res-card');
          assert(cards.length === 6, '6 resource cards, got ' + cards.length);
          const t = txt(doc);
          if (lang === 'fa') {
            assert(t.indexOf('یاقوت') !== -1 && t.indexOf('ارتشت هزینه دارد') !== -1, 'resources + callout FA');
          } else {
            assert(t.indexOf('Ruby') !== -1 && t.indexOf('Your army costs money') !== -1, 'resources + callout EN');
          }
        }

        if (page === 'army.html') {
          const t = txt(doc);
          const units = doc.querySelectorAll('.u-card').length;
          assert(units === 4, '4 unit cards, got ' + units);
          if (lang === 'fa') {
            assert(t.indexOf('پیاده نظام') !== -1 && t.indexOf('کماندار') !== -1, 'unit names FA');
            assert(t.indexOf('×۱.۵') !== -1, 'cycle ×1.5 badges');
            assert(t.indexOf('سنگ، کاغذ، سمشیر') !== -1, 'cycle title FA');
          } else {
            assert(t.indexOf('Infantry') !== -1 && t.indexOf('Cavalry') !== -1, 'unit names EN');
            assert(t.indexOf('Rock, Paper, Scissors') !== -1, 'cycle title EN');
          }
          assert(txt(doc).indexOf(lang === 'fa' ? 'منجنیق' : 'Trebuchet') !== -1, 'trebuchet section');
        }

        if (page === 'world.html') {
          const cards = doc.querySelectorAll('#worldCards .w-card');
          assert(cards.length === 3, '3 world cards, got ' + cards.length);
          const t = txt(doc);
          if (lang === 'fa') assert(t.indexOf('بازار و تجارت') !== -1 && t.indexOf('ستون‌های یک جهان زنده') !== -1, 'world FA');
          else assert(t.indexOf('Market & Trade') !== -1, 'world EN');
        }

        if (page === 'progress.html') {
          const t = txt(doc);
          const rows = doc.querySelectorAll('#progRows .thin-progress');
          assert(rows.length === 7, '7 progress rows, got ' + rows.length);
          assert(t.indexOf('68%') !== -1, 'ring 68%');
          if (lang === 'fa') {
            assert(t.indexOf('هسته و زیرساخت') !== -1 && t.indexOf('تمرکز فعلی') !== -1, 'progress FA');
          } else {
            assert(t.indexOf('Core & Infrastructure') !== -1 && t.indexOf('Current Focus') !== -1, 'progress EN');
          }
        }

        if (page === 'team.html') {
          const cards = doc.querySelectorAll('#teamGrid .t-card');
          assert(cards.length === 9, '9 team cards, got ' + cards.length);
          const t = txt(doc);
          if (lang === 'fa') {
            assert(t.indexOf('هیناتا') !== -1 && t.indexOf('فاضل علیزاده') !== -1, 'team names FA');
            assert(t.indexOf('یک تیم حرفه‌ای') !== -1, 'team title FA');
          } else {
            assert(t.indexOf('Hinata') !== -1 && t.indexOf('Fazel Alizadeh') !== -1, 'team names EN');
          }
        }

        if (page === 'news.html') {
          const t = txt(doc);
          const thumbs = doc.querySelectorAll('#devlogGrid .thumb-card');
          assert(thumbs.length === 3, '3 previous devlogs, got ' + thumbs.length);
          const feat = doc.querySelector('#featuredCard .feat-title');
          assert(feat && feat.textContent.trim().length > 0, 'featured title filled');
          if (lang === 'fa') assert(t.indexOf('آخرین نسخه') !== -1, 'featured label FA');
          else assert(t.indexOf('Latest Version') !== -1, 'featured label EN');
        }

        /* language toggle behavior */
        const langBtn = doc.getElementById('langBtn');
        assert(!!langBtn, 'lang toggle present');
        if (langBtn) {
          langBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
          await tick(40);
          const nowDir = doc.documentElement.getAttribute('dir');
          assert(nowDir === (lang === 'fa' ? 'ltr' : 'rtl'), 'language toggles dir → ' + nowDir);
          const nowLang = doc.documentElement.getAttribute('lang');
          assert(nowLang === (lang === 'fa' ? 'en' : 'fa'), 'language toggles lang attr → ' + nowLang);
        }
        console.log('  ✓ ' + label + ' passed');
      } catch (e) {
        failures++;
        console.error('  ✗ ' + label + ' CRASH: ' + e.message);
      }
    }
  }
  console.log('\n' + (failures === 0 ? 'ALL PASSED' : 'FAILURES') + ' — ' + checks + ' checks, ' + failures + ' failed');
  process.exit(failures === 0 ? 0 : 1);
})();
