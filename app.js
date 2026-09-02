/* ============================================================================
   AVGUSTDA RAD ETILGAN AMALIY VAZIFALAR
   Sahifadagi HAMMA son students.js dagi 2 052 o'quvchi qatoridan hisoblanadi.
   Shu sababli har bir sonni bosganda uning ortidagi ro'yxat aynan shu sonni
   beradi — jadval bilan ro'yxat hech qachon bir-biriga mos kelmay qolmaydi.
   Davr: 1-31 avgust 2026.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fi = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString("ru-RU") : "—");
  const f1 = (x) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toFixed(1) : "—");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- o'quvchilarni bir marta ochib olamiz ---------- */
  function parseCounts(str) {
    const out = {};
    if (!str) return out;
    str.split(",").forEach((t) => { out[t[0]] = (out[t[0]] || 0) + (+t.slice(1)); });
    return out;
  }
  const CH_OF = (code) => REASON_MAP[code][0];   // "h" | "a" | "v"

  // modul sonlarini KURS bo'yicha yig'ish: MODULE_MAP[belgi][0] = kurs nomi.
  // Yig'indisi o'quvchining jami rad etishiga aynan teng bo'ladi.
  function byCourse(mods) {
    const m = {};
    for (const k in mods) { const c = MODULE_MAP[k][0]; m[c] = (m[c] || 0) + mods[k]; }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }

  const ST = STUDENTS.map((r, i) => {
    const mods = parseCounts(r[4]), reasons = parseCounts(r[5]);
    let total = 0; const ch = { h: 0, a: 0, v: 0 };
    for (const k in reasons) { total += reasons[k]; ch[CH_OF(k)] += reasons[k]; }
    return {
      id: r[0], name: r[1],
      group: GROUP_MAP[r[2]] || "", curator: CURATOR_MAP[r[3]] || CURATOR_MAP[0],
      mods, reasons, total, ch,
      tasks: TASKS[i],  // necha XIL vazifada rad etilgan (tartib STUDENTS bilan bir xil)
      courses: byCourse(mods)
    };
  });
  if (TASKS.length !== STUDENTS.length) console.error("TASKS va STUDENTS uzunligi mos emas!");

  const T = ST.reduce((s, x) => s + x.total, 0);

  /* ---------- yig'indilar (hammasi ST dan) ---------- */
  function rollup(keyFn) {
    const m = new Map();
    ST.forEach((s) => keyFn(s).forEach(([k, n]) => {
      const e = m.get(k) || { n: 0, st: 0 };
      e.n += n; e.st += 1; m.set(k, e);
    }));
    return m;
  }
  const BY_CH = rollup((s) => ["h", "a", "v"].filter((k) => s.ch[k] > 0).map((k) => [k, s.ch[k]]));
  const BY_REASON = rollup((s) => Object.entries(s.reasons));
  const BY_MODULE = rollup((s) => Object.entries(s.mods));
  const BY_CURATOR = rollup((s) => [[s.curator, s.total]]);
  const BY_RGROUP = rollup((s) => REASON_GROUPS.map((g, i) => {
    let n = 0; g[1].forEach((c) => (n += s.reasons[c] || 0));
    return n > 0 ? [i, n] : null;
  }).filter(Boolean));

  const CH_LABEL = {
    h: ["Mentor (odam)", "Xodim ko'rib, izoh yozib rad etadi"],
    a: ["AI tekshiruvi", "Kod vazifalarini AI tekshiradi (3-avgustdan)"],
    v: ["Ovoz avtotekshiruvi (English)", "Ovozli javobni tizim tekshiradi"]
  };

  /* ---------- bosiladigan son ---------- */
  // har bir son <button data-q="..."> ichida: bosilganda shu kesim ro'yxati ochiladi
  const num = (q, txt, cls) => `<button class="pr-num ${cls || ""}" data-q="${esc(q)}">${txt}</button>`;
  const bar = (n, max) => `<span class="pr-bar" style="width:${Math.max(0.8, Math.min(100, n / max * 100))}%"></span>`;

  /* ---------- kesim: so'rovdan o'quvchilar ro'yxati ---------- */
  function slice(q) {
    const [kind, key] = q.split(":");
    if (kind === "all") return { title: "Avgustda rad etilgan barcha vazifalar", rows: ST.map((s) => [s, s.total]) };
    if (kind === "ch") return { title: CH_LABEL[key][0] + " rad etgan vazifalar", rows: ST.filter((s) => s.ch[key] > 0).map((s) => [s, s.ch[key]]) };
    if (kind === "reason") return { title: "Sabab: " + REASON_MAP[key][1], rows: ST.filter((s) => s.reasons[key]).map((s) => [s, s.reasons[key]]) };
    if (kind === "module") return { title: "Modul: " + MODULE_MAP[key][0] + " · " + MODULE_MAP[key][1], rows: ST.filter((s) => s.mods[key]).map((s) => [s, s.mods[key]]) };
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

  // bitta o'quvchining kesimi: qaysi modulda va qaysi sababdan
  function detail(s) {
    const mods = Object.entries(s.mods).sort((a, b) => b[1] - a[1]);
    const rs = Object.entries(s.reasons).sort((a, b) => b[1] - a[1]);
    const avg = s.total / s.tasks;
    return `
      <div class="pr-detail-box">
        <p class="pr-detail-lead">
          <b>${fi(s.total)}</b> rad etish, <b>${fi(s.tasks)}</b> xil vazifada &mdash;
          ya'ni bitta vazifaga o'rtacha <b>${f1(avg)}</b> marta rad etish to'g'ri kelgan.
          ${avg >= 3 ? "Ba'zi vazifalarni ko'p marta qayta yuborgan: yordam kerak bo'lgan joy shu." : "Ko'p vazifada bir-ikki martadan &mdash; jiddiy tiqilish yo'q."}
        </p>
        <div class="pr-detail-cols">
          <div>
            <b>Qaysi modulda</b>
            <table class="pr-mini">${mods.map(([c, n]) => `<tr><td>${esc(MODULE_MAP[c][0])} · ${esc(MODULE_MAP[c][1])}</td><td>${fi(n)}</td></tr>`).join("")}</table>
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
    $("drillNote").innerHTML = `<b>${fi(rows.length)}</b> o'quvchi &middot; <b>${fi(sum)}</b> rad etish (umumiy ${fi(T)} dan ${f1(sum / T * 100)}%). Ro'yxat rad etish soni bo'yicha tartiblangan.<br>
      <span class="pr-hint"><b>&laquo;Qaysi kursdan&raquo;</b> ustunidagi sonlar qo'shilib <b>jami rad etish</b> ni beradi &mdash; masalan English 69 + Dasturlash kursi 41 + Grafik dizayn 19 = 129.
      <b>Ismga bosing</b> &mdash; qaysi <b>modulda</b> va qaysi <b>sababdan</b> rad etilgani, hamda necha xil vazifada ekani ochiladi.</span>`;
    $("drillBody").innerHTML = rows.map(([s, n], i) => `<tr>
      <td class="rank-col">${i + 1}</td>
      <td><button class="pr-open" data-sid="${s.id}">${esc(s.name)}</button></td>
      <td>${esc(s.group) || "<span class='pr-dim'>guruhi yo'q</span>"}</td>
      <td>${esc(s.curator)}</td>
      <td><b>${fi(n)}</b></td>
      <td class="pr-courses">${s.courses.map(([c, n]) => `<span class="pr-crs">${esc(c)} <b>${fi(n)}</b></span>`).join("")}</td>
    </tr>
    <tr class="pr-detail" id="d${s.id}" hidden><td></td><td colspan="5">${detail(s)}</td></tr>`).join("");
    const p = $("drillSection");
    p.hidden = false;
    p.scrollIntoView({ block: "start" });
  }

  /* ---------- 1. UMUMIY SON ---------- */
  function secTotal() {
    const rows = ["a", "v", "h"].map((k) => [k, BY_CH.get(k)]).sort((x, y) => y[1].n - x[1].n);
    const max = rows[0][1].n;
    const auto = BY_CH.get("a").n + BY_CH.get("v").n;
    return `
    <section class="ranking panel-cut" id="pr1">
      <div class="section-head"><div>
        <p class="eyebrow">1 · Umumiy son</p>
        <h2>Avgustda nechta vazifa rad etildi</h2>
      </div></div>
      <div class="pr-big">
        ${num("all", fi(T), "pr-num-big")}
        <p>ta amaliy vazifa <b>rad etilgan</b>.<br>
        Bu <b>rad etish hodisasi</b> soni: bitta vazifa uch marta rad etilsa, uchta sanaladi.<br>
        Bu ${num("all", fi(ST.length) + " ta o'quvchida")}, ${fi(BY_MODULE.size)} ta modulda sodir bo'lgan.</p>
      </div>
      <h3 class="sub-head">Rad etishni kim qo'ygan</h3>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th>Kim tekshirib rad etdi</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>O'quvchi</th><th>Izoh</th></tr></thead>
        <tbody>
          ${rows.map(([k, e]) => `<tr>
            <td><b>${esc(CH_LABEL[k][0])}</b></td>
            <td>${num("ch:" + k, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("ch:" + k, fi(e.st))}</td>
            <td class="pr-note-cell">${esc(CH_LABEL[k][1])}</td>
          </tr>`).join("")}
          <tr class="pr-total"><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(ST.length))}</td><td></td></tr>
        </tbody>
      </table></div>
      <p class="threshold-note">
        Rad etishning ${f1(auto / T * 100)}% ini <b>odam emas, tizim</b> qo'ygan: kod vazifalarini AI, English kursidagi ovozli mashqlarni ovoz avtotekshiruvi tekshiradi.
        Bu bo'linish faqat shu yerda ko'rsatiladi. Blockly o'yin vazifalari umuman kirmaydi &mdash; ularni tizim avtomatik qabul qiladi, hech qachon rad etmaydi.<br>
        <b>Har bir songa bosing</b> &mdash; o'sha sonning ortidagi o'quvchilar ro'yxati ochiladi.
      </p>
    </section>`;
  }

  /* ---------- 2. SABAB ---------- */
  function secReasons() {
    const rows = [...BY_REASON.entries()].sort((a, b) => b[1].n - a[1].n);
    const max = rows[0][1].n;
    return `
    <section class="ranking panel-cut" id="pr2">
      <div class="section-head"><div>
        <p class="eyebrow">2 · Sabab</p>
        <h2>Nega rad etildi</h2>
        <p class="section-note">Har bir rad etishda izoh yozilgan. Izohlar erkin matn, shu sababli kalit so'zlar bo'yicha toifalangan (qoidalar oxirgi bo'limda).</p>
      </div></div>
      <div class="table-wrap"><table class="pr-table">
        <thead><tr><th class="rank-col">#</th><th>Rad etish sababi</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>O'quvchi</th></tr></thead>
        <tbody>
          ${rows.map(([c, e], i) => `<tr>
            <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
            <td><b>${esc(REASON_MAP[c][1])}</b>${REASON_MAP[c][2] ? `<small class="pr-quote">Mentor izohi: ${esc(REASON_MAP[c][2])}</small>` : ""}</td>
            <td>${num("reason:" + c, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("reason:" + c, fi(e.st))}</td>
          </tr>`).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(ST.length))}</td></tr>
        </tbody>
      </table></div>
      <h3 class="sub-head">Xodim (mentor) qo'ygan rad etishlar nima sababdan</h3>
      <div class="mentor-stat-row">
        ${REASON_GROUPS.map((g, i) => {
          const e = BY_RGROUP.get(i);
          return `<div class="mentor-stat">
            ${num("rgroup:" + i, fi(e.n), "pr-num-stat")}
            <span>${esc(g[0])}</span>
            <small>${esc(g[2])} Umumiy ${fi(T)} dan ${f1(e.n / T * 100)}%, ${num("rgroup:" + i, fi(e.st) + " o'quvchi")}.</small>
          </div>`;
        }).join("")}
      </div>
    </section>`;
  }

  /* ---------- 3. KURATOR ---------- */
  function secCurators() {
    const rows = [...BY_CURATOR.entries()].sort((a, b) => {
      const ux = a[0] === CURATOR_MAP[0], uy = b[0] === CURATOR_MAP[0];
      if (ux !== uy) return ux ? 1 : -1;
      return b[1].n - a[1].n;
    });
    const max = Math.max(...rows.map((r) => r[1].n));
    const un = rows.find((r) => r[0] === CURATOR_MAP[0]);
    return `
    <section class="ranking panel-cut" id="pr3">
      <div class="section-head"><div>
        <p class="eyebrow">3 · Kurator</p>
        <h2>Qaysi kuratorning o'quvchilarida ko'p</h2>
        <p class="section-note">Bizda <b>7 kurator</b> bor — jadvalda ular va alohida «biriktirilmagan» qatori. Kurator = o'quvchining faol obunasidagi guruh kuratori; har bir o'quvchida bitta kurator.</p>
      </div></div>
      <div class="pr-warn-strip">
        <b>Eng muhim ustun &mdash; &laquo;1 o'quvchiga o'rtacha&raquo;.</b> Yalpi son adashtiradi: ko'p o'quvchisi bor kuratorda rad etish tabiiy ravishda ko'p bo'ladi.
      </div>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th class="rank-col">#</th><th>Kurator</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th></tr></thead>
        <tbody>
          ${rows.map(([n, e], i) => {
            const u = n === CURATOR_MAP[0];
            return `<tr class="${u ? "row-unranked" : ""}">
              <td class="rank-col"><span class="rank ${u ? "off" : i < 3 ? "top" : ""}">${u ? "—" : i + 1}</span></td>
              <td><b>${esc(n)}</b>${u ? `<small class="pr-sub">faol obunasi yo'q &mdash; muzlatilgan, tugatgan yoki test hisoblari</small>` : ""}</td>
              <td>${num("curator:" + n, "<b>" + fi(e.n) + "</b>")}</td>
              <td>${f1(e.n / T * 100)}%</td>
              <td class="pr-barcell">${bar(e.n, max)}</td>
              <td>${num("curator:" + n, fi(e.st))}</td>
              <td><b>${f1(e.n / e.st)}</b></td>
            </tr>`;
          }).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(T) + "</b>")}</td><td>100%</td><td></td><td>${num("all", fi(ST.length))}</td><td><b>${f1(T / ST.length)}</b></td></tr>
        </tbody>
      </table></div>
      <p class="threshold-note">Jadval umumiy ${fi(T)} ta rad etishning hammasini qoplaydi. &laquo;Kurator biriktirilmagan&raquo; qatoridagi ${fi(un[1].n)} ta rad etish (${f1(un[1].n / T * 100)}%) hech qaysi kuratorga tegishli emas.</p>
    </section>`;
  }

  /* ---------- 4. MODUL ---------- */
  function secModules() {
    const rows = [...BY_MODULE.entries()].sort((a, b) => b[1].n - a[1].n);
    const max = rows[0][1].n;
    return `
    <section class="ranking panel-cut" id="pr4">
      <div class="section-head"><div>
        <p class="eyebrow">4 · Modul</p>
        <h2>Qaysi moduldan ko'p</h2>
        <p class="section-note">Avgustda rad etish bo'lgan barcha ${fi(rows.length)} modul.</p>
      </div></div>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th class="rank-col">#</th><th>Modul</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th></tr></thead>
        <tbody>
          ${rows.map(([c, e], i) => `<tr>
            <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
            <td><b>${esc(MODULE_MAP[c][1])}</b><small class="pr-sub">${esc(MODULE_MAP[c][0])} · ${MODULE_MAP[c][2]}-modul</small></td>
            <td>${num("module:" + c, "<b>" + fi(e.n) + "</b>")}</td>
            <td>${f1(e.n / T * 100)}%</td>
            <td class="pr-barcell">${bar(e.n, max)}</td>
            <td>${num("module:" + c, fi(e.st))}</td>
            <td><b>${f1(e.n / e.st)}</b></td>
          </tr>`).join("")}
          <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td>${num("all", "<b>" + fi(T) + "</b>")}</td><td>100%</td><td></td><td></td><td></td></tr>
        </tbody>
      </table></div>
      <p class="threshold-note">&laquo;Rad etilgan o'quvchi&raquo; ustunlarining yig'indisi ${fi(ST.length)} dan katta &mdash; bitta o'quvchi bir necha modulda rad etilgan bo'lishi mumkin, shu sababli u har bir modulda bir marta sanaladi.</p>
    </section>`;
  }

  /* ---------- 5. IZOH ---------- */
  function secNote() {
    return `
    <section class="ranking panel-cut" id="pr5">
      <div class="section-head"><div>
        <p class="eyebrow">5 · Izoh</p>
        <h2>Sonlar qanday olingan</h2>
      </div></div>
      <div class="pr-rules">
        <div><b>Rad etish</b><p>Bazada <code>student_question_practice</code> jadvalidagi <code>status = 'rejected'</code> qatorlar. Davr &mdash; <code>created_at</code> 1&ndash;31 avgust 2026.</p></div>
        <div><b>Birlik</b><p>Bitta qator = bitta rad etish hodisasi. Bitta vazifa uch marta rad etilsa &mdash; uch qator. Shu sababli ${fi(T)} soni vazifa soni emas.</p></div>
        <div><b>Foiz</b><p>Saytdagi har bir foiz bitta mahrajdan olingan: umumiy ${fi(T)} ta rad etish. Boshqa mahraj yo'q.</p></div>
        <div><b>Har bir son bosiladi</b><p>Sahifadagi hamma son bitta ro'yxatdan &mdash; ${fi(ST.length)} o'quvchi qatoridan hisoblanadi. Songa bosilganda aynan shu son ortidagi o'quvchilar chiqadi, shu sababli jadval bilan ro'yxat doim mos keladi.</p></div>
        <div><b>Blockly kirmaydi</b><p><code>teacher_id = 1</code>, izoh <code>blockly-game</code> &mdash; o'yin vazifalarini tizim avtomatik qabul qiladi va hech qachon rad etmaydi.</p></div>
        <div><b>Sabab toifasi</b><p>Izoh erkin matn (mentor izohlarida 1 597 xil matn). Kalit so'zlar bo'yicha prioritetli tartibda toifalanadi; bir izoh faqat bitta toifaga tushadi.</p></div>
      </div>
      <p class="threshold-note">
        <b>Bazadan o'qilgan payt:</b> ${esc(PR_SNAPSHOT)}. Baza jonli: hali tekshirilmagan topshiriqlar keyin qabul yoki rad ga o'tadi, shu sababli 30&ndash;31 avgust sonlari keyingi o'qishda bir necha birlik o'sishi mumkin.<br>
        <b>Manba jadvallar:</b> <code>student_question_practice</code>, <code>student_questions</code>, <code>student_lessons</code>, <code>student_modules</code>, <code>student_courses</code>, <code>student_students</code>, <code>student_list</code>, <code>subscribe_list</code>, <code>group_list</code>, <code>gl_sys_users</code>.
      </p>
    </section>`;
  }

  /* ---------- montaj ---------- */
  function build() {
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
      h.insertAdjacentHTML("afterend", `<p class="pr-period">Davr: <b>1–31 avgust 2026</b> &mdash; boshqa oy ma'lumoti yo'q</p>`);
    });

    $("rangeChip").textContent = "1–31 avgust 2026";
    $("countChip").textContent = `${fi(T)} ta rad etish`;

    $("app").addEventListener("click", (e) => {
      const b = e.target.closest(".pr-num");
      if (b) { openList(b.dataset.q); return; }
      const o = e.target.closest(".pr-open");
      if (o) {
        const row = $("d" + o.dataset.sid);
        row.hidden = !row.hidden;
        o.classList.toggle("open", !row.hidden);
        return;
      }
      if (e.target.closest("#drillClose")) $("drillSection").hidden = true;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
