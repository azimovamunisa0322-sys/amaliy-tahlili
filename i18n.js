/* ============================================================================
   IKKI TIL / ДВА ЯЗЫКА — sahifadagi HAMMA matn shu fayldan chiqadi.
   Kalitlar to'plami ikki tilda AYNAN bir xil bo'lishi kerak; app.js yuklanishda
   buni tekshiradi va farq bo'lsa konsolga xato yozadi.

   Bazadan olingan nomlar TARJIMA QILINMAYDI: o'quvchi ismlari, guruh nomlari,
   kurator ismlari, kurs / modul / dars nomlari — ular platformadagi haqiqiy
   yozuvlar. Mentor izohlaridan olingan misollar rus tilida tarjima sifatida
   ko'rsatiladi va jadvalda shundayligi ochiq yozilgan.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   Yordamchilar. Lug'at funksiyalari XOM sonni oladi va o'zi formatlaydi —
   shu sababli rus tilida son kelishigini to'g'ri qo'yish mumkin.
   Функции словаря получают СЫРОЕ число и сами его форматируют — поэтому
   в русском корректно ставится падеж после числа (1 урок / 2 урока / 5 уроков).
   ------------------------------------------------------------------------- */
const FI = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString("ru-RU") : "—");
const F1 = (x) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toFixed(1).replace(".", ",") : "—");
const CAP = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

// ruscha son kelishigi: PL(2, ["ученик","ученика","учеников"])
const PL = (n, f) => {
  const a = Math.abs(Math.round(n)) % 100, b = a % 10;
  if (a > 10 && a < 20) return f[2];
  if (b > 1 && b < 5) return f[1];
  if (b === 1) return f[0];
  return f[2];
};
const NPL = (n, f) => FI(n) + " " + PL(n, f);   // son + to'g'ri kelishik

const W = {
  rej: ["отклонение", "отклонения", "отклонений"],
  stud: ["ученик", "ученика", "учеников"],
  mod: ["модуль", "модуля", "модулей"],
  les: ["урок", "урока", "уроков"],
  cur: ["куратор", "куратора", "кураторов"],
  row: ["строка", "строки", "строк"],
  task: ["задание", "задания", "заданий"],
  acc: ["аккаунт", "аккаунта", "аккаунтов"],
  // predlog kelishigi: "в 1 уроке" / "в 2 уроках" / "в 41 уроке"
  lesIn: ["уроке", "уроках", "уроках"],
  taskIn: ["разном задании", "разных заданиях", "разных заданиях"]
};

