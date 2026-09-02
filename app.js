/* ============================================================================
   AVGUSTDA RAD ETILGAN AMALIY VAZIFALAR
   Faqat rad etishlar. Har bir son data.js dagi qatorlardan brauzerda hisoblanadi.
   Umumiy mahraj bir joyda bir xil: 24 671 rad etish (1-31 avgust 2026).
   ========================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const T = PR_REJ.total;
  const pct = (n, d) => (d ? (n / d) * 100 : 0);
  const f1 = (x) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toFixed(1) : "—");
  const f2 = (x) => (Number.isFinite(x) ? (Math.round(x * 100) / 100).toFixed(1) : "—");
  const fi = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString("ru-RU") : "—");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // ustun jadvaldagi eng katta qatorga nisbatan chiziladi (100% = shu jadvalning eng kattasi)
  const shareBar = (n, max) => `<span class="pr-bar" style="width:${Math.max(0.8, Math.min(100, pct(n, max || T)))}%"></span>`;

  const CH = {
    human: { lab: "Mentor", cls: "bad" },
    ai: { lab: "AI", cls: "" },
    voice: { lab: "Ovoz", cls: "mid" }
  };
  const chPill = (k) => `<span class="status-pill ${CH[k].cls}">${CH[k].lab}</span>`;
  // rad etishning qaysi kanaldan ko'p kelgani
  const topCh = (hr, ar, vr) => (vr >= hr && vr >= ar ? "voice" : ar >= hr ? "ai" : "human");

  /* ---------- 1. JAMI ---------- */
  function secTotal() {
    const ch = PR_REJ.byChannel.slice().sort((a, b) => b[1] - a[1]);
    const chMax = ch[0][1];
    return `
    <section class="ranking panel-cut" id="pr1">
      <div class="section-head">
        <div>
          <p class="eyebrow">1 · Umumiy son</p>
          <h2>Avgustda nechta vazifa rad etildi</h2>
        </div>
      </div>
      <div class="pr-big">
        <b>${fi(T)}</b>
        <p>ta amaliy vazifa <b>rad etilgan</b> &mdash; 1&ndash;31 avgust 2026.<br>
        Bu <b>rad etish hodisasi</b> soni: bitta vazifa uch marta rad etilsa, uchta sanaladi.<br>
        Bu ${fi(PR_REJ.students)} ta o'quvchida, ${fi(PR_REJ.lessons)} ta darsda va ${fi(PR_REJ.modules)} ta modulda sodir bo'lgan.</p>
      </div>
      <div class="table-wrap">
        <table class="pr-table pr-narrow">
          <thead><tr><th>Kim rad etdi</th><th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th><th>Nima uchun shu kanal</th></tr></thead>
          <tbody>
            ${ch.map(([lab, n, note]) => `<tr>
              <td><b>${esc(lab)}</b></td>
              <td><b>${fi(n)}</b></td>
              <td>${f1(pct(n, T))}%</td>
              <td class="pr-barcell">${shareBar(n, chMax)}</td>
              <td class="pr-note-cell">${esc(note)}</td>
            </tr>`).join("")}
            <tr class="pr-total"><td><b>JAMI</b></td><td><b>${fi(T)}</b></td><td>100%</td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="threshold-note">
        Ushbu saytdagi <b>hamma</b> jadval shu ${fi(T)} ta rad etishni bo'lib ko'rsatadi &mdash; sabab bo'yicha, kurator bo'yicha, modul va dars bo'yicha, urinish soni bo'yicha.
        Har bir jadvalning &laquo;ulushi&raquo; ustuni aynan shu ${fi(T)} dan olingan foiz.
        Blockly o'yin vazifalari bu yerda yo'q: ularni tizim avtomatik qabul qiladi, hech qachon rad etmaydi.
      </p>
    </section>`;
  }

  /* ---------- 2. SABAB ---------- */
  function reasonRows() {
    const out = [];
    PR_REASONS_HUMAN.forEach((r) => out.push({ code: r[0], lab: r[1], n: r[2], ch: "human", ex: r[4] || "" }));
    PR_REASONS_AI.forEach((r) => out.push({ code: r[0], lab: r[1], n: r[2], ch: "ai", ex: "" }));
    PR_REASONS_VOICE.forEach((r) => out.push({ code: r[0], lab: r[1], n: r[2], ch: "voice", ex: "" }));
    return out.sort((a, b) => b.n - a.n);
  }

  function secReasons() {
    const rows = reasonRows();
    const rMax = rows[0].n;
    const body = rows.map((r, i) => `<tr>
      <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
      <td><b>${esc(r.lab)}</b>${r.ex ? `<small class="pr-quote">Mentor izohi: ${esc(r.ex)}</small>` : ""}</td>
      <td>${chPill(r.ch)}</td>
      <td><b>${fi(r.n)}</b></td>
      <td>${f1(pct(r.n, T))}%</td>
      <td class="pr-barcell">${shareBar(r.n, rMax)}</td>
    </tr>`).join("");
    const sum = rows.reduce((a, r) => a + r.n, 0);
    return `
    <section class="ranking panel-cut" id="pr2">
      <div class="section-head">
        <div>
          <p class="eyebrow">2 · Sabab</p>
          <h2>Nega rad etildi</h2>
          <p class="section-note">Har bir rad etishda izoh yozilgan. Izohlar erkin matn, shu sababli ular kalit so'zlar bo'yicha toifalangan (qoidalar oxirgi bo'limda).</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="pr-table">
          <thead><tr><th class="rank-col">#</th><th>Rad etish sababi</th><th>Kim</th><th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th></tr></thead>
          <tbody>${body}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td></td><td><b>${fi(sum)}</b></td><td>100%</td><td></td></tr>
          </tbody>
        </table>
      </div>
      ${reasonGroups()}
    </section>`;
  }

  function reasonGroups() {
    const h = (codes) => PR_REASONS_HUMAN.filter((r) => codes.includes(r[0])).reduce((s, r) => s + r[2], 0);
    const fmt = h(["G", "C", "B", "I", "J"]);
    const cont = h(["H", "F", "K", "L", "A", "D", "E"]);
    const rest = h(["Z", "M", "N"]);
    const hTot = fmt + cont + rest;
    return `
      <h3 class="sub-head">Mentor rad etishlarini ikkiga bo'lsak <em>(${fi(hTot)} ta izoh)</em></h3>
      <div class="mentor-stat-row">
        <div class="mentor-stat"><b>${fi(fmt)}</b><span>Topshirish formati aybdor</span><small>Skrinshotda kod/natija ko'rinmaydi, noto'g'ri fayl yuborilgan, bo'sh yuborilgan, havola yo'q, format buzilgan. O'quvchi <b>bilmagani uchun emas</b> &mdash; <b>to'g'ri topshirmagani uchun</b> rad etilgan. Mentor rad etishlarining ${f1(pct(fmt, hTot))}% i.</small></div>
        <div class="mentor-stat"><b>${fi(cont)}</b><span>Ishning o'zi aybdor</span><small>To'liq bajarmagan, kodda xato, shartga mos emas, umuman bajarmagan, AI bilan yozgan, telefonda qilgan. Mentor rad etishlarining ${f1(pct(cont, hTot))}% i.</small></div>
        <div class="mentor-stat"><b>${fi(rest)}</b><span>Izohdan sabab tushunarsiz</span><small>Bir-ikki marta uchraydigan shaxsiy izohlar, izohsiz qoldirilganlar va &laquo;kuratorga murojaat qiling&raquo; deganlar. ${f1(pct(rest, hTot))}%.</small></div>
      </div>
      <p class="threshold-note"><b>Nima qilish mumkin:</b> ${fi(fmt)} ta rad etish o'quvchining bilimiga emas, topshirish tartibiga tegishli &mdash; ya'ni dars mazmunini o'zgartirmasdan, faqat &laquo;qanday topshirish kerak&raquo; ni tushuntirib kamaytirish mumkin. Bu butun avgust rad etishlarining ${f1(pct(fmt, T))}% i.</p>`;
  }

  /* ---------- 3. KURATOR ---------- */
  function secCurators() {
    const rows = PR_CURATORS.filter((c) => c[1] === "2026-08").map((c) => ({
      n: c[0], rej: c[3], st: c[4], hr: c[6], ar: c[8], vr: c[10],
      roster: PR_CURATOR_ROSTER[c[0]] || null
    })).sort((a, b) => {
      const ux = a.n === "Kurator biriktirilmagan", uy = b.n === "Kurator biriktirilmagan";
      if (ux !== uy) return ux ? 1 : -1;
      return b.rej - a.rej;
    });
    const sum = rows.reduce((a, r) => a + r.rej, 0);
    const cMax = Math.max(...rows.map((r) => r.rej));
    const body = rows.map((r, i) => {
      const un = r.n === "Kurator biriktirilmagan";
      return `<tr class="${un ? "row-unranked" : ""}">
        <td class="rank-col"><span class="rank ${un ? "off" : i < 3 ? "top" : ""}">${un ? "—" : i + 1}</span></td>
        <td><b>${esc(r.n)}</b>${r.roster ? `<small class="pr-sub">${r.roster[0]} faol guruh · ${fi(r.roster[1])} faol o'quvchi (CRM, bugun)</small>` : `<small class="pr-sub">faol obunasi yo'q o'quvchilar &mdash; muzlatilgan yoki tugatgan</small>`}</td>
        <td><b>${fi(r.rej)}</b></td>
        <td>${f1(pct(r.rej, T))}%</td>
        <td class="pr-barcell">${shareBar(r.rej, cMax)}</td>
        <td>${fi(r.st)}</td>
        <td><b>${f2(r.rej / r.st)}</b></td>
        <td>${fi(r.hr)}</td><td>${fi(r.ar)}</td><td>${fi(r.vr)}</td>
      </tr>`;
    }).join("");
    return `
    <section class="ranking panel-cut" id="pr3">
      <div class="section-head">
        <div>
          <p class="eyebrow">3 · Kurator</p>
          <h2>Qaysi kuratorning o'quvchilarida ko'p</h2>
          <p class="section-note">Kurator = o'quvchining faol obunasidagi guruh kuratori. Har bir o'quvchida bitta kurator.</p>
        </div>
      </div>
      <div class="pr-warn-strip">
        <b>Eng muhim ustun &mdash; &laquo;1 o'quvchiga o'rtacha&raquo;.</b> Yalpi son adashtiradi: ko'p o'quvchisi bor kuratorda rad etish tabiiy ravishda ko'p bo'ladi.
        Kuratorlarni solishtirganda o'quvchiga bo'lingan songa qarang.
      </div>
      <div class="table-wrap">
        <table class="pr-table">
          <thead><tr>
            <th class="rank-col">#</th><th>Kurator</th>
            <th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th>
            <th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th>
            <th>Mentor</th><th>AI</th><th>Ovoz</th>
          </tr></thead>
          <tbody>${body}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td><b>${fi(sum)}</b></td><td>${f1(pct(sum, T))}%</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="threshold-note">
        Jadval umumiy ${fi(T)} ta rad etishning hammasini qoplaydi.
        <b>&laquo;Kurator biriktirilmagan&raquo;</b> qatoridagi ${fi(2847)} ta rad etish (umumiy sonning ${f1(pct(2847, T))}% i) &mdash;
        faol obunasi bo'lmagan o'quvchilar: muzlatilganlar, kursni tugatganlar va test hisoblari. Ularni hech qaysi kuratorga yozib qo'yish to'g'ri bo'lmaydi.<br>
        Kanal ustunlari (Mentor / AI / Ovoz) &mdash; shu kuratorning o'quvchilaridagi rad etish qaysi tekshiruvchidan kelgani.
      </p>
      ${curatorCourse()}
    </section>`;
  }

  function curatorCourse() {
    const by = {};
    PR_CURATOR_COURSE.forEach((r) => { (by[r[0]] = by[r[0]] || []).push(r); });
    const ccMax = Math.max(...PR_CURATOR_COURSE.map((r) => r[3]));
    const body = Object.keys(by).sort().map((n) => {
      const list = by[n].slice().sort((a, b) => b[3] - a[3]);
      return list.map((r, i) => `<tr>
        ${i === 0 ? `<td rowspan="${list.length}" class="pr-rowhead"><b>${esc(n)}</b></td>` : ""}
        <td>${esc(r[1])}</td>
        <td><b>${fi(r[3])}</b></td>
        <td>${f1(pct(r[3], T))}%</td>
        <td class="pr-barcell">${shareBar(r[3], ccMax)}</td>
        <td>${fi(r[4])}</td>
        <td>${f2(r[3] / r[4])}</td>
      </tr>`).join("");
    }).join("");
    return `
      <h3 class="sub-head">Kurator × kurs <em>(rad etishlar qaysi kursdan kelgani)</em></h3>
      <div class="table-wrap">
        <table class="pr-table pr-narrow">
          <thead><tr><th>Kurator</th><th>Kurs</th><th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th><th>Rad etilgan o'quvchi</th><th>1 o'quvchiga</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <p class="threshold-note">Kuratorlar bir xil kurslarni olib bormaydi &mdash; Dilafruz Shokirovada asosan &laquo;Веб программирование&raquo;, Xalima Ismoiljonovada &laquo;Grafik dizayn&raquo;, Shaxlo Ziyodovada English ulushi katta. Shu sababli kuratorlarni faqat <b>bir xil kurs ichida</b> solishtirish to'g'ri bo'ladi.</p>`;
  }

  /* ---------- 4. MODUL ---------- */
  function secModules() {
    const rows = PR_MODULES_AUG.map((m) => ({
      crs: m[0], mdl: m[1], ord: m[2], rej: m[4], st: m[5], hr: m[7], ar: m[9], vr: m[11]
    })).filter((m) => m.rej > 0).sort((a, b) => b.rej - a.rej);
    const sum = rows.reduce((a, r) => a + r.rej, 0);
    const mMax = Math.max(...rows.map((r) => r.rej));
    const body = rows.map((r, i) => `<tr>
      <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
      <td><b>${esc(r.mdl)}</b><small class="pr-sub">${esc(r.crs)} · ${r.ord}-modul</small></td>
      <td>${chPill(topCh(r.hr, r.ar, r.vr))}</td>
      <td><b>${fi(r.rej)}</b></td>
      <td>${f1(pct(r.rej, T))}%</td>
      <td class="pr-barcell">${shareBar(r.rej, mMax)}</td>
      <td>${fi(r.st)}</td>
      <td><b>${f2(r.rej / r.st)}</b></td>
      <td>${fi(r.hr)}</td><td>${fi(r.ar)}</td><td>${fi(r.vr)}</td>
    </tr>`).join("");
    return `
    <section class="ranking panel-cut" id="pr4">
      <div class="section-head">
        <div>
          <p class="eyebrow">4 · Modul</p>
          <h2>Qaysi moduldan ko'p</h2>
          <p class="section-note">Avgustda rad etish bo'lgan barcha modullar, rad etish soni bo'yicha.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="pr-table">
          <thead><tr>
            <th class="rank-col">#</th><th>Modul</th><th>Ko'proq kim rad etdi</th>
            <th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th>
            <th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th>
            <th>Mentor</th><th>AI</th><th>Ovoz</th>
          </tr></thead>
          <tbody>${body}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td></td><td><b>${fi(sum)}</b></td><td>${f1(pct(sum, T))}%</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="threshold-note">JAMI ${fi(sum)} &mdash; umumiy ${fi(T)} dan ${fi(T - sum)} tasi kam: ular avgustda 15 tadan kam tekshiruv bo'lgan mayda modullarga va test kurslariga tegishli.</p>
    </section>`;
  }

  /* ---------- 5. DARS ---------- */
  const lS = { sort: "rej", dir: -1, crs: "all", ch: "all", q: "" };

  function lessonRows() {
    const rep = {}; PR_REPEAT.forEach((r) => (rep[r[0]] = r));
    return PR_LESSONS.map((l) => {
      const r = rep[l[0]] || [l[0], 0, 0, 0, 0];
      return {
        lid: l[0], crs: l[1], mdl: l[2], les: l[3],
        rej: l[6], st: l[7], hr: l[11], ar: l[13], vr: l[15],
        per: l[6] / l[7], ch2: r[2], ch3: r[3], stuck: r[4],
        ch: topCh(l[11], l[13], l[15])
      };
    });
  }

  function renderLessons() {
    const q = lS.q.trim().toLowerCase();
    let rows = lessonRows().filter((r) =>
      (lS.crs === "all" || r.crs === lS.crs) &&
      (lS.ch === "all" || r.ch === lS.ch) &&
      (!q || (r.les + " " + r.mdl + " " + r.crs).toLowerCase().includes(q)));
    const k = lS.sort;
    rows.sort((a, b) => (typeof a[k] === "string" ? lS.dir * a[k].localeCompare(b[k]) : lS.dir * (a[k] - b[k])));
    const lMax = rows.length ? Math.max(...rows.map((r) => r.rej)) : 1;
    $("prLBody").innerHTML = rows.map((r, i) => `<tr>
      <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
      <td><span class="lesson-title">${esc(r.les)}</span><small class="pr-sub">${esc(r.crs)} · ${esc(r.mdl)}</small></td>
      <td>${chPill(r.ch)}</td>
      <td><b>${fi(r.rej)}</b></td>
      <td>${f1(pct(r.rej, T))}%</td>
      <td class="pr-barcell">${shareBar(r.rej, lMax)}</td>
      <td>${fi(r.st)}</td>
      <td><b>${f2(r.per)}</b></td>
      <td>${fi(r.ch2)}</td>
      <td>${fi(r.ch3)}</td>
      <td>${fi(r.stuck)}</td>
    </tr>`).join("") || `<tr><td colspan="11" class="pr-empty">Bu filtrga mos dars yo'q.</td></tr>`;
    const s = rows.reduce((a, r) => a + r.rej, 0);
    $("prLFoot").innerHTML = `<b>${fi(rows.length)} dars</b> ko'rsatilmoqda, ular bo'yicha <b>${fi(s)}</b> rad etish (umumiy ${fi(T)} dan ${f1(pct(s, T))}%). Sarlavhani bosib saralash mumkin.`;
    document.querySelectorAll("#prLHead th[data-k]").forEach((th) => {
      th.classList.toggle("pr-sorted", th.dataset.k === lS.sort);
      th.dataset.dir = th.dataset.k === lS.sort ? (lS.dir < 0 ? "desc" : "asc") : "";
    });
  }

  function secLessons() {
    const courses = [...new Set(PR_LESSONS.map((l) => l[1]))].sort();
    const cols = [["#", ""], ["Dars", "les"], ["Ko'proq kim rad etdi", "ch"], ["Rad etishlar", "rej"],
      ["Ulushi", "rej"], ["&nbsp;", ""], ["Rad etilgan o'quvchi", "st"], ["1 o'quvchiga o'rtacha", "per"],
      ["2+ marta rad etilgan vazifa", "ch2"], ["3+ marta", "ch3"], ["Qaytib qabul qilinmagan", "stuck"]];
    const totalCovered = PR_LESSONS.reduce((a, l) => a + l[6], 0);
    return `
    <section class="ranking panel-cut" id="pr5">
      <div class="section-head">
        <div>
          <p class="eyebrow">5 · Dars</p>
          <h2>Qaysi darsdan ko'p</h2>
          <p class="section-note">Eng ko'p rad etilgan <b>101 dars</b> &mdash; ular umumiy ${fi(T)} rad etishning ${fi(totalCovered)} tasini (${f1(pct(totalCovered, T))}%) qoplaydi. Qolgani 400 dan ortiq darsga sochilgan, har birida 70 dan kam.</p>
        </div>
      </div>
      <section class="filters pr-filters panel-cut">
        <label><span class="filter-label">Kurs</span><select id="prLCrs"><option value="all">Barcha kurslar</option>${courses.map((c) => `<option>${esc(c)}</option>`).join("")}</select></label>
        <label><span class="filter-label">Kim rad etgan</span><select id="prLCh"><option value="all">Barchasi</option><option value="human">Mentor (odam)</option><option value="ai">AI</option><option value="voice">Ovoz (English)</option></select></label>
        <label><span class="filter-label">Qidiruv</span><input type="search" id="prLQ" placeholder="dars nomi..."></label>
      </section>
      <div class="table-wrap">
        <table class="pr-table pr-wide">
          <thead id="prLHead"><tr>${cols.map(([lab, k]) => `<th ${k ? `data-k="${k}" class="pr-sortable"` : 'class="rank-col"'}>${lab}</th>`).join("")}</tr></thead>
          <tbody id="prLBody"></tbody>
        </table>
      </div>
      <p class="threshold-note" id="prLFoot"></p>
      <p class="threshold-note">
        <b>&laquo;2+ marta rad etilgan vazifa&raquo;</b> &mdash; shu darsda nechta o'quvchi bitta vazifani ikki va undan ko'p marta rad ettirgani.
        <b>&laquo;Qaytib qabul qilinmagan&raquo;</b> &mdash; rad etilib, oy oxirigacha umuman o'tmagan vazifalar soni: o'quvchi shu darsda to'xtab qolgan.
      </p>
    </section>`;
  }

  /* ---------- 6. URINISH ---------- */
  function secAttempts() {
    const tbl = (rows, unit, tot) => (function (mx) { return rows.map((r) => `<tr>
      <td><b>${esc(r[0])}</b></td>
      <td>${fi(r[1])}</td>
      <td><b>${fi(r[2])}</b></td>
      <td>${f1(pct(r[2], T))}%</td>
      <td class="pr-barcell">${shareBar(r[2], mx)}</td>
    </tr>`).join("") + `<tr class="pr-total"><td><b>JAMI</b></td><td><b>${fi(tot)}</b> ${unit}</td><td><b>${fi(T)}</b></td><td>100%</td><td></td></tr>`; })(Math.max(...rows.map((r) => r[2])));
    const task = PR_PER_TASK, stu = PR_PER_STUDENT;
    const taskTot = task.reduce((a, r) => a + r[1], 0);
    const stuTot = stu.reduce((a, r) => a + r[1], 0);
    const top = task.slice().sort((a, b) => b[1] - a[1])[0];
    return `
    <section class="ranking panel-cut" id="pr6">
      <div class="section-head">
        <div>
          <p class="eyebrow">6 · Urinish soni</p>
          <h2>Necha marta rad etilgan</h2>
          <p class="section-note">Bir xil ${fi(T)} ta rad etish ikki xil kesimda: bitta <b>vazifa</b> bo'yicha va bitta <b>o'quvchi</b> bo'yicha.</p>
        </div>
      </div>

      <h3 class="sub-head">Bitta vazifa necha marta rad etilgan</h3>
      <p class="section-note">Birlik &mdash; &laquo;o'quvchi + vazifa&raquo; juftligi. Avgustda ${fi(taskTot)} ta juftlikda kamida bitta rad etish bo'lgan.</p>
      <div class="table-wrap">
        <table class="pr-table pr-narrow">
          <thead><tr><th>Necha marta rad etilgan</th><th>Nechta vazifa</th><th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th></tr></thead>
          <tbody>${tbl(task, "vazifa", taskTot)}</tbody>
        </table>
      </div>
      <p class="threshold-note">
        <b>Eng ko'p uchraydigani &mdash; ${esc(top[0])}</b> (${fi(top[1])} vazifa). Lekin rad etishlarning ko'p qismi ko'p urinishli vazifalardan chiqadi:
        3 va undan ko'p marta rad etilgan ${fi(task.slice(2).reduce((a, r) => a + r[1], 0))} ta vazifa ${fi(task.slice(2).reduce((a, r) => a + r[2], 0))} ta rad etishni bergan &mdash; umumiy sonning ${f1(pct(task.slice(2).reduce((a, r) => a + r[2], 0), T))}% i.
        <b>Aynan 3 marta</b> ustunidagi to'planish (${fi(1651)} vazifa) tasodifiy emas: AI tekshiruvi uch urinishdan keyin vazifani odamga o'tkazadi.
      </p>

      <h3 class="sub-head">Bitta o'quvchi necha marta rad etilgan</h3>
      <p class="section-note">Avgustda ${fi(stuTot)} ta o'quvchida kamida bitta rad etish bo'lgan.</p>
      <div class="table-wrap">
        <table class="pr-table pr-narrow">
          <thead><tr><th>Necha marta rad etilgan</th><th>Nechta o'quvchi</th><th>Rad etishlar</th><th>Ulushi</th><th>&nbsp;</th></tr></thead>
          <tbody>${tbl(stu, "o'quvchi", stuTot)}</tbody>
        </table>
      </div>
      <p class="threshold-note">
        <b>Diqqat qaratish kerak bo'lgan guruh:</b> 21 martadan ko'p rad etilgan ${fi(273 + 63)} ta o'quvchi (barcha rad etilgan o'quvchilarning ${f1(pct(273 + 63, stuTot))}% i)
        umumiy rad etishlarning ${fi(8174 + 4652)} tasini &mdash; ya'ni ${f1(pct(8174 + 4652, T))}% ini bergan.
      </p>
    </section>`;
  }

  /* ---------- 7. IZOH ---------- */
  function secNote() {
    return `
    <section class="ranking panel-cut" id="pr7">
      <div class="section-head">
        <div>
          <p class="eyebrow">7 · Izoh</p>
          <h2>Sonlar qanday olingan</h2>
        </div>
      </div>
      <div class="pr-rules">
        <div><b>Rad etish</b><p>Bazada <code>student_question_practice</code> jadvalidagi <code>status = 'rejected'</code> qatorlar. Davr &mdash; <code>created_at</code> 1&ndash;31 avgust 2026.</p></div>
        <div><b>Birlik</b><p>Bitta qator = bitta rad etish hodisasi. Bitta vazifa uch marta rad etilsa &mdash; uch qator. Shu sababli ${fi(T)} soni vazifa soni emas.</p></div>
        <div><b>Blockly kirmaydi</b><p><code>teacher_id = 1</code>, izoh <code>blockly-game</code> &mdash; o'yin vazifalarini tizim avtomatik qabul qiladi va hech qachon rad etmaydi. Avgustda bitta ham rad etish bermagan.</p></div>
        <div><b>Kim rad etdi</b><p>Mentor: <code>teacher_id &gt; 1</code>. AI: <code>teacher_id = 0</code> va <code>review_source = 'ai'</code>. Ovoz avtotekshiruvi: <code>teacher_id = 0</code>, <code>review_source</code> bo'sh (English kursi).</p></div>
        <div><b>Sabab toifasi</b><p>Izoh erkin matn (avgustda mentor izohlarida 1 597 xil matn). Kalit so'zlar bo'yicha prioritetli tartibda toifalanadi; bir izoh faqat bitta toifaga tushadi. Mentor izohlarining 8.7% i toifaga tushmadi &mdash; ular &laquo;Boshqa&raquo; da.</p></div>
        <div><b>Kurator</b><p>O'quvchining faol obunasidagi guruhning <code>group_list.ADMIN_ID</code> xodimi. Tekshirildi: har bir o'quvchida aynan bitta kurator chiqadi.</p></div>
      </div>
      <p class="threshold-note">
        <b>Snapshot:</b> ${esc(PR_META.snapshot)}. Baza jonli: hali tekshirilmagan topshiriqlar keyin qabul yoki rad ga o'tadi, shu sababli 30&ndash;31 avgust sonlari keyingi o'qishda bir necha birlik o'sishi mumkin.<br>
        <b>Manba jadvallar:</b> <code>student_question_practice</code>, <code>student_questions</code>, <code>student_lessons</code>, <code>student_modules</code>, <code>student_courses</code>, <code>student_students</code>, <code>subscribe_list</code>, <code>group_list</code>, <code>gl_sys_users</code>.
      </p>
    </section>`;
  }

  /* ---------- montaj ---------- */
  function build() {
    $("app").innerHTML = secTotal() + secReasons() + secCurators() + secModules() + secLessons() + secAttempts() + secNote();
    $("rangeChip").textContent = "1–31 avgust 2026";
    $("countChip").textContent = `${fi(T)} ta rad etish`;

    renderLessons();
    $("prLCrs").addEventListener("change", (e) => { lS.crs = e.target.value; renderLessons(); });
    $("prLCh").addEventListener("change", (e) => { lS.ch = e.target.value; renderLessons(); });
    $("prLQ").addEventListener("input", (e) => { lS.q = e.target.value; renderLessons(); });
    document.querySelectorAll("#prLHead th[data-k]").forEach((th) => {
      th.addEventListener("click", () => {
        const k = th.dataset.k;
        if (lS.sort === k) lS.dir = -lS.dir;
        else { lS.sort = k; lS.dir = k === "les" || k === "ch" ? 1 : -1; }
        renderLessons();
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
