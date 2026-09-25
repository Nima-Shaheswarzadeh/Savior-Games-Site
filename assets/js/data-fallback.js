/* Fallback copy of data/site-data.json — used when fetch() is unavailable (e.g. file://) */
window.MJ_FALLBACK_DATA =
{
  "progress": {
    "overallPercent": 68,
    "sections": [
      { "name_fa": "هسته و زیرساخت", "name_en": "Core & Infrastructure", "percent": 95 },
      { "name_fa": "شهر و ساختمان‌ها", "name_en": "City & Buildings", "percent": 81 },
      { "name_fa": "منابع و اقتصاد", "name_en": "Resources & Economy", "percent": 74 },
      { "name_fa": "ارتش و نبرد", "name_en": "Army & Combat", "percent": 67 },
      { "name_fa": "جهان و تعاملات", "name_en": "World & Interactions", "percent": 52 },
      { "name_fa": "UI و گرافیک", "name_en": "UI & Graphics", "percent": 62 },
      { "name_fa": "تست و بهینه‌سازی", "name_en": "Testing & Optimization", "percent": 45 }
    ],
    "currentFocus_fa": "به‌سازی چرخه‌ی برتری نیروها و تنظیم‌های عددی نبرد",
    "currentFocus_en": "Refining the unit counter cycle and balancing the combat numbers",
    "lastChange_fa": "اتصال داده‌ی زنده‌ی پیشرفت و به‌روزرسانی کارت‌های شهر",
    "lastChange_en": "Live progress data wired up; city cards refreshed",
    "nextStep_fa": "نسخه‌ی بازآزمایی اولیه‌ی حمله و دفاع برای تیم داخلی",
    "nextStep_en": "First internal playtest build of attack and defense"
  },
  "team": [
    { "order": 1, "name_fa": "سرکار خانم دیده‌بان", "name_en": "Didehban", "role_fa": "کدنویس فعال", "role_en": "Active Developer", "portrait": "images/team-sil-female.png", "gender": "F" },
    { "order": 2, "name_fa": "سرکار خانم هیناتا", "name_en": "Hinata", "role_fa": "کدنویس فعال", "role_en": "Active Developer", "portrait": "images/team-sil-female.png", "gender": "F" },
    { "order": 3, "name_fa": "آرشام زند", "name_en": "Arasham Zand", "role_fa": "ایده‌پرداز، مدیر توسعه پروژه", "role_en": "Visionary & Development Director", "portrait": "images/team-sil-male.png", "gender": "M" },
    { "order": 4, "name_fa": "محمدحسین نصیری", "name_en": "Mohammadhossein Nassiri", "role_fa": "مدیر فنی پروژه", "role_en": "Technical Director", "portrait": "images/team-sil-male.png", "gender": "M" },
    { "order": 5, "name_fa": "نیما شهسوارزاده", "name_en": "Nima Shahsvarzadeh", "role_fa": "کدنویس فعال", "role_en": "Active Developer", "portrait": "images/team-sil-male.png", "gender": "M" },
    { "order": 6, "name_fa": "امیرعلی خدادادپور", "name_en": "Amirali Khodadadpour", "role_fa": "کدنویس و گیم‌دیزاینر", "role_en": "Developer & Game Designer", "portrait": "images/team-sil-male.png", "gender": "M" },
    { "order": 7, "name_fa": "سید مهدی سجادی", "name_en": "Seyed Mehdi Sajjadi", "role_fa": "کدنویس", "role_en": "Developer", "portrait": "images/team-sil-male.png", "gender": "M" },
    { "order": 8, "name_fa": "مجتبی بیک‌پور", "name_en": "Mojtaba Baykpur", "role_fa": "کدنویس", "role_en": "Developer", "portrait": "images/team-sil-male.png", "gender": "M" },
    { "order": 9, "name_fa": "فاضل علیزاده", "name_en": "Fazel Alizadeh", "role_fa": "کدنویس", "role_en": "Developer", "portrait": "images/team-sil-male.png", "gender": "M" }
  ],
  "devlogs": [
    {
      "title_fa": "شهر زنده شد: پیشرفت هسته‌ی بازی",
      "title_en": "The city comes alive: core progress",
      "date": "2026-09-18",
      "description_fa": "ساختن، ارتقا و مدیریت ساختمان‌ها حالا در حلقه‌ی بازی کار می‌کند. ببین شهر منجی چطور نفس می‌کشد.",
      "description_en": "Building, upgrading and managing buildings now works in the game loop. See how Monji's city breathes.",
      "video": "",
      "thumbnail": "images/city-banner.jpg",
      "category": "dev",
      "featured": true
    },
    {
      "title_fa": "تصویرسازی میدان نبرد",
      "title_en": "Painting the battlefield",
      "date": "2026-09-07",
      "description_fa": "از اسکچ تا قاب نهایی؛ ساخت تصاویر سینمایی میدان نبرد.",
      "description_en": "From sketch to final frame; making the cinematic battlefield art.",
      "video": "",
      "thumbnail": "images/battle-hero.jpg",
      "category": "graphics",
      "featured": false
    },
    {
      "title_fa": "پشت صحنه‌ی چرخه‌ی برتری",
      "title_en": "Behind the counter cycle",
      "date": "2026-08-25",
      "description_fa": "چرا ×۱.۵؟ داستان طراحی چرخه‌ی پیاده، کمان و اسب.",
      "description_en": "Why ×1.5? The design story of infantry, bow and horse.",
      "video": "",
      "thumbnail": "images/home-hero.jpg",
      "category": "gameplay",
      "featured": false
    },
    {
      "title_fa": "داده‌ی زنده برای بازی در حال ساخت",
      "title_en": "Live data for a game in the making",
      "date": "2026-08-10",
      "description_fa": "سایت منجی از گوگل‌شیت نفس می‌کشد؛ معماری داده و دلیل انتخابش.",
      "description_en": "Monji's site breathes from a Google Sheet; the data architecture and why we chose it.",
      "video": "",
      "thumbnail": "images/world-banner.jpg",
      "category": "tech",
      "featured": false
    }
  ],
  "buildings": [
    {
      "category": "government",
      "name_fa": "مسجد بزرگ",
      "name_en": "The Great Mosque",
      "line_fa": "برای به‌دست‌آوردن قهرمان‌های نظامی",
      "line_en": "The source of military heroes for your dynasty.",
      "image": "images/building-mosque.jpg",
      "filter": ""
    },
    {
      "category": "government",
      "name_fa": "کاخ فرمانروا",
      "name_en": "The Citadel of Command",
      "line_fa": "مرکز فرمانروایی؛ سرنوشت شهر از اینجا تصمیم می‌گیرد",
      "line_en": "Seat of rule; the city's fate is decided here.",
      "image": "images/city-banner.jpg",
      "filter": "saturate(1.05) brightness(0.95)"
    },
    {
      "category": "military",
      "name_fa": "پادگان",
      "name_en": "The Barracks",
      "line_fa": "محل آموزش نیروهای حکومت",
      "line_en": "Where the dynasty's forces are trained.",
      "image": "images/building-barracks.jpg",
      "filter": ""
    },
    {
      "category": "military",
      "name_fa": "اردوگاه تمرین",
      "name_en": "The Training Ground",
      "line_fa": "کارگاه نبرد سواره‌نظام و پیاده‌نظام",
      "line_en": "Drill ground for cavalry and infantry.",
      "image": "images/building-barracks.jpg",
      "filter": "hue-rotate(-18deg) saturate(0.9)"
    },
    {
      "category": "economy",
      "name_fa": "بازار",
      "name_en": "The Bazaar",
      "line_fa": "مبادله‌ی منابع و درآمدهای روزانه‌ی شهر",
      "line_en": "The heart of trade; the city's daily income.",
      "image": "images/building-market.jpg",
      "filter": ""
    },
    {
      "category": "economy",
      "name_fa": "انبار گندم",
      "name_en": "The Granary",
      "line_fa": "نگهداری گندم؛ امنیت خوراک در زمان بحران",
      "line_en": "Wheat storage; food security in times of crisis.",
      "image": "images/building-market.jpg",
      "filter": "hue-rotate(14deg) brightness(1.05)"
    },
    {
      "category": "defense",
      "name_fa": "شفاخانه",
      "name_en": "The Shifa-khana",
      "line_fa": "درمان سربازان زخمی پس از نبرد",
      "line_en": "Healing wounded soldiers after battle.",
      "image": "images/building-hospital.jpg",
      "filter": ""
    },
    {
      "category": "defense",
      "name_fa": "ارگ و دیوار",
      "name_en": "The Citadel Wall",
      "line_fa": "خط اول دفاع؛ دیواری که تاریخ آن را به یاد می‌سپارد",
      "line_en": "The first line of defense; a wall history will remember.",
      "image": "images/city-banner.jpg",
      "filter": "hue-rotate(-10deg) brightness(0.9)"
    },
    {
      "category": "defense",
      "name_fa": "برج دیده‌بانی",
      "name_en": "The Watchtower",
      "line_fa": "چشم‌های حکومت روی جاده‌ها؛ هشدار زودهنگام",
      "line_en": "The dynasty's eyes on the roads; early warning.",
      "image": "images/building-mosque.jpg",
      "filter": "hue-rotate(20deg) saturate(0.85)"
    }
  ]
}
;
