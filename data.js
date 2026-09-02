// ============================================================================
// AMALIY VAZIFA — RAD ETILISH TAHLILI · ma'lumot qatlami
// Manba: Junior LMS / CRM bazasi (MCP, faqat SELECT). Hech narsa taxmin
// qilinmagan — har bir son quyidagi jadvallardan o'qib olingan:
//   student_question_practice  (o'quvchi topshirgan amaliy ish + tekshiruv)
//   student_questions -> student_lessons -> student_modules -> student_courses
//   student_students -> subscribe_list -> group_list.ADMIN_ID  (kurator)
//   gl_sys_users / gl_sys_roles  (tekshiruvchi va kurator ismi, roli)
//
// DAVR: 1-31 avgust 2026 — barcha son faqat shu oyga tegishli (created_at bo'yicha).
// Bu faylda sentyabr yoki boshqa oy ma'lumoti YO'Q.
// Bazadan o'qilgan payt: 2026-09-02, 15:00 (Toshkent). Baza jonli: 'uploaded'
// holatidagi (hali tekshirilmagan) topshiriqlar keyin qabul yoki rad ga o'tadi,
// shu sababli 30-31 avgust sonlari keyingi o'qishda bir necha birlik o'sishi mumkin.
// ============================================================================

const PR_META = {
  from: "2026-08-01",
  to: "2026-08-31",
  snapshot: "2026-09-02 15:00"   // ma'lumot bazadan shu paytda o'qildi
};

// Tekshiruv kanallari (pipeline) — bazadagi ustunlar bilan aniq bog'lanishi:
//  human = teacher_id > 1  (yoki review_source='teacher')  -> tirik odam tekshirgan
//  ai    = teacher_id = 0 AND review_source='ai'           -> AI tekshiruvi (3-avgustdan)
//  voice = teacher_id = 0 AND review_source IS NULL        -> ovozli javob avtotekshiruvi (English)
//  auto  = teacher_id = 1                                  -> blockly-game avto-qabul (rad etmaydi)

// Kunlik: [sana, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad, auto_jami]

// Oylik kontekst (iyun–iyul) — AI tekshiruvi 3-avgustda ishga tushgan, shu sababli
// iyun-iyulda 'ai' kanali deyarli yo'q. [oy, kanal, jami, rad]

// Kurslar: [kurs, oy, jami, rad, o'quvchi, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]
// Avgustda yuqoridagilardan tashqari 13 qator test kurslarida ("2 Test Course",
// "JSX Lessons", "Web dasturlash") — jadvalga kiritilmagan, jami 57 617 dan 13 tasi.

// Modullar (AVGUST): [kurs, modul, tartib, jami, rad, o'quvchi, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]
const PR_MODULES_AUG = [
["Dasturlash kursi", "HTML", 5, 2519, 520],
["Dasturlash kursi", "CSS", 10, 4988, 619],
["Dasturlash kursi", "Bootstrap", 15, 1676, 232],
["Dasturlash kursi", "Tilda", 20, 194, 195],
["Dasturlash kursi", "Git", 25, 166, 137],
["Dasturlash kursi", "Javascript", 30, 2233, 262],
["Dasturlash kursi", "React", 35, 1481, 242],
["Dasturlash kursi", "Python", 40, 91, 86],
["English", "Beginner", 1, 3070, 389],
["English", "Elementary", 2, 2464, 335],
["English", "Pre-Intermediate", 3, 1198, 271],
["English", "Intermediate", 4, 496, 223],
["Grafik dizayn", "Canva", 1, 182, 94],
["Grafik dizayn", "Figma", 2, 322, 72],
["Grafik dizayn", "Magica Voxel", 3, 20, 31],
["Grafik dizayn", "Photoshop", 5, 72, 29],
["Grafik dizayn", "Illustrator", 6, 33, 22],
["Grafik dizayn", "Blender", 7, 100, 37],
["Junior Kurs", "HTML", 10, 293, 69],
["Kompyuter Savodxonligi", "Kompyuter savodxonligi", 1, 95, 229],
["Suniy Intellekt", "AI", 1, 72, 237],
["Telegram Bot", "Telegram Bot", 1, 23, 62],
["Веб программирование", "HTML", 1, 687, 98],
["Веб программирование", "CSS", 2, 1104, 158],
["Веб программирование", "Bootstrap", 4, 564, 54],
["Веб программирование", "WiX", 5, 7, 20],
["Веб программирование", "Scratch", 6, 15, 20],
["Веб программирование", "Javascript", 7, 316, 47],
["Веб программирование", "React", 8, 181, 27]
];

