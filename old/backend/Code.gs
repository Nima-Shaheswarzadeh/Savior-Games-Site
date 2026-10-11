/**
 * ============================================================
 *  Monji Games — بک‌اند Google Apps Script (spec §7)
 * ============================================================
 *  دو گوگل‌شیت جدا:
 *   1) شیت «محتوای سایت» (فقط‌خواندنی برای سایت)
 *      تب‌ها: Progress | Team | Devlogs | Buildings
 *   2) شیت «ثبت‌نام بتا» (فقط‌نوشتنی از سمت سایت)
 *      تب: Registry
 *
 *  نصب:
 *   1) هر دو Spreadsheet را بسازید و در هرکدام:
 *      Extensions → Apps Script
 *   2) این کد را در پروژه‌ی Apps Script «شیت محتوا» بچسبانید
 *      (پروژه‌ی Apps Script دیگری برای شیت ثبت‌نام لازم نیست).
 *   3) CONTENT_ID و REGISTRY_ID را با شناسه‌ی هر Spreadsheet
 *      (از آدرس URL) پر کنید.
 *   4) Deploy → New deployment → Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5) آدرس /exec را در هر صفحه‌ی سایت، داخل
 *      window.MJ_CONFIG = { apiUrl: "..." } بگذارید.
 *
 *  سرصفحه‌های ستون‌ها باید دقیقاً در ردیف اول باشند
 *  و نام‌ها با همان اسم‌های پایین مطابقت کنند.
 */

var CONTENT_ID = 'PASTE_CONTENT_SPREADSHEET_ID';
var REGISTRY_ID = 'PASTE_REGISTRY_SPREADSHEET_ID';

/* ---------- GET: خواندن محتوای سایت به‌صورت JSON ---------- */
function doGet() {
  var ss = SpreadsheetApp.openById(CONTENT_ID);
  return jsonOut({
    progress: loadProgress(ss),
    team: loadTeam(ss),
    devlogs: loadDevlogs(ss),
    buildings: loadBuildings(ss)
  });
}

/* ---------- POST: ذخیره‌ی فرم ثبت‌نام بتا ---------- */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(REGISTRY_ID);
    var sheet = ss.getSheetByName('Registry') || ss.insertSheet('Registry');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'PreferredLanguage', 'Consent']);
    }
    sheet.appendRow([
      new Date(),
      String(body.name || ''),
      String(body.email || ''),
      String(body.preferredLanguage || 'FA'),
      body.consent ? 'yes' : 'no'
    ]);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/* ---------- کمکی‌ها ---------- */

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowsToObjects(sheet) {
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  var headers = values[0];
  return values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[String(h).trim()] = row[i];
    });
    return obj;
  });
}

/*
 * تب Progress:
 *  ردیف ۱: OverallPercent + متن‌های CurrentFocus/LastChange/NextStep (ستون‌های Section خالی)
 *  ردیف‌های ۲ تا ۸: SectionName_FA | SectionName_EN | SectionPercent
 */
function loadProgress(ss) {
  var rows = rowsToObjects(ss.getSheetByName('Progress'));
  var first = rows[0] || {};
  var sections = rows
    .filter(function (r) {
      return r['SectionName_FA'] && r['SectionPercent'] !== '' && r['SectionPercent'] != null;
    })
    .map(function (r) {
      return {
        name_fa: r['SectionName_FA'],
        name_en: r['SectionName_EN'],
        percent: Number(r['SectionPercent']) || 0
      };
    });
  return {
    overallPercent: Number(first['OverallPercent']) || 0,
    sections: sections,
    currentFocus_fa: first['CurrentFocus_FA'] || '',
    currentFocus_en: first['CurrentFocus_EN'] || '',
    lastChange_fa: first['LastChange_FA'] || '',
    lastChange_en: first['LastChange_EN'] || '',
    nextStep_fa: first['NextStep_FA'] || '',
    nextStep_en: first['NextStep_EN'] || ''
  };
}

/* تب Team: Order | Name_FA | Name_EN | Role_FA | Role_EN | PortraitURL | Gender */
function loadTeam(ss) {
  var rows = rowsToObjects(ss.getSheetByName('Team')).sort(function (a, b) {
    return (Number(a.Order) || 0) - (Number(b.Order) || 0);
  });
  return rows.map(function (r) {
    return {
      order: Number(r.Order) || 0,
      name_fa: r['Name_FA'] || r['Name'] || '',
      name_en: r['Name_EN'] || '',
      role_fa: r['Role_FA'] || '',
      role_en: r['Role_EN'] || '',
      portrait: r['PortraitURL'] || '',
      gender: r['Gender'] || ''
    };
  });
}

/* تب Devlogs: Title_FA/EN | Date | Description_FA/EN | VideoURL | ThumbnailURL | Category | Featured */
function loadDevlogs(ss) {
  return rowsToObjects(ss.getSheetByName('Devlogs')).map(function (r) {
    return {
      title_fa: r['Title_FA'] || '',
      title_en: r['Title_EN'] || '',
      date: String(r['Date']).slice(0, 10),
      description_fa: r['Description_FA'] || '',
      description_en: r['Description_EN'] || '',
      video: r['VideoURL'] || '',
      thumbnail: r['ThumbnailURL'] || '',
      category: r['Category'] || 'dev',
      featured: String(r['Featured']).toUpperCase() === 'TRUE'
    };
  });
}

/* تب Buildings (اختیاری): Category | Name_FA/EN | Line_FA/EN | ImageURL | Filter */
function loadBuildings(ss) {
  return rowsToObjects(ss.getSheetByName('Buildings')).map(function (r) {
    return {
      category: r['Category'] || '',
      name_fa: r['Name_FA'] || '',
      name_en: r['Name_EN'] || '',
      line_fa: r['Line_FA'] || '',
      line_en: r['Line_EN'] || '',
      image: r['ImageURL'] || '',
      filter: r['Filter'] || ''
    };
  });
}
