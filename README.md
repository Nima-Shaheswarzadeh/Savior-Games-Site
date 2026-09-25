# منجی گیمز — سایت معرفی پروژه (Monji Games)

پیاده‌سازی کامل سند طراحی `docs/SPEC.md` — ۸ صفحه‌ی دوزبانه (فارسی پیش‌فرض RTL + انگلیسی LTR) با Design System بخش ۲ سند.

> منبع حقیقت محتوا، متن نهایی کارفرما است (سند §۰). تصاویر مرجع فقط حس‌وحال بصری بودند و تبدیل عین‌به‌عین نشده‌اند.

---

## اجرای محلی

```bash
cd monji-games
python3 -m http.server 8000
# سپس http://localhost:8000
```

هر سرور استاتیک دیگری (نپکس `serve`، nginx و…) هم کار می‌کند. برای تست بدون سرور هم `data-fallback.js` داده‌ها را در دسترس دارد (fetch در `file://` ممکن است کار نکند).

## ساختار

```
monji-games/
├── index.html … team.html      # ۸ صفحه (IA تخت، spec §3)
├── assets/
│   ├── css/main.css            # Design System: پالت، تایپو، گرید، همه‌ی کامپوننت‌های §5
│   ├── css/fonts.css           # @font-face محلی (Vazirmatn, Lalezar, Gulzar, Cinzel, Cormorant, Inter)
│   ├── js/i18n.js              # فرهنگ لغت EN (فارسی در خود HTML است)
│   ├── js/main.js              # هدر/فوتر/مودال، موتور زبان، لایه‌ی داده، رندر هر صفحه
│   └── js/data-fallback.js     # نسخه‌ی JS از data/site-data.json
├── data/site-data.json         # داده‌ی نمونه — عینِ ساختاری که Apps Script برمی‌گرداند
├── images/                     # آرتورک‌های سینمایی (placeholder تا Artwork نهایی)
├── backend/Code.gs             # Google Apps Script: GET محتوا + POST ثبت‌نام (spec §7.3)
└── docs/SPEC.md                # سند طراحی اصلی
```

## دوزبانگی (spec §8)

- سوییچر FA/EN در هدر؛ زبان در `localStorage` ذخیره و `dir`/`lang` کل سند جابه‌جا می‌شود (گرید، chevron و فلش‌ها با properties لجیکال آینه می‌شوند).
- در نسخه‌ی نهایی، روتینگ پیشنهادی `/{page}` برای فارسی و `/en/{page}` برای انگلیسی: چون همه‌ی صفحات یک قالب مشترک با دیکشنری دوزبانه دارند، روی سرور کافی است مسیر `/en/*` را به همان فایل‌ها با `?lang=en` (یا redirect به `?lang=en`) نگاشت کنید.

## اتصال به گوگل‌شیت (spec §7)

1. دو Spreadsheet بسازید: «محتوای سایت» (تب‌های `Progress`، `Team`، `Devlogs`، `Buildings`) و «ثبت‌نام بتا» (تب `Registry`). سرستون‌ها دقیقاً مطابق توی `backend/Code.gs` و `data/site-data.json`.
2. `Code.gs` را در Apps Script پروژه‌ی شیت محتوا بگذارید، `CONTENT_ID` و `REGISTRY_ID` را پر کنید.
3. Deploy → Web app → **Execute as: Me** / **Access: Anyone**.
4. آدرس `/exec` را در هر صفحه، داخل `<script>window.MJ_CONFIG = { apiUrl: "https://script.google.com/…/exec" };</script>` بگذارید. تا این کار انجام نشود، سایت از `data/site-data.json` می‌خواند (همان ساختار JSON).
5. فرم «دنبال‌کردن پروژه» با `POST` (بدون preflight، `text/plain`) ردیف جدیدی در `Registry` می‌سازد: `Timestamp | Name | Email | PreferredLanguage | Consent`.

## فرض‌های پیاده‌سازی (برای تأیید کارفرما — spec §11)

| موضوع | تصمیم فعلی |
|---|---|
| ویدیوی Devlog | Embed یوتیوب (اگر `VideoURL` در شیت خالی باشد، مودال پیام «به‌زودی» نشان می‌دهد) |
| فیلدهای ثبت‌نام | Name / Email / PreferredLanguage / Consent (اختیاری) — طبق §7.2 |
| فوتر | ساختار پیشنهادی §۴ (لوگو + لینک‌ها + سوشال + شعار «ساخته‌شده برای آینده‌ای بهتر») |
| ساختمان‌ها | تصاویر Concept؛ ستون `Filter` در داده، تفاوت‌های بصری را تا رسیدن تصویر واقعی هر ساختمان حفظ می‌کند |
| پرتره‌های تیم | سیلوئت‌های نور لبه‌ی مسی (placeholder)؛ با پر شدن `PortraitURL` در شیت Team، خودکار جایگزین می‌شود |
| محتوای نمونه (متن/عدد Devlog و پیشرفت) | نونالیسم — فقط برای نمایش ساختار؛ همه‌چیز از داده‌ی زنده خوانده می‌شود |

## نقشه‌ی نگاشت به سند

- پالت/تایپو/گرید → `main.css` (قسمت‌های ۲.۱ تا ۲.۵)
- کامپوننت‌ها → همان اسم‌های §۵: `Header`, `Hero`, `FeatureCard`, `CategoryTabs`, `ItemCard`, `LevelProgression`, `ResourceCard`, `RotationCycle` (SVG با Viewbox نسبی), `CircularProgress` + `ThinProgressRow`, `TeamPortraitCard` (۵+۴), `DevlogFeatured` + `DevlogThumbCard` + `FilterPills`, `CTAButton`, `QuoteBanner`, `LanguageSwitch`
- ریسپانسیو → breakepoint 640/1024 مطابق §۹ (Hero موبایل: تصویر بالا، متن پایین؛ تب‌ها و فیلترها اسکرول افقی؛ حلقه Progress با `clamp()`)
- حذف‌شده‌ها طبق دستور کارفرما: «انبار بی‌نهایت نیست» و «نبرد و غارت» حذف‌اند؛ کارت «لشکرکشی» فقط در صفحه‌ی ارتش است.
