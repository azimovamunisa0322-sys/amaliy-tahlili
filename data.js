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
["Dasturlash kursi", "HTML", 5, 2519, 520, 357, 2161, 1],
["Dasturlash kursi", "CSS", 10, 4988, 619, 492, 4496, 0],
["Dasturlash kursi", "Bootstrap", 15, 1676, 232, 129, 1547, 0],
["Dasturlash kursi", "Tilda", 20, 194, 195, 194, 0, 0],
["Dasturlash kursi", "Git", 25, 166, 137, 166, 0, 0],
["Dasturlash kursi", "Javascript", 30, 2233, 262, 170, 2062, 1],
["Dasturlash kursi", "React", 35, 1481, 242, 1480, 0, 1],
["Dasturlash kursi", "Python", 40, 91, 86, 91, 0, 0],
["English", "Beginner", 1, 3070, 389, 8, 0, 3062],
["English", "Elementary", 2, 2464, 335, 20, 0, 2444],
["English", "Pre-Intermediate", 3, 1198, 271, 25, 0, 1173],
["English", "Intermediate", 4, 496, 223, 180, 0, 316],
["Grafik dizayn", "Canva", 1, 182, 94, 182, 0, 0],
["Grafik dizayn", "Figma", 2, 322, 72, 322, 0, 0],
["Grafik dizayn", "Magica Voxel", 3, 20, 31, 20, 0, 0],
["Grafik dizayn", "Photoshop", 5, 72, 29, 72, 0, 0],
["Grafik dizayn", "Illustrator", 6, 33, 22, 33, 0, 0],
["Grafik dizayn", "Blender", 7, 100, 37, 100, 0, 0],
["Junior Kurs", "HTML", 10, 293, 69, 43, 250, 0],
["Kompyuter Savodxonligi", "Kompyuter savodxonligi", 1, 95, 229, 95, 0, 0],
["Suniy Intellekt", "AI", 1, 72, 237, 72, 0, 0],
["Telegram Bot", "Telegram Bot", 1, 23, 62, 23, 0, 0],
["Веб программирование", "HTML", 1, 687, 98, 29, 658, 0],
["Веб программирование", "CSS", 2, 1104, 158, 191, 913, 0],
["Веб программирование", "Bootstrap", 4, 564, 54, 25, 539, 0],
["Веб программирование", "WiX", 5, 7, 20, 7, 0, 0],
["Веб программирование", "Scratch", 6, 15, 20, 15, 0, 0],
["Веб программирование", "Javascript", 7, 316, 47, 90, 226, 0],
["Веб программирование", "React", 8, 181, 27, 181, 0, 0]
];

// Modullar (SENTYABR 1–2, kam namuna): [kurs, modul, jami, rad, o'quvchi]