const STRINGS = {
  uz: {
    /* ---- umumiy ---- */
    lang: "Til",
    h1: "RAD ETILGAN <b>AMALIY VAZIFALAR</b>",
    docTitle: (sp) => `Rad etilgan amaliy vazifalar — ${sp}`,
    shortAug: "avgust", shortSep: "sentyabr", shortBoth: "avgust va sentyabr",
    innAug: "avgustda", innSep: "sentyabrda", innBoth: "avgust va sentyabrda",
    perAug: "1–31 avgust 2026",
    perSep: "1&ndash;3 sentyabr 2026",
    perBoth: "1-avgust &ndash; 3-sentyabr 2026",
    perDaysAug: "31 kun",
    perDaysSep: "1 va 2-sentyabr to'liq + 3-sentyabr 12:00 gacha, ya'ni 2,5 kun",
    perDaysBoth: "31 kun avgust + 2,5 kun sentyabr",
    dayNames: ["1-sentyabr", "2-sentyabr", "3-sentyabr"],
    chipCount: (n) => `${FI(n)} ta rad etish`,
    periodWord: "Davr",
    btnAug: "Avgust", btnSep: "Sentyabr", btnBoth: "Avgust + Sentyabr",
    periodNoteClosed: "Avgust yopilgan &mdash; sonlar yakuniy.",
    periodNoteSep: (tm) => `Sentyabr hali tugamagan: 1-sentyabr to'liq + 2-sentyabr ${tm} gacha.`,
    periodNoteBoth: (c) => `Ichida tugamagan sentyabr bor (kesim ${c}).`,
    periodLine: (label, closed, cut) =>
      `Davr: <b>${label}</b>${closed ? " &mdash; yopilgan, sonlar yakuniy" : ` &mdash; hali to'lib turadi (kesim ${cut})`}`,

    methodLead: (inn, n) =>
      `${CAP(inn)} <b>${FI(n)}</b> ta amaliy vazifa rad etilgan (guruhi bor o'quvchilar bo'yicha). ` +
      `Bu sayt shu sonni bo'lib ko'rsatadi: <b>nega</b> rad etilgan, <b>qaysi kuratorda</b> va <b>qaysi moduldan</b> ko'p.`,
    methodSummary: "Bitta muhim izoh",
    methodMore: (n) =>
      `<b>${FI(n)}</b> &mdash; bu <b>rad etish hodisasi</b> soni, vazifa soni emas. Bitta o'quvchi bitta vazifani uch marta yuborib, uch marta rad ettirsa, u uch marta sanaladi. ` +
      `Blockly o'yin vazifalari bu yerda umuman yo'q: ularni tizim avtomatik qabul qiladi va hech qachon rad etmaydi.`,
    exclNote: (ng, ngr, ts, tsr, raw, n) =>
      `Saytdan chiqarilgan: guruhi yo'q <b>${FI(ng)}</b> o'quvchi (<b>${FI(ngr)}</b> rad etish) ` +
      `va platformadagi <b>${FI(ts)}</b> test akkaunt (<b>${FI(tsr)}</b> rad etish). ` +
      `Bazadagi xom jami &mdash; ${FI(raw)}; bu yerdagi <b>${FI(n)}</b> esa faqat guruhi bor haqiqiy o'quvchilar bo'yicha.`,
    footNote: (label, cut) =>
      `Manba: Junior LMS / CRM bazasi. Davr: ${label} (topshiriq yuborilgan sana bo'yicha). ` +
      `Barcha son bazadagi haqiqiy qatorlardan olingan &mdash; hech narsa taxmin qilinmagan. ` +
      `Avgust yopilgan: tekshirilmagan topshiriq qolmagan, sonlar yakuniy. Sentyabr kesimi: ${cut}.`,
    nav: ["1 · Umumiy son", "2 · Nega rad etildi", "3 · Kurator", "4 · Modul va dars", "5 · Izoh"],

    /* ---- jadval sarlavhalari ---- */
    thRej: "Rad etishlar", thPct: "Foiz", thStud: "O'quvchi", thStudName: "O'quvchi", thNote: "Izoh",
    thRejStud: "Rad etilgan o'quvchi", thPerStud: "1 o'quvchiga o'rtacha", thPerStudShort: "1 o'quvchiga",
    thTotal: "JAMI",
    thCmpAug: "Avgustda foiz", thCmpDiff: "Farq, punkt",
    thWho: "Kim tekshirib rad etdi",
    thReason: "Rad etish sababi",
    thCurator: "Kurator", thModule: "Modul", thLesson: "Dars",
    thInModule: "Modul ichida",
    thGroup: "Guruh", thTotalRej: "Jami rad etish", thFromCourse: "Qaysi kursdan",
    noGroup: "guruhi yo'q", noName: "nomsiz dars", wasNone: "yo'q edi",

    /* ---- kanallar ---- */
    chH: "Mentor (odam)", chHNote: "Xodim ko'rib, izoh yozib rad etadi",
    chA: "AI tekshiruvi",
    chV: "Ovoz avtotekshiruvi (English)", chVNote: "Ovozli javobni tizim tekshiradi",
    aiNoteAug: "AI kod vazifalarini tekshiradi &mdash; avgustda 3-sanadan boshlab",
    aiNoteSep: "AI kod vazifalarini tekshiradi &mdash; sentyabrda birinchi kundan uzluksiz",
    aiNoteBoth: "AI kod vazifalarini tekshiradi &mdash; 3-avgustdan uzluksiz",

    /* ---- 1-bo'lim ---- */
    s1eyebrow: "1 · Umumiy son",
    s1h2: (inn) => `${CAP(inn)} nechta vazifa rad etildi`,
    s1big: (studBtn, mods, tot) =>
      `ta amaliy vazifa <b>rad etilgan</b>.<br>
       Bu <b>rad etish hodisasi</b> soni: bitta vazifa uch marta rad etilsa, uchta sanaladi.<br>
       Bu ${studBtn}, ${FI(mods)} ta modulda sodir bo'lgan.`,
    s1studSuffix: (n) => `${FI(n)} ta o'quvchida`,
    perDayLabel: "kuniga o'rtacha",
    perDayAugLabel: "avgustda kuniga o'rtacha",
    perDayAugHint: (n) => `Solishtirish uchun: ${FI(n)} &divide; 31 kun`,
    sepDaysTitle: "Sentyabrning kunlari",
    dayUnfinished: "(12:00 gacha, kun tugamagan)",
    s1sub: "Rad etishni kim qo'ygan",
    s1auto: (pct) =>
      `Rad etishning ${pct}% ini <b>odam emas, tizim</b> qo'ygan: kod vazifalarini AI, English kursidagi ovozli mashqlarni ovoz avtotekshiruvi tekshiradi.
       Bu bo'linish faqat shu yerda ko'rsatiladi. Blockly o'yin vazifalari umuman kirmaydi &mdash; ularni tizim avtomatik qabul qiladi, hech qachon rad etmaydi.`,
    s1aiSep: "<b>Sentyabrda AI birinchi kundan ishlagan</b> &mdash; 1-sentyabr 00:01 dan uzluksiz. Ya'ni sentyabrda uchala ustun ham to'liq davrni qamraydi.",
    s1aiAug: `<b>AI tekshiruvi butun avgust ishlamagan.</b> Bazadagi eng birinchi AI tekshiruvi &mdash; 30-iyul 11:35. U 31-iyul ertalab 08:57 da to'xtagan,
       <b>1 va 2 avgustda umuman ishlamagan</b>, va 3-avgust 15:30 da qaytib yoqilgan &mdash; shundan keyin uzluksiz ishlagan.
       Shu sababli AI ustunidagi son avgustning 31 kuniga emas, <b>29 kuniga</b> tegishli. <b>Bu ma'lumot yetishmasligi emas</b> &mdash; o'sha ikki kunda AI umuman ishlamagan,
       kod vazifalarini mentorlar tekshirgan, shu sababli 1 va 2 avgustning jami soni ham to'liq: mentor tekshiruvi 1-avgustda 1 335, 2-avgustda 1 275 ta bo'lgan
       &mdash; oyning eng baland kunlari; AI yoqilgach kuniga 350&ndash;500 ga tushgan.`,
    s1click: "<b>Har bir songa bosing</b> &mdash; o'sha sonning ortidagi o'quvchilar ro'yxati ochiladi.",

    /* ---- 2-bo'lim ---- */
    s2eyebrow: "2 · Sabab",
    s2h2: "Nega rad etildi",
    s2note: "Har bir rad etishda izoh yozilgan. Izohlar erkin matn, shu sababli kalit so'zlar bo'yicha toifalangan (qoidalar oxirgi bo'limda).",
    s2noteCmp: " Oxirgi ikki ustun <b>avgust bilan solishtiradi</b>: qaysi sabab ulushi o'sgan, qaysi biri kamaygan.",
    s2cmpStrip: "<b>Farq &mdash; foiz punktida.</b> Masalan avgustda 5,4% bo'lgan sabab sentyabrda 7,4% bo'lsa, farq +2,0 punkt. Bu ulushning o'zgarishi, sonning emas: sentyabr hali 2,5 kun, shu sababli yalpi sonni avgust bilan solishtirmang &mdash; ulushni solishtiring.",
    mentorQuote: "Mentor izohi:",
    s2sub: "Xodim (mentor) qo'ygan rad etishlar nima sababdan",
    rgroupTail: (tot, pct, studBtn) => ` Umumiy ${FI(tot)} dan ${pct}%, ${studBtn}.`,
    rgroupStud: (n) => `${FI(n)} o'quvchi`,
    rgroupWasAug: (pct) => ` Avgustda ${pct}% edi.`,

    /* ---- 3-bo'lim ---- */
    s3eyebrow: "3 · Kurator",
    s3h2: "Qaysi kuratorning o'quvchilarida ko'p",
    s3note: (rows) => `Bizda <b>7 kurator</b> bor. Kurator = o'quvchining faol obunasidagi guruh kuratori; har bir o'quvchida bitta kurator. Guruhi yo'q o'quvchilar va test akkaunt saytdan chiqarilgani uchun jadvalda aynan ${FI(rows)} qator bor.`,
    s3strip: "<b>Eng muhim ustun &mdash; &laquo;1 o'quvchiga o'rtacha&raquo;.</b> Yalpi son adashtiradi: ko'p o'quvchisi bor kuratorda rad etish tabiiy ravishda ko'p bo'ladi.",
    s3unranked: "faol obunasi yo'q &mdash; muzlatilgan, tugatgan yoki test hisoblari",
    s3tail: (tot, rows) => `Jadval umumiy ${FI(tot)} ta rad etishning hammasini qoplaydi &mdash; ${FI(rows)} kurator, boshqa qator yo'q.`,

    /* ---- 4-bo'lim ---- */
    s4eyebrow: "4 · Modul va dars",
    s4h2: "Qaysi moduldan, qaysi darsdan ko'p",
    s4note: (inn, mods, les) => `${CAP(inn)} rad etish bo'lgan barcha ${FI(mods)} modul va ${FI(les)} dars.`,
    s4strip: `<b>Modul nomiga bosing</b> &mdash; masalan <b>CSS</b> ga &mdash; o'sha modulning <b>qaysi darsida</b> rad etilgani ochiladi.
       Muammoni tuzatish uchun kerakli son shu: modul emas, aynan dars.`,
    s4topLesson: (name, crs, mod, n) => ` Eng ko'p rad etilgan dars: <b>${name}</b> (${crs} &middot; ${mod}) &mdash; ${FI(n)} marta.`,
    modOrder: (n) => `${n}-modul`,
    modSeeLessons: "darslarni ko'rish",
    lessonOrder: (n) => `dars tartibi ${n}`,
    lessonId: (n) => `dars id ${n}`,
    lessonLead: (crs, mod, cnt, sum) =>
      `<b>${crs} &middot; ${mod}</b> modulida rad etish <b>${FI(cnt)}</b> ta darsda bo'lgan.
       Quyidagi sonlar qo'shilib <b>${FI(sum)}</b> ni beradi &mdash; modul qatoridagi son bilan aynan bir xil.
       <br>Har bir dars soni ham bosiladi &mdash; o'sha darsda rad etilgan o'quvchilar ro'yxati ochiladi.`,
    s4tail: (n) => `&laquo;Rad etilgan o'quvchi&raquo; ustunlarining yig'indisi ${FI(n)} dan katta &mdash; bitta o'quvchi bir necha modulda rad etilgan bo'lishi mumkin, shu sababli u har bir modulda bir marta sanaladi. Dars bo'yicha ham xuddi shunday.`,

    /* ---- 5-bo'lim ---- */
    s5eyebrow: "5 · Izoh",
    s5h2: "Sonlar qanday olingan",
    rules: (V) => [
      ["Rad etish", `Bazada <code>student_question_practice</code> jadvalidagi <code>status = 'rejected'</code> qatorlar. Davr &mdash; <code>created_at</code> ${V.label}.`],
      ["Birlik", `Bitta qator = bitta rad etish hodisasi. Bitta vazifa uch marta rad etilsa &mdash; uch qator. Shu sababli ${FI(V.T)} soni vazifa soni emas.`],
      ["Foiz", `Saytdagi har bir foiz bitta mahrajdan olingan: tanlangan davrdagi ${FI(V.T)} ta rad etish. Boshqa mahraj yo'q.`],
      ["Davr filtri", "Yuqoridagi filtr avgust, sentyabr yoki ikkisini birga ko'rsatadi. Filtr bosilganda hamma son noldan qayta hisoblanadi &mdash; oldingi davrning soni hech qayerda qolmaydi. Ikki oy birga tanlanganda bir xil o'quvchi bir marta sanaladi, sonlari esa qo'shiladi."],
      ["Har bir son bosiladi", `Sahifadagi hamma son bitta ro'yxatdan &mdash; ${FI(V.ST)} o'quvchi qatoridan hisoblanadi. Songa bosilganda aynan shu son ortidagi o'quvchilar chiqadi, shu sababli jadval bilan ro'yxat doim mos keladi.`],
      ["AI tekshiruvi qachondan", "Birinchi AI tekshiruvi 30-iyul 11:35. 1&ndash;2 avgustda ishlamagan, 3-avgust 15:30 dan uzluksiz &mdash; sentyabrda ham birinchi kundan ishlagan. Ya'ni AI soni avgustning 29 kuniga, sentyabrning esa hamma kuniga tegishli. Jami son har kuni to'liq: AI ishlamagan kunlarda mentorlar tekshirgan."],
      ["Kim kirmaydi", `Guruhi yo'q &mdash; faol obunasi bo'lmagan, muzlatilgan yoki tugatgan &mdash; ${FI(V.exNg)} o'quvchi (${FI(V.exNgR)} rad etish) va ${FI(V.exTs)} test akkaunt (${FI(V.exTsR)} rad etish). &laquo;Guruhi yo'q&raquo; bilan &laquo;kuratori yo'q&raquo; to'plami aynan bir xil, shu sababli kurator jadvalida faqat 7 kurator qoldi.`],
      ["Blockly kirmaydi", "<code>teacher_id = 1</code>, izoh <code>blockly-game</code> &mdash; o'yin vazifalarini tizim avtomatik qabul qiladi va hech qachon rad etmaydi."],
      ["Sabab toifasi", "Izoh erkin matn (mentor izohlarida 1 597 xil matn). Kalit so'zlar bo'yicha prioritetli tartibda toifalanadi; bir izoh faqat bitta toifaga tushadi."],
      ["Guruh va kurator &mdash; hozirgi holat", "O'quvchining guruhi va kuratori <b>bugungi faol obunasi</b> bo'yicha olinadi, avgustdagi holati bo'yicha emas. Shu sababli muzlatilgan o'quvchi qayta faollashtirilsa, uning avgustdagi rad etishlari &laquo;guruhi yo'q&raquo; dan chiqib, kurator ustuniga o'tadi &mdash; ya'ni o'tgan oyning sonlari ham ozgina siljishi mumkin. Aynan shunday bo'ldi: 3-sentyabrda bitta o'quvchining obunasi avtomatik qayta yoqilgan va uning 9 rad etishi Madina Normatova ustuniga qo'shildi. Guruh va kurator holati oxirgi marta shu sanada bazaga solishtirilgan."],
      ["Til", "Sayt ikki tilda: sonlar va hisob-kitob bir xil, faqat matn o'zgaradi. Bazadan olingan nomlar &mdash; o'quvchi, guruh, kurator, kurs, modul va dars nomlari &mdash; tarjima qilinmaydi, chunki ular platformadagi haqiqiy yozuvlar. Mentor izohlaridan olingan misollar rus tilida tarjima sifatida beriladi va jadvalda shundayligi yozilgan."]
    ],
    s5closed: (snap, recheck) =>
      `<b>Avgust yopilgan &mdash; uning sonlari yakuniy.</b> Avgust ma'lumoti ${snap} da olingan va ${recheck} da bazaga qayta solishtirilgan:
       avgustda bitta ham tekshirilmagan (<code>uploaded</code>) topshiriq qolmagan, jami rad etish <b>24 671</b> da o'zgarmagan. Ya'ni sonlar 1&ndash;31 avgustni to'liq qamraydi va endi o'zgarmaydi. 31-avgust ham ichida: o'sha kuni 784 rad etish.`,
    s5open: (cut) =>
      `<b>Sentyabr hali yopilmagan</b> &mdash; kesim aniq vaqtga qadalgan: <b>${cut}</b>. Sentyabr sonlari keyingi yangilashda <b>ikki sababdan</b> o'sadi.
       <b>Birinchi:</b> yangi kunlar qo'shiladi. <b>Ikkinchi:</b> kesimdan oldin yuborilgan, lekin o'sha payt hali tekshirilmagan topshiriqlar keyin rad etiladi &mdash; ya'ni kesim o'zgarmasa ham eski kunlarning soni ortishi mumkin.
       Aynan shu sodir bo'ldi: 2-sentyabr 18:50 kesimida 829 rad etish bor edi, keyin o'sha oynadagi son 838 ga chiqdi.
       Shu sababli sentyabrni avgust bilan <b>yalpi son bo'yicha solishtirmang</b> &mdash; kunlik o'rtacha yoki foiz ulushi bo'yicha solishtiring.`,
    s5both: " Hozir ikki oy birga tanlangan: xom jami <b>25 891</b> (avgust 24 671 + sentyabr 1 220).",
    s5tables: "<b>Manba jadvallar:</b>",

    /* ---- ro'yxat ---- */
    drillEyebrow: "Ro'yxat",
    drillClose: "yopish &#10005;",
    drillAll: (per) => `${per} — rad etilgan barcha vazifalar`,
    drillCh: (ch) => `${ch} rad etgan vazifalar`,
    drillReason: (r) => `Sabab: ${r}`,
    drillModule: (crs, mod) => `Modul: ${crs} · ${mod}`,
    drillLesson: (les, crs, mod) => `Dars: ${les}  —  ${crs} · ${mod}`,
    drillCurator: (c) => `Kurator: ${c}`,
    drillRgroup: (g) => `Mentor sababi: ${g}`,
    drillNote: (label, st, sum, tot, pct) =>
      `Davr: <b>${label}</b>. <b>${FI(st)}</b> o'quvchi &middot; <b>${FI(sum)}</b> rad etish (umumiy ${FI(tot)} dan ${pct}%). Ro'yxat rad etish soni bo'yicha tartiblangan.`,
    drillHint: `<b>&laquo;Qaysi kursdan&raquo;</b> ustunidagi sonlar qo'shilib <b>jami rad etish</b> ni beradi &mdash; masalan English 69 + Dasturlash kursi 41 + Grafik dizayn 19 = 129.
       <b>Ismga bosing</b> &mdash; qaysi <b>oyda</b>, qaysi <b>darsda</b> va qaysi <b>sababdan</b> rad etilgani ochiladi.`,
    monthAug: "Avgust", monthSep: "Sentyabr",
    detRej: (n) => `<b>${FI(n)}</b> rad etish`,
    detTasks: (n) => `<b>${FI(n)}</b> xil vazifada`,
    detAvg: (pct) => `1 vazifaga o'rtacha <b>${pct}</b>`,
    detTotNote: "Ikki oyda bir xil vazifa bo'lishi mumkin, shu sababli &laquo;xil vazifa&raquo; qo'shilmaydi &mdash; oy bo'yicha alohida turadi.",
    detStuck: "Ba'zi vazifalarni ko'p marta qayta yuborgan: yordam kerak bo'lgan joy shu.",
    detOk: "Ko'p vazifada bir-ikki martadan &mdash; jiddiy tiqilish yo'q.",
    detWhichLesson: "Qaysi darsda",
    detWhichReason: "Qaysi sababdan",

    /* ---- kurator yorliqlari ---- */
    curatorNone: "Kurator biriktirilmagan",
    curatorTest: "MK super teacher (test hisobi)"
  },

  ru: {
    /* ---- общее ---- */
    lang: "Язык",
    h1: "ОТКЛОНЁННЫЕ <b>ПРАКТИЧЕСКИЕ ЗАДАНИЯ</b>",
    docTitle: (sp) => `Отклонённые практические задания — ${sp}`,
    shortAug: "август", shortSep: "сентябрь", shortBoth: "август и сентябрь",
    innAug: "в августе", innSep: "в сентябре", innBoth: "в августе и сентябре",
    perAug: "1–31 августа 2026",
    perSep: "1&ndash;3 сентября 2026",
    perBoth: "1 августа &ndash; 3 сентября 2026",
    perDaysAug: "31 день",
    perDaysSep: "1 и 2 сентября полностью + 3 сентября до 12:00, то есть 2,5 дня",
    perDaysBoth: "31 день августа + 2,5 дня сентября",
    dayNames: ["1 сентября", "2 сентября", "3 сентября"],
    chipCount: (n) => NPL(n, W.rej),
    periodWord: "Период",
    btnAug: "Август", btnSep: "Сентябрь", btnBoth: "Август + сентябрь",
    periodNoteClosed: "Август закрыт &mdash; цифры окончательные.",
    periodNoteSep: (tm) => `Сентябрь ещё не закончился: 1 сентября полностью + 2 сентября до ${tm}.`,
    periodNoteBoth: (c) => `Внутри есть незакрытый сентябрь (срез ${c}).`,
    periodLine: (label, closed, cut) =>
      `Период: <b>${label}</b>${closed ? " &mdash; закрыт, цифры окончательные" : ` &mdash; ещё пополняется (срез ${cut})`}`,

    methodLead: (inn, n) =>
      `${CAP(inn)} отклонено <b>${FI(n)}</b> ${PL(n, W.task)} (по ученикам, у которых есть группа). ` +
      `Этот сайт раскладывает именно это число: <b>почему</b> отклонили, <b>у какого куратора</b> и <b>из какого модуля</b> чаще.`,
    methodSummary: "Одно важное примечание",
    methodMore: (n) =>
      `<b>${FI(n)}</b> &mdash; это число <b>случаев отклонения</b>, а не число заданий. Если один ученик отправил одно задание три раза и все три раза его отклонили, он посчитан три раза. ` +
      `Игровых заданий Blockly здесь нет вообще: их система принимает автоматически и никогда не отклоняет.`,
    exclNote: (ng, ngr, ts, tsr, raw, n) =>
      `Исключено из сайта: <b>${FI(ng)}</b> ${PL(ng, W.stud)} без группы (<b>${FI(ngr)}</b> ${PL(ngr, W.rej)}) ` +
      `и <b>${FI(ts)}</b> тестовый ${PL(ts, W.acc)} платформы (<b>${FI(tsr)}</b> ${PL(tsr, W.rej)}). ` +
      `Сырой итог в базе &mdash; ${FI(raw)}; а <b>${FI(n)}</b> здесь &mdash; только по реальным ученикам с группой.`,
    footNote: (label, cut) =>
      `Источник: база Junior LMS / CRM. Период: ${label} (по дате отправки задания). ` +
      `Все цифры взяты из реальных строк базы &mdash; ничего не оценено приблизительно. ` +
      `Август закрыт: непроверенных заданий не осталось, цифры окончательные. Срез сентября: ${cut}.`,
    nav: ["1 · Общее число", "2 · Почему отклонили", "3 · Куратор", "4 · Модуль и урок", "5 · Методика"],

    /* ---- заголовки таблиц ---- */
    thRej: "Отклонений", thPct: "Процент", thStud: "Учеников", thStudName: "Ученик", thNote: "Пояснение",
    thRejStud: "Учеников с отклонением", thPerStud: "В среднем на ученика", thPerStudShort: "На ученика",
    thTotal: "ИТОГО",
    thCmpAug: "Было в августе", thCmpDiff: "Разница, п.п.",
    thWho: "Кто проверил и отклонил",
    thReason: "Причина отклонения",
    thCurator: "Куратор", thModule: "Модуль", thLesson: "Урок",
    thInModule: "Внутри модуля",
    thGroup: "Группа", thTotalRej: "Всего отклонений", thFromCourse: "Из какого курса",
    noGroup: "без группы", noName: "урок без названия", wasNone: "не было",

    /* ---- каналы ---- */
    chH: "Ментор (человек)", chHNote: "Сотрудник смотрит и отклоняет с комментарием",
    chA: "Проверка ИИ",
    chV: "Автопроверка речи (English)", chVNote: "Голосовой ответ проверяет система",
    aiNoteAug: "ИИ проверяет задания по коду &mdash; в августе начиная с 3-го числа",
    aiNoteSep: "ИИ проверяет задания по коду &mdash; в сентябре с первого дня непрерывно",
    aiNoteBoth: "ИИ проверяет задания по коду &mdash; непрерывно с 3 августа",

    /* ---- раздел 1 ---- */
    s1eyebrow: "1 · Общее число",
    s1h2: (inn) => `Сколько заданий отклонено ${inn}`,
    s1big: (studBtn, mods, tot) =>
      `${PL(tot, W.task)} <b>отклонено</b>.<br>
       Это число <b>случаев отклонения</b>: если одно задание отклонили три раза, это считается за три.<br>
       Произошло у ${studBtn}, число модулей &mdash; ${FI(mods)}.`,
    s1studSuffix: (n) => NPL(n, W.stud),
    perDayLabel: "в среднем за день",
    perDayAugLabel: "в среднем за день в августе",
    perDayAugHint: (n) => `Для сравнения: ${FI(n)} &divide; 31 день`,
    sepDaysTitle: "Дни сентября",
    dayUnfinished: "(до 12:00, день не закончен)",
    s1sub: "Кто поставил отклонение",
    s1auto: (pct) =>
      `${pct}% отклонений поставил <b>не человек, а система</b>: задания по коду проверяет ИИ, голосовые упражнения курса English &mdash; автопроверка речи.
       Это разделение показано только здесь. Игровые задания Blockly не входят вообще &mdash; их система принимает автоматически и никогда не отклоняет.`,
    s1aiSep: "<b>В сентябре ИИ работал с первого дня</b> &mdash; непрерывно с 1 сентября 00:01. То есть в сентябре все три столбца покрывают весь период.",
    s1aiAug: `<b>ИИ работал не весь август.</b> Самая первая проверка ИИ в базе &mdash; 30 июля 11:35. Она остановилась 31 июля в 08:57,
       <b>1 и 2 августа не работала вообще</b>, и снова включилась 3 августа в 15:30 &mdash; после этого работала непрерывно.
       Поэтому число в столбце ИИ относится не к 31, а к <b>29 дням</b> августа. <b>Это не пробел в данных</b> &mdash; в те два дня ИИ просто не работал,
       задания по коду проверяли менторы, поэтому итог за 1 и 2 августа тоже полный: проверок ментора 1 августа было 1 335, 2 августа &mdash; 1 275
       &mdash; самые высокие дни месяца; после включения ИИ они упали до 350&ndash;500 в день.`,
    s1click: "<b>Нажмите на любое число</b> &mdash; откроется список учеников, стоящих за этим числом.",

    /* ---- раздел 2 ---- */
    s2eyebrow: "2 · Причина",
    s2h2: "Почему отклонили",
    s2note: "К каждому отклонению написан комментарий. Комментарии &mdash; свободный текст, поэтому они разложены по ключевым словам (правила в последнем разделе).",
    s2noteCmp: " Последние два столбца <b>сравнивают с августом</b>: доля какой причины выросла, а какой упала.",
    s2cmpStrip: "<b>Разница &mdash; в процентных пунктах.</b> Например, причина была 5,4% в августе и стала 7,4% в сентябре &mdash; разница +2,0 п.п. Это изменение доли, а не числа: сентябрь идёт всего 2,5 дня, поэтому не сравнивайте валовые числа с августом &mdash; сравнивайте доли.",
    mentorQuote: "Пример комментария ментора (перевод с узбекского):",
    s2sub: "По каким причинам отклоняет сотрудник (ментор)",
    rgroupTail: (tot, pct, studBtn) => ` ${pct}% от общих ${FI(tot)}, ${studBtn}.`,
    rgroupStud: (n) => NPL(n, W.stud),
    rgroupWasAug: (pct) => ` В августе было ${pct}%.`,

    /* ---- раздел 3 ---- */
    s3eyebrow: "3 · Куратор",
    s3h2: "У учеников какого куратора отклонений больше",
    s3note: (rows) => `У нас <b>7 кураторов</b>. Куратор = куратор группы по активной подписке ученика; у каждого ученика один куратор. Ученики без группы и тестовый аккаунт исключены из сайта, поэтому в таблице ровно ${NPL(rows, W.row)}.`,
    s3strip: "<b>Самый важный столбец &mdash; &laquo;в среднем на ученика&raquo;.</b> Валовое число вводит в заблуждение: у куратора с большим числом учеников отклонений естественно больше.",
    s3unranked: "нет активной подписки &mdash; заморожены, завершили или тестовые аккаунты",
    s3tail: (tot, rows) => `Таблица покрывает все ${FI(tot)} ${PL(tot, W.rej)} целиком &mdash; ${NPL(rows, W.cur)}, других строк нет.`,

    /* ---- раздел 4 ---- */
    s4eyebrow: "4 · Модуль и урок",
    s4h2: "Из какого модуля и какого урока больше",
    s4note: (inn, mods, les) => `Все ${NPL(mods, W.mod)} и ${NPL(les, W.les)}, где ${inn} были отклонения.`,
    s4strip: `<b>Нажмите на название модуля</b> &mdash; например на <b>CSS</b> &mdash; и раскроется, <b>в каком именно уроке</b> этого модуля были отклонения.
       Чтобы починить проблему, нужно именно это: не модуль, а конкретный урок.`,
    s4topLesson: (name, crs, mod, n) => ` Урок с самым большим числом отклонений: <b>${name}</b> (${crs} &middot; ${mod}) &mdash; ${FI(n)} раз.`,
    modOrder: (n) => `${n}-й модуль`,
    modSeeLessons: "посмотреть уроки",
    lessonOrder: (n) => `порядок урока ${n}`,
    lessonId: (n) => `id урока ${n}`,
    lessonLead: (crs, mod, cnt, sum) =>
      `В модуле <b>${crs} &middot; ${mod}</b> отклонения были в <b>${FI(cnt)}</b> ${PL(cnt, W.lesIn)}.
       Числа ниже в сумме дают <b>${FI(sum)}</b> &mdash; ровно столько же, сколько в строке модуля.
       <br>Число каждого урока тоже нажимается &mdash; откроется список учеников, у которых отклонили именно этот урок.`,
    s4tail: (n) => `Сумма по столбцу &laquo;учеников с отклонением&raquo; больше, чем ${FI(n)} &mdash; один ученик мог получить отклонение в нескольких модулях, поэтому он считается по одному разу в каждом. По урокам точно так же.`,

    /* ---- раздел 5 ---- */
    s5eyebrow: "5 · Методика",
    s5h2: "Откуда взяты цифры",
    rules: (V) => [
      ["Отклонение", `Строки таблицы <code>student_question_practice</code> со <code>status = 'rejected'</code>. Период &mdash; <code>created_at</code> ${V.label}.`],
      ["Единица счёта", `Одна строка = один случай отклонения. Если одно задание отклонили три раза &mdash; это три строки. Поэтому ${FI(V.T)} &mdash; это не число заданий.`],
      ["Процент", `Каждый процент на сайте взят от одного знаменателя: ${FI(V.T)} ${PL(V.T, W.rej)} за выбранный период. Другого знаменателя нет.`],
      ["Фильтр периода", "Фильтр сверху показывает август, сентябрь или оба сразу. При нажатии все цифры пересчитываются с нуля &mdash; ни одно число прошлого периода нигде не остаётся. Когда выбраны оба месяца, один и тот же ученик считается один раз, а его числа складываются."],
      ["Каждое число нажимается", `Все числа на странице считаются из одного списка &mdash; из ${FI(V.ST)} строк учеников. При нажатии выходят ровно те ученики, что стоят за этим числом, поэтому таблица и список всегда совпадают.`],
      ["С какого момента работает ИИ", "Первая проверка ИИ &mdash; 30 июля 11:35. 1&ndash;2 августа не работала, с 3 августа 15:30 непрерывно &mdash; в сентябре тоже с первого дня. То есть число ИИ относится к 29 дням августа и ко всем дням сентября. Общий итог полон каждый день: в дни без ИИ проверяли менторы."],
      ["Кто не входит", `Без группы &mdash; без активной подписки, заморожены или завершили &mdash; ${NPL(V.exNg, W.stud)} (${FI(V.exNgR)} ${PL(V.exNgR, W.rej)}) и ${FI(V.exTs)} тестовый ${PL(V.exTs, W.acc)} (${FI(V.exTsR)} ${PL(V.exTsR, W.rej)}). Множества &laquo;без группы&raquo; и &laquo;без куратора&raquo; полностью совпадают, поэтому в таблице кураторов осталось только 7 кураторов.`],
      ["Blockly не входит", "<code>teacher_id = 1</code>, комментарий <code>blockly-game</code> &mdash; игровые задания система принимает автоматически и никогда не отклоняет."],
      ["Категория причины", "Комментарий &mdash; свободный текст (1 597 разных текстов в комментариях менторов). Категоризация по ключевым словам в порядке приоритета; один комментарий попадает только в одну категорию."],
      ["Группа и куратор &mdash; текущее состояние", "Группа и куратор ученика берутся по его <b>активной подписке на сегодня</b>, а не по состоянию на август. Поэтому если замороженного ученика снова активировали, его августовские отклонения уходят из &laquo;без группы&raquo; в столбец куратора &mdash; то есть цифры прошлого месяца тоже могут немного сдвинуться. Именно так и случилось: 3 сентября подписку одного ученика автоматически возобновили, и его 9 отклонений добавились в столбец Мадины Норматовой. Состояние групп и кураторов последний раз сверено с базой в эту дату."],
      ["Язык", "Сайт на двух языках: цифры и расчёты одинаковые, меняется только текст. Названия из базы &mdash; имена учеников, названия групп, кураторов, курсов, модулей и уроков &mdash; не переводятся, потому что это реальные записи платформы. Примеры комментариев менторов даны в переводе с узбекского, и в таблице это подписано."]
    ],
    s5closed: (snap, recheck) =>
      `<b>Август закрыт &mdash; его цифры окончательные.</b> Данные за август взяты ${snap} и сверены с базой заново ${recheck}:
       в августе не осталось ни одного непроверенного (<code>uploaded</code>) задания, общее число отклонений не изменилось и равно <b>24 671</b>. То есть цифры полностью покрывают 1&ndash;31 августа и больше не изменятся. 31 августа тоже внутри: в тот день 784 отклонения.`,
    s5open: (cut) =>
      `<b>Сентябрь ещё не закрыт</b> &mdash; срез прибит к точному времени: <b>${cut}</b>. При следующем обновлении цифры сентября вырастут по <b>двум причинам</b>.
       <b>Первая:</b> добавятся новые дни. <b>Вторая:</b> задания, отправленные до среза, но на тот момент ещё не проверенные, отклоняют позже &mdash; то есть число за прошедшие дни может вырасти даже при том же срезе.
       Именно это и произошло: на срезе 2 сентября 18:50 было 829 отклонений, потом число в том же окне стало 838.
       Поэтому не сравнивайте сентябрь с августом <b>по валовому числу</b> &mdash; сравнивайте по среднему за день или по доле в процентах.`,
    s5both: " Сейчас выбраны оба месяца: сырой итог <b>25 891</b> (август 24 671 + сентябрь 1 220).",
    s5tables: "<b>Таблицы-источники:</b>",

    /* ---- список ---- */
    drillEyebrow: "Список",
    drillClose: "закрыть &#10005;",
    drillAll: (per) => `${per} — все отклонённые задания`,
    drillCh: (ch) => `Задания, отклонённые: ${ch}`,
    drillReason: (r) => `Причина: ${r}`,
    drillModule: (crs, mod) => `Модуль: ${crs} · ${mod}`,
    drillLesson: (les, crs, mod) => `Урок: ${les}  —  ${crs} · ${mod}`,
    drillCurator: (c) => `Куратор: ${c}`,
    drillRgroup: (g) => `Причина ментора: ${g}`,
    drillNote: (label, st, sum, tot, pct) =>
      `Период: <b>${label}</b>. <b>${FI(st)}</b> ${PL(st, W.stud)} &middot; <b>${FI(sum)}</b> ${PL(sum, W.rej)} (${pct}% от общих ${FI(tot)}). Список отсортирован по числу отклонений.`,
    drillHint: `Числа в столбце <b>&laquo;из какого курса&raquo;</b> в сумме дают <b>всего отклонений</b> &mdash; например English 69 + Dasturlash kursi 41 + Grafik dizayn 19 = 129.
       <b>Нажмите на имя</b> &mdash; раскроется, в каком <b>месяце</b>, в каком <b>уроке</b> и по какой <b>причине</b> отклонили.`,
    monthAug: "Август", monthSep: "Сентябрь",
    detRej: (n) => `<b>${FI(n)}</b> ${PL(n, W.rej)}`,
    detTasks: (n) => `в <b>${FI(n)}</b> ${PL(n, W.taskIn)}`,
    detAvg: (pct) => `в среднем <b>${pct}</b> на задание`,
    detTotNote: "В двух месяцах могло быть одно и то же задание, поэтому &laquo;разные задания&raquo; не складываются &mdash; они стоят отдельно по месяцам.",
    detStuck: "Некоторые задания отправлял много раз: вот где нужна помощь.",
    detOk: "По большинству заданий один-два раза &mdash; серьёзного застоя нет.",
    detWhichLesson: "В каком уроке",
    detWhichReason: "По какой причине",

    /* ---- метки кураторов ---- */
    curatorNone: "Куратор не назначен",
    curatorTest: "MK super teacher (тестовый аккаунт)"
  }
};

