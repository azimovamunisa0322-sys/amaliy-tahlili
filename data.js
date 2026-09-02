// ============================================================================
// AMALIY VAZIFA — RAD ETILISH TAHLILI · ma'lumot qatlami
// Manba: Junior LMS / CRM bazasi (MCP, faqat SELECT). Hech narsa taxmin
// qilinmagan — har bir son quyidagi jadvallardan o'qib olingan:
//   student_question_practice  (o'quvchi topshirgan amaliy ish + tekshiruv)
//   student_questions -> student_lessons -> student_modules -> student_courses
//   student_students -> subscribe_list -> group_list.ADMIN_ID  (kurator)
//   gl_sys_users / gl_sys_roles  (tekshiruvchi va kurator ismi, roli)
//
// Snapshot: 2026-09-02, 15:00 (Toshkent). Baza JONLI: 'uploaded' holatidagi
// (hali tekshirilmagan) qatorlar keyin approved/rejected ga o'tadi, shu sababli
// 30-31 avgust va sentyabr sonlari keyingi o'qishda bir necha birlik o'sishi
// mumkin. Barcha foizlar faqat TEKSHIRILGAN qatorlar ustidan hisoblangan
// (status = approved yoki rejected; 'uploaded' va 'old_approved' kirmaydi).
// ============================================================================

const PR_META = {
  snapshot: "2026-09-02 15:00",
  aug: { from: "2026-08-01", to: "2026-08-31", days: 31 },
  sep: { from: "2026-09-01", to: "2026-09-02", days: 2, note: "2-sentyabr kuni to'lmagan" }
};

// Tekshiruv kanallari (pipeline) — bazadagi ustunlar bilan aniq bog'lanishi:
//  human = teacher_id > 1  (yoki review_source='teacher')  -> tirik odam tekshirgan
//  ai    = teacher_id = 0 AND review_source='ai'           -> AI tekshiruvi (3-avgustdan)
//  voice = teacher_id = 0 AND review_source IS NULL        -> ovozli javob avtotekshiruvi (English)
//  auto  = teacher_id = 1                                  -> blockly-game avto-qabul (rad etmaydi)
const PR_PIPES = {
  human: { label: "Mentor (odam)", short: "Mentor", color: "#be123c" },
  ai:    { label: "AI tekshiruvi", short: "AI", color: "#2563eb" },
  voice: { label: "Ovoz avtotekshiruvi (English)", short: "Ovoz", color: "#a16207" },
  auto:  { label: "Blockly avto-qabul", short: "Avto", color: "#7c8695" }
};

// Kunlik: [sana, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad, auto_jami]
const PR_DAILY = [
["2026-08-01",1335,255,0,0,3,2,69],
["2026-08-02",1275,204,0,0,1,0,85],
["2026-08-03",1108,214,400,187,3,0,138],
["2026-08-04",896,201,839,406,1,0,104],
["2026-08-05",871,203,882,387,21,13,136],
["2026-08-06",878,223,1020,475,205,143,139],
["2026-08-07",798,201,1075,489,658,508,140],
["2026-08-08",747,175,1097,535,694,519,107],
["2026-08-09",714,196,1092,556,498,335,91],
["2026-08-10",682,176,954,442,428,302,64],
["2026-08-11",737,208,1056,521,597,452,79],
["2026-08-12",696,166,961,478,500,367,90],
["2026-08-13",694,173,962,446,310,203,79],
["2026-08-14",741,199,971,459,396,285,105],
["2026-08-15",583,135,822,357,299,198,95],
["2026-08-16",553,129,838,397,379,263,109],
["2026-08-17",550,132,934,402,517,427,92],
["2026-08-18",577,160,929,417,483,387,134],
["2026-08-19",628,148,975,419,302,242,81],
["2026-08-20",635,144,1035,489,432,339,110],
["2026-08-21",543,120,1069,474,343,262,65],
["2026-08-22",503,126,1095,509,321,240,103],
["2026-08-23",461,119,1063,506,285,203,109],
["2026-08-24",421,96,1052,508,285,191,103],
["2026-08-25",442,115,943,437,288,200,3415],
["2026-08-26",449,103,999,501,227,151,4243],
["2026-08-27",493,110,899,419,94,58,1171],
["2026-08-28",410,92,882,412,205,138,1566],
["2026-08-29",469,112,869,392,225,154,1565],
["2026-08-30",369,94,802,386,242,170,1389],
["2026-08-31",354,86,882,446,366,252,1371],
["2026-09-01",329,76,797,362,205,114,827],
["2026-09-02",62,15,138,80,25,17,197]
];

// Oylik kontekst (iyun–iyul) — AI tekshiruvi 3-avgustda ishga tushgan, shu sababli
// iyun-iyulda 'ai' kanali deyarli yo'q. [oy, kanal, jami, rad]
const PR_MONTHS_CTX = [
["2026-06","human",32413,6894],["2026-06","voice",28726,17502],["2026-06","auto",2810,2],
["2026-07","human",37545,7117],["2026-07","voice",24956,15251],["2026-07","ai",881,467],["2026-07","auto",2567,0]
];

