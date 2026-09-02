/* ============================================================================
   AMALIY VAZIFA — RAD ETILISH TAHLILI (ko'rinish qatlami)
   Barcha son data.js dagi qatorlardan brauzerda hisoblanadi.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const pct = (n, d) => (d ? (n / d) * 100 : 0);
  const f1 = (x) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toFixed(1) : "—");
  const fi = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString("ru-RU") : "—");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pp = (x) => (x > 0 ? "+" : x < 0 ? "−" : "±") + f1(Math.abs(x));

  // rang: rad etilish foizi qancha yuqori bo'lsa shuncha yomon
  function tone(p) { return p >= 45 ? "stat-bad" : p >= 25 ? "stat-mid" : "stat-good"; }
  function pillTone(p) { return p >= 45 ? "bad" : p >= 25 ? "mid" : "good"; }

  // ---------- kunlik qatorlardan davr yig'indisi ----------
  // qator: [sana, hn, hr, an, ar, vn, vr, au]
  function agg(from, to) {
    const o = { human: [0, 0], ai: [0, 0], voice: [0, 0], auto: 0, days: 0 };
    PR_DAILY.forEach((r) => {
      if (r[0] < from || r[0] > to) return;
      o.days++;
      o.human[0] += r[1]; o.human[1] += r[2];
      o.ai[0] += r[3]; o.ai[1] += r[4];
      o.voice[0] += r[5]; o.voice[1] += r[6];
      o.auto += r[7];
    });
    o.total = o.human[0] + o.ai[0] + o.voice[0];
    o.rej = o.human[1] + o.ai[1] + o.voice[1];
    o.rate = pct(o.rej, o.total);
    return o;
  }

  const AUG = agg("2026-08-01", "2026-08-31");
  const SEP = agg("2026-09-01", "2026-09-02");
  const W_FIRST = agg("2026-08-01", "2026-08-07");
  const W_LAST = agg("2026-08-26", "2026-09-01"); // oxirgi 7 TO'LIQ kun

  // ---------- 1. XULOSA ----------
  function secSummary() {
    const cards = [
      ["Amaliy vazifa rad etilish foizi<br><small>AVGUST · tekshirilgan barcha topshiriq</small>", f1(AUG.rate) + "%", AUG.rate,
        `${fi(AUG.rej)} rad / ${fi(AUG.total)} tekshirilgan topshiriq`],
      ["Xuddi shu foiz<br><small>SENTYABR · 1–2 sentyabr</small>", f1(SEP.rate) + "%", SEP.rate,
        `${fi(SEP.rej)} rad / ${fi(SEP.total)} · o'zgarish ${pp(SEP.rate - AUG.rate)} p.p.`],
      ["Mentor (odam) rad etish foizi<br><small>AVGUST</small>", f1(pct(AUG.human[1], AUG.human[0])) + "%", pct(AUG.human[1], AUG.human[0]),
        `${fi(AUG.human[1])} rad / ${fi(AUG.human[0])} · sentyabrda ${f1(pct(SEP.human[1], SEP.human[0]))}%`],
      ["AI tekshiruvi rad etish foizi<br><small>AVGUST</small>", f1(pct(AUG.ai[1], AUG.ai[0])) + "%", pct(AUG.ai[1], AUG.ai[0]),
        `${fi(AUG.ai[1])} rad / ${fi(AUG.ai[0])} · sentyabrda ${f1(pct(SEP.ai[1], SEP.ai[0]))}%`],
      ["Ovoz avtotekshiruvi (English)<br><small>AVGUST</small>", f1(pct(AUG.voice[1], AUG.voice[0])) + "%", pct(AUG.voice[1], AUG.voice[0]),
        `${fi(AUG.voice[1])} rad / ${fi(AUG.voice[0])} · sentyabrda ${f1(pct(SEP.voice[1], SEP.voice[0]))}%`],
      ["Birinchi urinishda o'tmagan vazifa<br><small>AVGUST · o'quvchi × vazifa</small>", f1(pct(PR_REPEAT_DIST.anyRej, PR_REPEAT_DIST.chains)) + "%", pct(PR_REPEAT_DIST.anyRej, PR_REPEAT_DIST.chains),
        `${fi(PR_REPEAT_DIST.anyRej)} zanjir / ${fi(PR_REPEAT_DIST.chains)}`],
      ["2 va undan ko'p marta rad etilgan<br><small>AVGUST · o'quvchi × vazifa</small>", f1(pct(PR_REPEAT_DIST.rej2, PR_REPEAT_DIST.chains)) + "%", pct(PR_REPEAT_DIST.rej2, PR_REPEAT_DIST.chains),
        `${fi(PR_REPEAT_DIST.rej2)} zanjir · 3+ marta: ${fi(PR_REPEAT_DIST.rej3)} (${f1(pct(PR_REPEAT_DIST.rej3, PR_REPEAT_DIST.chains))}%)`],
      ["Rad etilib hali qabul qilinmagan<br><small>AVGUST · «to'xtab qolgan» vazifa</small>", fi(PR_REPEAT_DIST.stuck), 30,
        `${f1(pct(PR_REPEAT_DIST.stuck, PR_REPEAT_DIST.anyRej))}% — rad etilgan zanjirlardan qaytib qabul qilinmagani`]
    ];
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">1 · Asosiy foizlar</p>
          <h2>Qisqa javob</h2>
          <p class="section-note">Mahraj — <b>tekshirilgan</b> topshiriqlar (qabul + rad). Blockly avto-qabul chiqarilgan. Sentyabr — 2 kunlik, 2-sentyabr hali to'lmagan.</p>
        </div>
      </div>
      <div class="kpi-grid pr-kpi">
        ${cards.map(([lab, val, t, foot]) => `
          <div class="kpi">
            <span class="kpi-label">${lab}</span>
            <strong class="${tone(t)}">${val}</strong>
            <p class="kpi-foot">${foot}</p>
          </div>`).join("")}
      </div>
      <div class="pr-answers">
        ${answers().map((a) => `<div class="pr-answer"><b>${esc(a[0])}</b><p>${a[1]}</p></div>`).join("")}
      </div>
    </section>`;
  }

  function answers() {
    const topLesson = [...PR_LESSONS].sort((a, b) => b[6] - a[6])[0];
    const rep = PR_REPEAT.map((r) => {
      const l = PR_LESSONS.find((x) => x[0] === r[0]);
      return { name: l ? l[3] : r[0], crs: l ? l[1] : "", mdl: l ? l[2] : "", ch: r[1], ch2: r[2], p: pct(r[2], r[1]) };
    }).filter((x) => x.ch >= 40).sort((a, b) => b.p - a.p);
    const modAug = PR_MODULES_AUG.map((m) => ({ crs: m[0], mdl: m[1], t: m[3], r: m[4], p: pct(m[4], m[3]) })).filter((m) => m.t >= 300).sort((a, b) => b.p - a.p);
    const curH = PR_CURATORS.filter((c) => c[1] === "2026-08" && c[0] !== "Kurator biriktirilmagan")
      .map((c) => ({ n: c[0], p: pct(c[6], c[5]), hn: c[5], hr: c[6], all: pct(c[3], c[2]) })).sort((a, b) => b.p - a.p);
    const rH = PR_REASONS_HUMAN[0], rA = PR_REASONS_AI[0];
    return [
      ["Qaysi darsdan amaliy ish eng ko'p rad etiladi?",
        `Sonda: <b>${esc(topLesson[3])}</b> (${esc(topLesson[1])} · ${esc(topLesson[2])}) — avgustda ${fi(topLesson[6])} rad etish, ${f1(pct(topLesson[6], topLesson[5]))}%. Bu English kursidagi ovozli mashq, ya'ni odam emas, avtotekshiruv rad etadi.
        Kod yozadigan amaliy ishlar orasida eng ko'pi: <b>CSS Demo day</b> (${fi(519)} tekshiruv, ${fi(385)} rad — ${f1(pct(385, 519))}%) va <b>Amaliy ish. HTML nima va nega kerak?</b> (${fi(338)} rad).`],
      ["Qaysi darsdan QAYTA-QAYTA rad etiladi?",
        `Takroriylik = bitta o'quvchi bitta vazifani 2+ marta rad ettirgani. Eng yuqori uchlik (kamida 40 zanjir):
        <b>${esc(rep[0].name)}</b> — ${f1(rep[0].p)}%, <b>${esc(rep[1].name)}</b> — ${f1(rep[1].p)}%, <b>${esc(rep[2].name)}</b> — ${f1(rep[2].p)}%.
        Butun platformada avgustda ${f1(pct(PR_REPEAT_DIST.rej2, PR_REPEAT_DIST.chains))}% vazifa 2+ marta, ${f1(pct(PR_REPEAT_DIST.rej3, PR_REPEAT_DIST.chains))}% esa 3+ marta rad etilgan.`],
      ["Modul bo'yicha eng og'ir joy qayerda?",
        `Kamida 300 tekshiruvli modullar orasida: <b>${esc(modAug[0].crs)} · ${esc(modAug[0].mdl)}</b> — ${f1(modAug[0].p)}%, <b>${esc(modAug[1].crs)} · ${esc(modAug[1].mdl)}</b> — ${f1(modAug[1].p)}%, <b>${esc(modAug[2].crs)} · ${esc(modAug[2].mdl)}</b> — ${f1(modAug[2].p)}%.
        Faqat mentor tekshiradigan modullar orasida esa <b>Dasturlash kursi · React</b> ajralib turadi: ${f1(pct(1480, 2738))}% (${fi(1480)} / ${fi(2738)}) — bu butunlay odam qo'ygan rad etish.`],
      ["Qaysi kuratorning o'quvchilarida muammo?",
        `Mentor (odam) rad etish foizi bo'yicha: <b>${esc(curH[0].n)}</b> ${f1(curH[0].p)}%, <b>${esc(curH[1].n)}</b> ${f1(curH[1].p)}%, <b>${esc(curH[2].n)}</b> ${f1(curH[2].p)}%; eng pastda <b>${esc(curH[curH.length - 1].n)}</b> ${f1(curH[curH.length - 1].p)}%.
        <span class="pr-warn">Diqqat:</span> kuratorlar bir xil kurslarni olib bormaydi — masalan Dilafruz Shokirovada asosan «Веб программирование», Xalima Ismoiljonovada esa «Grafik dizayn» ko'p. Shu sababli pastda kurator × kurs kesimi ham berilgan; taqqoslashni faqat bir xil kurs ichida qilish to'g'ri bo'ladi.`],
      ["Nima uchun rad etiladi?",
        `Mentor izohlari bo'yicha 1-o'rin — <b>${esc(rH[1])}</b>: ${fi(rH[2])} marta, mentor rad etishlarining ${f1(pct(rH[2], PR_REASONS_HUMAN_TOTAL.aug))}%. Ya'ni eng ko'p rad etish sababi bilim emas — <b>topshirish formati</b>.
        AI tekshiruvida 1-o'rin — <b>${esc(rA[1])}</b>: ${fi(rA[2])} marta (${f1(pct(rA[2], PR_REASONS_AI_TOTAL.aug))}%).`],
      ["Avgustga nisbatan hozir qanday?",
        `Umumiy foiz deyarli o'zgarmadi: <b>${f1(AUG.rate)}% → ${f1(SEP.rate)}%</b> (${pp(SEP.rate - AUG.rate)} p.p.).
        Lekin ichida siljish bor: mentor ${f1(pct(AUG.human[1], AUG.human[0]))}% → ${f1(pct(SEP.human[1], SEP.human[0]))}%, AI ${f1(pct(AUG.ai[1], AUG.ai[0]))}% → ${f1(pct(SEP.ai[1], SEP.ai[0]))}%, ovoz ${f1(pct(AUG.voice[1], AUG.voice[0]))}% → ${f1(pct(SEP.voice[1], SEP.voice[0]))}%.
        Avgust ichida esa mentor rad etish foizi <b>o'sdi</b>: 1–7 avgust ${f1(pct(W_FIRST.human[1], W_FIRST.human[0]))}% → 26 avgust–1 sentyabr ${f1(pct(W_LAST.human[1], W_LAST.human[0]))}%.`]
    ];
  }

  // ---------- 2. AVGUST vs SENTYABR ----------
  function secCompare() {
    const rows = [
      ["Mentor (odam) tekshiruvi", "human"],
      ["AI tekshiruvi", "ai"],
      ["Ovoz avtotekshiruvi (English)", "voice"]
    ].map(([lab, k]) => {
      const a = AUG[k], s = SEP[k], w1 = W_FIRST[k], w2 = W_LAST[k];
      const pa = pct(a[1], a[0]), ps = pct(s[1], s[0]);
      return `<tr>
        <td><b>${lab}</b></td>
        <td>${fi(a[0])}</td><td>${fi(a[1])}</td>
        <td class="${tone(pa)}"><b>${f1(pa)}%</b></td>
        <td>${fi(s[0])}</td><td>${fi(s[1])}</td>
        <td class="${tone(ps)}"><b>${f1(ps)}%</b></td>
        <td>${pp(ps - pa)} p.p.</td>
        <td>${f1(pct(w1[1], w1[0]))}% &rarr; ${f1(pct(w2[1], w2[0]))}%</td>
        <td>${fi(Math.round(a[0] / 31))} &rarr; ${fi(Math.round(s[0] / 2))}</td>
      </tr>`;
    }).join("");
    const tot = `<tr class="pr-total">
        <td><b>JAMI (tekshirilgan)</b></td>
        <td>${fi(AUG.total)}</td><td>${fi(AUG.rej)}</td><td class="${tone(AUG.rate)}"><b>${f1(AUG.rate)}%</b></td>
        <td>${fi(SEP.total)}</td><td>${fi(SEP.rej)}</td><td class="${tone(SEP.rate)}"><b>${f1(SEP.rate)}%</b></td>
        <td>${pp(SEP.rate - AUG.rate)} p.p.</td>
        <td title="1–7 avgustda AI hali deyarli ishlamagan, shu sababli umumiy foizni hafta bilan taqqoslash noto'g'ri">&mdash;</td>
        <td>${fi(Math.round(AUG.total / 31))} &rarr; ${fi(Math.round(SEP.total / 2))}</td>
      </tr>`;
    const ctx = PR_MONTHS_CTX.reduce((m, r) => { (m[r[0]] = m[r[0]] || [0, 0]); m[r[0]][0] += r[1] === "auto" ? 0 : r[2]; m[r[0]][1] += r[1] === "auto" ? 0 : r[3]; return m; }, {});
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">2 · Avgust va hozir</p>
          <h2>Kanal bo'yicha o'zgarish</h2>
          <p class="section-note">Uch kanal bir xil vazifalarni tekshirmaydi, shu sababli ular <b>qo'shilmaydi</b> — har biri alohida foiz. Umumiy qator faqat ma'lumot uchun.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="pr-table">
          <thead><tr>
            <th>Tekshiruv kanali</th>
            <th>Avgust: tekshirilgan</th><th>Avgust: rad</th><th>Avgust: rad %</th>
            <th>Sentyabr: tekshirilgan</th><th>Sentyabr: rad</th><th>Sentyabr: rad %</th>
            <th>O'zgarish</th><th>Avgust ichida (1–7 &rarr; oxirgi 7 kun)</th><th>Kunlik hajm (avg &rarr; sen)</th>
          </tr></thead>
          <tbody>${rows}${tot}</tbody>
        </table>
      </div>
      <p class="threshold-note">
        <b>Umumiy qatorda «avgust ichida» ustuni bo'sh</b> &mdash; ataylab. 1&ndash;7 avgustda AI tekshiruvi hali deyarli ishlamagan
        (u faqat 3-avgustda yoqilgan), ovoz avtotekshiruvi ham 5-avgustdan boshlangan. Ya'ni o'sha haftada aralashma butunlay boshqa edi,
        shu sababli <b>umumiy</b> foizni haftalar bo'yicha taqqoslash real o'zgarishni emas, kanal aralashmasining o'zgarishini ko'rsatadi.
        Kanal qatorlaridagi «avgust ichida» esa to'g'ri &mdash; har bir kanal o'zi bilan taqqoslanadi.<br>
        <b>Sentyabr namunasi kichik:</b> mentor 391, AI 935, ovoz 230 tekshiruv. Ovozdagi &minus;15.9 p.p. shu 230 qatordan chiqqan &mdash;
        uni tendensiya deb hisoblash uchun hali erta.<br>
        <b>Kontekst.</b> AI tekshiruvi <b>3-avgustda</b> ishga tushdi — shu sababli iyul va avgustni to'g'ridan-to'g'ri taqqoslash mumkin emas.
        Iyun: ${fi(ctx["2026-06"][0])} tekshiruv, ${fi(ctx["2026-06"][1])} rad (${f1(pct(ctx["2026-06"][1], ctx["2026-06"][0]))}%).
        Iyul: ${fi(ctx["2026-07"][0])} tekshiruv, ${fi(ctx["2026-07"][1])} rad (${f1(pct(ctx["2026-07"][1], ctx["2026-07"][0]))}%).
        Avgustda mentorning kunlik tekshiruv hajmi ${fi(Math.round(W_FIRST.human[0] / 7))} dan ${fi(Math.round(W_LAST.human[0] / 7))} ga tushdi — kod vazifalarini AI oldi.
      </p>
      ${chart()}
    </section>`;
  }

  // ---------- kunlik grafik (SVG) ----------
  function chart() {
    const W = 1080, H = 260, L = 42, R = 14, T = 16, B = 34;
    const iw = W - L - R, ih = H - T - B;
    const n = PR_DAILY.length;
    const x = (i) => L + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
    const y = (p) => T + ih - (Math.max(0, Math.min(100, p)) / 100) * ih;
    const series = [
      ["human", 1, 2, "#be123c"], ["ai", 3, 4, "#2563eb"], ["voice", 5, 6, "#a16207"]
    ];
    const paths = series.map(([k, ti, ri, col]) => {
      let d = "", open = false;
      PR_DAILY.forEach((r, i) => {
        if (r[ti] < 15) { open = false; return; } // kunlik hajmi 15 dan kam bo'lsa foiz ishonchsiz — chizilmaydi
        const p = pct(r[ri], r[ti]);
        d += (open ? "L" : "M") + x(i).toFixed(1) + " " + y(p).toFixed(1) + " ";
        open = true;
      });
      return `<path d="${d.trim()}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    }).join("");
    const grid = [0, 25, 50, 75, 100].map((v) =>
      `<line x1="${L}" y1="${y(v)}" x2="${W - R}" y2="${y(v)}" stroke="#e4e7ec"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="pr-ax">${v}%</text>`).join("");
    const ticks = PR_DAILY.map((r, i) => {
      const dd = r[0].slice(8);
      if (!(dd === "01" || dd === "05" || dd === "10" || dd === "15" || dd === "20" || dd === "25" || dd === "31")) return "";
      return `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" class="pr-ax">${r[0].slice(5).replace("-", ".")}</text>`;
    }).join("");
    const sepIdx = PR_DAILY.findIndex((r) => r[0] === "2026-09-01");
    const sepLine = sepIdx > 0 ? `<line x1="${x(sepIdx)}" y1="${T}" x2="${x(sepIdx)}" y2="${T + ih}" stroke="#10151d" stroke-dasharray="3 3" opacity=".45"/><text x="${x(sepIdx) - 5}" y="${T + 12}" text-anchor="end" class="pr-ax">sentyabr</text>` : "";
    return `
      <h3 class="sub-head">Kunlik rad etilish foizi <em>(1 avgust – 2 sentyabr)</em></h3>
      <div class="pr-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" class="pr-chart" role="img" aria-label="Kunlik rad etilish foizi">
          ${grid}${sepLine}${paths}${ticks}
        </svg>
      </div>
      <div class="legend pr-legend">
        <span><i class="dot" style="background:#be123c"></i>Mentor (odam)</span>
        <span><i class="dot" style="background:#2563eb"></i>AI tekshiruvi</span>
        <span><i class="dot" style="background:#a16207"></i>Ovoz avtotekshiruvi</span>
      </div>
      <p class="threshold-note">Kunlik hajmi 15 tekshiruvdan kam bo'lgan kunlar chizilmaydi (foiz ishonchsiz bo'ladi) — shu sababli AI chizig'i 3-avgustdan, ovoz chizig'i 5-avgustdan boshlanadi.</p>`;
  }

  // ---------- 3. TAKRORIY RAD ETISH ----------
  function secRepeat() {
    const d = PR_REPEAT_DIST;
    const bars = d.buckets.map(([lab, v]) => {
      const p = pct(v, d.chains);
      return `<tr><td><b>${lab}</b></td><td>${fi(v)}</td><td>${f1(p)}%</td>
        <td class="pr-barcell"><span class="pr-bar" style="width:${Math.max(0.6, p)}%"></span></td></tr>`;
    }).join("");
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">3 · Takroriylik</p>
          <h2>Bitta vazifa necha marta rad etiladi</h2>
          <p class="section-note">Birlik — <b>o'quvchi × vazifa</b> zanjiri (avgust, ${fi(d.chains)} zanjir). Bitta o'quvchi bitta vazifani necha marta rad ettirgani sanaladi.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="pr-table pr-narrow">
          <thead><tr><th>Necha marta rad etilgan</th><th>Zanjir soni</th><th>Ulushi</th><th>&nbsp;</th></tr></thead>
          <tbody>${bars}</tbody>
        </table>
      </div>
      <p class="threshold-note">
        <b>«3 marta» ustunidagi to'planish (${fi(1651)} zanjir) tasodifiy emas:</b> AI tekshiruvi uch urinishdan keyin vazifani odamga (mentorga) o'tkazadi —
        shu sababli aynan 3 ta rad etish eng ko'p uchraydigan «tugash nuqtasi».
        Avgustda rad etilgan ${fi(d.anyRej)} zanjirning ${fi(d.stuck)} tasi (${f1(pct(d.stuck, d.anyRej))}%) oy oxirigacha umuman qabul qilinmagan — o'quvchi qaytib topshirmagan yoki qayta-qayta rad etilgan.
      </p>
    </section>`;
  }

  // ---------- 4. DARSLAR ----------
  const lState = { sort: "aRej", dir: -1, crs: "all", pipe: "all", min: 60, q: "" };

  function lessonRows() {
    const rep = {}; PR_REPEAT.forEach((r) => (rep[r[0]] = r));
    return PR_LESSONS.map((l) => {
      const r = rep[l[0]] || [l[0], 0, 0, 0, 0];
      const domPipe = l[14] > l[10] && l[14] > l[12] ? "voice" : l[12] > l[10] ? "ai" : "human";
      return {
        lid: l[0], crs: l[1], mdl: l[2], les: l[3], type: l[4],
        aTot: l[5], aRej: l[6], aSt: l[7], sTot: l[8], sRej: l[9],
        hn: l[10], hr: l[11], an: l[12], ar: l[13], vn: l[14], vr: l[15],
        rate: pct(l[6], l[5]), sRate: l[8] >= 10 ? pct(l[9], l[8]) : null,
        ch: r[1], ch2: r[2], ch3: r[3], stuck: r[4],
        rep2: pct(r[2], r[1]), rep3: pct(r[3], r[1]), domPipe
      };
    });
  }

  function renderLessons() {
    const all = lessonRows();
    const q = lState.q.trim().toLowerCase();
    let rows = all.filter((r) =>
      (lState.crs === "all" || r.crs === lState.crs) &&
      (lState.pipe === "all" || r.domPipe === lState.pipe) &&
      r.aTot >= lState.min &&
      (!q || (r.les + " " + r.mdl + " " + r.crs).toLowerCase().includes(q)));
    const k = lState.sort;
    rows.sort((a, b) => {
      const va = a[k], vb = b[k];
      if (typeof va === "string") return lState.dir * va.localeCompare(vb);
      return lState.dir * ((va === null ? -1 : va) - (vb === null ? -1 : vb));
    });
    const body = rows.map((r, i) => `
      <tr>
        <td class="rank-col"><span class="rank ${i < 3 ? "top" : ""}">${i + 1}</span></td>
        <td>
          <span class="lesson-title">${esc(r.les)}</span>
          <small class="pr-sub">${esc(r.crs)} · ${esc(r.mdl)} · ${esc(r.type)} · id ${r.lid}</small>
        </td>
        <td><span class="status-pill ${r.domPipe === "human" ? "bad" : r.domPipe === "ai" ? "" : "mid"}">${PR_PIPES[r.domPipe].short}</span></td>
        <td>${fi(r.aTot)}</td>
        <td><b>${fi(r.aRej)}</b></td>
        <td class="${tone(r.rate)}"><b>${f1(r.rate)}%</b></td>
        <td>${fi(r.aSt)}</td>
        <td>${r.ch ? fi(r.ch2) : "—"}</td>
        <td class="${r.ch ? tone(r.rep2) : ""}">${r.ch ? f1(r.rep2) + "%" : "—"}</td>
        <td>${r.ch ? f1(r.rep3) + "%" : "—"}</td>
        <td>${r.ch ? fi(r.stuck) : "—"}</td>
        <td>${r.sTot ? fi(r.sTot) + " / " + fi(r.sRej) : "—"}</td>
        <td class="${r.sRate === null ? "" : tone(r.sRate)}">${r.sRate === null ? "—" : f1(r.sRate) + "%"}</td>
      </tr>`).join("");
    $("prLessonBody").innerHTML = body || `<tr><td colspan="13" class="pr-empty">Bu filtrga mos dars yo'q.</td></tr>`;
    const sTot = rows.reduce((s, r) => s + r.aTot, 0), sRej = rows.reduce((s, r) => s + r.aRej, 0);
    $("prLessonFoot").innerHTML = `<b>${fi(rows.length)} dars</b> ko'rsatilmoqda · ular bo'yicha avgustda ${fi(sTot)} tekshiruv, ${fi(sRej)} rad (${f1(pct(sRej, sTot))}%). Sarlavhani bosib saralash mumkin.`;
    document.querySelectorAll("#prLessonHead th[data-k]").forEach((th) => {
      th.classList.toggle("pr-sorted", th.dataset.k === lState.sort);
      th.dataset.dir = th.dataset.k === lState.sort ? (lState.dir < 0 ? "desc" : "asc") : "";
    });
  }

  function secLessons() {
    const courses = [...new Set(PR_LESSONS.map((l) => l[1]))].sort();
    const cols = [
      ["#", ""], ["Dars", "les"], ["Kim tekshiradi", "domPipe"], ["Tekshirilgan (avg)", "aTot"],
      ["Rad etilgan (avg)", "aRej"], ["Rad %", "rate"], ["O'quvchi", "aSt"],
      ["2+ marta rad (zanjir)", "ch2"], ["2+ marta rad %", "rep2"], ["3+ marta rad %", "rep3"],
      ["Qabul qilinmagan", "stuck"], ["Sentyabr: tekshir./rad", "sTot"], ["Sentyabr rad %", "sRate"]
    ];
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">4 · Darslar</p>
          <h2>Qaysi darsdan rad etiladi</h2>
          <p class="section-note">Avgustda kamida 60 tekshiruv va kamida 70 rad etish bo'lgan <b>barcha 101 dars</b>. «2+ marta rad %» — o'sha darsdagi o'quvchi × vazifa zanjirlaridan qanchasi kamida ikki marta rad etilgani.</p>
        </div>
      </div>
      <section class="filters pr-filters panel-cut">
        <label><span class="filter-label">Kurs</span><select id="prLCrs"><option value="all">Barcha kurslar</option>${courses.map((c) => `<option>${esc(c)}</option>`).join("")}</select></label>
        <label><span class="filter-label">Kim tekshiradi</span><select id="prLPipe">
          <option value="all">Barchasi</option><option value="human">Mentor (odam)</option><option value="ai">AI</option><option value="voice">Ovoz (English)</option></select></label>
        <label><span class="filter-label">Eng kam tekshiruv</span><select id="prLMin">
          <option value="60">60+</option><option value="120">120+</option><option value="200">200+</option><option value="300">300+</option></select></label>
        <label><span class="filter-label">Qidiruv</span><input type="search" id="prLQ" placeholder="dars nomi..."></label>
      </section>
      <div class="table-wrap">
        <table class="pr-table pr-wide">
          <thead id="prLessonHead"><tr>${cols.map(([lab, k]) => `<th ${k ? `data-k="${k}" class="pr-sortable"` : 'class="rank-col"'}>${lab}</th>`).join("")}</tr></thead>
          <tbody id="prLessonBody"></tbody>
        </table>
      </div>
      <p class="threshold-note" id="prLessonFoot"></p>
    </section>`;
  }

  // ---------- 5. MODULLAR ----------
  function secModules() {
    const sep = {}; PR_MODULES_SEP.forEach((m) => (sep[m[0] + "|" + m[1]] = m));
    const rows = PR_MODULES_AUG.map((m) => {
      const s = sep[m[0] + "|" + m[1]];
      const rate = pct(m[4], m[3]);
      const hRate = m[6] ? pct(m[7], m[6]) : null, aRate = m[8] ? pct(m[9], m[8]) : null, vRate = m[10] ? pct(m[11], m[10]) : null;
      const sRate = s && s[2] >= 15 ? pct(s[3], s[2]) : null;
      return { m, s, rate, hRate, aRate, vRate, sRate };
    }).sort((a, b) => b.rate - a.rate);
    const body = rows.map((r) => {
      const m = r.m;
      return `<tr>
        <td><b>${esc(m[1])}</b><small class="pr-sub">${esc(m[0])} · ${m[2]}-modul</small></td>
        <td>${fi(m[3])}</td><td><b>${fi(m[4])}</b></td>
        <td class="${tone(r.rate)}"><b>${f1(r.rate)}%</b></td>
        <td>${fi(m[5])}</td>
        <td>${m[6] ? fi(m[6]) + " / " + fi(m[7]) : "—"}</td>
        <td class="${r.hRate === null ? "" : tone(r.hRate)}">${r.hRate === null ? "—" : f1(r.hRate) + "%"}</td>
        <td>${m[8] ? fi(m[8]) + " / " + fi(m[9]) : "—"}</td>
        <td class="${r.aRate === null ? "" : tone(r.aRate)}">${r.aRate === null ? "—" : f1(r.aRate) + "%"}</td>
        <td>${m[10] ? fi(m[10]) + " / " + fi(m[11]) : "—"}</td>
        <td class="${r.vRate === null ? "" : tone(r.vRate)}">${r.vRate === null ? "—" : f1(r.vRate) + "%"}</td>
        <td>${r.s ? fi(r.s[2]) + " / " + fi(r.s[3]) : "—"}</td>
        <td class="${r.sRate === null ? "" : tone(r.sRate)}">${r.sRate === null ? "—" : f1(r.sRate) + "%"}</td>
      </tr>`;
    }).join("");
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">5 · Modullar</p>
          <h2>Modul va mavzu bo'yicha foiz</h2>
          <p class="section-note">Avgustda kamida 15 tekshiruv bo'lgan barcha modullar, rad etilish foizi bo'yicha kamayish tartibida. Kanal ustunlari «tekshirilgan / rad» ko'rinishida.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="pr-table pr-wide">
          <thead><tr>
            <th>Modul</th><th>Tekshirilgan</th><th>Rad</th><th>Rad %</th><th>O'quvchi</th>
            <th>Mentor: tekshir./rad</th><th>Mentor rad %</th>
            <th>AI: tekshir./rad</th><th>AI rad %</th>
            <th>Ovoz: tekshir./rad</th><th>Ovoz rad %</th>
            <th>Sentyabr: tekshir./rad</th><th>Sentyabr rad %</th>
          </tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <p class="threshold-note">Sentyabr ustuni 15 tekshiruvdan kam bo'lsa foiz ko'rsatilmaydi (&laquo;—&raquo;) — 2 kunlik ma'lumot bilan foiz chiqarish xato bo'ladi.</p>
    </section>`;
  }

  // ---------- 6. KURATORLAR ----------
  function secCurators() {
    const aug = {}, sep = {};
    PR_CURATORS.forEach((c) => ((c[1] === "2026-08" ? aug : sep)[c[0]] = c));
    const names = PR_CURATORS.filter((c) => c[1] === "2026-08").map((c) => c[0]);
    const rows = names.map((n) => {
      const a = aug[n], s = sep[n] || [n, "", 0, 0, 0, 0, 0, 0, 0, 0, 0];
      return {
        n, a, s, all: pct(a[3], a[2]),
        h: a[5] ? pct(a[6], a[5]) : null, ai: a[7] ? pct(a[8], a[7]) : null, v: a[9] ? pct(a[10], a[9]) : null,
        sAll: s[2] >= 60 ? pct(s[3], s[2]) : null,
        roster: PR_CURATOR_ROSTER[n] || null
      };
    }).sort((x, y) => {
      // "biriktirilmagan" qatori doim eng oxirida — u kuratorlar bilan bir qatorda turmaydi
      const ux = x.n === "Kurator biriktirilmagan", uy = y.n === "Kurator biriktirilmagan";
      if (ux !== uy) return ux ? 1 : -1;
      return (y.h === null ? -1 : y.h) - (x.h === null ? -1 : x.h);
    });
    const body = rows.map((r, i) => `
      <tr class="${r.n === "Kurator biriktirilmagan" ? "row-unranked" : ""}">
        <td class="rank-col"><span class="rank ${r.n === "Kurator biriktirilmagan" ? "off" : i < 2 ? "top" : ""}">${r.n === "Kurator biriktirilmagan" ? "—" : i + 1}</span></td>
        <td><b>${esc(r.n)}</b>${r.roster ? `<small class="pr-sub">${r.roster[0]} faol guruh · ${fi(r.roster[1])} faol o'quvchi (CRM, bugun)</small>` : `<small class="pr-sub">faol obunasi yo'q o'quvchilar (muzlatilgan / tugatgan)</small>`}</td>
        <td>${fi(r.a[4])}</td>
        <td>${fi(r.a[2])}</td><td><b>${fi(r.a[3])}</b></td>
        <td class="${tone(r.all)}"><b>${f1(r.all)}%</b></td>
        <td>${fi(r.a[5])} / ${fi(r.a[6])}</td>
        <td class="${r.h === null ? "" : tone(r.h)}"><b>${r.h === null ? "—" : f1(r.h) + "%"}</b></td>
        <td>${fi(r.a[7])} / ${fi(r.a[8])}</td>
        <td class="${r.ai === null ? "" : tone(r.ai)}">${r.ai === null ? "—" : f1(r.ai) + "%"}</td>
        <td>${fi(r.a[9])} / ${fi(r.a[10])}</td>
        <td class="${r.v === null ? "" : tone(r.v)}">${r.v === null ? "—" : f1(r.v) + "%"}</td>
        <td>${fi(r.s[2])} / ${fi(r.s[3])}</td>
        <td class="${r.sAll === null ? "" : tone(r.sAll)}">${r.sAll === null ? "—" : f1(r.sAll) + "%"}</td>
      </tr>`).join("");

    // kurator × kurs
    const byCur = {};
    PR_CURATOR_COURSE.forEach((r) => { (byCur[r[0]] = byCur[r[0]] || []).push(r); });
    const ccBody = Object.keys(byCur).sort().map((n) => {
      const list = byCur[n].sort((a, b) => b[2] - a[2]);
      return list.map((r, i) => `<tr>
        ${i === 0 ? `<td rowspan="${list.length}" class="pr-rowhead"><b>${esc(n)}</b></td>` : ""}
        <td>${esc(r[1])}</td><td>${fi(r[2])}</td><td><b>${fi(r[3])}</b></td>
        <td class="${tone(pct(r[3], r[2]))}"><b>${f1(pct(r[3], r[2]))}%</b></td>
        <td>${fi(r[4])}</td>
        <td>${fi(r[5])} / ${fi(r[6])}</td>
        <td class="${r[5] ? tone(pct(r[6], r[5])) : ""}">${r[5] ? f1(pct(r[6], r[5])) + "%" : "—"}</td>
      </tr>`).join("");
    }).join("");

    // kurator × sabab
    const codes = PR_REASONS_HUMAN.map((r) => r[0]);
    const labMap = {}; PR_REASONS_HUMAN.forEach((r) => (labMap[r[0]] = r[1]));
    const crBody = PR_CURATOR_REASONS.map(([n, m]) => {
      const tot = Object.values(m).reduce((a, b) => a + b, 0);
      const top = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 3);
      return `<tr>
        <td><b>${esc(n)}</b></td>
        <td>${fi(tot)}</td>
        ${codes.map((c) => {
          const v = m[c] || 0, p = pct(v, tot);
          return `<td class="pr-heat" style="background:rgba(190,18,60,${(Math.min(p, 30) / 30 * 0.42).toFixed(3)})" title="${esc(labMap[c])}">${v ? f1(p) + "%" : "—"}<small>${v ? fi(v) : ""}</small></td>`;
        }).join("")}
        <td class="pr-topcell">${top.map(([c, v]) => `<span class="pr-code" title="${esc(labMap[c])}">${c}</span> ${f1(pct(v, tot))}%`).join("<br>")}</td>
      </tr>`;
    }).join("");

    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">6 · Kuratorlar</p>
          <h2>Kurator kesimi</h2>
          <p class="section-note">Kurator = o'quvchining <b>faol obunasidagi guruh</b> kuratori. Reyting <b>mentor (odam) rad etish foizi</b> bo'yicha — bu qatorda avtotekshiruv aralashmaydi.</p>
        </div>
      </div>
      <div class="warn-strip pr-warn-strip">
        <b>Bu jadvalni to'g'ri o'qish.</b> Yuqori foiz kuratorning yomon ishlaganini avtomatik ko'rsatmaydi:
        kuratorlar turli kurslarni olib boradi (Dilafruz Shokirovada asosan «Веб программирование», Xalima Ismoiljonovada «Grafik dizayn», Shaxlo Ziyodovada English ulushi katta),
        va turli kurslarda rad etilish foizi tabiiy ravishda boshqa. Shu sababli pastda <b>kurator × kurs</b> jadvali ham bor — taqqoslashni bir xil kurs ichida qiling.
      </div>
      <div class="table-wrap">
        <table class="pr-table pr-wide">
          <thead><tr>
            <th class="rank-col">#</th><th>Kurator</th><th>Amaliy ish topshirgan o'quvchi (avg)</th>
            <th>Tekshirilgan</th><th>Rad</th><th>Rad % (jami)</th>
            <th>Mentor: tekshir./rad</th><th>Mentor rad %</th>
            <th>AI: tekshir./rad</th><th>AI rad %</th>
            <th>Ovoz: tekshir./rad</th><th>Ovoz rad %</th>
            <th>Sentyabr: tekshir./rad</th><th>Sentyabr rad %</th>
          </tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <p class="threshold-note">«Kurator biriktirilmagan» — faol obunasi bo'lmagan (muzlatilgan yoki kursni tugatgan) o'quvchilar; avgust hajmining ${f1(pct(5899, AUG.total))}% i. Ularni hech kimga yozib qo'yish to'g'ri bo'lmaydi, shu sababli alohida qatorda.</p>

      <h3 class="sub-head">Kurator × kurs <em>(avgust)</em></h3>
      <div class="table-wrap">
        <table class="pr-table">
          <thead><tr><th>Kurator</th><th>Kurs</th><th>Tekshirilgan</th><th>Rad</th><th>Rad %</th><th>O'quvchi</th><th>Mentor: tekshir./rad</th><th>Mentor rad %</th></tr></thead>
          <tbody>${ccBody}</tbody>
        </table>
      </div>
      <p class="threshold-note">Kamida 25 tekshiruv bo'lgan juftliklar.</p>

      <h3 class="sub-head">Kurator × rad etish sababi <em>(avgust, faqat mentor izohlari)</em></h3>
      <div class="table-wrap">
        <table class="pr-table pr-wide">
          <thead><tr><th>Kurator</th><th>Mentor rad etishi</th>${codes.map((c) => `<th title="${esc(labMap[c])}">${c}</th>`).join("")}<th>Eng ko'p uch sabab</th></tr></thead>
          <tbody>${crBody}</tbody>
        </table>
      </div>
      <p class="threshold-note">Har bir katakda — o'sha kuratorning mentor rad etishlaridan necha foizi shu sababga to'g'ri kelgani (ostida — soni). Kod izohlari 7-bo'limda.</p>
    </section>`;
  }

  // ---------- 7. SABABLAR ----------
  function secReasons() {
    const block = (title, note, arr, tot, codeCol) => {
      const rows = arr.map((r) => {
        const pA = pct(r[2], tot.aug), pS = pct(r[3], tot.sep);
        return `<tr>
          <td><span class="pr-code">${r[0]}</span></td>
          <td><b>${esc(r[1])}</b>${r[4] ? `<small class="pr-quote">${esc(r[4])}</small>` : ""}</td>
          <td>${fi(r[2])}</td>
          <td><b>${f1(pA)}%</b></td>
          <td class="pr-barcell"><span class="pr-bar" style="width:${Math.max(0.6, pA * 3)}%"></span></td>
          <td>${fi(r[3])}</td>
          <td>${tot.sep >= 60 ? f1(pS) + "%" : "—"}</td>
        </tr>`;
      }).join("");
      return `
        <h3 class="sub-head">${title}</h3>
        <p class="section-note">${note}</p>
        <div class="table-wrap">
          <table class="pr-table">
            <thead><tr><th>${codeCol}</th><th>Sabab</th><th>Avgust: soni</th><th>Avgust: ulushi</th><th>&nbsp;</th><th>Sentyabr: soni</th><th>Sentyabr: ulushi</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    };
    // Uchta guruh butun mentor rad etishlarini to'liq qoplaydi (yig'indisi 100%)
    const sum = (codes) => PR_REASONS_HUMAN.filter((r) => codes.includes(r[0])).reduce((s, r) => s + r[2], 0);
    const gr = sum(["G", "C", "B", "I", "J"]);
    const kn = sum(["H", "F", "K", "L", "A", "D", "E"]);
    const rest = sum(["Z", "M", "N"]);
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">7 · Sabablar</p>
          <h2>Nima uchun rad etiladi</h2>
          <p class="section-note">Mentor har rad etishda <code>reason</code> maydoniga izoh yozadi. Izohlar erkin matn (avgustda 4 816 rad etishda 1 597 xil matn), shu sababli ular <b>kalit so'z qoidalari</b> bilan toifalangan — qoidalar 9-bo'limda ochiq.</p>
        </div>
      </div>
      <div class="mentor-stat-row pr-split">
        <div class="mentor-stat"><b>${f1(pct(gr, PR_REASONS_HUMAN_TOTAL.aug))}%</b><span>Topshirish formati bilan bog'liq</span><small>Skrinshot (G), noto'g'ri fayl (C), bo'sh yuborish (B), havola yo'q (I), format talabi (J) — ya'ni o'quvchi <b>bilmagani uchun emas</b>, <b>to'g'ri topshirmagani uchun</b> rad etilgan. ${fi(gr)} rad etish.</small></div>
        <div class="mentor-stat"><b>${f1(pct(kn, PR_REASONS_HUMAN_TOTAL.aug))}%</b><span>Ishning mazmuni bilan bog'liq</span><small>To'liq bajarmagan (H), kodda xato (F), shartga mos emas (K), umuman bajarmagan (L), AI bilan yozgan (A), takroran yuborish (D), telefonda bajargan (E). ${fi(kn)} rad etish.</small></div>
        <div class="mentor-stat"><b>${f1(pct(rest, PR_REASONS_HUMAN_TOTAL.aug))}%</b><span>Aniqlanmagan yoki jarayon izohi</span><small>Bir-ikki marta uchraydigan shaxsiy izohlar (Z), izohsiz qoldirilgan (M) va kuratorga murojaat so'rovi (N) — jami ${fi(rest)} izoh. Uch guruh qo'shilib aynan 100% ni beradi.</small></div>
      </div>
      ${block("Mentor (odam) rad etish sabablari", `Mahraj — avgustda ${fi(PR_REASONS_HUMAN_TOTAL.aug)}, sentyabrda ${fi(PR_REASONS_HUMAN_TOTAL.sep)} mentor rad etishi. Sentyabr namunasi kichik, shu sababli foiz ko'rsatilmaydi.`, PR_REASONS_HUMAN, PR_REASONS_HUMAN_TOTAL, "Kod")}
      ${block("AI tekshiruvining rad etish sabablari", `Mahraj — avgustda ${fi(PR_REASONS_AI_TOTAL.aug)}, sentyabrda ${fi(PR_REASONS_AI_TOTAL.sep)} AI rad etishi. AI izohi har topshiriq uchun alohida yoziladi, shu sababli toifalash taxminiy: bir izoh bir necha xatoni sanashi mumkin, u birinchi mos kelgan toifaga yoziladi.`, PR_REASONS_AI, PR_REASONS_AI_TOTAL, "Kod")}
      ${block("Ovoz avtotekshiruvi (English) rad etish sabablari", `Mahraj — avgustda ${fi(PR_REASONS_VOICE_TOTAL.aug)}, sentyabrda ${fi(PR_REASONS_VOICE_TOTAL.sep)} rad etish. Bu kanal amaliy <em>kod</em> ishi emas — English kursidagi ovozli mashqlar; e'tiborni chalg'itmasligi uchun alohida turadi.`, PR_REASONS_VOICE, PR_REASONS_VOICE_TOTAL, "Kod")}
    </section>`;
  }

  // ---------- 8. TEKSHIRUVCHILAR ----------
  function secReviewers() {
    const mk = (mon) => PR_REVIEWERS.filter((r) => r[2] === mon).map((r) => {
      const p = pct(r[4], r[3]);
      return `<tr><td><b>${esc(r[0])}</b><small class="pr-sub">${esc(r[1])}</small></td>
        <td>${fi(r[3])}</td><td>${fi(r[4])}</td>
        <td class="${tone(p)}"><b>${f1(p)}%</b></td>
        <td>${r[5] ? fi(r[5]) : "—"}</td>
        <td>${fi(Math.round(r[3] / (mon === "2026-08" ? 31 : 2)))}</td></tr>`;
    }).join("");
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">8 · Tekshiruvchilar</p>
          <h2>Kim tekshiradi va kim rad etadi</h2>
          <p class="section-note">Faqat <b>odam</b> tekshirgan qatorlar. Rad etish foizi tekshiruvchining qat'iyligini ko'rsatadi — lekin ular bir xil vazifalarni tekshirmaydi, shu sababli bu reyting emas, taqsimot.</p>
        </div>
      </div>
      <h3 class="sub-head">Avgust</h3>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th>Tekshiruvchi</th><th>Tekshirgan</th><th>Rad etgan</th><th>Rad %</th><th>O'quvchi</th><th>Kunlik o'rtacha</th></tr></thead>
        <tbody>${mk("2026-08")}</tbody></table></div>
      <h3 class="sub-head">Sentyabr (1–2)</h3>
      <div class="table-wrap"><table class="pr-table pr-narrow">
        <thead><tr><th>Tekshiruvchi</th><th>Tekshirgan</th><th>Rad etgan</th><th>Rad %</th><th>O'quvchi</th><th>Kunlik o'rtacha</th></tr></thead>
        <tbody>${mk("2026-09")}</tbody></table></div>
      <p class="threshold-note"><b>Diqqat:</b> avgustda odam tekshirgan ${fi(AUG.human[0])} qatorning ${f1(pct(14030, AUG.human[0]))}% i bitta xodimga — <b>Diyorbek Kozibayev</b> (Support Mentor) ga to'g'ri keladi. Ya'ni «mentorlar qanday sabab yozadi» degan savolning javobi amalda shu bir xodimning shablonlariga bog'liq.</p>
    </section>`;
  }

  // ---------- 9. METODIKA ----------
  function secMethod() {
    return `
    <section class="ranking panel-cut">
      <div class="section-head">
        <div>
          <p class="eyebrow">9 · Metodika</p>
          <h2>Har bir son qayerdan olingan</h2>
        </div>
      </div>
      <div class="method-panel formula-panel pr-rules">
        ${PR_RULES.map(([k, v]) => `<div><b>${esc(k)}</b><p>${esc(v)}</p></div>`).join("")}
      </div>
      <p class="threshold-note">
        <b>Manba jadvallar:</b> <code>student_question_practice</code> (topshiriq + tekshiruv + izoh) &middot;
        <code>student_questions &rarr; student_lessons &rarr; student_modules &rarr; student_courses</code> (dars, modul, kurs) &middot;
        <code>student_students &rarr; subscribe_list &rarr; group_list.ADMIN_ID</code> (kurator) &middot;
        <code>gl_sys_users / gl_sys_roles</code> (ism va rol).<br>
        <b>Snapshot:</b> ${esc(PR_META.snapshot)}. Baza jonli: hali tekshirilmagan topshiriqlar keyin qabul/rad ga o'tadi, shu sababli 30–31 avgust va sentyabr sonlari keyingi o'qishda bir necha birlik o'sishi mumkin.<br>
        <b>Nima kirmagan:</b> hali tekshirilmagan (<code>uploaded</code>) va eski <code>old_approved</code> qatorlar; blockly avto-qabul (avgustda 17 147 qator) barcha foizlardan chiqarilgan.<br>
        <b>Bitta kichik nomuvofiqlik ochiq aytiladi:</b> avgustda 20 qatorda <code>teacher_id = 0</code> bo'lib, <code>review_source = 'teacher'</code> turadi — ya'ni odam tekshirgani yozilgan, lekin qaysi xodim ekani yozilmagan. Ular «jami» va «mentor» ustunlariga kiradi, darslar jadvalining kanal ustunlarida esa 10 tasi hech qaysi kanalga yozilmagan (31 048 dan 10 tasi, 0.03%). Shu sababli darslar jadvalida kanal ustunlarining yig'indisi «tekshirilgan» ustunidan 10 birlik kam chiqishi mumkin.
      </p>
    </section>`;
  }

  // ---------- montaj ----------
  function build() {
    const el = $("app");
    el.innerHTML = [
      ["pr1", secSummary()], ["pr2", secCompare()], ["pr3", secRepeat()],
      ["pr4", secLessons()], ["pr5", secModules()], ["pr6", secCurators()],
      ["pr7", secReasons()], ["pr8", secReviewers()], ["pr9", secMethod()]
    ].map(([id, html]) => html.replace('<section class="ranking panel-cut">', `<section class="ranking panel-cut" id="${id}">`)).join("");

    $("rangeChip").textContent = "avgust: 31 kun · sentyabr: 2 kun";
    $("countChip").textContent = `${fi(AUG.total + SEP.total)} ta tekshirilgan topshiriq`;

    renderLessons();
    $("prLCrs").addEventListener("change", (e) => { lState.crs = e.target.value; renderLessons(); });
    $("prLPipe").addEventListener("change", (e) => { lState.pipe = e.target.value; renderLessons(); });
    $("prLMin").addEventListener("change", (e) => { lState.min = +e.target.value; renderLessons(); });
    $("prLQ").addEventListener("input", (e) => { lState.q = e.target.value; renderLessons(); });
    document.querySelectorAll("#prLessonHead th[data-k]").forEach((th) => {
      th.addEventListener("click", () => {
        const k = th.dataset.k;
        if (lState.sort === k) lState.dir = -lState.dir;
        else { lState.sort = k; lState.dir = k === "les" ? 1 : -1; }
        renderLessons();
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
