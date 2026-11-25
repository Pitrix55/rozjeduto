// Orientační výkon komponent ve hrách.
// Skóre jsou odhady podle veřejně publikovaných testů, srovnané na jednu stupnici:
//   grafiky:   GeForce GTX 1060 6GB = 100
//   procesory: Intel Core i5-8400   = 100
// Vyšší číslo = výkonnější. Slouží jen k porovnání s požadavky her, ne k přesnému měření FPS.
// Položky s hidden:true nejdou vybrat jako vlastní sestava – popisují obecné požadavky typu
// „dvoujádrový procesor 2 GHz“, které některé hry uvádějí místo konkrétního modelu, nebo
// překlepy z požadavků her (např. „R7 270X“, ve skutečnosti R9 270X).
// Názvy používané v data/games.js neměň – hry se na ně odkazují.

const partList = rows => rows.map(([name, score, hidden]) => ({ name, score, hidden: !!hidden }));

globalThis.GPUS = partList([
  // ===== NVIDIA – stolní =====
  // RTX 50
  ["RTX 5090", 760], ["RTX 5080", 530], ["RTX 5070 Ti", 470], ["RTX 5070", 380], ["RTX 5060 Ti", 300], ["RTX 5060", 255], ["RTX 5050", 190],
  // RTX 40
  ["RTX 4090", 620], ["RTX 4080 Super", 490], ["RTX 4080", 480], ["RTX 4070 Ti Super", 420], ["RTX 4070 Ti", 395], ["RTX 4070 Super", 375], ["RTX 4070", 320],
  ["RTX 4060 Ti 16GB", 262], ["RTX 4060 Ti", 260], ["RTX 4060", 215],
  // RTX 30
  ["RTX 3090 Ti", 400], ["RTX 3090", 365], ["RTX 3080 Ti", 355], ["RTX 3080 12GB", 335], ["RTX 3080", 320], ["RTX 3070 Ti", 270], ["RTX 3070", 255],
  ["RTX 3060 Ti", 225], ["RTX 3060", 180], ["RTX 3060 8GB", 165], ["RTX 3050", 135], ["RTX 3050 6GB", 105],
  // RTX 20
  ["Titan RTX", 285], ["RTX 2080 Ti", 270], ["RTX 2080 Super", 225], ["RTX 2080", 215], ["RTX 2070 Super", 200], ["RTX 2070", 175], ["RTX 2060 Super", 172], ["RTX 2060 12GB", 160], ["RTX 2060", 150],
  // GTX 16
  ["GTX 1660 Ti", 125], ["GTX 1660 Super", 124], ["GTX 1660", 110], ["GTX 1650 Super", 92], ["GTX 1650", 72], ["GTX 1630", 45],
  // GTX 10
  ["Titan Xp", 215], ["GTX 1080 Ti", 205], ["GTX 1080", 160], ["GTX 1070 Ti", 148], ["GTX 1070", 130], ["GTX 1060 6GB", 100], ["GTX 1060 5GB", 96], ["GTX 1060 3GB", 92],
  ["GTX 1050 Ti", 60], ["GTX 1050 3GB", 55], ["GTX 1050", 50], ["GT 1030", 25],
  // GTX 900
  ["GTX Titan X", 130], ["GTX 980 Ti", 128], ["GTX 980", 100], ["GTX 970", 85], ["GTX 960", 58], ["GTX 950", 50],
  // GTX 700 / 750
  ["GTX Titan", 75], ["GTX 780 Ti", 80], ["GTX 780", 70], ["GTX 770", 60], ["GTX 760", 50], ["GTX 750 Ti", 33], ["GTX 750", 28], ["GTX 745", 20], ["GT 740", 18], ["GT 730", 10], ["GT 710", 6],
  // GTX 600
  ["GTX 690", 75], ["GTX 680", 58], ["GTX 670", 54], ["GTX 660 Ti", 48], ["GTX 660", 42], ["GTX 650 Ti Boost", 38], ["GTX 650 Ti", 30], ["GTX 650", 22], ["GT 640", 14], ["GT 630", 9],
  // GTX 500 / 400
  ["GTX 590", 55], ["GTX 580", 40], ["GTX 570", 36], ["GTX 560 Ti", 32], ["GTX 560", 30], ["GTX 550 Ti", 22], ["GT 520", 5],
  ["GTX 480", 36], ["GTX 470", 33], ["GTX 465", 30], ["GTX 460", 28], ["GTS 450", 20],
  // starší GeForce
  ["GTX 285", 22], ["GTX 280", 20], ["GTX 260", 17], ["GTS 250", 14], ["GeForce 9800 GTX", 16], ["GeForce 9800 GT", 14], ["GeForce 9600 GT", 10],
  ["GeForce 8800 GTX", 14], ["GeForce 8800 GTS", 12], ["GeForce 8800 GT", 13], ["GeForce 9500 GT", 6], ["GeForce 8600 GT", 6], ["GeForce 8500 GT", 4], ["GT 240", 7], ["GT 220", 5],
  ["GeForce 7900 GT", 3], ["GeForce 7800 GT", 3], ["GeForce 7600 GT", 3], ["GeForce 6800", 2], ["GeForce 6600", 2],

  // ===== NVIDIA – notebooky =====
  ["RTX 5090 Laptop", 420], ["RTX 5080 Laptop", 360], ["RTX 5070 Ti Laptop", 290], ["RTX 5070 Laptop", 240], ["RTX 5060 Laptop", 215],
  ["RTX 4090 Laptop", 380], ["RTX 4080 Laptop", 330], ["RTX 4070 Laptop", 240], ["RTX 4060 Laptop", 205], ["RTX 4050 Laptop", 175],
  ["RTX 3080 Ti Laptop", 270], ["RTX 3080 Laptop", 240], ["RTX 3070 Ti Laptop", 225], ["RTX 3070 Laptop", 210], ["RTX 3060 Laptop", 165], ["RTX 3050 Ti Laptop", 115], ["RTX 3050 Laptop", 105],
  ["RTX 2080 Laptop", 190], ["RTX 2070 Laptop", 165], ["RTX 2060 Laptop", 135],
  ["GTX 1660 Ti Laptop", 110], ["GTX 1650 Ti Laptop", 70], ["GTX 1650 Laptop", 62], ["GTX 1070 Laptop", 120], ["GTX 1060 Laptop", 90], ["GTX 1050 Ti Laptop", 55], ["GTX 1050 Laptop", 45],
  ["MX550", 32], ["MX450", 30], ["MX350", 20], ["MX250", 18], ["MX150", 17],

  // ===== AMD Radeon – stolní =====
  // RX 9000
  ["RX 9070 XT", 470], ["RX 9070", 420], ["RX 9060 XT", 290], ["RX 9060 XT 8GB", 280],
  // RX 7000
  ["RX 7900 XTX", 520], ["RX 7900 XT", 450], ["RX 7900 GRE", 390], ["RX 7800 XT", 360], ["RX 7700 XT", 300], ["RX 7600 XT", 225], ["RX 7600", 215],
  // RX 6000
  ["RX 6950 XT", 385], ["RX 6900 XT", 370], ["RX 6800 XT", 345], ["RX 6800", 300], ["RX 6750 XT", 265], ["RX 6750 GRE", 245], ["RX 6700 XT", 250], ["RX 6700", 230],
  ["RX 6650 XT", 215], ["RX 6600 XT", 205], ["RX 6600", 180], ["RX 6500 XT", 75], ["RX 6400", 62],
  // RX 5000
  ["RX 5700 XT", 185], ["RX 5700", 165], ["RX 5600 XT", 150], ["RX 5600", 140], ["RX 5500 XT", 105], ["RX 5300", 85],
  // Vega / Radeon VII
  ["Radeon VII", 190], ["RX Vega 64", 155], ["RX Vega 56", 140],
  // RX 400 / 500
  ["RX 590", 112], ["RX 580", 102], ["RX 580 2048SP", 92], ["RX 570", 92], ["RX 560", 52], ["RX 550", 30], ["RX 480", 100], ["RX 470", 90], ["RX 460", 45],
  // R9 / R7 300 a Fury
  ["R9 Fury X", 125], ["R9 Fury", 115], ["R9 Nano", 112], ["R9 390X", 92], ["R9 390", 85], ["R9 380X", 68], ["R9 380", 62], ["R7 370", 45], ["R7 360", 30],
  // R9 / R7 200
  ["R9 295X2", 110], ["R9 290X", 80], ["R9 290", 75], ["R9 285", 60], ["R9 280X", 63], ["R9 280", 55], ["R9 270X", 48], ["R9 270", 44],
  ["R7 265", 38], ["R7 260X", 33], ["R7 260", 28], ["R7 250", 16], ["R7 240", 10],
  ["R7 270X", 48, true],
  // HD 7000 / 8000
  ["HD 7990", 110], ["HD 7970 GHz Edition", 68], ["HD 7970", 63], ["HD 7950", 55], ["HD 7870", 48], ["HD 8870", 48], ["HD 7850", 40], ["HD 7790", 35], ["HD 7770", 25], ["HD 7750", 22],
  // HD 6000 / 5000 / 4000 a starší
  ["HD 6990", 60], ["HD 6970", 36], ["HD 6950", 33], ["HD 6870", 30], ["HD 6850", 26], ["HD 6790", 22], ["HD 6770", 18], ["HD 6670", 11], ["HD 6570", 8],
  ["HD 5970", 50], ["HD 5870", 30], ["HD 5850", 26], ["HD 5830", 22], ["HD 5770", 16], ["HD 5750", 14], ["HD 5670", 9],
  ["HD 4890", 24], ["HD 4870", 22], ["HD 4850", 18], ["HD 4770", 16], ["HD 4670", 8],
  ["HD 4650", 6], ["HD 5450", 3], ["HD 3870", 9], ["HD 3650", 6], ["HD 2600 XT", 5], ["X1950 XTX", 4], ["X1900", 4], ["X800", 2], ["X1300", 2],

  // ===== AMD Radeon – notebooky =====
  ["RX 7900M", 400], ["RX 7600S", 180], ["RX 6850M XT", 280], ["RX 6800M", 260], ["RX 6700M", 220], ["RX 6600M", 190], ["RX 6500M", 70], ["RX 5600M", 120], ["RX 5500M", 85],

  // ===== Intel Arc =====
  ["Arc B580", 220], ["Arc B570", 195], ["Arc A770", 190], ["Arc A750", 175], ["Arc A580", 150], ["Arc A380", 65], ["Arc A310", 40],

  // ===== integrované grafiky =====
  ["Radeon 890M (integrovaná)", 75], ["Radeon 880M (integrovaná)", 66], ["Radeon 780M (integrovaná)", 60], ["Radeon 760M (integrovaná)", 52], ["Radeon 680M (integrovaná)", 50],
  ["Radeon Vega 11 (integrovaná)", 26], ["Radeon Vega 8 (integrovaná)", 22], ["Radeon Vega 7 (integrovaná)", 26],
  ["Intel Arc 140V (integrovaná)", 62], ["Intel Arc (Core Ultra, integrovaná)", 50], ["Iris Xe (integrovaná)", 30], ["Iris Plus (integrovaná)", 20],
  ["Intel UHD 770 (integrovaná)", 18], ["Intel UHD 730 (integrovaná)", 16], ["Intel UHD 630 (integrovaná)", 15], ["Intel UHD 620 (integrovaná)", 12],
  ["Intel HD 630 (integrovaná)", 14], ["Intel HD 530 (integrovaná)", 13], ["Intel HD 4600 (integrovaná)", 11], ["Intel HD 4000 (integrovaná)", 8],
  ["Adreno X1 (Snapdragon X)", 30],

  // ===== kapesní herní PC =====
  ["Steam Deck", 45], ["ROG Ally (Z1 Extreme)", 62], ["ROG Ally X", 64], ["ROG Ally (Z1)", 40], ["Legion Go (Z1 Extreme)", 62], ["MSI Claw (Core Ultra 7)", 50],

  // ===== obecné požadavky (nejdou vybrat) =====
  ["obecná grafika: 256 MB, Shader Model 3", 3, true], ["obecná grafika: 1 GB, DirectX 10", 10, true], ["obecná grafika: 2 GB, DirectX 10", 16, true],
  ["obecná grafika: 1 GB, DirectX 11", 20, true], ["obecná grafika: DirectX 11", 12, true]
]);