// Kurslar: [kurs, oy, jami, rad, o'quvchi, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]
const PR_COURSES = [
["Dasturlash kursi","2026-08",33319,13348,1663,11122,3076,22179,10266,7,3],
["English","2026-08",11804,7228,976,2207,232,0,0,9594,6995],
["Веб программирование","2026-08",6746,2874,315,2075,538,4669,2336,0,0],
["Grafik dizayn","2026-08",2435,729,227,2432,728,0,0,0,0],
["Suniy Intellekt","2026-08",1249,72,237,1249,72,0,0,0,0],
["Kompyuter Savodxonligi","2026-08",980,95,229,979,95,0,0,0,0],
["Junior Kurs","2026-08",676,293,69,127,43,549,250,0,0],
["Telegram Bot","2026-08",395,23,62,395,23,0,0,0,0],
["Dasturlash kursi","2026-09",948,365,504,236,62,712,303,0,0],
["Веб программирование","2026-09",240,140,99,33,11,207,129,0,0],
["English","2026-09",238,131,93,9,0,0,0,229,131],
["Grafik dizayn","2026-09",67,12,57,67,12,0,0,0,0],
["Suniy Intellekt","2026-09",22,2,20,22,2,0,0,0,0],
["Kompyuter Savodxonligi","2026-09",16,4,14,16,4,0,0,0,0],
["Junior Kurs","2026-09",10,5,7,0,0,10,5,0,0],
["Telegram Bot","2026-09",8,0,8,8,0,0,0,0,0]
];
// Avgustda yuqoridagilardan tashqari 13 qator test kurslarida ("2 Test Course",
// "JSX Lessons", "Web dasturlash") — jadvalga kiritilmagan, jami 57 617 dan 13 tasi.

// Modullar (AVGUST): [kurs, modul, tartib, jami, rad, o'quvchi, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]
const PR_MODULES_AUG = [
["Dasturlash kursi","HTML",5,6155,2519,520,1548,357,4606,2161,1,1],
["Dasturlash kursi","CSS",10,11234,4988,619,1773,492,9461,4496,0,0],
["Dasturlash kursi","Bootstrap",15,3890,1676,232,539,129,3349,1547,2,0],
["Dasturlash kursi","Tilda",20,2068,194,195,2068,194,0,0,0,0],
["Dasturlash kursi","Git",25,1147,166,137,1147,166,0,0,0,0],
["Dasturlash kursi","Javascript",30,5487,2233,262,722,170,4763,2062,2,1],
["Dasturlash kursi","React",35,2740,1481,242,2738,1480,0,0,2,1],
["Dasturlash kursi","Python",40,598,91,86,598,91,0,0,0,0],
["English","Beginner",1,4527,3070,389,453,8,0,0,4074,3062],
["English","Elementary",2,3494,2464,335,484,20,0,0,3010,2444],
["English","Pre-Intermediate",3,2232,1198,271,337,25,0,0,1895,1173],
["English","Intermediate",4,1551,496,223,936,180,0,0,615,316],
["Grafik dizayn","Canva",1,601,182,94,601,182,0,0,0,0],
["Grafik dizayn","Figma",2,779,322,72,779,322,0,0,0,0],
["Grafik dizayn","Magica Voxel",3,235,20,31,235,20,0,0,0,0],
["Grafik dizayn","Photoshop",5,217,72,29,217,72,0,0,0,0],
["Grafik dizayn","Illustrator",6,184,33,22,184,33,0,0,0,0],
["Grafik dizayn","Blender",7,419,100,37,419,100,0,0,0,0],
["Junior Kurs","HTML",10,676,293,69,127,43,549,250,0,0],
["Kompyuter Savodxonligi","Kompyuter savodxonligi",1,980,95,229,980,95,0,0,0,0],
["Suniy Intellekt","AI",1,1249,72,237,1249,72,0,0,0,0],
["Telegram Bot","Telegram Bot",1,395,23,62,395,23,0,0,0,0],
["Веб программирование","HTML",1,1328,687,98,158,29,1170,658,0,0],
["Веб программирование","CSS",2,2784,1104,158,795,191,1989,913,0,0],
["Веб программирование","Bootstrap",4,1234,564,54,186,25,1048,539,0,0],
["Веб программирование","WiX",5,202,7,20,202,7,0,0,0,0],
["Веб программирование","Scratch",6,123,15,20,123,15,0,0,0,0],
["Веб программирование","Javascript",7,770,316,47,308,90,462,226,0,0],
["Веб программирование","React",8,305,181,27,305,181,0,0,0,0]
];

// Modullar (SENTYABR 1–2, kam namuna): [kurs, modul, jami, rad, o'quvchi]
const PR_MODULES_SEP = [
["Dasturlash kursi","HTML",100,35,54],
["Dasturlash kursi","CSS",337,149,156],
["Dasturlash kursi","Bootstrap",105,49,50],
["Dasturlash kursi","Tilda",70,6,53],
["Dasturlash kursi","Git",44,2,29],
["Dasturlash kursi","Javascript",191,79,82],
["Dasturlash kursi","React",91,47,69],
["Dasturlash kursi","Python",16,3,14],
["English","Beginner",95,44,31],
["English","Elementary",65,47,27],
["English","Pre-Intermediate",60,35,22],
["English","Intermediate",19,5,14],
["Grafik dizayn","Canva",24,4,23],
["Grafik dizayn","Figma",25,7,19],
["Kompyuter Savodxonligi","Kompyuter savodxonligi",16,4,14],
["Suniy Intellekt","AI",22,2,20],
["Веб программирование","HTML",36,24,13],
["Веб программирование","CSS",82,51,31],
["Веб программирование","Bootstrap",70,42,23],
["Веб программирование","Javascript",35,17,18]
];