// Modullar (SENTYABR 1–2, kam namuna): [kurs, modul, jami, rad, o'quvchi]



// Umumiy takroriylik taqsimoti (AVGUST, blockly avto-qabul chiqarilgan).
// Birlik = o'quvchi × vazifa zanjiri. Jami 33 624 zanjir, 24 671 rad etish.

// ---------------------------------------------------------------------------
// KURATORLAR
// Kurator = o'quvchi FAOL obunasidagi guruhning group_list.ADMIN_ID xodimi.
// Har bir o'quvchida faol obunalar bo'yicha aynan BITTA kurator chiqadi
// (tekshirildi: 2 056 o'quvchidan hech birida ikkinchi kurator yo'q).
// Faol obunasi yo'q (muzlatilgan / tugatgan) o'quvchilar alohida qatorda.
// ---------------------------------------------------------------------------
// [kurator, oy, jami, rad, o'quvchi, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]
const PR_CURATORS = [
["Fotimabonu Abdulkhakova", 3760, 283],
["Shaxlo Ziyodova", 4462, 207],
["Madina Normatova", 3340, 272],
["Jasmina Tolibova", 2793, 291],
["Marjona Pardayeva", 3057, 333],
["Dilafruz Shokirova", 2369, 239],
["Xalima Ismoiljonova", 2043, 219],
["Kurator biriktirilmagan", 2847, 574]
];



// ---------------------------------------------------------------------------
// RAD ETISH SABABLARI
// Mentor har bir rad etishda `reason` maydoniga izoh yozadi. Bu izohlar
// shablonlashgan, lekin erkin matn: avgustda 4 816 rad etishda 1 597 xil matn.
// Shu sababli toifalash KALIT SO'Z qoidalari bilan qilingan (prioritetli tartib:
// bir izoh birinchi mos kelgan toifaga tushadi). Qoidalar ochiq — pastda.
// Avgustda izohlarning 91.3% i toifaga tushdi, 8.7% i "boshqa" (bir martalik
// shaxsiy izohlar) bo'lib qoldi.
// ---------------------------------------------------------------------------
// [kod, sabab, avgust, sentyabr, kalit so'z misoli]
const PR_REASONS_HUMAN = [
["G", "Skrinshotda kod va natija ko'rinmayapti", 1176, "«Barcha kodlarni ochilgan fayllar bilan birga to'liq skrinshot qilib yuboring. Loyiha run qilingan holatda natija va terminal ham ko'rinishi kerak»"],
["H", "Vazifa to'liq bajarilmagan", 732, "«Siz vazifani to'liq bajarmagansiz. Topshiriq shartlarini diqqat bilan o'rganib chiqib, qayta bajarishga harakat qiling»"],
["C", "Boshqa / noto'g'ri material yuborilgan", 563, "«Siz berilgan vazifa o'rniga boshqa material/rasm yuborgansiz»"],
["Z", "Boshqa — bir martalik shaxsiy izoh", 420, "Har biri 1–2 marta uchraydigan qisqa izohlar: «terminal qani?», «shartdagidek qiling», «kreativ post yarating»"],
["L", "Vazifa bajarilmagan / yuklanmagan", 382, "«Vazifa bajarilmagan!», «Shu vazifani bajaring», «Vazifani yuklang»"],
["A", "O'zi bajarmagan / AI bilan yozgan", 371, "«Siz topshiriqni sun'iy intellekt (AI) yordamida bajargansiz. Vazifani mustaqil ravishda ishlab, qayta yuboring»"],
["F", "Kodda xato / noto'g'ri teg", 361, "«Siz kodlarni xato yozgansiz — kodlarni tozalab boshqatdan yozib chiqing», «img tegidan noto'g'ri tartibda foydalangansiz»"],
["B", "Bo'sh yoki ko'rinmaydigan vazifa", 195, "«Siz bo'sh vazifani yuborgansiz. Agar bu holat yana takrorlansa, sizdan coin yechib olinishi mumkin»"],
["K", "Shart bo'yicha bajarilmagan", 176, "«Amaliy ish shartida so'ralgan ishni yuboring!», «Shartda ko'rsatilganidek qiling»"],
["I", "Havola / URL yuborilmagan", 170, "«Bu yerga vazifaning url/havolasini tashlashingiz kerak», «Figma ssilkasini yuboring»"],
["J", "Format talabi buzilgan", 78, "«Video tayyorlang», «Uy ishini daftarga yozib qiling», «Prezentatsiya qilib yuklang», «Blender dasturida bajaring»"],
["M", "Izohsiz yoki tushunarsiz izoh", 57, "«?», «hop», «1234» — 6 belgidan qisqa izohlar"],
["D", "Bir xil ishni tuzatmasdan takroran yuborish", 53, "«Siz bir xil bo'lgan vazifani to'g'rilamasdan qayta-qayta yuborganligingiz uchun sizdan coinlar ayriladi»"],
["N", "Kuratorga / mentorga murojaat qilish so'ralgan", 47, "«Kuratorga murojaat qiling, sizga mentor bilan suhbat darsi qo'yib berishadi»"],
["E", "Telefonda bajarilgan", 34, "«React modulidan boshlab telefonda bajarilgan topshiriqlar qabul qilinmaydi»"]
];

