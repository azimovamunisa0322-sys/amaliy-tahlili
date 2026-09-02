/* ============================================================================
   AVGUSTDA RAD ETILGAN AMALIY VAZIFALAR
   Faqat rad etishlar, faqat 1-31 avgust 2026.
   Yagona mahraj: 24 671 rad etish. Hamma jadval shu sonni bo'lib ko'rsatadi.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const T = PR_REJ.total;
  const pct = (n, d) => (d ? (n / d) * 100 : 0);
  const f1 = (x) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toFixed(1) : "—");
  const fi = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString("ru-RU") : "—");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // ustun jadvaldagi eng katta qatorga nisbatan chiziladi (to'liq uzunlik = shu jadvalning eng kattasi)
  const bar = (n, max) => `<span class="pr-bar" style="width:${Math.max(0.8, Math.min(100, pct(n, max)))}%"></span>`;

  /* ---------- 1. UMUMIY SON ---------- */
  function secTotal() {
    const ch = PR_REJ.byChannel.slice().sort((a, b) => b[1] - a[1]);
    const max = ch[0][1];
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
        <p>ta amaliy vazifa <b>rad etilgan</b>.<br>
        Bu <b>rad etish hodisasi</b> soni: bitta vazifa uch marta rad etilsa, uchta sanaladi.<br>
        Bu ${fi(PR_REJ.students)} ta o'quvchida, ${fi(PR_REJ.lessons)} ta darsda va ${fi(PR_REJ.modules)} ta modulda sodir bo'lgan.</p>
      </div>
      <h3 class="sub-head">Rad etishni kim qo'ygan</h3>
      <div class="table-wrap">
        <table class="pr-table pr-narrow">
          <thead><tr><th>Kim tekshirib rad etdi</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th><th>Izoh</th></tr></thead>
          <tbody>
            ${ch.map(([lab, n, note]) => `<tr>
              <td><b>${esc(lab)}</b></td>
              <td><b>${fi(n)}</b></td>
              <td>${f1(pct(n, T))}%</td>
              <td class="pr-barcell">${bar(n, max)}</td>
              <td class="pr-note-cell">${esc(note)}</td>
            </tr>`).join("")}
            <tr class="pr-total"><td><b>JAMI</b></td><td><b>${fi(T)}</b></td><td>100%</td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="threshold-note">
        Rad etishning ${f1(pct(PR_REJ.byChannel[0][1] + PR_REJ.byChannel[1][1], T))}% ini <b>odam emas, tizim</b> qo'ygan:
        kod vazifalarini AI tekshiradi, English kursidagi ovozli mashqlarni esa ovoz avtotekshiruvi tekshiradi.
        Xodim (mentor) qo'ygan rad etishlar ${fi(PR_REJ.byChannel.find((c) => c[0].indexOf("Mentor") === 0)[1])} ta.
        Bu bo'linish faqat shu yerda ko'rsatiladi &mdash; qolgan jadvallarda aralashtirilmaydi.
        Blockly o'yin vazifalari umuman kirmaydi: ularni tizim avtomatik qabul qiladi, hech qachon rad etmaydi.
      </p>
    </section>`;
  }

  /* ---------- 2. SABAB ---------- */
  function secReasons() {
    const rows = [].concat(
      PR_REASONS_HUMAN.map((r) => ({ lab: r[1], n: r[2], ex: r[3] || "" })),
      PR_REASONS_AI.map((r) => ({ lab: r[1], n: r[2], ex: "" })),
      PR_REASONS_VOICE.map((r) => ({ lab: r[1], n: r[2], ex: "" }))
    ).sort((a, b) => b.n - a.n);
    const max = rows[0].n;
    const body = rows.map((r, i) => `<tr>
      <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
      <td><b>${esc(r.lab)}</b>${r.ex ? `<small class="pr-quote">Mentor izohi: ${esc(r.ex)}</small>` : ""}</td>
      <td><b>${fi(r.n)}</b></td>
      <td>${f1(pct(r.n, T))}%</td>
      <td class="pr-barcell">${bar(r.n, max)}</td>
    </tr>`).join("");
    const sum = rows.reduce((a, r) => a + r.n, 0);
    return `
    <section class="ranking panel-cut" id="pr2">
      <div class="section-head">
        <div>
          <p class="eyebrow">2 · Sabab</p>
          <h2>Nega rad etildi</h2>
          <p class="section-note">Har bir rad etishda izoh yozilgan. Izohlar erkin matn, shu sababli kalit so'zlar bo'yicha toifalangan (qoidalar oxirgi bo'limda).</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="pr-table">
          <thead><tr><th class="rank-col">#</th><th>Rad etish sababi</th><th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th></tr></thead>
          <tbody>${body}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td><b>${fi(sum)}</b></td><td>100%</td><td></td></tr>
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
    return `
      <h3 class="sub-head">Xodim (mentor) qo'ygan rad etishlar nima sababdan</h3>
      <div class="mentor-stat-row">
        <div class="mentor-stat"><b>${fi(fmt)}</b><span>Topshirish formati xato</span><small>Skrinshotda kod yoki natija ko'rinmaydi, noto'g'ri fayl yuborilgan, bo'sh yuborilgan, havola yo'q, format buzilgan. O'quvchi <b>bilmagani uchun emas</b> &mdash; <b>to'g'ri topshirmagani uchun</b> rad etilgan. Umumiy ${fi(T)} dan ${f1(pct(fmt, T))}%.</small></div>
        <div class="mentor-stat"><b>${fi(cont)}</b><span>Amaliy vazifada xatolik</span><small>To'liq bajarmagan, kodda xato, shartga mos emas, umuman bajarmagan, AI bilan yozgan, telefonda qilgan. Umumiy ${fi(T)} dan ${f1(pct(cont, T))}%.</small></div>
        <div class="mentor-stat"><b>${fi(rest)}</b><span>Izohdan sabab tushunarsiz</span><small>Bir-ikki marta uchraydigan shaxsiy izohlar, izohsiz qoldirilganlar va &laquo;kuratorga murojaat qiling&raquo; deganlar. Umumiy ${fi(T)} dan ${f1(pct(rest, T))}%.</small></div>
      </div>
      <p class="threshold-note"><b>Nima qilish mumkin:</b> ${fi(fmt)} ta rad etish o'quvchining bilimiga emas, topshirish tartibiga tegishli &mdash; dars mazmunini o'zgartirmasdan, faqat &laquo;qanday topshirish kerak&raquo; ni tushuntirib kamaytirish mumkin.</p>`;
  }

  /* ---------- 3. KURATOR ---------- */
  function secCurators() {
    const rows = PR_CURATORS.map((c) => ({ n: c[0], rej: c[1], st: c[2] })).sort((a, b) => {
      const ux = a.n === "Kurator biriktirilmagan", uy = b.n === "Kurator biriktirilmagan";
      if (ux !== uy) return ux ? 1 : -1;
      return b.rej - a.rej;
    });
    const max = Math.max(...rows.map((r) => r.rej));
    const sum = rows.reduce((a, r) => a + r.rej, 0);
    const un = rows.find((r) => r.n === "Kurator biriktirilmagan");
    const body = rows.map((r, i) => {
      const u = r.n === "Kurator biriktirilmagan";
      return `<tr class="${u ? "row-unranked" : ""}">
        <td class="rank-col"><span class="rank ${u ? "off" : i < 3 ? "top" : ""}">${u ? "—" : i + 1}</span></td>
        <td><b>${esc(r.n)}</b>${u ? `<small class="pr-sub">faol obunasi yo'q o'quvchilar &mdash; muzlatilgan, tugatgan yoki test hisoblari</small>` : ""}</td>
        <td><b>${fi(r.rej)}</b></td>
        <td>${f1(pct(r.rej, T))}%</td>
        <td class="pr-barcell">${bar(r.rej, max)}</td>
        <td>${fi(r.st)}</td>
        <td><b>${f1(r.rej / r.st)}</b></td>
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
        <table class="pr-table pr-narrow">
          <thead><tr>
            <th class="rank-col">#</th><th>Kurator</th>
            <th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th>
            <th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th>
          </tr></thead>
          <tbody>${body}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td><b>${fi(sum)}</b></td><td>${f1(pct(sum, T))}%</td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="threshold-note">
        Jadval umumiy ${fi(T)} ta rad etishning hammasini qoplaydi.
        <b>&laquo;Kurator biriktirilmagan&raquo;</b> qatoridagi ${fi(un.rej)} ta rad etish (umumiy sonning ${f1(pct(un.rej, T))}% i) hech qaysi kuratorga tegishli emas:
        bu o'quvchilarning faol obunasi yo'q &mdash; muzlatilgan, kursni tugatgan yoki test hisoblari.
      </p>
    </section>`;
  }

  /* ---------- 4. MODUL ---------- */
  function secModules() {
    const rows = PR_MODULES_AUG.map((m) => ({ crs: m[0], mdl: m[1], ord: m[2], rej: m[3], st: m[4] }))
      .filter((m) => m.rej > 0).sort((a, b) => b.rej - a.rej);
    const max = rows[0].rej;
    const sum = rows.reduce((a, r) => a + r.rej, 0);
    const body = rows.map((r, i) => `<tr>
      <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
      <td><b>${esc(r.mdl)}</b><small class="pr-sub">${esc(r.crs)} · ${r.ord}-modul</small></td>
      <td><b>${fi(r.rej)}</b></td>
      <td>${f1(pct(r.rej, T))}%</td>
      <td class="pr-barcell">${bar(r.rej, max)}</td>
      <td>${fi(r.st)}</td>
      <td><b>${f1(r.rej / r.st)}</b></td>
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
        <table class="pr-table pr-narrow">
          <thead><tr>
            <th class="rank-col">#</th><th>Modul</th>
            <th>Rad etishlar</th><th>Foiz</th><th>&nbsp;</th>
            <th>Rad etilgan o'quvchi</th><th>1 o'quvchiga o'rtacha</th>
          </tr></thead>
          <tbody>${body}
            <tr class="pr-total"><td class="rank-col"></td><td><b>JAMI</b></td><td><b>${fi(sum)}</b></td><td>${f1(pct(sum, T))}%</td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="threshold-note">JAMI ${fi(sum)} &mdash; umumiy ${fi(T)} dan ${fi(T - sum)} tasi kam: ular avgustda juda kam topshiriq bo'lgan mayda modullarga va test kurslariga tegishli.</p>
    </section>`;
  }

  /* ---------- 5. IZOH ---------- */
  function secNote() {
    return `
    <section class="ranking panel-cut" id="pr5">
      <div class="section-head">
        <div>
          <p class="eyebrow">5 · Izoh</p>
          <h2>Sonlar qanday olingan</h2>
        </div>
      </div>
      <div class="pr-rules">
        <div><b>Rad etish</b><p>Bazada <code>student_question_practice</code> jadvalidagi <code>status = 'rejected'</code> qatorlar. Davr &mdash; <code>created_at</code> 1&ndash;31 avgust 2026.</p></div>
        <div><b>Birlik</b><p>Bitta qator = bitta rad etish hodisasi. Bitta vazifa uch marta rad etilsa &mdash; uch qator. Shu sababli ${fi(T)} soni vazifa soni emas, rad etish soni.</p></div>
        <div><b>Foiz</b><p>Saytdagi har bir foiz bitta mahrajdan olingan: umumiy ${fi(T)} ta rad etish. Boshqa mahraj yo'q.</p></div>
        <div><b>Blockly kirmaydi</b><p><code>teacher_id = 1</code>, izoh <code>blockly-game</code> &mdash; o'yin vazifalarini tizim avtomatik qabul qiladi va hech qachon rad etmaydi. Avgustda bitta ham rad etish bermagan.</p></div>
        <div><b>Sabab toifasi</b><p>Izoh erkin matn (avgustda mentor izohlarida 1 597 xil matn). Kalit so'zlar bo'yicha prioritetli tartibda toifalanadi; bir izoh faqat bitta toifaga tushadi. Mentor izohlarining 8.7% i toifaga tushmadi.</p></div>
        <div><b>Kurator</b><p>O'quvchining faol obunasidagi guruhning <code>group_list.ADMIN_ID</code> xodimi. Tekshirildi: har bir o'quvchida aynan bitta kurator chiqadi.</p></div>
      </div>
      <p class="threshold-note">
        <b>Bazadan o'qilgan payt:</b> ${esc(PR_META.snapshot)}. Baza jonli: hali tekshirilmagan topshiriqlar keyin qabul yoki rad ga o'tadi, shu sababli 30&ndash;31 avgust sonlari keyingi o'qishda bir necha birlik o'sishi mumkin.<br>
        <b>Manba jadvallar:</b> <code>student_question_practice</code>, <code>student_questions</code>, <code>student_lessons</code>, <code>student_modules</code>, <code>student_courses</code>, <code>student_students</code>, <code>subscribe_list</code>, <code>group_list</code>, <code>gl_sys_users</code>.
      </p>
    </section>`;
  }

  /* ---------- montaj ---------- */
  function build() {
    $("app").innerHTML = secTotal() + secReasons() + secCurators() + secModules() + secNote();
    // har bir bo'lim sarlavhasi ostida davr yozib turadi
    document.querySelectorAll("#app .section-head h2").forEach((h) => {
      h.insertAdjacentHTML("afterend", `<p class="pr-period">Davr: <b>1–31 avgust 2026</b> &mdash; boshqa oy ma'lumoti yo'q</p>`);
    });
    $("rangeChip").textContent = "1–31 avgust 2026";
    $("countChip").textContent = `${fi(T)} ta rad etish`;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