globalThis.CPUS = partList([
  // ===== Intel Core Ultra (2024–) =====
  ["Core Ultra 9 285K", 235], ["Core Ultra 7 265K", 215], ["Core Ultra 7 265KF", 215], ["Core Ultra 5 245K", 195], ["Core Ultra 5 245KF", 195], ["Core Ultra 5 225F", 165],
  // ===== 14. generace =====
  ["Core i9-14900KS", 233], ["Core i9-14900K", 230], ["Core i9-14900KF", 230], ["Core i7-14700K", 220], ["Core i7-14700KF", 220], ["Core i7-14700", 205], ["Core i7-14700F", 205],
  ["Core i5-14600K", 200], ["Core i5-14600KF", 200], ["Core i5-14500", 178], ["Core i5-14400", 165], ["Core i5-14400F", 165], ["Core i3-14100", 145], ["Core i3-14100F", 145],
  // ===== 13. generace =====
  ["Core i9-13900KS", 228], ["Core i9-13900K", 225], ["Core i9-13900KF", 225], ["Core i9-13900", 210], ["Core i7-13700K", 210], ["Core i7-13700KF", 210], ["Core i7-13700", 195], ["Core i7-13700F", 195],
  ["Core i5-13600K", 195], ["Core i5-13600KF", 195], ["Core i5-13500", 172], ["Core i5-13400", 160], ["Core i5-13400F", 160], ["Core i3-13100", 140], ["Core i3-13100F", 140],
  // ===== 12. generace =====
  ["Core i9-12900KS", 205], ["Core i9-12900K", 200], ["Core i9-12900KF", 200], ["Core i9-12900", 192], ["Core i7-12700K", 185], ["Core i7-12700KF", 185], ["Core i7-12700", 175], ["Core i7-12700F", 175],
  ["Core i5-12600K", 175], ["Core i5-12600KF", 175], ["Core i5-12600", 158], ["Core i5-12500", 155], ["Core i5-12400", 150], ["Core i5-12400F", 150],
  ["Core i3-12100", 135], ["Core i3-12100F", 135], ["Pentium Gold G7400", 85], ["Celeron G6900", 65],
  // ===== 11. generace =====
  ["Core i9-11900K", 155], ["Core i9-11900", 150], ["Core i7-11700K", 150], ["Core i7-11700", 145], ["Core i7-11700F", 145],
  ["Core i5-11600K", 140], ["Core i5-11600", 136], ["Core i5-11500", 132], ["Core i5-11400", 128], ["Core i5-11400F", 128],
  // ===== 10. generace =====
  ["Core i9-10900K", 145], ["Core i9-10850K", 143], ["Core i9-10900", 140], ["Core i9-10900F", 140], ["Core i7-10700K", 138], ["Core i7-10700KF", 138], ["Core i7-10700", 133], ["Core i7-10700F", 133],
  ["Core i5-10600K", 125], ["Core i5-10600KF", 125], ["Core i5-10600", 120], ["Core i5-10500", 115], ["Core i5-10400", 112], ["Core i5-10400F", 112],
  ["Core i3-10300", 98], ["Core i3-10105F", 96], ["Core i3-10100", 95], ["Core i3-10100F", 95], ["Pentium Gold G6400", 62], ["Celeron G5905", 40],
  // ===== 9. generace =====
  ["Core i9-9900KS", 140], ["Core i9-9900K", 138], ["Core i9-9900KF", 138], ["Core i9-9900", 134], ["Core i7-9700K", 130], ["Core i7-9700KF", 130], ["Core i7-9700", 125], ["Core i7-9700F", 125],
  ["Core i5-9600K", 115], ["Core i5-9600KF", 115], ["Core i5-9600", 112], ["Core i5-9500", 108], ["Core i5-9500F", 108], ["Core i5-9400", 104], ["Core i5-9400F", 104],
  ["Core i3-9350K", 92], ["Core i3-9350F", 92], ["Core i3-9100", 88], ["Core i3-9100F", 88],
  // ===== 8. generace =====
  ["Core i7-8086K", 122], ["Core i7-8700K", 120], ["Core i7-8700", 115], ["Core i5-8600K", 108], ["Core i5-8600", 106], ["Core i5-8500", 102], ["Core i5-8400", 100],
  ["Core i3-8350K", 88], ["Core i3-8300", 85], ["Core i3-8100", 82], ["Pentium Gold G5600", 60], ["Pentium Gold G5500", 58], ["Pentium Gold G5400", 55], ["Celeron G4900", 42],
  // ===== 7. generace =====
  ["Core i7-7700K", 100], ["Core i7-7700", 95], ["Core i5-7600K", 88], ["Core i5-7600", 85], ["Core i5-7500", 80], ["Core i5-7400", 76],
  ["Core i3-7350K", 70], ["Core i3-7300", 67], ["Core i3-7100", 64], ["Pentium G4620", 53], ["Pentium G4600", 52], ["Pentium G4560", 50], ["Celeron G3930", 34],
  // ===== 6. generace =====
  ["Core i7-6700K", 92], ["Core i7-6700", 88], ["Core i5-6600K", 80], ["Core i5-6600", 76], ["Core i5-6500", 74], ["Core i5-6402P", 71], ["Core i5-6400", 70],
  ["Core i3-6320", 63], ["Core i3-6300", 60], ["Core i3-6100", 57], ["Pentium G4500", 47], ["Pentium G4400", 45], ["Celeron G3900", 36],
  // ===== Intel HEDT (X-series) =====
  ["Core i9-7900X", 110], ["Core i7-7820X", 105], ["Core i7-7800X", 98], ["Core i7-6900K", 96], ["Core i7-6850K", 94], ["Core i7-6800K", 92],
  ["Core i7-5960X", 88], ["Core i7-5930K", 85], ["Core i7-5820K", 82], ["Core i7-4930K", 72], ["Core i7-3930K", 66],
  // ===== 5. a 4. generace =====
  ["Core i7-5775C", 85], ["Core i5-5675C", 75],
  ["Core i7-4790K", 88], ["Core i7-4790", 84], ["Core i7-4770K", 80], ["Core i7-4770", 79], ["Core i5-4690K", 72], ["Core i5-4690", 70], ["Core i5-4670K", 69], ["Core i5-4670", 68],
  ["Core i5-4590", 67], ["Core i5-4570", 66], ["Core i5-4460", 64], ["Core i5-4440", 63], ["Core i5-4430", 62],
  ["Core i3-4370", 56], ["Core i3-4360", 55], ["Core i3-4170", 53], ["Core i3-4160", 52], ["Core i3-4150", 51], ["Core i3-4130", 50],
  ["Pentium G3258", 40], ["Pentium G3260", 38], ["Pentium G3250", 36], ["Pentium G3220", 35], ["Celeron G1840", 29], ["Celeron G1820", 28],
  // ===== 3. generace =====
  ["Core i7-3770K", 72], ["Core i7-3770", 70], ["Core i5-3570K", 64], ["Core i5-3570", 63], ["Core i5-3550", 62], ["Core i5-3470", 60], ["Core i5-3450", 59], ["Core i5-3350P", 57], ["Core i5-3330", 56],
  ["Core i3-3250", 46], ["Core i3-3240", 45], ["Core i3-3225", 44], ["Core i3-3220", 44], ["Pentium G2030", 33], ["Pentium G2020", 32], ["Celeron G1620", 26], ["Celeron G1610", 25],
  // ===== 2. generace =====
  ["Core i7-2700K", 66], ["Core i7-2600K", 64], ["Core i7-2600", 62], ["Core i5-2550K", 60], ["Core i5-2500K", 58], ["Core i5-2500", 56], ["Core i5-2400", 54], ["Core i5-2320", 51], ["Core i5-2310", 50], ["Core i5-2300", 50],
  ["Core i3-2130", 43], ["Core i3-2120", 42], ["Core i3-2100", 40], ["Core i3-2100T", 36], ["Pentium G860", 33], ["Pentium G850", 32], ["Pentium G840", 31], ["Pentium G630", 28], ["Pentium G620", 27], ["Celeron G540", 23], ["Celeron G530", 22],
  // ===== 1. generace a Core 2 =====
  ["Core i7-980X", 48], ["Core i7-950", 38], ["Core i7-920", 36], ["Core i7-870", 44], ["Core i7-860", 42], ["Core i5-760", 39], ["Core i5-750", 38], ["Core i5-650", 30], ["Core i3-540", 27], ["Core i3-530", 26],
  ["Core 2 Quad Q9650", 30], ["Core 2 Quad Q9550", 29], ["Core 2 Quad Q9400", 26], ["Core 2 Quad Q8200", 23], ["Core 2 Quad Q6600", 22],
  ["Core 2 Duo E8500", 19], ["Core 2 Duo E8400", 18], ["Core 2 Duo E7500", 16], ["Core 2 Duo E6600", 14],
  // ===== Intel – notebooky =====
  ["Core Ultra 9 275HX", 225], ["Core Ultra 9 185H", 160], ["Core Ultra 7 255H", 165], ["Core Ultra 7 155H", 150], ["Core Ultra 7 258V", 140], ["Core Ultra 5 125H", 135],
  ["Core i9-14900HX", 220], ["Core i7-14700HX", 205], ["Core i9-13980HX", 215], ["Core i9-13900HX", 210], ["Core i7-13650HX", 185], ["Core i7-13700H", 170], ["Core i5-13500H", 150], ["Core i5-13420H", 135],
  ["Core i9-12900H", 170], ["Core i7-12700H", 160], ["Core i7-12650H", 150], ["Core i5-12500H", 140], ["Core i5-12450H", 130], ["Core i7-1255U", 100], ["Core i5-1235U", 95],
  ["Core i9-11980HK", 145], ["Core i7-11800H", 135], ["Core i5-11400H", 120], ["Core i7-1165G7", 92], ["Core i5-1135G7", 85],
  ["Core i9-10980HK", 115], ["Core i7-10870H", 110], ["Core i7-10750H", 105], ["Core i5-10300H", 95], ["Core i7-10510U", 72], ["Core i5-10210U", 68],
  ["Core i9-9880H", 105], ["Core i7-9750H", 100], ["Core i5-9300H", 90], ["Core i7-8750H", 95], ["Core i5-8300H", 85], ["Core i7-8550U", 64], ["Core i5-8250U", 60],
  ["Core i7-7700HQ", 78], ["Core i5-7300HQ", 68], ["Core i7-6700HQ", 72], ["Core i7-4720HQ", 65], ["Core i7-4710HQ", 63],

  // ===== AMD Ryzen 9000 =====
  ["Ryzen 9 9950X3D", 262], ["Ryzen 9 9950X", 225], ["Ryzen 9 9900X3D", 245], ["Ryzen 9 9900X", 220], ["Ryzen 7 9800X3D", 260], ["Ryzen 7 9700X", 215], ["Ryzen 5 9600X", 205], ["Ryzen 5 9600", 200],
  // ===== Ryzen 8000G / 7000 =====
  ["Ryzen 7 8700G", 170], ["Ryzen 5 8600G", 160], ["Ryzen 5 8500G", 145], ["Ryzen 5 8400F", 155],
  ["Ryzen 9 7950X3D", 240], ["Ryzen 9 7950X", 210], ["Ryzen 9 7900X3D", 215], ["Ryzen 9 7900X", 205], ["Ryzen 9 7900", 200],
  ["Ryzen 7 7800X3D", 235], ["Ryzen 7 7700X", 200], ["Ryzen 7 7700", 195], ["Ryzen 5 7600X3D", 225], ["Ryzen 5 7600X", 190], ["Ryzen 5 7600", 185], ["Ryzen 5 7500F", 182],
  // ===== Ryzen 5000 =====
  ["Ryzen 9 5950X", 162], ["Ryzen 9 5900X", 160], ["Ryzen 9 5900XT", 162], ["Ryzen 7 5800X3D", 190], ["Ryzen 7 5800X", 158], ["Ryzen 7 5800XT", 160], ["Ryzen 7 5700X3D", 180], ["Ryzen 7 5700X", 155], ["Ryzen 7 5700G", 140], ["Ryzen 7 5700", 138],
  ["Ryzen 5 5600X3D", 175], ["Ryzen 5 5600X", 150], ["Ryzen 5 5600", 145], ["Ryzen 5 5600G", 132], ["Ryzen 5 5600GT", 133], ["Ryzen 5 5500", 135], ["Ryzen 5 5500GT", 130], ["Ryzen 5 4600G", 122], ["Ryzen 5 4500", 120],
  // ===== Ryzen 3000 =====
  ["Ryzen 9 3950X", 132], ["Ryzen 9 3900X", 130], ["Ryzen 7 3800XT", 130], ["Ryzen 7 3800X", 128], ["Ryzen 7 3700X", 125],
  ["Ryzen 5 3600XT", 124], ["Ryzen 5 3600X", 122], ["Ryzen 5 3600", 118], ["Ryzen 5 3500X", 108], ["Ryzen 5 3500", 104], ["Ryzen 5 3400G", 88],
  ["Ryzen 3 3300X", 105], ["Ryzen 3 3100", 90], ["Ryzen 3 3200G", 82],
  // ===== Ryzen 2000 =====
  ["Ryzen 7 2700X", 108], ["Ryzen 7 2700", 103], ["Ryzen 5 2600X", 104], ["Ryzen 5 2600", 98], ["Ryzen 5 2500X", 92], ["Ryzen 5 2400G", 82], ["Ryzen 3 2200G", 72],
  // ===== Ryzen 1000 =====
  ["Ryzen 7 1800X", 98], ["Ryzen 7 1700X", 95], ["Ryzen 7 1700", 92], ["Ryzen 5 1600 AF", 98], ["Ryzen 5 1600X", 92], ["Ryzen 5 1600", 88], ["Ryzen 5 1500X", 80], ["Ryzen 5 1400", 75],
  ["Ryzen 3 1300X", 74], ["Ryzen 3 1200", 70],
  // ===== Athlon a APU =====
  ["Athlon 3000G", 50], ["Athlon 200GE", 48], ["A12-9800", 46], ["A10-9700", 44], ["A8-9600", 40], ["A10-7860K", 42], ["A10-7850K", 42], ["A8-7600", 38],
  ["Athlon X4 860K", 40], ["Athlon X4 845", 41], ["Athlon II X4 640", 26],
  // ===== FX =====
  ["FX-9590", 64], ["FX-9370", 62], ["FX-8370", 58], ["FX-8350", 56], ["FX-8320", 52], ["FX-8320E", 51], ["FX-8300", 50], ["FX-8150", 48], ["FX-8120", 46],
  ["FX-6350", 48], ["FX-6300", 46], ["FX-6100", 40], ["FX-4350", 40], ["FX-4300", 38], ["FX-4100", 34],
  // ===== Phenom =====
  ["Phenom II X6 1100T", 36], ["Phenom II X6 1090T", 35], ["Phenom II X6 1055T", 32],
  ["Phenom II X4 975", 32], ["Phenom II X4 965", 31], ["Phenom II X4 955", 30], ["Phenom II X4 945", 28], ["Phenom II X4 940", 27], ["Phenom 9850", 20], ["Phenom X3 8650", 16],
  // ===== AMD – notebooky =====
  ["Ryzen AI 9 HX 370", 175], ["Ryzen 9 7945HX", 210], ["Ryzen 9 8945HS", 168], ["Ryzen 7 8845HS", 165], ["Ryzen 9 7940HS", 165], ["Ryzen 7 7840HS", 160], ["Ryzen 7 7735HS", 135], ["Ryzen 5 7535HS", 125],
  ["Ryzen 9 6900HX", 150], ["Ryzen 7 6800H", 145], ["Ryzen 5 6600H", 130], ["Ryzen 9 5900HX", 140], ["Ryzen 7 5800H", 130], ["Ryzen 5 5600H", 115], ["Ryzen 7 5700U", 100], ["Ryzen 5 5500U", 95],
  ["Ryzen 7 4800H", 110], ["Ryzen 5 4600H", 100], ["Ryzen 7 3750H", 70], ["Ryzen 5 3550H", 65],

  // ===== kapesní herní PC a ARM =====
  ["ROG Ally X", 122], ["ROG Ally (Z1 Extreme)", 120], ["Legion Go (Z1 Extreme)", 120], ["ROG Ally (Z1)", 100], ["MSI Claw (Core Ultra 7)", 125], ["Steam Deck", 70],
  ["Snapdragon X Elite", 90], ["Snapdragon X Plus", 85],

  // ===== obecné požadavky (nejdou vybrat) =====
  ["obecný procesor: x64 s SSE2", 10, true], ["obecný jednojádrový procesor (Pentium 4)", 10, true], ["obecný procesor: 2 GHz", 14, true], ["obecný dvoujádrový procesor 2,4 GHz", 18, true],
  ["obecný dvoujádrový procesor 2,8 GHz", 22, true], ["obecný dvoujádrový procesor 3 GHz", 24, true],
  ["obecný čtyřjádrový procesor 2,6 GHz", 30, true], ["obecný čtyřjádrový procesor 3 GHz", 45, true], ["obecný čtyřjádrový procesor 3,2 GHz", 50, true],
  ["obecný procesor: 4 jádra, 4 GHz (2020+)", 110, true], ["Athlon čtyřjádrový", 26, true],
  // a family without a model ("Intel Core i5") – counted as an early generation of that family
  ["obecný Core i3", 44, true], ["obecný Core i5", 54, true], ["obecný Core i7", 62, true], ["obecný Core i9", 110, true],
  ["obecný Ryzen 3", 70, true], ["obecný Ryzen 5", 75, true], ["obecný Ryzen 7", 92, true], ["obecný Ryzen 9", 130, true]
]);

// Short names people type that should map to one specific model.
globalThis.PART_ALIASES = {
  gpu: { "GTX 1060": "GTX 1060 6GB", "HD 2600": "HD 2600 XT", "7900 GT": "GeForce 7900 GT", "8800 GT": "GeForce 8800 GT", "9800 GT": "GeForce 9800 GT", "RTX 3080 10GB": "RTX 3080", "RX 9060 XT 16GB": "RX 9060 XT", "Vega 64": "RX Vega 64", "Vega 56": "RX Vega 56", "Deck": "Steam Deck" },
  cpu: { "Deck": "Steam Deck" }
};
