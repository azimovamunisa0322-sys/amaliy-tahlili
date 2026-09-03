/* ============================================================================
   RAD ETILGAN AMALIY VAZIFALAR / ОТКЛОНЁННЫЕ ПРАКТИЧЕСКИЕ ЗАДАНИЯ

   Sahifadagi HAMMA son students.js dagi o'quvchi qatorlaridan hisoblanadi.
   Shu sababli har bir sonni bosganda uning ortidagi ro'yxat aynan shu sonni
   beradi — jadval bilan ro'yxat hech qachon bir-biriga mos kelmay qolmaydi.

   Davr filtri: avgust | sentyabr | ikkisi birga.
   Til: rus / o'zbek — HAMMA matn i18n.js dagi lug'atdan chiqadi, sonlar
   va hisob-kitob esa tildan mutlaqo mustaqil.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  // son formati i18n.js dan: FI (butun son), F1 (o'nlik, vergul bilan)
  const fi = FI, f1 = F1;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- til ---------- */
  const LANGS = ["ru", "uz"];
  let LANG = "ru";
  try { const s = localStorage.getItem("prLang"); if (LANGS.indexOf(s) >= 0) LANG = s; } catch (e) { /* xotira yopiq */ }

  const t = (k, ...a) => {
    const v = STRINGS[LANG][k];
    if (v === undefined) { console.error("Tarjima kaliti yo'q: " + k); return "—"; }
    return typeof v === "function" ? v(...a) : v;
  };

  // lug'at butunligini yuklanishda tekshiramiz — bir tilda qolib ketmasin
  (function checkDict() {
    const a = Object.keys(STRINGS.uz).sort(), b = Object.keys(STRINGS.ru).sort();
    if (a.join("|") !== b.join("|")) {
      console.error("Tarjima kalitlari mos emas. Faqat uz da:",
        a.filter((k) => !(k in STRINGS.ru)), "| faqat ru da:", b.filter((k) => !(k in STRINGS.uz)));
    }
    Object.keys(REASON_MAP).forEach((c) => { if (!REASONS_RU[c]) console.error("REASONS_RU da sabab yo'q: " + c); });
    if (RGROUPS_RU.length !== REASON_GROUPS.length) console.error("RGROUPS_RU uzunligi mos emas");
  })();

  // sabab / guruh nomlari: ruscha bo'lsa REASONS_RU dan, aks holda students.js dan
  const rTitle = (c) => (LANG === "ru" ? REASONS_RU[c][0] : REASON_MAP[c][1]);
  const rQuote = (c) => (LANG === "ru" ? REASONS_RU[c][1] : REASON_MAP[c][2]);
  const gTitle = (i) => (LANG === "ru" ? RGROUPS_RU[i][0] : REASON_GROUPS[i][0]);
  const gDesc = (i) => (LANG === "ru" ? RGROUPS_RU[i][1] : REASON_GROUPS[i][2]);
  // kurator ismlari bazadan — tarjima qilinmaydi. Faqat "biriktirilmagan" va
  // test hisobi yorliqlari tilga bog'liq (ular filtrdan keyin ko'rinmaydi).
  const curName = (n) => (n === CURATOR_MAP[0] ? t("curatorNone") : n === CURATOR_MAP[21453] ? t("curatorTest") : n);

  /* ---------- o'quvchi qatorini ochish ---------- */
  function parseCounts(str) {
    const out = {};
    if (!str) return out;
    str.split(",").forEach((k) => { out[k[0]] = (out[k[0]] || 0) + (+k.slice(1)); });
    return out;
  }
  const CH_OF = (code) => REASON_MAP[code][0];   // "h" | "a" | "v"

  // dars tokenlari: "<2 belgi base36 indeks><son>" -> { indeks: son }
  function parseLessons(str) {
    const out = {};
    if (!str) return out;
    str.split(",").forEach((k) => {
      const i = parseInt(k.slice(0, 2), 36);
      out[i] = (out[i] || 0) + (+k.slice(2));
    });
    return out;
  }

  // modul sonlarini KURS bo'yicha yig'ish: MODULE_MAP[belgi][0] = kurs nomi.
  // Yig'indisi o'quvchining jami rad etishiga aynan teng bo'ladi.
  function byCourse(mods) {
    const m = {};
    for (const k in mods) { const c = MODULE_MAP[k][0]; m[c] = (m[c] || 0) + mods[k]; }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }

  /* ---------- davrlar ---------- */
  // Sentyabr: 1 va 2-sentyabr to'liq + 3-sentyabr 12:00 gacha = 2,5 kun.
  const SEP_DAYS = 2 + 12 / 24;
  const PMETA = {
    aug: { key: "aug", days: 31, raw: 24671, closed: true },
    sep: { key: "sep", days: SEP_DAYS, raw: 1220, closed: false },
    both: { key: "both", days: 31 + SEP_DAYS, raw: 25891, closed: false }
  };
  const pick = (k, a, s, b) => (k === "aug" ? a : k === "sep" ? s : b);
  const pLabel = (k) => t(pick(k, "perAug", "perSep", "perBoth"));
  const pInn = (k) => t(pick(k, "innAug", "innSep", "innBoth"));
  const pDays = (k) => t(pick(k, "perDaysAug", "perDaysSep", "perDaysBoth"));
  const pAi = (k) => t(pick(k, "aiNoteAug", "aiNoteSep", "aiNoteBoth"));
  const pShort = (k) => t(pick(k, "shortAug", "shortSep", "shortBoth"));

  const TEST_CURATOR = 21453, TEST_GROUP = 415;

  /* ---------- xom to'plamlar (filtrlanmagan) ---------- */
  function rawSet(rows, taskOf, lesSrc) {
    return rows.map((r, i) => {
      const mods = parseCounts(r[4]), reasons = parseCounts(r[5]);
      const lessons = parseLessons(lesSrc[r[0]]);
      let total = 0; const ch = { h: 0, a: 0, v: 0 };
      for (const k in reasons) { total += reasons[k]; ch[CH_OF(k)] += reasons[k]; }
      return {
        id: r[0], name: r[1], gid: r[2], aid: r[3],
        group: GROUP_MAP[r[2]] || "", curator: CURATOR_MAP[r[3]] || CURATOR_MAP[0],
        mods, reasons, lessons, total, ch, tasks: taskOf(r, i), courses: byCourse(mods)
      };
    });
  }

  const RAW_AUG = rawSet(STUDENTS, (r, i) => TASKS[i], LESSONS_AUG);
  const RAW_SEP = rawSet(STUDENTS_SEP, (r) => TASKS_SEP[r[0]], LESSONS_SEP);

  // avgustda TASKS indeks bo'yicha bog'langan — uzunlik mos kelmasa hamma
  // "necha xil vazifa" soni siljib ketadi, shu sababli ochiq tekshiruv.
  if (TASKS.length !== STUDENTS.length) console.error("TASKS va STUDENTS uzunligi mos emas!");
  RAW_SEP.forEach((s) => { if (!Number.isFinite(s.tasks)) console.error("TASKS_SEP yo'q: " + s.id); });

  // "Necha xil vazifada" = necha xil DARSDA — bu hozircha to'g'ri, chunki shu
  // davrda rad etish bo'lgan 503 darsning har birida aynan bitta amaliy savol
  // rad etilgan. Bazada esa bitta darsda bir necha savol bo'lishi mumkin
  // (masalan 1297-darsda 6 ta). Agar keyingi yangilashda bitta darsning ikkinchi
  // savoli ham rad etilsa, dars tokeni ikkisini bitta qatorga qo'shib yuboradi
  // va son kamayib ketadi. Shu sababli tenglikni jim qoldirmaymiz:
  [[RAW_AUG, "avgust"], [RAW_SEP, "sentyabr"]].forEach(([set, nom]) => {
    set.forEach((s) => {
      const n = Object.keys(s.lessons).length;
      if (n !== s.tasks) console.error(`${nom}: o'quvchi ${s.id} — dars soni ${n}, vazifa soni ${s.tasks}. "Necha xil vazifada" soni endi to'g'ri emas.`);
    });
  });

  // ikki oyni bitta o'quvchiga birlashtirish: sonlar qo'shiladi, holat
  // (guruh/kurator/ism) sentyabrdan olinadi — u yangiroq.
  function mergeSets() {
    const m = new Map();
    const put = (s, key) => {
      let e = m.get(s.id);
      if (!e) {
        e = {
          id: s.id, name: s.name, gid: s.gid, aid: s.aid, group: s.group, curator: s.curator,
          mods: Object.assign({}, s.mods), reasons: Object.assign({}, s.reasons),
          lessons: Object.assign({}, s.lessons),
          ch: Object.assign({}, s.ch), total: s.total, tasks: null, parts: {}
        };
        m.set(s.id, e);
      } else {
        for (const k in s.mods) e.mods[k] = (e.mods[k] || 0) + s.mods[k];
        for (const k in s.reasons) e.reasons[k] = (e.reasons[k] || 0) + s.reasons[k];
        for (const k in s.lessons) e.lessons[k] = (e.lessons[k] || 0) + s.lessons[k];
        for (const k in s.ch) e.ch[k] += s.ch[k];
        e.total += s.total;
        if (key === "sep") { e.name = s.name; e.gid = s.gid; e.aid = s.aid; e.group = s.group; e.curator = s.curator; }
      }
      e.parts[key] = { total: s.total, tasks: s.tasks };
    };
    RAW_AUG.forEach((s) => put(s, "aug"));
    RAW_SEP.forEach((s) => put(s, "sep"));
    const out = [...m.values()];
    out.forEach((e) => (e.courses = byCourse(e.mods)));
    return out;
  }

  // guruhi yo'q o'quvchilar va test akkaunt saytdan chiqariladi (foydalanuvchi
  // so'rovi, 2026-09-02). Qator o'chirilmaydi — faqat filtrlanadi, shu sababli
  // students.js to'liq va tekshiriladigan holda qoladi.
  function applyFilter(list) {
    const ex = { noGroup: 0, noGroupRej: 0, test: 0, testRej: 0 };
    const kept = list.filter((s) => {
      if (s.gid === 0) { ex.noGroup += 1; ex.noGroupRej += s.total; return false; }
      if (s.aid === TEST_CURATOR || s.gid === TEST_GROUP) { ex.test += 1; ex.testRej += s.total; return false; }
      return true;
    });
    return { list: kept, ex };
  }

  function rollup(list, keyFn) {
    const m = new Map();
    list.forEach((s) => keyFn(s).forEach(([k, n]) => {
      const e = m.get(k) || { n: 0, st: 0 };
      e.n += n; e.st += 1; m.set(k, e);
    }));
    return m;
  }

  // bitta oy ko'rinishida ham parts bo'lsin — detail() ikkisini bir xil o'qiydi
  const one = (k) => (s) => Object.assign({}, s, { parts: { [k]: { total: s.total, tasks: s.tasks } } });

  function makeView(key) {
    const src = key === "aug" ? RAW_AUG.map(one("aug"))
      : key === "sep" ? RAW_SEP.map(one("sep"))
      : mergeSets();
    const { list, ex } = applyFilter(src);
    const T = list.reduce((s, x) => s + x.total, 0);
    return {
      P: PMETA[key], ST: list, T, EX: ex,
      byCh: rollup(list, (s) => ["h", "a", "v"].filter((k) => s.ch[k] > 0).map((k) => [k, s.ch[k]])),
      byReason: rollup(list, (s) => Object.entries(s.reasons)),
      byModule: rollup(list, (s) => Object.entries(s.mods)),
      byLesson: rollup(list, (s) => Object.entries(s.lessons)),
      byCurator: rollup(list, (s) => [[s.curator, s.total]]),
      byRgroup: rollup(list, (s) => REASON_GROUPS.map((g, i) => {
        let n = 0; g[1].forEach((c) => (n += s.reasons[c] || 0));
        return n > 0 ? [i, n] : null;
      }).filter(Boolean))
    };
  }
  // ko'rinishlar tildan mustaqil — bir marta hisoblanadi, til faqat matnni almashtiradi
  const VIEWS = { aug: makeView("aug"), sep: makeView("sep"), both: makeView("both") };
  let V = VIEWS.aug;

  const chLabel = (k) => t(k === "h" ? "chH" : k === "a" ? "chA" : "chV");
  const chNote = (k) => (k === "a" ? pAi(V.P.key) : k === "h" ? t("chHNote") : t("chVNote"));

  /* ---------- bosiladigan son ---------- */
  const num = (q, txt, cls) => `<button class="pr-num ${cls || ""}" data-q="${esc(q)}">${txt}</button>`;
  const bar = (n, max) => `<span class="pr-bar" style="width:${max > 0 ? Math.max(0.8, Math.min(100, n / max * 100)) : 0.8}%"></span>`;
  const get = (m, k) => m.get(k) || { n: 0, st: 0 };

  // sentyabrni ko'rganda avgust ulushi bilan solishtirish ustuni chiqadi
  const cmpOn = () => V.P.key === "sep";
  const cmpHead = () => (cmpOn() ? `<th class="pr-cmp">${t("thCmpAug")}</th><th class="pr-cmp">${t("thCmpDiff")}</th>` : "");
  const cmpBlank = () => (cmpOn() ? `<td class="pr-cmp"></td><td class="pr-cmp"></td>` : "");

  function cmp2(refMap, refT, key, nowN) {
    const a = get(refMap, key).n / refT * 100;
    const b = nowN / V.T * 100;
    const d = b - a;
    const cls = Math.abs(d) < 0.3 ? "flat" : d > 0 ? "up" : "down";
    const sign = d > 0.3 ? "+" : d < -0.3 ? "&minus;" : "";
    return `<td class="pr-cmp">${get(refMap, key).n ? f1(a) + "%" : `<span class='pr-dim'>${t("wasNone")}</span>`}</td>
            <td class="pr-cmp"><span class="pr-delta ${cls}">${sign}${f1(Math.abs(d))}</span></td>`;
  }

  /* ---------- kesim: so'rovdan o'quvchilar ro'yxati ---------- */
  function slice(q) {
    const [kind, key] = q.split(":");
    const ST = V.ST, per = pLabel(V.P.key).replace(/&[a-z]+;/g, "–");
    if (kind === "all") return { title: t("drillAll", per), rows: ST.map((s) => [s, s.total]) };
    if (kind === "ch") return { title: t("drillCh", chLabel(key)), rows: ST.filter((s) => s.ch[key] > 0).map((s) => [s, s.ch[key]]) };
    if (kind === "reason") return { title: t("drillReason", rTitle(key)), rows: ST.filter((s) => s.reasons[key]).map((s) => [s, s.reasons[key]]) };
    if (kind === "module") return { title: t("drillModule", MODULE_MAP[key][0], MODULE_MAP[key][1]), rows: ST.filter((s) => s.mods[key]).map((s) => [s, s.mods[key]]) };
    if (kind === "lesson") {
      const L = LESSON_MAP[+key], M = MODULE_MAP[L[0]];
      return { title: t("drillLesson", L[1].trim() || t("noName"), M[0], M[1]), rows: ST.filter((s) => s.lessons[key]).map((s) => [s, s.lessons[key]]) };
    }
    if (kind === "curator") return { title: t("drillCurator", curName(key)), rows: ST.filter((s) => s.curator === key).map((s) => [s, s.total]) };
    if (kind === "rgroup") {
      const g = REASON_GROUPS[+key];
      return {
        title: t("drillRgroup", gTitle(+key)),
        rows: ST.map((s) => { let n = 0; g[1].forEach((c) => (n += s.reasons[c] || 0)); return [s, n]; }).filter((r) => r[1] > 0)
      };
    }
    return { title: "—", rows: [] };
  }

  // bitta o'quvchining kesimi: qaysi oyda, qaysi darsda, qaysi sababdan
  function detail(s) {
    const les = Object.entries(s.lessons).map(([i, n]) => [+i, n])
      .sort((a, b) => b[1] - a[1] || LESSON_MAP[a[0]][0].localeCompare(LESSON_MAP[b[0]][0]) || LESSON_MAP[a[0]][2] - LESSON_MAP[b[0]][2]);
    const rs = Object.entries(s.reasons).sort((a, b) => b[1] - a[1]);
    const pk = ["aug", "sep"].filter((k) => s.parts && s.parts[k]);
    const lead = pk.map((k) => {
      const p = s.parts[k], avg = p.total / p.tasks;
      return `<tr><td>${t(k === "aug" ? "monthAug" : "monthSep")}</td><td>${t("detRej", p.total)}</td>
              <td>${t("detTasks", p.tasks)}</td><td>${t("detAvg", f1(avg))}</td></tr>`;
    }).join("");
    const avgAll = pk.length === 1 ? s.parts[pk[0]].total / s.parts[pk[0]].tasks : null;
    return `
      <div class="pr-detail-box">
        <table class="pr-mini pr-mini-lead">${lead}
          ${pk.length > 1 ? `<tr class="pr-mini-tot"><td><b>${t("thTotal")}</b></td><td>${t("detRej", s.total)}</td><td colspan="2">${t("detTotNote")}</td></tr>` : ""}
        </table>
        ${avgAll !== null ? `<p class="pr-detail-lead">${avgAll >= 3 ? t("detStuck") : t("detOk")}</p>` : ""}
        <div class="pr-detail-cols">
          <div>
            <b>${t("detWhichLesson")}</b>
            <table class="pr-mini">${les.map(([i, n]) => `<tr><td><b>${esc(LESSON_MAP[i][1].trim()) || t("noName")}</b><small class="pr-sub">${esc(MODULE_MAP[LESSON_MAP[i][0]][0])} · ${esc(MODULE_MAP[LESSON_MAP[i][0]][1])} &middot; ${t("lessonOrder", LESSON_MAP[i][2])}</small></td><td>${fi(n)}</td></tr>`).join("")}</table>
          </div>
          <div>
            <b>${t("detWhichReason")}</b>
            <table class="pr-mini">${rs.map(([c, n]) => `<tr><td>${esc(rTitle(c))}</td><td>${fi(n)}</td></tr>`).join("")}</table>
          </div>
        </div>
      </div>`;
  }

  function openList(q) {
    const { title, rows } = slice(q);
    rows.sort((a, b) => b[1] - a[1] || a[0].name.localeCompare(b[0].name));
    const sum = rows.reduce((s, r) => s + r[1], 0);
    $("drillTitle").textContent = title;
    $("drillNote").innerHTML = t("drillNote", pLabel(V.P.key), rows.length, sum, V.T, f1(sum / V.T * 100)) +
      `<br><span class="pr-hint">${t("drillHint")}</span>`;
    $("drillBody").innerHTML = rows.map(([s, n], i) => `<tr>
      <td class="rank-col">${i + 1}</td>
      <td><button class="pr-open" data-sid="${s.id}">${esc(s.name)}</button></td>
      <td>${esc(s.group) || `<span class='pr-dim'>${t("noGroup")}</span>`}</td>
      <td>${esc(curName(s.curator))}</td>
      <td><b>${fi(n)}</b></td>
      <td class="pr-courses">${s.courses.map(([c, m]) => `<span class="pr-crs">${esc(c)} <b>${fi(m)}</b></span>`).join("")}</td>
    </tr>
    <tr class="pr-detail" id="d${s.id}" hidden><td></td><td colspan="5">${detail(s)}</td></tr>`).join("");
    const p = $("drillSection");
    p.hidden = false;
    p.scrollIntoView({ block: "start" });
  }

  /* ---------- 1. UMUMIY SON ---------- */
  function secTotal() {
    const rows = ["a", "v", "h"].map((k) => [k, get(V.byCh, k)]).sort((x, y) => y[1].n - x[1].n);
    const max = rows[0][1].n;
    const auto = get(V.byCh, "a").n + get(V.byCh, "v").n;
    const perDay = V.T / V.P.days;
    const augDay = VIEWS.aug.T / PMETA.aug.days;
    return `
    <section class="ranking panel-cut" id="pr1">
      <div class="section-head"><div>
        <p class="eyebrow">${t("s1eyebrow")}</p>
        <h2>${t("s1h2", pInn(V.P.key))}</h2>
      </div></div>
      <div class="pr-big">
        ${num("all", fi(V.T), "pr-num-big")}
        <p>${t("s1big", num("all", t("s1studSuffix", V.ST.length)), V.byModule.size, V.T)}</p>
      </div>

      <div class="pr-daily">
        <div>
          <b>${fi(perDay)}</b>
          <span>${t("perDayLabel")}</span>
          <small>${fi(V.T)} &divide; ${pDays(V.P.key)}</small>
        </div>
        ${V.P.key !== "aug" ? `<div>
          <b>${fi(augDay)}</b>
          <span>${t("perDayAugLabel")}</span>
          <small>${t("perDayAugHint", VIEWS.aug.T)}</small>
        </div>` : ""}
        ${V.P.key !== "aug" ? `<div class="pr-daily-days">
          <b>${t("sepDaysTitle")}</b>
          <small>${PR_SEP_DAYS.map(([, n, done], i) => `${t("dayNames")[i]}: <b>${fi(n)}</b>${done ? "" : ` <i>${t("dayUnfinished")}</i>`}`).join(" &middot; ")}</small>
        </div>` : ""}
      </div>

      <h3 class="sub-head">${t("s1sub")}</h3>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th>${t("thWho")}</th><th>${t("thRej")}</th><th>${t("thPct")}</th><th>&nbsp;</th><th>${t("thStud")}</th><th>${t("thNote")}</th></tr></thead>
        <tbody>
          ${rows.map(([k, e]) => `<tr>
            <td><b>${esc(chLabel(k))}</b></td>
            <td>${num("ch:" + k, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / V.T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("ch:" + k, fi(e.st))}</td>
            <td class="pr-note-cell">${chNote(k)}</td>
          </tr>`).join("")}
          <tr class="pr-total"><td><b>${t("thTotal")}</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(V.ST.length))}</td><td></td></tr>
        </tbody>
      </table></div>
      <p class="threshold-note">
        ${t("s1auto", f1(auto / V.T * 100))}<br>
        ${V.P.key === "sep" ? t("s1aiSep") : t("s1aiAug")}<br>
        ${t("s1click")}
      </p>
    </section>`;
  }

  /* ---------- 2. SABAB ---------- */
  function secReasons() {
    const rows = [...V.byReason.entries()].sort((a, b) => b[1].n - a[1].n);
    const max = rows.length ? rows[0][1].n : 0;
    return `
    <section class="ranking panel-cut" id="pr2">
      <div class="section-head"><div>
        <p class="eyebrow">${t("s2eyebrow")}</p>
        <h2>${t("s2h2")}</h2>
        <p class="section-note">${t("s2note")}${cmpOn() ? t("s2noteCmp") : ""}</p>
      </div></div>
      ${cmpOn() ? `<div class="pr-warn-strip">${t("s2cmpStrip")}</div>` : ""}
      <div class="table-wrap"><table class="pr-table">
        <thead><tr><th class="rank-col">#</th><th>${t("thReason")}</th><th>${t("thRej")}</th><th>${t("thPct")}</th><th>&nbsp;</th><th>${t("thStud")}</th>${cmpHead()}</tr></thead>
        <tbody>
          ${rows.map(([c, e], i) => `<tr>
            <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
            <td><b>${esc(rTitle(c))}</b>${rQuote(c) ? `<small class="pr-quote">${t("mentorQuote")} ${esc(rQuote(c))}</small>` : ""}</td>
            <td>${num("reason:" + c, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / V.T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("reason:" + c, fi(e.st))}</td>
            ${cmpOn() ? cmp2(VIEWS.aug.byReason, VIEWS.aug.T, c, e.n) : ""}
          </tr>`).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>${t("thTotal")}</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(V.ST.length))}</td>${cmpBlank()}</tr>
        </tbody>
      </table></div>
      <h3 class="sub-head">${t("s2sub")}</h3>
      <div class="mentor-stat-row">
        ${REASON_GROUPS.map((g, i) => {
          const e = get(V.byRgroup, i);
          const ra = get(VIEWS.aug.byRgroup, i);
          return `<div class="mentor-stat">
            ${num("rgroup:" + i, fi(e.n), "pr-num-stat")}
            <span>${esc(gTitle(i))}</span>
            <small>${esc(gDesc(i))}${t("rgroupTail", V.T, f1(e.n / V.T * 100), num("rgroup:" + i, t("rgroupStud", e.st)))}${
              cmpOn() ? t("rgroupWasAug", f1(ra.n / VIEWS.aug.T * 100)) : ""}</small>
          </div>`;
        }).join("")}
      </div>
    </section>`;
  }

  /* ---------- 3. KURATOR ---------- */
  function secCurators() {
    const rows = [...V.byCurator.entries()].sort((a, b) => {
      const ux = a[0] === CURATOR_MAP[0], uy = b[0] === CURATOR_MAP[0];
      if (ux !== uy) return ux ? 1 : -1;
      return b[1].n - a[1].n;
    });
    const max = rows.length ? Math.max(...rows.map((r) => r[1].n)) : 0;
    return `
    <section class="ranking panel-cut" id="pr3">
      <div class="section-head"><div>
        <p class="eyebrow">${t("s3eyebrow")}</p>
        <h2>${t("s3h2")}</h2>
        <p class="section-note">${t("s3note", rows.length)}</p>
      </div></div>
      <div class="pr-warn-strip">${t("s3strip")}</div>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th class="rank-col">#</th><th>${t("thCurator")}</th><th>${t("thRej")}</th><th>${t("thPct")}</th><th>&nbsp;</th><th>${t("thRejStud")}</th><th>${t("thPerStud")}</th>${cmpHead()}</tr></thead>
        <tbody>
          ${rows.map(([n, e], i) => {
            const u = n === CURATOR_MAP[0];
            return `<tr class="${u ? "row-unranked" : ""}">
              <td class="rank-col"><span class="rank ${u ? "off" : i < 3 ? "top" : ""}">${u ? "—" : i + 1}</span></td>
              <td><b>${esc(curName(n))}</b>${u ? `<small class="pr-sub">${t("s3unranked")}</small>` : ""}</td>
              <td>${num("curator:" + n, "<b>" + fi(e.n) + "</b>")}</td>
              <td>${f1(e.n / V.T * 100)}%</td>
              <td class="pr-barcell">${bar(e.n, max)}</td>
              <td>${num("curator:" + n, fi(e.st))}</td>
              <td><b>${f1(e.n / e.st)}</b></td>
              ${cmpOn() ? cmp2(VIEWS.aug.byCurator, VIEWS.aug.T, n, e.n) : ""}
            </tr>`;
          }).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>${t("thTotal")}</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(V.ST.length))}</td><td><b>${f1(V.T / V.ST.length)}</b></td>${cmpBlank()}</tr>
        </tbody>
      </table></div>
      <p class="threshold-note">${t("s3tail", V.T, rows.length)}</p>
    </section>`;
  }

  /* ---------- 4. MODUL VA DARS (nomga bosilganda darslar ochiladi) ---------- */
  // Modul ichidagi darslar: LESSON_MAP dan shu modulga tegishli darslar.
  // Dars sonlarining yig'indisi modul soniga aynan teng — ikkisi bir manbadan.
  function modLessons(mcode) {
    const out = [];
    V.byLesson.forEach((e, idx) => { if (LESSON_MAP[idx][0] === mcode) out.push([idx, e]); });
    out.sort((a, b) => b[1].n - a[1].n || LESSON_MAP[a[0]][2] - LESSON_MAP[b[0]][2]);
    return out;
  }

  function lessonRow(mcode, modN, cols) {
    const rows = modLessons(mcode);
    const sum = rows.reduce((a, r) => a + r[1].n, 0);
    const max = rows.length ? rows[0][1].n : 0;
    const M = MODULE_MAP[mcode];
    return `<tr class="pr-mod-detail" id="m${mcode}" hidden><td></td><td colspan="${cols - 1}">
      <div class="pr-detail-box">
        <p class="pr-detail-lead">${t("lessonLead", esc(M[0]), esc(M[1]), rows.length, sum)}</p>
        <div class="table-wrap"><table class="pr-table pr-lessons">
          <thead><tr><th class="rank-col">#</th><th>${t("thLesson")}</th><th>${t("thRej")}</th><th>${t("thInModule")}</th><th>&nbsp;</th><th>${t("thStud")}</th><th>${t("thPerStudShort")}</th></tr></thead>
          <tbody>
            ${rows.map(([idx, e], i) => `<tr>
              <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
              <td><b>${esc(LESSON_MAP[idx][1].trim()) || `<span class='pr-dim'>${t("noName")}</span>`}</b><small class="pr-sub">${t("lessonOrder", LESSON_MAP[idx][2])} &middot; ${t("lessonId", LESSON_MAP[idx][3])}</small></td>
              <td>${num("lesson:" + idx, "<b>" + fi(e.n) + "</b>")}</td>
              <td>${f1(e.n / sum * 100)}%</td>
              <td class="pr-barcell">${bar(e.n, max)}</td>
              <td>${num("lesson:" + idx, fi(e.st))}</td>
              <td><b>${f1(e.n / e.st)}</b></td>
            </tr>`).join("")}
            <tr class="pr-total"><td class="rank-col"></td><td><b>${t("thTotal")}</b></td><td>${num("module:" + mcode, "<b>" + fi(sum) + "</b>")}</td><td>100%</td><td></td><td>${num("module:" + mcode, fi(modN))}</td><td></td></tr>
          </tbody>
        </table></div>
      </div></td></tr>`;
  }

  function secModules() {
    const rows = [...V.byModule.entries()].sort((a, b) => b[1].n - a[1].n);
    const max = rows.length ? rows[0][1].n : 0;
    const cols = 7 + (cmpOn() ? 2 : 0);
    let topIdx = -1, topN = 0;
    V.byLesson.forEach((e, idx) => { if (e.n > topN) { topN = e.n; topIdx = idx; } });
    const TL = topIdx >= 0 ? LESSON_MAP[topIdx] : null;
    return `
    <section class="ranking panel-cut" id="pr4">
      <div class="section-head"><div>
        <p class="eyebrow">${t("s4eyebrow")}</p>
        <h2>${t("s4h2")}</h2>
        <p class="section-note">${t("s4note", pInn(V.P.key), rows.length, V.byLesson.size)}</p>
      </div></div>
      <div class="pr-warn-strip">
        ${t("s4strip")}${TL ? t("s4topLesson", esc(TL[1].trim()), esc(MODULE_MAP[TL[0]][0]), esc(MODULE_MAP[TL[0]][1]), topN) : ""}
      </div>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th class="rank-col">#</th><th>${t("thModule")}</th><th>${t("thRej")}</th><th>${t("thPct")}</th><th>&nbsp;</th><th>${t("thRejStud")}</th><th>${t("thPerStud")}</th>${cmpHead()}</tr></thead>
        <tbody>
          ${rows.map(([c, e], i) => `<tr>
            <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
            <td><button class="pr-mod" data-m="${esc(c)}"><b>${esc(MODULE_MAP[c][1])}</b><small class="pr-sub">${esc(MODULE_MAP[c][0])} · ${t("modOrder", MODULE_MAP[c][2])} &middot; ${t("modSeeLessons")}</small></button></td>
            <td>${num("module:" + c, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / V.T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("module:" + c, fi(e.st))}</td>
            <td><b>${f1(e.n / e.st)}</b></td>
            ${cmpOn() ? cmp2(VIEWS.aug.byModule, VIEWS.aug.T, c, e.n) : ""}
          </tr>
          ${lessonRow(c, e.st, cols)}`).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>${t("thTotal")}</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td></td><td></td>${cmpBlank()}</tr>
        </tbody>
      </table></div>
      <p class="threshold-note">${t("s4tail", V.ST.length)}</p>
    </section>`;
  }

  /* ---------- 5. IZOH ---------- */
  function secNote() {
    const rules = t("rules", {
      label: pLabel(V.P.key), T: V.T, ST: V.ST.length,
      exNg: V.EX.noGroup, exNgR: V.EX.noGroupRej, exTs: V.EX.test, exTsR: V.EX.testRej
    });
    return `
    <section class="ranking panel-cut" id="pr5">
      <div class="section-head"><div>
        <p class="eyebrow">${t("s5eyebrow")}</p>
        <h2>${t("s5h2")}</h2>
      </div></div>
      <div class="pr-rules">
        ${rules.map(([h, p]) => `<div><b>${h}</b><p>${p}</p></div>`).join("")}
      </div>
      <p class="threshold-note">
        ${t("s5closed", esc(PR_SNAPSHOT), esc(PR_RECHECK))}<br>
        ${t("s5open", esc(PR_SEP_CUT))}${V.P.key === "both" ? t("s5both") : ""}<br>
        ${t("s5tables")} <code>student_question_practice</code>, <code>student_questions</code>, <code>student_lessons</code>, <code>student_modules</code>, <code>student_courses</code>, <code>student_students</code>, <code>student_list</code>, <code>subscribe_list</code>, <code>group_list</code>, <code>gl_sys_users</code>.
      </p>
    </section>`;
  }

  /* ---------- montaj ---------- */
  function render() {
    const key = V.P.key, label = pLabel(key);

    $("app").innerHTML = secTotal() + secReasons() + secCurators() + secModules() + secNote() + `
    <section class="ranking panel-cut" id="drillSection" hidden>
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("drillEyebrow")}</p>
          <h2 id="drillTitle">—</h2>
          <p class="section-note" id="drillNote">—</p>
        </div>
        <button type="button" class="text-button" id="drillClose">${t("drillClose")}</button>
      </div>
      <div class="table-wrap"><table class="pr-table">
        <thead><tr><th class="rank-col">#</th><th>${t("thStudName")}</th><th>${t("thGroup")}</th><th>${t("thCurator")}</th><th>${t("thTotalRej")}</th><th>${t("thFromCourse")}</th></tr></thead>
        <tbody id="drillBody"></tbody>
      </table></div>
    </section>`;

    document.querySelectorAll("#app .section-head h2").forEach((h) => {
      if (h.id === "drillTitle") return;
      h.insertAdjacentHTML("afterend", `<p class="pr-period">${t("periodLine", label, V.P.closed, esc(PR_SEP_CUT))}</p>`);
    });

    $("pageTitle").innerHTML = t("h1");
    $("eyebrow").innerHTML = "Junior LMS · " + label;
    $("rangeChip").innerHTML = label;
    $("countChip").textContent = t("chipCount", V.T);
    document.title = t("docTitle", pShort(key));
    document.documentElement.lang = LANG;

    $("methodLead").innerHTML = t("methodLead", pInn(key), V.T);
    $("methodSummary").innerHTML = t("methodSummary");
    $("methodMore").innerHTML = t("methodMore", V.T);
    $("exclNote").innerHTML = t("exclNote", V.EX.noGroup, V.EX.noGroupRej, V.EX.test, V.EX.testRej, V.P.raw, V.T);
    $("footNote").innerHTML = t("footNote", label, esc(PR_SEP_CUT));

    $("periodWord").textContent = t("periodWord");
    ["aug", "sep", "both"].forEach((k) => {
      $("btn-" + k).textContent = t(k === "aug" ? "btnAug" : k === "sep" ? "btnSep" : "btnBoth");
    });
    $("periodNote").innerHTML = V.P.closed ? t("periodNoteClosed")
      : key === "sep" ? t("periodNoteSep", esc(PR_SEP_CUT.slice(11)))
        : t("periodNoteBoth", esc(PR_SEP_CUT));

    $("langWord").textContent = t("lang");
    document.querySelectorAll("#langFilter button").forEach((b) => b.classList.toggle("on", b.dataset.l === LANG));

    const nav = t("nav");
    document.querySelectorAll(".pr-subnav a").forEach((a, i) => (a.textContent = nav[i]));
  }

  function setPeriod(key) {
    if (!VIEWS[key]) return;
    V = VIEWS[key];
    document.querySelectorAll("#periodFilter button[data-p]").forEach((b) => b.classList.toggle("on", b.dataset.p === key));
    render();
  }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0 || l === LANG) return;
    LANG = l;
    try { localStorage.setItem("prLang", l); } catch (e) { /* xotira yopiq */ }
    render();
  }

  function build() {
    $("periodFilter").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-p]");
      if (b) setPeriod(b.dataset.p);
    });
    $("langFilter").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-l]");
      if (b) setLang(b.dataset.l);
    });

    $("app").addEventListener("click", (e) => {
      const b = e.target.closest(".pr-num");
      if (b) { openList(b.dataset.q); return; }
      const md = e.target.closest(".pr-mod");
      if (md) {
        const row = $("m" + md.dataset.m);
        row.hidden = !row.hidden;
        md.classList.toggle("open", !row.hidden);
        return;
      }
      const o = e.target.closest(".pr-open");
      if (o) {
        const row = $("d" + o.dataset.sid);
        row.hidden = !row.hidden;
        o.classList.toggle("open", !row.hidden);
        return;
      }
      if (e.target.closest("#drillClose")) $("drillSection").hidden = true;
    });

    setPeriod("aug");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