// Kurator × sabab (AVGUST, faqat mentor rad etishlari): [kurator, {kod: soni}]

// AI tekshiruvining rad etish sabablari. AI izohi har topshiriq uchun alohida
// yoziladi (uzun, takrorlanmaydigan matn), shu sababli bu ham kalit so'z bilan
// toifalangan. Avgustda 12 852 rad etishning 98.6% i toifaga tushdi.
// [kod, sabab, avgust, sentyabr]
const PR_REASONS_AI = [
["A7", "Kerakli teg ishlatilmagan (kod vazifasi)", 2665],
["A3", "HTML struktura xatosi: <html> / <head> / <body> (kod vazifasi)", 2217],
["A2", "CSS ulanmagan yoki <style> noto'g'ri joyda (kod vazifasi)", 2077],
["A5", "JavaScript talablari bajarilmagan: o'zgaruvchi, console.log, shart operatori (kod vazifasi)", 1583],
["A4", "Bootstrap noto'g'ri ulangan (kod vazifasi)", 1451],
["A8", "Element yoki class talabi bajarilmagan (kod vazifasi)", 1004],
["A1", "Kod bo'sh yoki vazifa umuman bajarilmagan (kod vazifasi)", 891],
["A6", "Talab qilingan miqdorda element yo'q, masalan «kamida 3 ta div» (kod vazifasi)", 637],
["A9", "Kodda boshqa xato (kod vazifasi)", 142],
["AZ", "Boshqa — toifaga tushmagan AI izohi", 185]
];

// Ovozli javob avtotekshiruvi (English) — ikki sabab: yozuv sifati va talaffuz.
const PR_REASONS_VOICE = [
["V1", "Ovoz umuman aniqlanmadi \u2014 mikrofon yoki yozuv sifati (English, ovozli mashq)", 307],
["V2", "So'zlarning bir qismi noto'g'ri aytilgan yoki aytilmagan (English, ovozli mashq)", 6697]
];

// Tekshiruvchilar (odam): [ism, rol, oy, jami, rad, o'quvchi]

// Toifalash qoidalari — sayt ustida ochiq ko'rsatiladi

// ---------------------------------------------------------------------------
// AVGUSTDA RAD ETILGAN VAZIFALAR — umumiy son va uning bo'linishi.
// Davr: 1–31 avgust 2026. Blockly avto-qabul kirmaydi (u hech qachon rad etmaydi).
// ---------------------------------------------------------------------------
const PR_REJ = {
  total: 24671,
  students: 2052,   // rad etish bo'lgan turli o'quvchi
  lessons: 503,     // rad etish bo'lgan turli dars
  modules: 31,      // rad etish bo'lgan turli modul
  byChannel: [
    ["Ovoz avtotekshiruvi (English)", 7004, "Ovozli javobni tizim tekshiradi"],
    ["AI tekshiruvi", 12852, "Kod vazifalarini AI tekshiradi (3-avgustdan)"],
    ["Mentor (odam)", 4815, "Xodim ko'rib, izoh yozib rad etadi"]
  ]
};


// Bitta vazifa (o'quvchi × vazifa) necha marta rad etilgan — faqat rad etish bo'lganlar:
// [guruh, zanjir soni, rad etishlar]
const PR_PER_TASK = [
  ["1 marta", 4645, 4645],
  ["2 marta", 1815, 3630],
  ["3 marta", 1651, 4953],
  ["4–5 marta", 600, 2640],
  ["6–10 marta", 515, 3925],
  ["11+ marta", 242, 4878]
];