/* ---------------------------------------------------------------------------
   Rad etish sabablari rus tilida — toifa nomi va mentor izohidan misol.
   Kalitlar students.js dagi REASON_MAP kodlari bilan bir xil.
   Причины отклонения по-русски — название категории и пример комментария
   ментора. Примеры даны в переводе с узбекского; в таблице так и подписано.
   ------------------------------------------------------------------------- */
const REASONS_RU = {
  G: ["Кода и результата не видно на скриншоте", "«Пришлите полный скриншот со всем кодом и открытыми файлами. Проект должен быть запущен — результат и терминал тоже должны быть видны»"],
  H: ["Задание выполнено не полностью", "«Вы выполнили задание не полностью. Внимательно перечитайте условия и попробуйте выполнить заново»"],
  C: ["Прислан другой / не тот материал", "«Вместо заданного задания вы прислали другой материал / картинку»"],
  Z: ["Другое — единичный личный комментарий", "«где терминал?», «сделайте как в условии», «создайте креативный пост»"],
  L: ["Задание не выполнено / не загружено", "«Задание не выполнено!», «Выполните это задание», «Загрузите задание»"],
  A: ["Сделано не самостоятельно / с помощью ИИ", "«Вы выполнили задание с помощью искусственного интеллекта (ИИ). Сделайте задание самостоятельно и пришлите заново»"],
  F: ["Ошибка в коде / неверный тег", "«Вы написали код с ошибками — почистите код и напишите заново», «Вы использовали тег img в неверном порядке»"],
  B: ["Пустое или невидимое задание", "«Вы отправили пустое задание. Если это повторится, у вас могут списать коины»"],
  K: ["Выполнено не по условию", "«Пришлите ту работу, которая требуется в условии практической!», «Сделайте так, как указано в условии»"],
  I: ["Не прислана ссылка / URL", "«Сюда нужно прислать url/ссылку на задание», «Пришлите ссылку на Figma»"],
  J: ["Нарушено требование к формату", "«Подготовьте видео», «Домашнюю работу сделайте в тетради», «Загрузите в виде презентации»"],
  M: ["Без комментария или комментарий непонятен", "«?», «hop», «1234» — комментарии короче 6 символов"],
  D: ["Повторная отправка той же работы без исправлений", "«За то, что вы повторно отправляете одно и то же задание, не исправив его, у вас списываются коины»"],
  N: ["Просят обратиться к куратору / ментору", "«Обратитесь к куратору, вам поставят разговорный урок с ментором»"],
  E: ["Выполнено на телефоне", "«Начиная с модуля React задания, выполненные на телефоне, не принимаются»"],
  7: ["Не использован нужный тег (задание по коду)", ""],
  3: ["Ошибка структуры HTML: <html> / <head> / <body> (задание по коду)", ""],
  2: ["CSS не подключён или <style> не на месте (задание по коду)", ""],
  5: ["Не выполнены требования JavaScript: переменная, console.log, условный оператор (задание по коду)", ""],
  4: ["Bootstrap подключён неверно (задание по коду)", ""],
  8: ["Не выполнено требование по элементу или class (задание по коду)", ""],
  1: ["Код пустой или задание не выполнено вовсе (задание по коду)", ""],
  6: ["Нет нужного количества элементов, например «минимум 3 div» (задание по коду)", ""],
  9: ["Другая ошибка в коде (задание по коду)", ""],
  0: ["Другое — комментарий ИИ без категории", ""],
  v: ["Речь не распознана вообще — микрофон или качество записи (English, голосовое упражнение)", ""],
  w: ["Часть слов произнесена неверно или не произнесена (English, голосовое упражнение)", ""]
};

// Mentor sabablarining uch guruhi / Три группы причин ментора
const RGROUPS_RU = [
  ["Неверный формат сдачи",
   "На скриншоте не видно кода или результата, прислан не тот файл, прислано пустым, нет ссылки, нарушен формат. Отклонено не потому, что ученик не знает, а потому, что сдал неправильно."],
  ["Ошибка в самой практической",
   "Выполнено не полностью, ошибка в коде, не по условию, не выполнено вовсе, написано с помощью ИИ, сделано на телефоне."],
  ["Из комментария причина непонятна",
   "Личные комментарии, встречающиеся один-два раза, оставленные без комментария и те, где просят обратиться к куратору."]
];