// Darslar — avgustda kamida 60 ta tekshiruv VA kamida 70 ta rad etish bo'lgan
// barcha darslar — jami 101 dars. Ustunlar:
// [dars_id, kurs, modul, dars, turi,
//  avg_jami, avg_rad, avg_oquvchi, sen_jami, sen_rad,
//  human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]   (kanal ustunlari = AVGUST)
const PR_LESSONS = [
[543,"English","Beginner","Action words 2 practice","Practice",1611,1459,159,7,4,65,3,0,0,1546,1456],
[595,"English","Elementary","Years practice","Practice",1234,1109,155,20,18,72,6,0,0,1162,1103],
[601,"English","Elementary","Furniture practice","Practice",666,549,125,4,3,43,1,0,0,623,548],
[542,"English","Beginner","Action words 1 practice","Practice",600,443,163,9,6,53,2,0,0,547,441],
[535,"English","Beginner","What this this/that? practice","Practice",583,429,159,8,2,51,0,0,0,532,429],
[572,"English","Elementary","Feelings practice","Practice",579,427,163,19,14,53,2,0,0,526,425],
[1909,"Dasturlash kursi","CSS","CSS Demo day","Demoday",519,385,146,10,6,306,251,213,134,0,0],
[1771,"Dasturlash kursi","HTML","Amaliy ish. HTML nima va nega kerak?","Practice",639,338,332,19,13,96,45,543,293,0,0],
[1650,"Dasturlash kursi","HTML","Amaliy ish. Attributlar va havola tegi","Practice",514,287,237,0,0,80,27,434,260,0,0],
[1824,"Dasturlash kursi","CSS","Amaliy ish. Matnlar bilan ishlash - 2","Practice",465,286,183,2,0,78,18,387,268,0,0],
[1816,"Dasturlash kursi","CSS","Amaliy ish. Internal stil berish uslubi","Practice",435,247,190,11,7,58,4,377,243,0,0],
[1735,"Dasturlash kursi","HTML","Amaliy ish. Inline elementlar","Practice",444,234,209,1,0,70,17,374,217,0,0],
[2015,"Dasturlash kursi","Bootstrap","Amaliy ish. Bootstrapda form elementlari","Practice",350,233,119,9,4,41,3,309,230,0,0],
[1822,"Dasturlash kursi","CSS","Amaliy ish. Matnlar bilan ishlash - 1","Practice",401,225,180,5,3,51,10,350,215,0,0],
[1751,"Dasturlash kursi","HTML","HTML modul oxiri","Practice",400,221,169,6,2,95,33,305,188,0,0],
[1753,"Dasturlash kursi","HTML","HTML. Demo day","Practice",378,212,173,3,1,110,49,267,163,0,0],
[1648,"Dasturlash kursi","HTML","Amaliy ish. Paragraf tegi va Formatlash teglari","Practice",471,210,273,2,1,49,7,421,202,1,1],
[539,"English","Beginner","Professions practice","Practice",373,209,167,13,6,60,1,0,0,313,208],
[611,"English","Pre-Intermediate","Conditionals practice","Practice",322,206,122,5,2,32,1,0,0,290,205],
[1878,"Dasturlash kursi","CSS","Amaliy ish. Transform va cursor xususiyatlari","Practice",336,196,144,6,5,50,9,286,187,0,0],
[1740,"Dasturlash kursi","HTML","Amaliy ish. Form elementlari - 1","Practice",378,193,186,3,0,52,10,326,183,0,0],
[1818,"Dasturlash kursi","CSS","Amaliy ish. Selectorlar","Practice",370,178,196,12,6,52,6,318,172,0,0],
[606,"English","Pre-Intermediate","At the hospital practice","Practice",304,175,135,10,4,41,2,0,0,262,173],
[2020,"Dasturlash kursi","Bootstrap","Bootstrap. Demo day","Demoday",285,174,115,6,1,124,100,161,74,0,0],
[1835,"Dasturlash kursi","CSS","Amaliy ish. Backgroundlar oilasi - 1","Practice",341,174,168,6,3,36,2,305,172,0,0],
[2144,"Dasturlash kursi","React","Amaliy ish. Npm va kutubxonalar","Practice",240,173,76,10,5,239,173,0,0,0,0],
[683,"English","Pre-Intermediate","Practice (homework)","Practice",284,173,117,4,1,35,5,0,0,249,168],
[1820,"Dasturlash kursi","CSS","Amaliy ish. Ranglar bilan ishlash","Practice",356,171,190,6,3,37,6,319,165,0,0],
[1829,"Dasturlash kursi","CSS","Mustahkamlash ishi - 1","Practice",343,171,172,10,4,62,15,281,156,0,0],
[2213,"Dasturlash kursi","React","Demo day. React","Demoday",223,170,74,4,4,222,169,0,0,0,0],
[735,"English","Pre-Intermediate","Present Perfect 3 practice homework","Practice",277,166,112,1,0,42,6,0,0,235,160],
[1854,"Dasturlash kursi","CSS","Mustahkamlash ishi - 3","Practice",309,156,155,2,0,47,3,262,153,0,0],
[1646,"Dasturlash kursi","HTML","Amaliy ish. HTMLdagi muhim kodlar","Practice",428,156,278,3,0,58,17,370,139,0,0],
[534,"English","Beginner","What is it? lesson practice","Practice",304,154,152,22,16,43,0,0,0,261,154],
[1840,"Dasturlash kursi","CSS","Mustahkamlash ishi - 2","Practice",321,152,171,3,0,53,10,268,142,0,0],
[578,"English","Elementary","Seasons and weather practice","Practice",306,152,154,16,12,50,0,0,0,256,152],
[2396,"Веб программирование","CSS","CSS. Demo day","Demoday",190,151,46,3,3,120,104,70,47,0,0],
[1900,"Dasturlash kursi","CSS","Mustahkamlash amaliy ishi - 6","Practice",285,150,137,11,5,43,8,242,142,0,0],
[2013,"Dasturlash kursi","Bootstrap","Amaliy ish. Modal oyna va dropdown","Practice",268,144,131,6,2,18,3,250,141,0,0],
[1993,"Dasturlash kursi","CSS","Amaliy ish. External uslub bilan stillash","Practice",285,143,143,36,26,33,1,252,142,0,0],
[1879,"Dasturlash kursi","CSS","Mustahkamlash ishi - 5","Practice",284,140,144,11,6,48,7,236,133,0,0],
[2058,"Dasturlash kursi","Javascript","Amaliy ish-1. Mantiqiy operatorlar","Practice",229,135,96,9,6,21,2,208,133,0,0],
[613,"English","Pre-Intermediate","Irregular verbs practice","Practice",248,135,115,13,10,26,0,0,0,222,135],
[2010,"Dasturlash kursi","Bootstrap","Mustahkamlash amaliy ishi - 1","Practice",274,133,144,9,4,100,0,174,133,0,0],
[1881,"Dasturlash kursi","CSS","Amaliy ish. Position xususiyati","Practice",270,133,139,18,9,28,5,242,128,0,0],
[580,"English","Elementary","Places in the city practice","Practice",294,131,164,0,0,40,1,0,0,254,130],
[1742,"Dasturlash kursi","HTML","Amaliy ish. Form elementlari - 2","Practice",310,130,184,10,4,35,1,275,129,0,0],
[1837,"Dasturlash kursi","CSS","Amaliy ish. Backgroundlar oilasi - 2","Practice",297,129,172,3,0,45,11,252,118,0,0],
[2003,"Dasturlash kursi","Bootstrap","Amaliy ish. Bootstrapga kirish","Practice",265,128,139,4,2,30,1,234,127,1,0],
[682,"English","Pre-Intermediate","Would like practice","Practice",242,125,118,16,15,30,2,0,0,212,123],
[1874,"Dasturlash kursi","CSS","Amaliy ish. Flex bilan navbar yasash 2-qism","Practice",263,122,142,7,1,29,4,234,118,0,0],
[2148,"Dasturlash kursi","React","Mustahkamlash ishi - 1","Practice",174,121,64,10,5,174,121,0,0,0,0],
[2170,"Веб программирование","HTML","Практика. Аттрибуты и медиатеги","Practice",166,121,48,0,0,26,7,140,114,0,0],
[531,"English","Beginner","Basic conversation 1 practice","Practice",321,119,214,8,1,57,1,0,0,264,118],
[1845,"Dasturlash kursi","CSS","Amaliy ish. Margin va padding xususiyati","Practice",294,118,177,3,0,36,9,257,109,0,0],
[2146,"Dasturlash kursi","React","Amaliy ish. Export va Import","Practice",178,117,70,7,5,177,117,0,0,0,0],
[1876,"Dasturlash kursi","CSS","Amaliy ish. Navbar + Header","Practice",252,116,141,12,8,18,1,234,115,0,0],
[1849,"Dasturlash kursi","CSS","Amaliy ish. Box model 2-qism","Practice",272,114,158,9,3,23,0,249,114,0,0],
[738,"English","Intermediate","Accessories practice","Practice",222,113,109,2,0,37,3,0,0,185,110],
[2119,"Dasturlash kursi","Javascript","Masterclass. Login forma","Practice",184,110,75,3,1,32,11,152,99,0,0],
[604,"English","Pre-Intermediate","Practice (story)","Practice",230,108,128,4,2,46,4,0,0,184,104],
[533,"English","Beginner","Family members practice","Practice",264,106,161,8,3,38,0,0,0,226,106],
[2589,"Dasturlash kursi","HTML","Amaliy ish. Attributlar va media tegi","Practice",319,104,225,1,1,318,104,0,0,0,0],
[2009,"Dasturlash kursi","Bootstrap","Amaliy ish. Bootstrapda matnlar bilan ishlash","Practice",249,103,146,3,0,25,2,224,101,0,0],
[2133,"Dasturlash kursi","Javascript","Javascript. Demo day","Demoday",175,100,78,2,2,79,54,96,46,0,0],
[532,"English","Beginner","Basic conversation 2 practice","Practice",262,100,167,12,4,34,0,0,0,228,100],
[2035,"Dasturlash kursi","Bootstrap","Mustahkamlash amaliy ishi - 2","Practice",235,99,138,3,2,29,0,206,99,0,0],
[1853,"Dasturlash kursi","CSS","Amaliy ish. Display xususiyati 2-qism","Practice",248,99,149,5,0,23,4,225,95,0,0],
[2054,"Dasturlash kursi","Javascript","Amaliy ish. Ma`lumot turlari 3-qism","Practice",188,97,93,7,4,24,3,164,94,0,0],
[2116,"Dasturlash kursi","Javascript","Amaliy ish. QuerySelector bilan ishlash","Practice",180,97,83,15,12,17,0,163,97,0,0],
[1814,"Dasturlash kursi","CSS","Amaliy ish. CSS va uning HTMLga ta'siri","Practice",277,96,182,4,0,30,2,247,94,0,0],
[1870,"Dasturlash kursi","CSS","Mustahkamlash amaliy ishi - 4","Practice",240,94,148,17,8,125,34,115,60,0,0],
[695,"English","Intermediate","Winter celebrations practice","Practice",204,93,115,3,0,44,6,0,0,160,87],
[2077,"Dasturlash kursi","Javascript","Amaliy ish-2. Mantiqiy operatorlar","Practice",183,88,96,8,5,10,1,173,87,0,0],
[2028,"Dasturlash kursi","Bootstrap","Amaliy ish. Cardlar bilan ishlash","Practice",214,86,130,13,6,12,1,202,85,0,0],
[2011,"Dasturlash kursi","Bootstrap","Navbar + Carousel","Practice",221,86,135,2,0,21,1,200,85,0,0],
[1839,"Dasturlash kursi","CSS","Amaliy ish. Outline xususiyati","Practice",255,86,171,6,0,26,5,229,81,0,0],
[2202,"Dasturlash kursi","React","Amaliy ish. CRUD fetch orqali","Practice",125,86,45,2,1,125,86,0,0,0,0],
[2150,"Dasturlash kursi","React","Amaliy ish. useState va useEffect hooklari","Practice",148,86,66,1,1,147,85,0,0,0,0],
[400,"English","Elementary","Month and days of the week","Practice",247,86,165,2,0,58,0,0,0,189,86],
[1833,"Dasturlash kursi","CSS","Amaliy ish. Border xususiyati - 2","Practice",255,84,171,5,2,25,2,230,82,0,0],
[2102,"Dasturlash kursi","Javascript","Amaliy ish. DOM","Practice",173,84,91,1,0,17,1,156,83,0,0],
[1864,"Dasturlash kursi","CSS","Amaliy ish. Flexlar oilasi 1 - qism","Practice",223,83,141,2,0,38,25,185,58,0,0],
[2591,"Dasturlash kursi","HTML","Amaliy ish. Iframe tegi va uning turlari","Practice",264,83,181,8,2,133,17,131,66,0,0],
[2104,"Dasturlash kursi","Javascript","Amaliy ish.. DOM eventlari va selectorlari","Practice",168,82,87,2,0,14,2,154,80,0,0],
[2005,"Dasturlash kursi","Bootstrap","Amaliy ish. Bootstrapda ranglar bilan ishlash","Practice",219,81,139,8,5,21,2,198,79,0,0],
[1866,"Dasturlash kursi","CSS","Amaliy ish. Flexlar oilasi 2 - qism","Practice",224,81,143,2,0,24,4,200,77,0,0],
[1899,"Dasturlash kursi","CSS","Amaliy ish. !important va attribut selektori","Practice",213,80,134,5,2,19,0,194,80,0,0],
[2017,"Dasturlash kursi","Bootstrap","Amaliy ish. Grid sistemasi","Practice",195,78,118,5,2,21,5,174,73,0,0],
[1847,"Dasturlash kursi","CSS","Amaliy ish. Box model 1-qism","Practice",243,78,165,15,6,21,3,222,75,0,0],
[701,"English","Intermediate","Shapes practice","Practice",188,78,110,9,4,35,1,0,0,152,77],
[2176,"Веб программирование","HTML","Практика. Теги списков и iframe","Practice",119,78,47,2,2,13,0,106,78,0,0],
[2124,"Dasturlash kursi","Javascript","Amaliy ish. Obyekt metodlari","Practice",145,76,73,18,14,18,2,127,74,0,0],
[2157,"Dasturlash kursi","React","Amaliy ish. React-router-dom bilan ishlash 1-qism","Practice",125,75,53,5,1,125,75,0,0,0,0],
[1831,"Dasturlash kursi","CSS","Amaliy ish. Border xususiyati - 1","Practice",237,74,164,7,3,9,0,227,74,0,0],
[1907,"Dasturlash kursi","CSS","Maket bilan ishlash","Practice",198,74,124,9,3,21,3,177,71,0,0],
[2007,"Dasturlash kursi","Bootstrap","Amaliy ish. Bootstrapda buttonlar bilan ishlash","Practice",218,73,145,5,3,29,2,188,71,1,0],
[1885,"Dasturlash kursi","CSS","Amaliy ish. Psevdo klasslar 2-qism","Practice",211,73,141,6,4,28,3,183,70,0,0],
[731,"English","Pre-Intermediate","Present Perfect 2 practice homework","Practice",177,71,107,1,0,39,4,0,0,138,67],
[1883,"Dasturlash kursi","CSS","Amaliy ish. Psevdo klasslar 1-qism","Practice",209,70,139,8,3,17,1,192,69,0,0],
[2164,"Веб программирование","HTML","Практика. Что такое HTML и зачем он нам нужен","Practice",124,70,61,12,11,14,3,110,67,0,0]
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
const PR_REPEAT_DIST = {
  chains: 33624, totalRej: 24671, totalSub: 57617,
  buckets: [["0 marta",24156],["1 marta",4645],["2 marta",1815],["3 marta",1651],["4–5 marta",600],["6–10 marta",515],["11+ marta",242]],
  anyRej: 9468, rej2: 4823, rej3: 3008, stuck: 755
};

// ---------------------------------------------------------------------------
// KURATORLAR
// Kurator = o'quvchi FAOL obunasidagi guruhning group_list.ADMIN_ID xodimi.
// Har bir o'quvchida faol obunalar bo'yicha aynan BITTA kurator chiqadi
// (tekshirildi: 2 056 o'quvchidan hech birida ikkinchi kurator yo'q).
// Faol obunasi yo'q (muzlatilgan / tugatgan) o'quvchilar alohida qatorda.
// ---------------------------------------------------------------------------
// [kurator, oy, jami, rad, o'quvchi, human_jami, human_rad, ai_jami, ai_rad, voice_jami, voice_rad]
const PR_CURATORS = [
["Fotimabonu Abdulkhakova","2026-08",10019,3760,283,3274,549,5473,2311,1272,900],
["Shaxlo Ziyodova","2026-08",8896,4462,207,1615,238,5230,2617,2051,1607],
["Madina Normatova","2026-08",7541,3340,272,3065,801,3277,1607,1199,932],
["Jasmina Tolibova","2026-08",7258,2793,291,3406,896,3292,1485,560,412],
["Marjona Pardayeva","2026-08",6778,3057,333,2477,823,3466,1640,835,594],
["Dilafruz Shokirova","2026-08",6006,2369,239,2464,646,3211,1501,331,222],
["Xalima Ismoiljonova","2026-08",5220,2043,219,2496,430,1530,762,1194,851],
["Kurator biriktirilmagan","2026-08",5899,2847,574,1815,432,1918,929,2166,1486],
["Fotimabonu Abdulkhakova","2026-09",247,87,129,51,6,182,73,14,8],
["Dilafruz Shokirova","2026-09",240,130,107,55,19,167,100,18,11],
["Marjona Pardayeva","2026-09",233,96,122,61,18,147,61,25,17],
["Madina Normatova","2026-09",206,81,106,68,11,107,50,31,20],
["Shaxlo Ziyodova","2026-09",202,104,73,16,3,158,78,28,23],
["Jasmina Tolibova","2026-09",195,84,118,83,31,95,48,17,5],
["Xalima Ismoiljonova","2026-09",141,42,75,56,3,62,24,23,15],
["Kurator biriktirilmagan","2026-09",92,40,24,1,0,17,8,74,32]
];

// CRM ning bugungi holati (sana filtriga bog'liq emas): faol guruh va faol o'quvchi
const PR_CURATOR_ROSTER = {
  "Marjona Pardayeva": [8,357], "Jasmina Tolibova": [7,322], "Madina Normatova": [5,306],
  "Fotimabonu Abdulkhakova": [6,303], "Dilafruz Shokirova": [4,257],
  "Xalima Ismoiljonova": [7,253], "Shaxlo Ziyodova": [5,225]
};

// Kurator × kurs (AVGUST): [kurator, kurs, jami, rad, o'quvchi, human_jami, human_rad]
const PR_CURATOR_COURSE = [
["Fotimabonu Abdulkhakova","Dasturlash kursi",7662,2766,273,2199,465],
["Fotimabonu Abdulkhakova","English",1578,926,116,307,27],
["Fotimabonu Abdulkhakova","Suniy Intellekt",395,22,52,395,22],
["Fotimabonu Abdulkhakova","Grafik dizayn",175,30,20,175,30],
["Fotimabonu Abdulkhakova","Kompyuter Savodxonligi",120,4,18,120,4],
["Fotimabonu Abdulkhakova","Telegram Bot",70,1,8,70,1],
["Shaxlo Ziyodova","Dasturlash kursi",4696,1942,133,1007,166],
["Shaxlo Ziyodova","English",2356,1625,78,304,17],
["Shaxlo Ziyodova","Веб программирование",1752,868,60,230,32],
["Shaxlo Ziyodova","Grafik dizayn",37,21,4,37,21],
["Shaxlo Ziyodova","Suniy Intellekt",33,1,4,33,1],
["Madina Normatova","Dasturlash kursi",5380,2195,247,2137,602],
["Madina Normatova","English",1509,976,112,310,44],
["Madina Normatova","Grafik dizayn",421,133,37,420,133],
["Madina Normatova","Telegram Bot",62,1,9,62,1],
["Madina Normatova","Kompyuter Savodxonligi",62,8,12,62,8],
["Madina Normatova","Suniy Intellekt",58,3,10,58,3],
["Madina Normatova","Веб программирование",29,21,2,12,10],
["Jasmina Tolibova","Dasturlash kursi",5081,2011,255,2060,625],
["Jasmina Tolibova","English",837,454,114,277,42],
["Jasmina Tolibova","Kompyuter Savodxonligi",343,29,109,343,29],
["Jasmina Tolibova","Grafik dizayn",322,159,33,322,159],
["Jasmina Tolibova","Junior Kurs",317,109,31,42,9],
["Jasmina Tolibova","Suniy Intellekt",256,19,61,256,19],
["Jasmina Tolibova","Telegram Bot",101,11,19,101,11],
["Marjona Pardayeva","Dasturlash kursi",5224,2282,296,1809,682],
["Marjona Pardayeva","English",1071,631,108,239,38],
["Marjona Pardayeva","Grafik dizayn",160,54,15,160,54],
["Marjona Pardayeva","Suniy Intellekt",112,7,26,112,7],
["Marjona Pardayeva","Junior Kurs",103,69,16,48,28],
["Marjona Pardayeva","Telegram Bot",68,7,12,68,7],
["Marjona Pardayeva","Kompyuter Savodxonligi",28,6,8,27,6],
["Dilafruz Shokirova","Веб программирование",4289,1727,189,1608,450],
["Dilafruz Shokirova","Dasturlash kursi",961,347,47,439,125],
["Dilafruz Shokirova","English",448,234,53,117,12],
["Dilafruz Shokirova","Grafik dizayn",152,50,11,151,49],
["Dilafruz Shokirova","Suniy Intellekt",58,8,17,58,8],
["Dilafruz Shokirova","Kompyuter Savodxonligi",46,1,8,46,1],
["Dilafruz Shokirova","Telegram Bot",42,0,5,42,0],
["Xalima Ismoiljonova","Dasturlash kursi",1968,761,92,588,84],
["Xalima Ismoiljonova","English",1441,884,104,247,33],
["Xalima Ismoiljonova","Grafik dizayn",1016,260,84,1015,260],
["Xalima Ismoiljonova","Kompyuter Savodxonligi",326,30,50,326,30],
["Xalima Ismoiljonova","Suniy Intellekt",247,10,50,247,10],
["Xalima Ismoiljonova","Junior Kurs",180,91,13,30,6],
["Xalima Ismoiljonova","Telegram Bot",38,3,6,38,3]
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
["G","Skrinshotda kod va natija ko'rinmayapti",1176,30,"«Barcha kodlarni ochilgan fayllar bilan birga to'liq skrinshot qilib yuboring. Loyiha run qilingan holatda natija va terminal ham ko'rinishi kerak»"],
["H","Vazifa to'liq bajarilmagan",732,5,"«Siz vazifani to'liq bajarmagansiz. Topshiriq shartlarini diqqat bilan o'rganib chiqib, qayta bajarishga harakat qiling»"],
["C","Boshqa / noto'g'ri material yuborilgan",563,24,"«Siz berilgan vazifa o'rniga boshqa material/rasm yuborgansiz»"],
["Z","Boshqa — bir martalik shaxsiy izoh",420,6,"Har biri 1–2 marta uchraydigan qisqa izohlar: «terminal qani?», «shartdagidek qiling», «kreativ post yarating»"],
["L","Vazifa bajarilmagan / yuklanmagan",382,5,"«Vazifa bajarilmagan!», «Shu vazifani bajaring», «Vazifani yuklang»"],
["A","O'zi bajarmagan / AI bilan yozgan",371,0,"«Siz topshiriqni sun'iy intellekt (AI) yordamida bajargansiz. Vazifani mustaqil ravishda ishlab, qayta yuboring»"],
["F","Kodda xato / noto'g'ri teg",361,12,"«Siz kodlarni xato yozgansiz — kodlarni tozalab boshqatdan yozib chiqing», «img tegidan noto'g'ri tartibda foydalangansiz»"],
["B","Bo'sh yoki ko'rinmaydigan vazifa",195,0,"«Siz bo'sh vazifani yuborgansiz. Agar bu holat yana takrorlansa, sizdan coin yechib olinishi mumkin»"],
["K","Shart bo'yicha bajarilmagan",176,0,"«Amaliy ish shartida so'ralgan ishni yuboring!», «Shartda ko'rsatilganidek qiling»"],
["I","Havola / URL yuborilmagan",170,7,"«Bu yerga vazifaning url/havolasini tashlashingiz kerak», «Figma ssilkasini yuboring»"],
["J","Format talabi buzilgan",78,1,"«Video tayyorlang», «Uy ishini daftarga yozib qiling», «Prezentatsiya qilib yuklang», «Blender dasturida bajaring»"],
["M","Izohsiz yoki tushunarsiz izoh",58,1,"«?», «hop», «1234» — 6 belgidan qisqa izohlar"],
["D","Bir xil ishni tuzatmasdan takroran yuborish",53,0,"«Siz bir xil bo'lgan vazifani to'g'rilamasdan qayta-qayta yuborganligingiz uchun sizdan coinlar ayriladi»"],
["N","Kuratorga / mentorga murojaat qilish so'ralgan",47,0,"«Kuratorga murojaat qiling, sizga mentor bilan suhbat darsi qo'yib berishadi»"],
["E","Telefonda bajarilgan",34,0,"«React modulidan boshlab telefonda bajarilgan topshiriqlar qabul qilinmaydi»"]
];
const PR_REASONS_HUMAN_TOTAL = { aug: 4816, sep: 91 };

// Kurator × sabab (AVGUST, faqat mentor rad etishlari): [kurator, {kod: soni}]
const PR_CURATOR_REASONS = [
["Fotimabonu Abdulkhakova",{G:111,C:96,H:94,F:60,A:35,L:32,K:24,I:23,B:16,Z:44,D:4,J:4,N:3,M:2,E:1}],
["Marjona Pardayeva",{G:270,C:109,H:109,A:52,L:49,F:44,B:30,I:28,K:21,D:16,J:10,N:9,M:9,Z:64,E:3}],
["Madina Normatova",{G:225,C:99,H:94,A:65,L:62,F:36,I:31,K:28,B:22,E:20,J:14,D:11,M:11,N:8,Z:75}],
["Jasmina Tolibova",{G:211,C:125,H:118,L:101,A:81,I:44,K:36,F:30,B:25,M:15,N:11,E:8,J:5,D:3,Z:81}],
["Dilafruz Shokirova",{G:188,H:134,F:66,C:57,L:31,A:26,B:26,I:16,K:16,N:8,D:8,J:4,M:4,Z:61}],
["Xalima Ismoiljonova",{A:77,L:71,C:46,H:41,G:39,K:33,B:23,I:20,J:20,F:8,M:7,N:5,D:2,Z:38}],
["Shaxlo Ziyodova",{F:76,H:67,B:17,J:15,L:13,K:10,A:8,G:5,D:5,C:4,I:2,M:3,Z:12}]
];

// AI tekshiruvining rad etish sabablari. AI izohi har topshiriq uchun alohida
// yoziladi (uzun, takrorlanmaydigan matn), shu sababli bu ham kalit so'z bilan
// toifalangan. Avgustda 12 852 rad etishning 98.6% i toifaga tushdi.
// [kod, sabab, avgust, sentyabr]
const PR_REASONS_AI = [
["A7","Kerakli teg ishlatilmagan",2665,45],
["A3","HTML struktura xatosi (<html> / <head> / <body>)",2217,92],
["A2","CSS ulanmagan yoki <style> noto'g'ri joyda",2077,100],
["A5","JavaScript talablari bajarilmagan (o'zgaruvchi, console.log, shart operatori)",1583,59],
["A4","Bootstrap noto'g'ri ulangan",1451,47],
["A8","Element / class talabi bajarilmagan",1004,22],
["A1","Vazifa bajarilmagan yoki kod bo'sh",891,45],
["A6","Talab qilingan miqdorda element yo'q («kamida 3 ta div»)",637,14],
["A9","Kodda boshqa xato",142,4],
["AZ","Boshqa",185,9]
];
const PR_REASONS_AI_TOTAL = { aug: 12852, sep: 437 };

// Ovozli javob avtotekshiruvi (English) — ikki sabab: yozuv sifati va talaffuz.
const PR_REASONS_VOICE = [
["V1","Ovoz umuman aniqlanmadi (mikrofon / yozuv sifati)",307,2],
["V2","So'zlarning bir qismi noto'g'ri aytilgan yoki aytilmagan",6697,129]
];
const PR_REASONS_VOICE_TOTAL = { aug: 7004, sep: 131 };

// Tekshiruvchilar (odam): [ism, rol, oy, jami, rad, o'quvchi]
const PR_REVIEWERS = [
["Diyorbek Kozibayev","Support Mentor","2026-08",14030,3412,1810],
["Jamoliddin Isaboyev","Super o'qituvchi","2026-08",2147,475,1165],
["Munisa Zokirjonova","Super o'qituvchi","2026-08",1962,189,674],
["Ahror Avazov","Super o'qituvchi","2026-08",1617,454,213],
["Shoxruzabonu Ismailova","Support Mentor","2026-08",781,271,190],
["Maftuna Azimjonova","Team Lead","2026-08",43,8,18],
["Boshqalar (4 xodim + tizim)","—","2026-08",32,6,0],
["Diyorbek Kozibayev","Support Mentor","2026-09",314,79,245],
["Ahror Avazov","Super o'qituvchi","2026-09",67,12,57],
["Munisa Zokirjonova","Super o'qituvchi","2026-09",9,0,9],
["Jamoliddin Isaboyev","Super o'qituvchi","2026-09",1,0,1]
];

// Toifalash qoidalari — sayt ustida ochiq ko'rsatiladi
const PR_RULES = [
  ["Rad etilish foizi", "rad etilgan / (rad etilgan + qabul qilingan) × 100. Hali tekshirilmagan ('uploaded') va eski 'old_approved' qatorlar mahrajga ham, suratga ham kirmaydi."],
  ["Birlik", "Bitta qator = o'quvchining bitta topshirig'i (bitta yuborishi). Bitta vazifani 5 marta yuborsa — 5 qator."],
  ["Zanjir", "«O'quvchi × vazifa» juftligi. Takroriy rad etish shu birlik ustidan hisoblanadi."],
  ["Blockly avto-qabul", "teacher_id = 1, izoh 'blockly-game' — o'yin turidagi vazifalarni tizim avtomatik qabul qiladi va hech qachon rad etmaydi (avgustda 17 147 qator, 1 tasi rad etilgan). Barcha foizlardan CHIQARILGAN, aks holda rad etish foizi soxta pasayadi."],
  ["Mentor tekshiruvi", "teacher_id > 1 — tirik xodim tekshirgan va izoh yozgan."],
  ["AI tekshiruvi", "teacher_id = 0, review_source = 'ai' — 3-avgustda ishga tushgan, kod (compiler) turidagi vazifalarni tekshiradi."],
  ["Ovoz avtotekshiruvi", "teacher_id = 0, review_source bo'sh — English kursidagi ovozli javoblarni tekshiradi."],
  ["Kurator", "O'quvchining faol obunasidagi guruhning ADMIN_ID xodimi. Bir o'quvchida bitta kurator."],
  ["Sabab toifasi", "Erkin matnli izoh kalit so'zlar bo'yicha prioritetli tartibda toifalanadi; bir izoh faqat bitta toifaga tushadi."]
];

// ---------------------------------------------------------------------------
// HAJM: "o'zi qancha amaliy bor edi?" — bosh kartadagi 57 617 soni nimadan
// qolgani. Davr: 1–31 avgust 2026 (created_at bo'yicha). Snapshot 2026-09-02.
// ---------------------------------------------------------------------------
const PR_VOLUME = {
  aug: {
    rows: 74830,          // avgustda yuborilgan barcha amaliy topshiriq qatori
    blockly: 17176,       // shundan blockly o'yin — tizim avtomatik qabul qiladi
    oldApproved: 37,      // eski tizimdan qolgan 'old_approved' status
    pending: 29,          // hali tekshirilmagan ('uploaded')
    reviewed: 57617,      // TEKSHIRILGAN — barcha foizlarning mahraji
    rejected: 24671,
    students: 2418,       // amaliy ish topshirgan turli o'quvchi
    questions: 546,       // avgustda ishlatilgan turli amaliy vazifa
    chains: 33624         // o'quvchi × vazifa juftligi
  },
  // Platformada mavjud (faol) amaliy vazifalar — kurs rejasidagi soni,
  // avgustda ishlatilganidan ko'p, chunki hamma guruh hamma modulga yetmagan.
  catalog: {
    total: 1022,
    byType: [["Fayl / rasm yuklash (input-file)", 641], ["Kod yozish (compiler)", 299], ["Ovozli javob (voice)", 42], ["Matnli javob (text)", 40]],
    blockly: 169,
    byCourse: [["WebStart", 328], ["Веб программирование", 234], ["Dasturlash kursi", 191], ["Grafik dizayn", 101], ["English", 35], ["Junior Kurs", 17], ["Telegram Bot", 12], ["Kompyuter Savodxonligi", 11], ["Suniy Intellekt", 10]]
  }
};