// Darslar — avgustda kamida 60 ta tekshiruv VA kamida 70 ta rad etish bo'lgan
// barcha darslar — jami 101 dars. Ustunlar:
// [dars_id, kurs, modul, dars, turi,
//  avg_jami, avg_rad, avg_oquvchi, sen_jami, sen_rad,
//  human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]   (kanal ustunlari = AVGUST)
const PR_LESSONS = [
[543, "English", "Beginner", "Action words 2 practice", 1459, 159, 3, 0, 1456],
[595, "English", "Elementary", "Years practice", 1109, 155, 6, 0, 1103],
[601, "English", "Elementary", "Furniture practice", 549, 125, 1, 0, 548],
[542, "English", "Beginner", "Action words 1 practice", 443, 163, 2, 0, 441],
[535, "English", "Beginner", "What this this/that? practice", 429, 159, 0, 0, 429],
[572, "English", "Elementary", "Feelings practice", 427, 163, 2, 0, 425],
[1909, "Dasturlash kursi", "CSS", "CSS Demo day", 385, 146, 251, 134, 0],
[1771, "Dasturlash kursi", "HTML", "Amaliy ish. HTML nima va nega kerak?", 338, 332, 45, 293, 0],
[1650, "Dasturlash kursi", "HTML", "Amaliy ish. Attributlar va havola tegi", 287, 237, 27, 260, 0],
[1824, "Dasturlash kursi", "CSS", "Amaliy ish. Matnlar bilan ishlash - 2", 286, 183, 18, 268, 0],
[1816, "Dasturlash kursi", "CSS", "Amaliy ish. Internal stil berish uslubi", 247, 190, 4, 243, 0],
[1735, "Dasturlash kursi", "HTML", "Amaliy ish. Inline elementlar", 234, 209, 17, 217, 0],
[2015, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Bootstrapda form elementlari", 233, 119, 3, 230, 0],
[1822, "Dasturlash kursi", "CSS", "Amaliy ish. Matnlar bilan ishlash - 1", 225, 180, 10, 215, 0],
[1751, "Dasturlash kursi", "HTML", "HTML modul oxiri", 221, 169, 33, 188, 0],
[1753, "Dasturlash kursi", "HTML", "HTML. Demo day", 212, 173, 49, 163, 0],
[1648, "Dasturlash kursi", "HTML", "Amaliy ish. Paragraf tegi va Formatlash teglari", 210, 273, 7, 202, 1],
[539, "English", "Beginner", "Professions practice", 209, 167, 1, 0, 208],
[611, "English", "Pre-Intermediate", "Conditionals practice", 206, 122, 1, 0, 205],
[1878, "Dasturlash kursi", "CSS", "Amaliy ish. Transform va cursor xususiyatlari", 196, 144, 9, 187, 0],
[1740, "Dasturlash kursi", "HTML", "Amaliy ish. Form elementlari - 1", 193, 186, 10, 183, 0],
[1818, "Dasturlash kursi", "CSS", "Amaliy ish. Selectorlar", 178, 196, 6, 172, 0],
[606, "English", "Pre-Intermediate", "At the hospital practice", 175, 135, 2, 0, 173],
[2020, "Dasturlash kursi", "Bootstrap", "Bootstrap. Demo day", 174, 115, 100, 74, 0],
[1835, "Dasturlash kursi", "CSS", "Amaliy ish. Backgroundlar oilasi - 1", 174, 168, 2, 172, 0],
[2144, "Dasturlash kursi", "React", "Amaliy ish. Npm va kutubxonalar", 173, 76, 173, 0, 0],
[683, "English", "Pre-Intermediate", "Practice (homework)", 173, 117, 5, 0, 168],
[1820, "Dasturlash kursi", "CSS", "Amaliy ish. Ranglar bilan ishlash", 171, 190, 6, 165, 0],
[1829, "Dasturlash kursi", "CSS", "Mustahkamlash ishi - 1", 171, 172, 15, 156, 0],
[2213, "Dasturlash kursi", "React", "Demo day. React", 170, 74, 169, 0, 0],
[735, "English", "Pre-Intermediate", "Present Perfect 3 practice homework", 166, 112, 6, 0, 160],
[1854, "Dasturlash kursi", "CSS", "Mustahkamlash ishi - 3", 156, 155, 3, 153, 0],
[1646, "Dasturlash kursi", "HTML", "Amaliy ish. HTMLdagi muhim kodlar", 156, 278, 17, 139, 0],
[534, "English", "Beginner", "What is it? lesson practice", 154, 152, 0, 0, 154],
[1840, "Dasturlash kursi", "CSS", "Mustahkamlash ishi - 2", 152, 171, 10, 142, 0],
[578, "English", "Elementary", "Seasons and weather practice", 152, 154, 0, 0, 152],
[2396, "Веб программирование", "CSS", "CSS. Demo day", 151, 46, 104, 47, 0],
[1900, "Dasturlash kursi", "CSS", "Mustahkamlash amaliy ishi - 6", 150, 137, 8, 142, 0],
[2013, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Modal oyna va dropdown", 144, 131, 3, 141, 0],
[1993, "Dasturlash kursi", "CSS", "Amaliy ish. External uslub bilan stillash", 143, 143, 1, 142, 0],
[1879, "Dasturlash kursi", "CSS", "Mustahkamlash ishi - 5", 140, 144, 7, 133, 0],
[2058, "Dasturlash kursi", "Javascript", "Amaliy ish-1. Mantiqiy operatorlar", 135, 96, 2, 133, 0],
[613, "English", "Pre-Intermediate", "Irregular verbs practice", 135, 115, 0, 0, 135],
[2010, "Dasturlash kursi", "Bootstrap", "Mustahkamlash amaliy ishi - 1", 133, 144, 0, 133, 0],
[1881, "Dasturlash kursi", "CSS", "Amaliy ish. Position xususiyati", 133, 139, 5, 128, 0],
[580, "English", "Elementary", "Places in the city practice", 131, 164, 1, 0, 130],
[1742, "Dasturlash kursi", "HTML", "Amaliy ish. Form elementlari - 2", 130, 184, 1, 129, 0],
[1837, "Dasturlash kursi", "CSS", "Amaliy ish. Backgroundlar oilasi - 2", 129, 172, 11, 118, 0],
[2003, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Bootstrapga kirish", 128, 139, 1, 127, 0],
[682, "English", "Pre-Intermediate", "Would like practice", 125, 118, 2, 0, 123],
[1874, "Dasturlash kursi", "CSS", "Amaliy ish. Flex bilan navbar yasash 2-qism", 122, 142, 4, 118, 0],
[2148, "Dasturlash kursi", "React", "Mustahkamlash ishi - 1", 121, 64, 121, 0, 0],
[2170, "Веб программирование", "HTML", "Практика. Аттрибуты и медиатеги", 121, 48, 7, 114, 0],
[531, "English", "Beginner", "Basic conversation 1 practice", 119, 214, 1, 0, 118],
[1845, "Dasturlash kursi", "CSS", "Amaliy ish. Margin va padding xususiyati", 118, 177, 9, 109, 0],
[2146, "Dasturlash kursi", "React", "Amaliy ish. Export va Import", 117, 70, 117, 0, 0],
[1876, "Dasturlash kursi", "CSS", "Amaliy ish. Navbar + Header", 116, 141, 1, 115, 0],
[1849, "Dasturlash kursi", "CSS", "Amaliy ish. Box model 2-qism", 114, 158, 0, 114, 0],
[738, "English", "Intermediate", "Accessories practice", 113, 109, 3, 0, 110],
[2119, "Dasturlash kursi", "Javascript", "Masterclass. Login forma", 110, 75, 11, 99, 0],
[604, "English", "Pre-Intermediate", "Practice (story)", 108, 128, 4, 0, 104],
[533, "English", "Beginner", "Family members practice", 106, 161, 0, 0, 106],
[2589, "Dasturlash kursi", "HTML", "Amaliy ish. Attributlar va media tegi", 104, 225, 104, 0, 0],
[2009, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Bootstrapda matnlar bilan ishlash", 103, 146, 2, 101, 0],
[2133, "Dasturlash kursi", "Javascript", "Javascript. Demo day", 100, 78, 54, 46, 0],
[532, "English", "Beginner", "Basic conversation 2 practice", 100, 167, 0, 0, 100],
[2035, "Dasturlash kursi", "Bootstrap", "Mustahkamlash amaliy ishi - 2", 99, 138, 0, 99, 0],
[1853, "Dasturlash kursi", "CSS", "Amaliy ish. Display xususiyati 2-qism", 99, 149, 4, 95, 0],
[2054, "Dasturlash kursi", "Javascript", "Amaliy ish. Ma`lumot turlari 3-qism", 97, 93, 3, 94, 0],
[2116, "Dasturlash kursi", "Javascript", "Amaliy ish. QuerySelector bilan ishlash", 97, 83, 0, 97, 0],
[1814, "Dasturlash kursi", "CSS", "Amaliy ish. CSS va uning HTMLga ta'siri", 96, 182, 2, 94, 0],
[1870, "Dasturlash kursi", "CSS", "Mustahkamlash amaliy ishi - 4", 94, 148, 34, 60, 0],
[695, "English", "Intermediate", "Winter celebrations practice", 93, 115, 6, 0, 87],
[2077, "Dasturlash kursi", "Javascript", "Amaliy ish-2. Mantiqiy operatorlar", 88, 96, 1, 87, 0],
[2028, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Cardlar bilan ishlash", 86, 130, 1, 85, 0],
[2011, "Dasturlash kursi", "Bootstrap", "Navbar + Carousel", 86, 135, 1, 85, 0],
[1839, "Dasturlash kursi", "CSS", "Amaliy ish. Outline xususiyati", 86, 171, 5, 81, 0],
[2202, "Dasturlash kursi", "React", "Amaliy ish. CRUD fetch orqali", 86, 45, 86, 0, 0],
[2150, "Dasturlash kursi", "React", "Amaliy ish. useState va useEffect hooklari", 86, 66, 85, 0, 0],
[400, "English", "Elementary", "Month and days of the week", 86, 165, 0, 0, 86],
[1833, "Dasturlash kursi", "CSS", "Amaliy ish. Border xususiyati - 2", 84, 171, 2, 82, 0],
[2102, "Dasturlash kursi", "Javascript", "Amaliy ish. DOM", 84, 91, 1, 83, 0],
[1864, "Dasturlash kursi", "CSS", "Amaliy ish. Flexlar oilasi 1 - qism", 83, 141, 25, 58, 0],
[2591, "Dasturlash kursi", "HTML", "Amaliy ish. Iframe tegi va uning turlari", 83, 181, 17, 66, 0],
[2104, "Dasturlash kursi", "Javascript", "Amaliy ish.. DOM eventlari va selectorlari", 82, 87, 2, 80, 0],
[2005, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Bootstrapda ranglar bilan ishlash", 81, 139, 2, 79, 0],
[1866, "Dasturlash kursi", "CSS", "Amaliy ish. Flexlar oilasi 2 - qism", 81, 143, 4, 77, 0],
[1899, "Dasturlash kursi", "CSS", "Amaliy ish. !important va attribut selektori", 80, 134, 0, 80, 0],
[2017, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Grid sistemasi", 78, 118, 5, 73, 0],
[1847, "Dasturlash kursi", "CSS", "Amaliy ish. Box model 1-qism", 78, 165, 3, 75, 0],
[701, "English", "Intermediate", "Shapes practice", 78, 110, 1, 0, 77],
[2176, "Веб программирование", "HTML", "Практика. Теги списков и iframe", 78, 47, 0, 78, 0],
[2124, "Dasturlash kursi", "Javascript", "Amaliy ish. Obyekt metodlari", 76, 73, 2, 74, 0],
[2157, "Dasturlash kursi", "React", "Amaliy ish. React-router-dom bilan ishlash 1-qism", 75, 53, 75, 0, 0],
[1831, "Dasturlash kursi", "CSS", "Amaliy ish. Border xususiyati - 1", 74, 164, 0, 74, 0],
[1907, "Dasturlash kursi", "CSS", "Maket bilan ishlash", 74, 124, 3, 71, 0],
[2007, "Dasturlash kursi", "Bootstrap", "Amaliy ish. Bootstrapda buttonlar bilan ishlash", 73, 145, 2, 71, 0],
[1885, "Dasturlash kursi", "CSS", "Amaliy ish. Psevdo klasslar 2-qism", 73, 141, 3, 70, 0],
[731, "English", "Pre-Intermediate", "Present Perfect 2 practice homework", 71, 107, 4, 0, 67],
[1883, "Dasturlash kursi", "CSS", "Amaliy ish. Psevdo klasslar 1-qism", 70, 139, 1, 69, 0],
[2164, "Веб программирование", "HTML", "Практика. Что такое HTML и зачем он нам нужен", 70, 61, 3, 67, 0]
];

// Takroriy rad etish (AVGUST). Birlik = o'quvchi × amaliy vazifa ("zanjir").
// [dars_id, zanjir, 2+_marta_rad, 3+_marta_rad, rad_bolib_hali_qabul_qilinmagan]
const PR_REPEAT = [
[400,165,21,11,4],[531,214,24,12,12],[532,167,22,12,5],[533,161,23,11,3],[534,152,30,20,2],
[535,159,38,27,5],[539,167,33,25,3],[542,163,47,39,6],[543,159,86,78,7],[572,163,56,44,11],
[578,154,26,20,0],[580,164,23,14,1],[595,155,95,83,30],[601,125,64,52,8],[604,128,18,15,6],
[606,135,29,19,6],[611,122,27,22,6],[613,115,23,15,2],[682,118,17,11,1],[683,117,26,22,6],
[695,115,16,9,4],[701,110,15,8,0],[731,107,11,9,1],[735,112,19,12,1],[738,109,30,18,0],
[1646,278,38,25,6],[1648,273,60,32,12],[1650,237,66,54,10],[1735,209,69,40,7],[1740,186,48,25,1],
[1742,184,30,23,4],[1751,169,57,37,5],[1753,173,45,30,7],[1771,332,71,46,31],[1814,182,21,17,1],
[1816,190,71,38,2],[1818,196,46,34,4],[1820,190,41,30,5],[1822,180,54,34,4],[1824,183,73,52,4],
[1829,172,43,27,3],[1831,164,12,7,1],[1833,171,20,13,0],[1835,168,46,27,1],[1837,172,32,22,4],
[1839,171,22,9,2],[1840,171,41,24,2],[1845,177,29,17,1],[1847,165,20,8,0],[1849,158,32,17,0],
[1853,149,26,13,0],[1854,155,43,20,2],[1864,141,18,7,1],[1866,143,20,10,0],[1870,148,21,15,2],
[1874,142,35,17,1],[1876,141,29,15,5],[1878,144,48,35,4],[1879,144,32,23,0],[1881,139,33,19,2],
[1883,139,15,8,0],[1885,141,17,9,3],[1899,134,15,10,1],[1900,137,34,22,2],[1907,124,21,7,0],
[1909,146,57,42,12],[1993,143,36,24,1],[2003,139,31,17,2],[2005,139,17,10,1],[2007,145,16,13,0],
[2009,146,22,9,0],[2010,144,30,25,3],[2011,135,18,14,0],[2013,131,30,17,7],[2015,119,66,46,2],
[2017,118,21,13,1],[2020,115,29,21,4],[2028,130,17,14,2],[2035,138,27,15,2],[2054,93,22,17,2],
[2058,96,33,22,2],[2077,96,20,8,1],[2102,91,20,9,2],[2104,87,19,9,1],[2116,83,26,15,0],
[2119,75,25,19,1],[2124,73,19,10,4],[2133,78,18,13,3],[2144,76,32,17,12],[2146,70,26,13,11],
[2148,64,21,14,12],[2150,66,18,10,5],[2157,53,11,7,5],[2164,61,16,13,7],[2170,48,28,23,3],
[2176,47,23,15,6],[2202,45,12,9,6],[2213,74,31,20,21],[2396,46,22,17,7],[2589,225,23,10,10],
[2591,181,17,12,0]
];

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
["Fotimabonu Abdulkhakova", 3760, 283, 549, 2311, 900],
["Shaxlo Ziyodova", 4462, 207, 238, 2617, 1607],
["Madina Normatova", 3340, 272, 801, 1607, 932],
["Jasmina Tolibova", 2793, 291, 896, 1485, 412],
["Marjona Pardayeva", 3057, 333, 823, 1640, 594],
["Dilafruz Shokirova", 2369, 239, 646, 1501, 222],
["Xalima Ismoiljonova", 2043, 219, 430, 762, 851],
["Kurator biriktirilmagan", 2847, 574, 432, 929, 1486]
];

// CRM ning bugungi holati (sana filtriga bog'liq emas): faol guruh va faol o'quvchi
const PR_CURATOR_ROSTER = {
  "Marjona Pardayeva": [8,357], "Jasmina Tolibova": [7,322], "Madina Normatova": [5,306],
  "Fotimabonu Abdulkhakova": [6,303], "Dilafruz Shokirova": [4,257],
  "Xalima Ismoiljonova": [7,253], "Shaxlo Ziyodova": [5,225]
};

// Kurator × kurs (AVGUST): [kurator, kurs, jami, rad, o'quvchi, human_jami, human_rad]
const PR_CURATOR_COURSE = [
["Fotimabonu Abdulkhakova", "Dasturlash kursi", 2766, 273],
["Fotimabonu Abdulkhakova", "English", 926, 116],
["Fotimabonu Abdulkhakova", "Suniy Intellekt", 22, 52],
["Fotimabonu Abdulkhakova", "Grafik dizayn", 30, 20],
["Fotimabonu Abdulkhakova", "Kompyuter Savodxonligi", 4, 18],
["Fotimabonu Abdulkhakova", "Telegram Bot", 1, 8],
["Shaxlo Ziyodova", "Dasturlash kursi", 1942, 133],
["Shaxlo Ziyodova", "English", 1625, 78],
["Shaxlo Ziyodova", "Веб программирование", 868, 60],
["Shaxlo Ziyodova", "Grafik dizayn", 21, 4],
["Shaxlo Ziyodova", "Suniy Intellekt", 1, 4],
["Madina Normatova", "Dasturlash kursi", 2195, 247],
["Madina Normatova", "English", 976, 112],
["Madina Normatova", "Grafik dizayn", 133, 37],
["Madina Normatova", "Telegram Bot", 1, 9],
["Madina Normatova", "Kompyuter Savodxonligi", 8, 12],
["Madina Normatova", "Suniy Intellekt", 3, 10],
["Madina Normatova", "Веб программирование", 21, 2],
["Jasmina Tolibova", "Dasturlash kursi", 2011, 255],
["Jasmina Tolibova", "English", 454, 114],
["Jasmina Tolibova", "Kompyuter Savodxonligi", 29, 109],
["Jasmina Tolibova", "Grafik dizayn", 159, 33],
["Jasmina Tolibova", "Junior Kurs", 109, 31],
["Jasmina Tolibova", "Suniy Intellekt", 19, 61],
["Jasmina Tolibova", "Telegram Bot", 11, 19],
["Marjona Pardayeva", "Dasturlash kursi", 2282, 296],
["Marjona Pardayeva", "English", 631, 108],
["Marjona Pardayeva", "Grafik dizayn", 54, 15],
["Marjona Pardayeva", "Suniy Intellekt", 7, 26],
["Marjona Pardayeva", "Junior Kurs", 69, 16],
["Marjona Pardayeva", "Telegram Bot", 7, 12],
["Marjona Pardayeva", "Kompyuter Savodxonligi", 6, 8],
["Dilafruz Shokirova", "Веб программирование", 1727, 189],
["Dilafruz Shokirova", "Dasturlash kursi", 347, 47],
["Dilafruz Shokirova", "English", 234, 53],
["Dilafruz Shokirova", "Grafik dizayn", 50, 11],
["Dilafruz Shokirova", "Suniy Intellekt", 8, 17],
["Dilafruz Shokirova", "Kompyuter Savodxonligi", 1, 8],
["Dilafruz Shokirova", "Telegram Bot", 0, 5],
["Xalima Ismoiljonova", "Dasturlash kursi", 761, 92],
["Xalima Ismoiljonova", "English", 884, 104],
["Xalima Ismoiljonova", "Grafik dizayn", 260, 84],
["Xalima Ismoiljonova", "Kompyuter Savodxonligi", 30, 50],
["Xalima Ismoiljonova", "Suniy Intellekt", 10, 50],
["Xalima Ismoiljonova", "Junior Kurs", 91, 13],
["Xalima Ismoiljonova", "Telegram Bot", 3, 6]
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
["A7", "Kerakli teg ishlatilmagan", 2665],
["A3", "HTML struktura xatosi (<html> / <head> / <body>)", 2217],
["A2", "CSS ulanmagan yoki <style> noto'g'ri joyda", 2077],
["A5", "JavaScript talablari bajarilmagan (o'zgaruvchi, console.log, shart operatori)", 1583],
["A4", "Bootstrap noto'g'ri ulangan", 1451],
["A8", "Element / class talabi bajarilmagan", 1004],
["A1", "Vazifa bajarilmagan yoki kod bo'sh", 891],
["A6", "Talab qilingan miqdorda element yo'q («kamida 3 ta div»)", 637],
["A9", "Kodda boshqa xato", 142],
["AZ", "Boshqa", 185]
];

// Ovozli javob avtotekshiruvi (English) — ikki sabab: yozuv sifati va talaffuz.
const PR_REASONS_VOICE = [
["V1", "Ovoz umuman aniqlanmadi (mikrofon / yozuv sifati)", 307],
["V2", "So'zlarning bir qismi noto'g'ri aytilgan yoki aytilmagan", 6697]
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

// Bitta o'quvchi avgustda necha marta rad etilgan: [guruh, o'quvchi soni, rad etishlar]
const PR_PER_STUDENT = [
  ["1 marta", 241, 241],
  ["2 marta", 176, 352],
  ["3–5 marta", 427, 1662],
  ["6–10 marta", 450, 3461],
  ["11–20 marta", 422, 6129],
  ["21–50 marta", 273, 8174],
  ["50+ marta", 63, 4652]
];

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
