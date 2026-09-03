/* ============================================================================
   RAD ETILGAN AMALIY VAZIFALAR — avgust va sentyabr
   Sahifadagi HAMMA son students.js dagi o'quvchi qatorlaridan hisoblanadi.
   Shu sababli har bir sonni bosganda uning ortidagi ro'yxat aynan shu sonni
   beradi — jadval bilan ro'yxat hech qachon bir-biriga mos kelmay qolmaydi.

   Davr filtri: avgust | sentyabr | ikkisi birga. Filtr o'zgarganda hamma son,
   hamma jadval va hamma ro'yxat noldan qayta hisoblanadi — hech qayerda
   oldingi davrning soni qolib ketmaydi.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fi = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString("ru-RU") : "—");
  const f1 = (x) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toFixed(1) : "—");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- o'quvchi qatorini ochish ---------- */
  function parseCounts(str) {
    const out = {};
    if (!str) return out;
    str.split(",").forEach((t) => { out[t[0]] = (out[t[0]] || 0) + (+t.slice(1)); });
    return out;
  }
  const CH_OF = (code) => REASON_MAP[code][0];   // "h" | "a" | "v"

  // dars tokenlari: "<2 belgi base36 indeks><son>" -> { indeks: son }
  function parseLessons(str) {
    const out = {};
    if (!str) return out;
    str.split(",").forEach((t) => {
      const i = parseInt(t.slice(0, 2), 36);
      out[i] = (out[i] || 0) + (+t.slice(2));
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
  // Sentyabr 2 kun emas: 1-sentyabr to'liq + 2-sentyabr 18:50 gacha.
  // Kunlik o'rtacha uchun shuning uchun 1,78 kun ishlatiladi, 2 emas.
  const SEP_DAYS = 1 + (18 * 60 + 50) / 1440;
  const PERIODS = {
    aug: {
      key: "aug", short: "Avgust", inn: "Avgustda", label: "1–31 avgust 2026",
      days: 31, daysNote: "31 kun", raw: 24671, closed: true,
      aiNote: "AI kod vazifalarini tekshiradi &mdash; avgustda 3-sanadan boshlab"
    },
    sep: {
      key: "sep", short: "Sentyabr", inn: "Sentyabrda", label: "1&ndash;2 sentyabr 2026",
      days: SEP_DAYS, daysNote: "1-sentyabr to'liq + 2-sentyabr 18:50 gacha, ya'ni 1,8 kun",
      raw: 829, closed: false,
      aiNote: "AI kod vazifalarini tekshiradi &mdash; sentyabrda birinchi kundan uzluksiz"
    },
    both: {
      key: "both", short: "Avgust + Sentyabr", inn: "Avgust va sentyabrda",
      label: "1-avgust &ndash; 2-sentyabr 2026",
      days: 31 + SEP_DAYS, daysNote: "31 kun avgust + 1,8 kun sentyabr", raw: 25500, closed: false,
      aiNote: "AI kod vazifalarini tekshiradi &mdash; 3-avgustdan uzluksiz"
    }
  };

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
      P: PERIODS[key], ST: list, T, EX: ex,
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
  const VIEWS = { aug: makeView("aug"), sep: makeView("sep"), both: makeView("both") };
  let V = VIEWS.aug;

  const CH_LABEL = {
    h: ["Mentor (odam)", "Xodim ko'rib, izoh yozib rad etadi"],
    a: ["AI tekshiruvi", ""],
    v: ["Ovoz avtotekshiruvi (English)", "Ovozli javobni tizim tekshiradi"]
  };
  const chNote = (k) => (k === "a" ? V.P.aiNote : CH_LABEL[k][1]);

  /* ---------- bosiladigan son ---------- */
  const num = (q, txt, cls) => `<button class="pr-num ${cls || ""}" data-q="${esc(q)}">${txt}</button>`;
  const bar = (n, max) => `<span class="pr-bar" style="width:${max > 0 ? Math.max(0.8, Math.min(100, n / max * 100)) : 0.8}%"></span>`;
  const get = (m, k) => m.get(k) || { n: 0, st: 0 };

  // sentyabrni ko'rganda avgust foizi bilan solishtirish ustuni chiqadi —
  // «qaysi foiz ustida ishlash kerak» degan savolga aynan shu javob beradi.
  const cmpOn = () => V.P.key === "sep";
  const cmpHead = () => (cmpOn() ? `<th class="pr-cmp">Avgustda foiz</th><th class="pr-cmp">Farq, punkt</th>` : "");
  const cmpBlank = () => (cmpOn() ? `<td class="pr-cmp"></td><td class="pr-cmp"></td>` : "");

  /* ---------- kesim: so'rovdan o'quvchilar ro'yxati ---------- */
  function slice(q) {
    const [kind, key] = q.split(":");
    const ST = V.ST, per = V.P.label.replace(/&[a-z]+;/g, "–");
    if (kind === "all") return { title: `${per} — rad etilgan barcha vazifalar`, rows: ST.map((s) => [s, s.total]) };
    if (kind === "ch") return { title: CH_LABEL[key][0] + " rad etgan vazifalar", rows: ST.filter((s) => s.ch[key] > 0).map((s) => [s, s.ch[key]]) };
    if (kind === "reason") return { title: "Sabab: " + REASON_MAP[key][1], rows: ST.filter((s) => s.reasons[key]).map((s) => [s, s.reasons[key]]) };
    if (kind === "module") return { title: "Modul: " + MODULE_MAP[key][0] + " · " + MODULE_MAP[key][1], rows: ST.filter((s) => s.mods[key]).map((s) => [s, s.mods[key]]) };
    if (kind === "lesson") {
      const L = LESSON_MAP[+key], M = MODULE_MAP[L[0]];
      return {
        title: "Dars: " + L[1].trim() + "  —  " + M[0] + " · " + M[1],
        rows: ST.filter((s) => s.lessons[key]).map((s) => [s, s.lessons[key]])
      };
    }
    if (kind === "curator") return { title: "Kurator: " + key, rows: ST.filter((s) => s.curator === key).map((s) => [s, s.total]) };
    if (kind === "rgroup") {
      const g = REASON_GROUPS[+key];
      return {
        title: "Mentor sababi: " + g[0],
        rows: ST.map((s) => { let n = 0; g[1].forEach((c) => (n += s.reasons[c] || 0)); return [s, n]; }).filter((r) => r[1] > 0)
      };
    }
    return { title: "—", rows: [] };
  }

  // bitta o'quvchining kesimi: qaysi oyda, qaysi modulda, qaysi sababdan
  function detail(s) {
    const les = Object.entries(s.lessons).map(([i, n]) => [+i, n])
      .sort((a, b) => b[1] - a[1] || LESSON_MAP[a[0]][0].localeCompare(LESSON_MAP[b[0]][0]) || LESSON_MAP[a[0]][2] - LESSON_MAP[b[0]][2]);
    const rs = Object.entries(s.reasons).sort((a, b) => b[1] - a[1]);
    const pk = ["aug", "sep"].filter((k) => s.parts && s.parts[k]);
    const lead = pk.map((k) => {
      const p = s.parts[k], avg = p.total / p.tasks;
      return `<tr><td>${k === "aug" ? "Avgust" : "Sentyabr"}</td><td><b>${fi(p.total)}</b> rad etish</td>
              <td><b>${fi(p.tasks)}</b> xil vazifada</td><td>1 vazifaga o'rtacha <b>${f1(avg)}</b></td></tr>`;
    }).join("");
    const avgAll = pk.length === 1 ? s.parts[pk[0]].total / s.parts[pk[0]].tasks : null;
    return `
      <div class="pr-detail-box">
        <table class="pr-mini pr-mini-lead">${lead}
          ${pk.length > 1 ? `<tr class="pr-mini-tot"><td><b>JAMI</b></td><td><b>${fi(s.total)}</b> rad etish</td><td colspan="2">Ikki oyda bir xil vazifa bo'lishi mumkin, shu sababli &laquo;xil vazifa&raquo; qo'shilmaydi &mdash; oy bo'yicha alohida turadi.</td></tr>` : ""}
        </table>
        ${avgAll !== null ? `<p class="pr-detail-lead">${avgAll >= 3
          ? "Ba'zi vazifalarni ko'p marta qayta yuborgan: yordam kerak bo'lgan joy shu."
          : "Ko'p vazifada bir-ikki martadan &mdash; jiddiy tiqilish yo'q."}</p>` : ""}
        <div class="pr-detail-cols">
          <div>
            <b>Qaysi darsda</b>
            <table class="pr-mini">${les.map(([i, n]) => `<tr><td><b>${esc(LESSON_MAP[i][1].trim()) || "nomsiz dars"}</b><small class="pr-sub">${esc(MODULE_MAP[LESSON_MAP[i][0]][0])} · ${esc(MODULE_MAP[LESSON_MAP[i][0]][1])} &middot; dars tartibi ${LESSON_MAP[i][2]}</small></td><td>${fi(n)}</td></tr>`).join("")}</table>
          </div>
          <div>
            <b>Qaysi sababdan</b>
            <table class="pr-mini">${rs.map(([c, n]) => `<tr><td>${esc(REASON_MAP[c][1])}</td><td>${fi(n)}</td></tr>`).join("")}</table>
          </div>
        </div>
      </div>`;
  }

  function openList(q) {
    const { title, rows } = slice(q);
    rows.sort((a, b) => b[1] - a[1] || a[0].name.localeCompare(b[0].name));
    const sum = rows.reduce((s, r) => s + r[1], 0);
    $("drillTitle").textContent = title;
    $("drillNote").innerHTML = `Davr: <b>${V.P.label}</b>. <b>${fi(rows.length)}</b> o'quvchi &middot; <b>${fi(sum)}</b> rad etish (umumiy ${fi(V.T)} dan ${f1(sum / V.T * 100)}%). Ro'yxat rad etish soni bo'yicha tartiblangan.<br>
      <span class="pr-hint"><b>&laquo;Qaysi kursdan&raquo;</b> ustunidagi sonlar qo'shilib <b>jami rad etish</b> ni beradi &mdash; masalan English 69 + Dasturlash kursi 41 + Grafik dizayn 19 = 129.
      <b>Ismga bosing</b> &mdash; qaysi <b>oyda</b>, qaysi <b>modulda</b> va qaysi <b>sababdan</b> rad etilgani ochiladi.</span>`;
    $("drillBody").innerHTML = rows.map(([s, n], i) => `<tr>
      <td class="rank-col">${i + 1}</td>
      <td><button class="pr-open" data-sid="${s.id}">${esc(s.name)}</button></td>
      <td>${esc(s.group) || "<span class='pr-dim'>guruhi yo'q</span>"}</td>
      <td>${esc(s.curator)}</td>
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
    const augDay = VIEWS.aug.T / PERIODS.aug.days;
    return `
    <section class="ranking panel-cut" id="pr1">
      <div class="section-head"><div>
        <p class="eyebrow">1 · Umumiy son</p>
        <h2>${V.P.inn} nechta vazifa rad etildi</h2>
      </div></div>
      <div class="pr-big">
        ${num("all", fi(V.T), "pr-num-big")}
        <p>ta amaliy vazifa <b>rad etilgan</b>.<br>
        Bu <b>rad etish hodisasi</b> soni: bitta vazifa uch marta rad etilsa, uchta sanaladi.<br>
        Bu ${num("all", fi(V.ST.length) + " ta o'quvchida")}, ${fi(V.byModule.size)} ta modulda sodir bo'lgan.</p>
      </div>

      <div class="pr-daily">
        <div>
          <b>${fi(perDay)}</b>
          <span>kuniga o'rtacha</span>
          <small>${fi(V.T)} &divide; ${V.P.daysNote}</small>
        </div>
        ${V.P.key !== "aug" ? `<div>
          <b>${fi(augDay)}</b>
          <span>avgustda kuniga o'rtacha</span>
          <small>Solishtirish uchun: ${fi(VIEWS.aug.T)} &divide; 31 kun</small>
        </div>` : ""}
        ${V.P.key !== "aug" ? `<div class="pr-daily-days">
          <b>Sentyabrning kunlari</b>
          <small>${PR_SEP_DAYS.map(([d, n, done]) => `${d}: <b>${fi(n)}</b>${done ? "" : " <i>(18:50 gacha, kun tugamagan)</i>"}`).join(" &middot; ")}</small>
        </div>` : ""}
      </div>

      <h3 class="sub-head">Rad etishni kim qo'ygan</h3>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th>Kim tekshirib rad etdi</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>O'quvchi</th><th>Izoh</th></tr></thead>
        <tbody>
          ${rows.map(([k, e]) => `<tr>
            <td><b>${esc(CH_LABEL[k][0])}</b></td>
            <td>${num("ch:" + k, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / V.T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("ch:" + k, fi(e.st))}</td>
            <td class="pr-note-cell">${chNote(k)}</td>
          </tr>`).join("")}
          <tr class="pr-total"><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(V.ST.length))}</td><td></td></tr>
        </tbody>
      </table></div>
      <p class="threshold-note">
        Rad etishning ${f1(auto / V.T * 100)}% ini <b>odam emas, tizim</b> qo'ygan: kod vazifalarini AI, English kursidagi ovozli mashqlarni ovoz avtotekshiruvi tekshiradi.
        Bu bo'linish faqat shu yerda ko'rsatiladi. Blockly o'yin vazifalari umuman kirmaydi &mdash; ularni tizim avtomatik qabul qiladi, hech qachon rad etmaydi.<br>
        ${V.P.key === "sep" ? `<b>Sentyabrda AI birinchi kundan ishlagan</b> &mdash; 1-sentyabr 00:01 dan uzluksiz. Ya'ni sentyabrda uchala ustun ham to'liq davrni qamraydi.`
          : `<b>AI tekshiruvi butun avgust ishlamagan.</b> Bazadagi eng birinchi AI tekshiruvi &mdash; 30-iyul 11:35. U 31-iyul ertalab 08:57 da to'xtagan,
        <b>1 va 2 avgustda umuman ishlamagan</b>, va 3-avgust 15:30 da qaytib yoqilgan &mdash; shundan keyin uzluksiz ishlagan.
        Shu sababli AI ustunidagi son avgustning 31 kuniga emas, <b>29 kuniga</b> tegishli. <b>Bu ma'lumot yetishmasligi emas</b> &mdash; o'sha ikki kunda AI umuman ishlamagan,
        kod vazifalarini mentorlar tekshirgan, shu sababli 1 va 2 avgustning jami soni ham to'liq: mentor tekshiruvi 1-avgustda 1 335, 2-avgustda 1 275 ta bo'lgan
        &mdash; oyning eng baland kunlari; AI yoqilgach kuniga 350&ndash;500 ga tushgan.`}<br>
        <b>Har bir songa bosing</b> &mdash; o'sha sonning ortidagi o'quvchilar ro'yxati ochiladi.
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
        <p class="eyebrow">2 · Sabab</p>
        <h2>Nega rad etildi</h2>
        <p class="section-note">Har bir rad etishda izoh yozilgan. Izohlar erkin matn, shu sababli kalit so'zlar bo'yicha toifalangan (qoidalar oxirgi bo'limda).${
          cmpOn() ? ` Oxirgi ikki ustun <b>avgust bilan solishtiradi</b>: qaysi sabab ulushi o'sgan, qaysi biri kamaygan.` : ""}</p>
      </div></div>
      ${cmpOn() ? `<div class="pr-warn-strip"><b>Farq &mdash; foiz punktida.</b> Masalan avgustda 5,4% bo'lgan sabab sentyabrda 7,4% bo'lsa, farq +2,0 punkt. Bu ulushning o'zgarishi, sonning emas: sentyabr hali 2 kun, shu sababli yalpi sonni avgust bilan solishtirmang &mdash; ulushni solishtiring.</div>` : ""}
      <div class="table-wrap"><table class="pr-table">
        <thead><tr><th class="rank-col">#</th><th>Rad etish sababi</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>O'quvchi</th>${cmpHead()}</tr></thead>
        <tbody>
          ${rows.map(([c, e], i) => `<tr>
            <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
            <td><b>${esc(REASON_MAP[c][1])}</b>${REASON_MAP[c][2] ? `<small class="pr-quote">Mentor izohi: ${esc(REASON_MAP[c][2])}</small>` : ""}</td>
            <td>${num("reason:" + c, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / V.T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("reason:" + c, fi(e.st))}</td>
            ${cmpOn() ? cmp2(VIEWS.aug.byReason, VIEWS.aug.T, c, e.n) : ""}
          </tr>`).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(V.ST.length))}</td>${cmpBlank()}</tr>
        </tbody>
      </table></div>
      <h3 class="sub-head">Xodim (mentor) qo'ygan rad etishlar nima sababdan</h3>
      <div class="mentor-stat-row">
        ${REASON_GROUPS.map((g, i) => {
          const e = get(V.byRgroup, i);
          const ra = get(VIEWS.aug.byRgroup, i);
          return `<div class="mentor-stat">
            ${num("rgroup:" + i, fi(e.n), "pr-num-stat")}
            <span>${esc(g[0])}</span>
            <small>${esc(g[2])} Umumiy ${fi(V.T)} dan ${f1(e.n / V.T * 100)}%, ${num("rgroup:" + i, fi(e.st) + " o'quvchi")}.${
              cmpOn() ? ` Avgustda ${f1(ra.n / VIEWS.aug.T * 100)}% edi.` : ""}</small>
          </div>`;
        }).join("")}
      </div>
    </section>`;
  }

  // avgust bilan solishtirish ustunlari (faqat sentyabr ko'rinishida)
  function cmp2(refMap, refT, key, nowN) {
    const a = get(refMap, key).n / refT * 100;
    const b = nowN / V.T * 100;
    const d = b - a;
    const cls = Math.abs(d) < 0.3 ? "flat" : d > 0 ? "up" : "down";
    const sign = d > 0.3 ? "+" : d < -0.3 ? "&minus;" : "";
    return `<td class="pr-cmp">${get(refMap, key).n ? f1(a) + "%" : "<span class='pr-dim'>yo'q edi</span>"}</td>
            <td class="pr-cmp"><span class="pr-delta ${cls}">${sign}${f1(Math.abs(d))}</span></td>`;
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
        <p class="eyebrow">3 · Kurator</p>
        <h2>Qaysi kuratorning o'quvchilarida ko'p</h2>
        <p class="section-note">Bizda <b>7 kurator</b> bor. Kurator = o'quvchining faol obunasidagi guruh kuratori; har bir o'quvchida bitta kurator. Guruhi yo'q o'quvchilar va test akkaunt saytdan chiqarilgani uchun jadvalda aynan ${rows.length} qator bor.</p>
      </div></div>
      <div class="pr-warn-strip">
        <b>Eng muhim ustun &mdash; &laquo;1 o'quvchiga o'rtacha&raquo;.</b> Yalpi son adashtiradi: ko'p o'quvchisi bor kuratorda rad etish tabiiy ravishda ko'p bo'ladi.
      </div>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th class="rank-col">#</th><th>Kurator</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th>${cmpHead()}</tr></thead>
        <tbody>
          ${rows.map(([n, e], i) => {
            const u = n === CURATOR_MAP[0];
            return `<tr class="${u ? "row-unranked" : ""}">
              <td class="rank-col"><span class="rank ${u ? "off" : i < 3 ? "top" : ""}">${u ? "—" : i + 1}</span></td>
              <td><b>${esc(n)}</b>${u ? `<small class="pr-sub">faol obunasi yo'q &mdash; muzlatilgan, tugatgan yoki test hisoblari</small>` : ""}</td>
              <td>${num("curator:" + n, "<b>" + fi(e.n) + "</b>")}</td>
              <td>${f1(e.n / V.T * 100)}%</td>
              <td class="pr-barcell">${bar(e.n, max)}</td>
              <td>${num("curator:" + n, fi(e.st))}</td>
              <td><b>${f1(e.n / e.st)}</b></td>
              ${cmpOn() ? cmp2(VIEWS.aug.byCurator, VIEWS.aug.T, n, e.n) : ""}
            </tr>`;
          }).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(V.ST.length))}</td><td><b>${f1(V.T / V.ST.length)}</b></td>${cmpBlank()}</tr>
        </tbody>
      </table></div>
      <p class="threshold-note">Jadval umumiy ${fi(V.T)} ta rad etishning hammasini qoplaydi &mdash; ${rows.length} kurator, boshqa qator yo'q.</p>
    </section>`;
  }

  /* ---------- 4. MODUL (nomga bosilganda darslar ochiladi) ---------- */
  // Modul ichidagi darslar qatori: LESSON_MAP dan shu modulga tegishli darslar.
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
        <p class="pr-detail-lead">
          <b>${esc(M[0])} &middot; ${esc(M[1])}</b> modulida rad etish <b>${fi(rows.length)}</b> ta darsda bo'lgan.
          Quyidagi sonlar qo'shilib <b>${fi(sum)}</b> ni beradi &mdash; modul qatoridagi son bilan aynan bir xil.
          <br>Har bir dars soni ham bosiladi &mdash; o'sha darsda rad etilgan o'quvchilar ro'yxati ochiladi.
        </p>
        <div class="table-wrap"><table class="pr-table pr-lessons">
          <thead><tr><th class="rank-col">#</th><th>Dars</th><th>Rad etishlar</th><th>Modul ichida</th><th>&nbsp;</th><th>O'quvchi</th><th>1 o'quvchiga</th></tr></thead>
          <tbody>
            ${rows.map(([idx, e], i) => `<tr>
              <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
              <td><b>${esc(LESSON_MAP[idx][1].trim()) || "<span class='pr-dim'>nomsiz dars</span>"}</b><small class="pr-sub">dars tartibi ${LESSON_MAP[idx][2]} &middot; dars id ${LESSON_MAP[idx][3]}</small></td>
              <td>${num("lesson:" + idx, "<b>" + fi(e.n) + "</b>")}</td>
              <td>${f1(e.n / sum * 100)}%</td>
              <td class="pr-barcell">${bar(e.n, max)}</td>
              <td>${num("lesson:" + idx, fi(e.st))}</td>
              <td><b>${f1(e.n / e.st)}</b></td>
            </tr>`).join("")}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("module:" + mcode, "<b>" + fi(sum) + "</b>")}</td><td>100%</td><td></td><td>${num("module:" + mcode, fi(modN))}</td><td></td></tr>
          </tbody>
        </table></div>
      </div></td></tr>`;
  }

  function secModules() {
    const rows = [...V.byModule.entries()].sort((a, b) => b[1].n - a[1].n);
    const max = rows.length ? rows[0][1].n : 0;
    const cols = 7 + (cmpOn() ? 2 : 0);
    // eng ko'p rad etilgan bitta dars — bo'lim izohida ko'rsatamiz
    let topIdx = -1, topN = 0;
    V.byLesson.forEach((e, idx) => { if (e.n > topN) { topN = e.n; topIdx = idx; } });
    const TL = topIdx >= 0 ? LESSON_MAP[topIdx] : null;
    return `
    <section class="ranking panel-cut" id="pr4">
      <div class="section-head"><div>
        <p class="eyebrow">4 · Modul va dars</p>
        <h2>Qaysi moduldan, qaysi darsdan ko'p</h2>
        <p class="section-note">${V.P.inn} rad etish bo'lgan barcha ${fi(rows.length)} modul va ${fi(V.byLesson.size)} dars.</p>
      </div></div>
      <div class="pr-warn-strip">
        <b>Modul nomiga bosing</b> &mdash; masalan <b>CSS</b> ga &mdash; o'sha modulning <b>qaysi darsida</b> rad etilgani ochiladi.
        Muammoni tuzatish uchun kerakli son shu: modul emas, aynan dars.${
          TL ? ` Eng ko'p rad etilgan dars: <b>${esc(TL[1].trim())}</b> (${esc(MODULE_MAP[TL[0]][0])} &middot; ${esc(MODULE_MAP[TL[0]][1])}) &mdash; ${fi(topN)} marta.` : ""}
      </div>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th class="rank-col">#</th><th>Modul</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th>${cmpHead()}</tr></thead>
        <tbody>
          ${rows.map(([c, e], i) => `<tr>
            <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
            <td><button class="pr-mod" data-m="${esc(c)}"><b>${esc(MODULE_MAP[c][1])}</b><small class="pr-sub">${esc(MODULE_MAP[c][0])} · ${MODULE_MAP[c][2]}-modul &middot; darslarni ko'rish</small></button></td>
            <td>${num("module:" + c, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / V.T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("module:" + c, fi(e.st))}</td>
            <td><b>${f1(e.n / e.st)}</b></td>
            ${cmpOn() ? cmp2(VIEWS.aug.byModule, VIEWS.aug.T, c, e.n) : ""}
          </tr>
          ${lessonRow(c, e.st, cols)}`).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(V.T) + "</b>")}</td><td>100%</td><td></td><td></td><td></td>${cmpBlank()}</tr>
        </tbody>
      </table></div>
      <p class="threshold-note">&laquo;Rad etilgan o'quvchi&raquo; ustunlarining yig'indisi ${fi(V.ST.length)} dan katta &mdash; bitta o'quvchi bir necha modulda rad etilgan bo'lishi mumkin, shu sababli u har bir modulda bir marta sanaladi. Dars bo'yicha ham xuddi shunday.</p>
    </section>`;
  }

  /* ---------- 5. IZOH ---------- */
  function secNote() {
    const per = V.P.key;
    return `
    <section class="ranking panel-cut" id="pr5">
      <div class="section-head"><div>
        <p class="eyebrow">5 · Izoh</p>
        <h2>Sonlar qanday olingan</h2>
      </div></div>
      <div class="pr-rules">
        <div><b>Rad etish</b><p>Bazada <code>student_question_practice</code> jadvalidagi <code>status = 'rejected'</code> qatorlar. Davr &mdash; <code>created_at</code> ${V.P.label}.</p></div>
        <div><b>Birlik</b><p>Bitta qator = bitta rad etish hodisasi. Bitta vazifa uch marta rad etilsa &mdash; uch qator. Shu sababli ${fi(V.T)} soni vazifa soni emas.</p></div>
        <div><b>Foiz</b><p>Saytdagi har bir foiz bitta mahrajdan olingan: tanlangan davrdagi ${fi(V.T)} ta rad etish. Boshqa mahraj yo'q.</p></div>
        <div><b>Davr filtri</b><p>Yuqoridagi filtr avgust, sentyabr yoki ikkisini birga ko'rsatadi. Filtr bosilganda hamma son noldan qayta hisoblanadi &mdash; oldingi davrning soni hech qayerda qolmaydi. Ikki oy birga tanlanganda bir xil o'quvchi bir marta sanaladi, sonlari esa qo'shiladi.</p></div>
        <div><b>Har bir son bosiladi</b><p>Sahifadagi hamma son bitta ro'yxatdan &mdash; ${fi(V.ST.length)} o'quvchi qatoridan hisoblanadi. Songa bosilganda aynan shu son ortidagi o'quvchilar chiqadi, shu sababli jadval bilan ro'yxat doim mos keladi.</p></div>
        <div><b>AI tekshiruvi qachondan</b><p>Birinchi AI tekshiruvi 30-iyul 11:35. 1&ndash;2 avgustda ishlamagan, 3-avgust 15:30 dan uzluksiz &mdash; sentyabrda ham birinchi kundan ishlagan. Ya'ni AI soni avgustning 29 kuniga, sentyabrning esa hamma kuniga tegishli. Jami son har kuni to'liq: AI ishlamagan kunlarda mentorlar tekshirgan.</p></div>
        <div><b>Kim kirmaydi</b><p>Guruhi yo'q &mdash; faol obunasi bo'lmagan, muzlatilgan yoki tugatgan &mdash; ${fi(V.EX.noGroup)} o'quvchi (${fi(V.EX.noGroupRej)} rad etish) va ${fi(V.EX.test)} test akkaunt (${fi(V.EX.testRej)} rad etish). &laquo;Guruhi yo'q&raquo; bilan &laquo;kuratori yo'q&raquo; to'plami aynan bir xil, shu sababli kurator jadvalida faqat 7 kurator qoldi.</p></div>
        <div><b>Blockly kirmaydi</b><p><code>teacher_id = 1</code>, izoh <code>blockly-game</code> &mdash; o'yin vazifalarini tizim avtomatik qabul qiladi va hech qachon rad etmaydi.</p></div>
        <div><b>Sabab toifasi</b><p>Izoh erkin matn (mentor izohlarida 1 597 xil matn). Kalit so'zlar bo'yicha prioritetli tartibda toifalanadi; bir izoh faqat bitta toifaga tushadi.</p></div>
      </div>
      <p class="threshold-note">
        <b>Avgust yopilgan &mdash; uning sonlari yakuniy.</b> Avgust ma'lumoti ${esc(PR_SNAPSHOT)} da olingan va ${esc(PR_RECHECK)} da bazaga qayta solishtirilgan:
        avgustda bitta ham tekshirilmagan (<code>uploaded</code>) topshiriq qolmagan, jami rad etish <b>24 671</b> da o'zgarmagan. Ya'ni sonlar 1&ndash;31 avgustni to'liq qamraydi va endi o'zgarmaydi. 31-avgust ham ichida: o'sha kuni 784 rad etish.<br>
        <b>Sentyabr hali yopilmagan.</b> Bugun 2-sentyabr, baza to'lib turadi. Shu sababli sentyabr kesimi aniq vaqtga qadalgan: <b>${esc(PR_SEP_CUT)}</b>. O'sha vaqtdan keyin qo'yilgan rad etishlar bu yerda yo'q, va sentyabr sonlari keyingi yangilashda o'sadi.
        Shuning uchun sentyabrni avgust bilan <b>yalpi son bo'yicha solishtirmang</b> &mdash; kunlik o'rtacha yoki foiz ulushi bo'yicha solishtiring.${
          per === "both" ? ` Hozir ikki oy birga tanlangan: xom jami <b>25 500</b> (avgust 24 671 + sentyabr 829).` : ""}<br>
        <b>Manba jadvallar:</b> <code>student_question_practice</code>, <code>student_questions</code>, <code>student_lessons</code>, <code>student_modules</code>, <code>student_courses</code>, <code>student_students</code>, <code>student_list</code>, <code>subscribe_list</code>, <code>group_list</code>, <code>gl_sys_users</code>.
      </p>
    </section>`;
  }

  /* ---------- montaj ---------- */
  function render() {
    $("app").innerHTML = secTotal() + secReasons() + secCurators() + secModules() + secNote() + `
    <section class="ranking panel-cut" id="drillSection" hidden>
      <div class="section-head">
        <div>
          <p class="eyebrow">Ro'yxat</p>
          <h2 id="drillTitle">—</h2>
          <p class="section-note" id="drillNote">—</p>
        </div>
        <button type="button" class="text-button" id="drillClose">yopish &#10005;</button>
      </div>
      <div class="table-wrap"><table class="pr-table">
        <thead><tr><th class="rank-col">#</th><th>O'quvchi</th><th>Guruh</th><th>Kurator</th><th>Jami rad etish</th><th>Qaysi kursdan</th></tr></thead>
        <tbody id="drillBody"></tbody>
      </table></div>
    </section>`;

    document.querySelectorAll("#app .section-head h2").forEach((h) => {
      if (h.id === "drillTitle") return;
      h.insertAdjacentHTML("afterend",
        `<p class="pr-period">Davr: <b>${V.P.label}</b>${V.P.closed ? " &mdash; yopilgan, sonlar yakuniy" : ` &mdash; hali to'lib turadi (kesim ${esc(PR_SEP_CUT)})`}</p>`);
    });

    $("eyebrow").innerHTML = "Junior LMS · " + V.P.label;
    $("rangeChip").innerHTML = V.P.label;
    $("countChip").textContent = `${fi(V.T)} ta rad etish`;
    document.title = (V.P.key === "sep" ? "Sentyabrda" : V.P.key === "both" ? "Avgust va sentyabrda" : "Avgustda") + " rad etilgan amaliy vazifalar";

    $("methodLead").innerHTML =
      `${V.P.inn} <b>${fi(V.T)}</b> ta amaliy vazifa rad etilgan (guruhi bor o'quvchilar bo'yicha). ` +
      `Bu sayt shu sonni bo'lib ko'rsatadi: <b>nega</b> rad etilgan, <b>qaysi kuratorda</b> va <b>qaysi moduldan</b> ko'p.`;
    $("methodMore").innerHTML =
      `<b>${fi(V.T)}</b> &mdash; bu <b>rad etish hodisasi</b> soni, vazifa soni emas. Bitta o'quvchi bitta vazifani uch marta yuborib, uch marta rad ettirsa, u uch marta sanaladi. ` +
      `Blockly o'yin vazifalari bu yerda umuman yo'q: ularni tizim avtomatik qabul qiladi va hech qachon rad etmaydi.`;

    $("exclNote").innerHTML =
      `Saytdan chiqarilgan: guruhi yo'q <b>${fi(V.EX.noGroup)}</b> o'quvchi (<b>${fi(V.EX.noGroupRej)}</b> rad etish) ` +
      `va platformadagi <b>${fi(V.EX.test)}</b> test akkaunt (<b>${fi(V.EX.testRej)}</b> rad etish). ` +
      `Bazadagi xom jami — ${fi(V.P.raw)}; bu yerdagi <b>${fi(V.T)}</b> esa faqat guruhi bor haqiqiy o'quvchilar bo'yicha.`;

    $("periodNote").innerHTML = V.P.closed
      ? "Avgust yopilgan &mdash; sonlar yakuniy."
      : V.P.key === "sep"
        ? `Sentyabr hali tugamagan: 1-sentyabr to'liq + 2-sentyabr ${esc(PR_SEP_CUT.slice(11))} gacha.`
        : `Ichida tugamagan sentyabr bor (kesim ${esc(PR_SEP_CUT)}).`;

    $("footNote").innerHTML =
      `Manba: Junior LMS / CRM bazasi. Davr: ${V.P.label} (topshiriq yuborilgan sana bo'yicha). ` +
      `Barcha son bazadagi haqiqiy qatorlardan olingan &mdash; hech narsa taxmin qilinmagan. ` +
      `Avgust yopilgan: tekshirilmagan topshiriq qolmagan, sonlar yakuniy. Sentyabr kesimi: ${esc(PR_SEP_CUT)}.`;
  }

  function setPeriod(key) {
    if (!VIEWS[key]) return;
    V = VIEWS[key];
    document.querySelectorAll("#periodFilter button").forEach((b) => b.classList.toggle("on", b.dataset.p === key));
    render();
  }

  function build() {
    $("periodFilter").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-p]");
      if (b) setPeriod(b.dataset.p);
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
