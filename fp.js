/* 藥劑師：整理藥房 —— 第一人稱 3D 版（室內）
   在溫暖的木造藥房裡走動，把散亂、東倒西歪躺在工作桌上的乾藥材撿起來，
   拉開百子櫃對應的抽屜放進去，把每一格都收滿。無計時、無失敗。 */

import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// 場景內中文字型：霞鶩文楷（手寫楷體，古風藥籤感）。載入失敗則退回系統字型。
const CN_FONT = '"LXGW WenKai TC", "Microsoft JhengHei", serif';

// ---------- 藥草資料 ----------
// 50 種中醫常用藥材（shape = 乾藥材外型；clue = 格子上的藥性謎面，· 為換行）
const HERBS = [
  // 根莖 / 樹皮類
  { id: "renshen",    name: "人參",   icon: "🫚", color: 0xe0cfa0, shape: "root",     clue: "大補元氣·百草之王·形如人" },
  { id: "danggui",    name: "當歸",   icon: "🫚", color: 0xd8a86a, shape: "root",     clue: "補血調經·婦科聖藥·根分頭尾" },
  { id: "huangqi",    name: "黃耆",   icon: "🫚", color: 0xd8c48a, shape: "root",     clue: "補氣固表·切片入湯·味甜根長" },
  { id: "gancao",     name: "甘草",   icon: "🫚", color: 0xc8a85a, shape: "root",     clue: "調和諸藥·味道回甜·人稱國老" },
  { id: "baizhu",     name: "白朮",   icon: "🫚", color: 0xcdb27a, shape: "root",     clue: "健脾燥濕·根莖團塊·斷面氣香" },
  { id: "chuanxiong", name: "川芎",   icon: "🫚", color: 0xb59a6a, shape: "root",     clue: "活血行氣·頭痛要藥·產於四川" },
  { id: "danshen",    name: "丹參",   icon: "🫚", color: 0xa8432a, shape: "root",     clue: "活血安神·色紅入心·一味四物" },
  { id: "dangshen",   name: "黨參",   icon: "🫚", color: 0xcdb888, shape: "root",     clue: "補中益氣·平民人參·條根有紋" },
  { id: "shanyao",    name: "山藥",   icon: "🫚", color: 0xeae0c8, shape: "root",     clue: "補脾益腎·餐桌常見·色白黏滑" },
  { id: "gegen",      name: "葛根",   icon: "🫚", color: 0xe2d4a8, shape: "root",     clue: "解肌退熱·亦能解酒·粉白根塊" },
  { id: "banlangen",  name: "板藍根", icon: "🫚", color: 0xb0a070, shape: "root",     clue: "清熱解毒·防疫常用·灰黃根條" },
  { id: "rougui",     name: "肉桂",   icon: "🪵", color: 0x7a3a22, shape: "root",     clue: "溫中散寒·桂樹之皮·辛甜捲筒" },
  { id: "duzhong",    name: "杜仲",   icon: "🪵", color: 0x6a4a32, shape: "root",     clue: "補肝強腎·折斷膠絲·樹皮入藥" },
  { id: "jiegeng",    name: "桔梗",   icon: "🪻", color: 0x6f7fd0, shape: "tulip",    clue: "宣肺利咽·紫色鈴花·朝鮮涼拌" },
  // 果實 / 種子類
  { id: "gouqi",      name: "枸杞",   icon: "🔴", color: 0xd2342a, shape: "berry",    clue: "紅果明目·泡茶入粥·寧夏盛產" },
  { id: "hongzao",    name: "紅棗",   icon: "🔴", color: 0xb33a22, shape: "berry",    clue: "補中益氣·煮湯香甜·皺皮紅果" },
  { id: "shanzha",    name: "山楂",   icon: "🔴", color: 0xc23a2a, shape: "berry",    clue: "消食化積·酸甜·糖葫蘆原料" },
  { id: "wuweizi",    name: "五味子", icon: "🔴", color: 0x7a2a2a, shape: "berry",    clue: "斂肺澀精·五味俱全·暗紅小果" },
  { id: "suanzaoren", name: "酸棗仁", icon: "🟤", color: 0xa86a3a, shape: "berry",    clue: "養心安神·助眠·扁圓種仁" },
  { id: "juemingzi",  name: "決明子", icon: "🟤", color: 0x6a4a2a, shape: "berry",    clue: "清肝明目·泡茶·菱形亮籽" },
  { id: "lianzi",     name: "蓮子",   icon: "⚪", color: 0xe6dcc0, shape: "berry",    clue: "養心益腎·入羹湯·白胖種子" },
  { id: "sangshen",   name: "桑椹",   icon: "🫐", color: 0x4a2a4a, shape: "berry",    clue: "滋陰補血·紫黑多汁·樹莓之狀" },
  { id: "chenpi",     name: "陳皮",   icon: "🟠", color: 0xc86a2a, shape: "berry",    clue: "理氣化痰·橘皮陳放·愈久愈香" },
  { id: "lianqiao",   name: "連翹",   icon: "🟤", color: 0xb5934a, shape: "berry",    clue: "清熱解毒·瘡家聖藥·紡錘裂果" },
  { id: "luoshen",    name: "洛神花", icon: "🌺", color: 0xc0203a, shape: "rose",     clue: "酸甜泡茶·暗紅花萼·南國風味" },
  // 菌類
  { id: "lingzhi",    name: "靈芝",   icon: "🍄", color: 0x8a3a22, shape: "mushroom", clue: "安神仙草·菌蓋雲紋·瑞氣祥兆" },
  { id: "fuling",     name: "茯苓",   icon: "🍄", color: 0xcdbfa6, shape: "mushroom", clue: "利水健脾·松根而生·白色塊菌" },
  { id: "zhuling",    name: "豬苓",   icon: "🍄", color: 0x5a4632, shape: "mushroom", clue: "利水滲濕·黑褐塊狀·地下菌核" },
  // 花類
  { id: "juhua",      name: "菊花",   icon: "🌼", color: 0xf0c93a, shape: "sun",      clue: "清肝明目·重陽入茶·黃白小花" },
  { id: "jinyinhua",  name: "金銀花", icon: "🌸", color: 0xf2e8c0, shape: "daisy",    clue: "清熱解毒·一藤兩色·別名忍冬" },
  { id: "honghua",    name: "紅花",   icon: "🌺", color: 0xe0552a, shape: "rose",     clue: "活血化瘀·紅色細絲·亦可染色" },
  { id: "guihua",     name: "桂花",   icon: "🌼", color: 0xf0b24a, shape: "sun",      clue: "中秋飄香·細小金花·釀蜜入糕" },
  { id: "zicaoju",    name: "紫錐菊", icon: "🌸", color: 0xc060a0, shape: "daisy",    clue: "增強免疫·西洋草藥·紫瓣錐心" },
  { id: "pugongying", name: "蒲公英", icon: "🌻", color: 0xf6d63a, shape: "daisy",    clue: "清熱消腫·黃花白絮·隨風而飛" },
  { id: "meiguihua",  name: "玫瑰花", icon: "🌹", color: 0xd06a8a, shape: "rose",     clue: "疏肝理氣·芬芳花蕾·色澤粉紅" },
  { id: "huaihua",    name: "槐花",   icon: "🌼", color: 0xe8e0a0, shape: "sun",      clue: "涼血止血·槐樹之花·淡黃米粒" },
  { id: "kuandong",   name: "款冬花", icon: "🪻", color: 0x9a6a5a, shape: "tulip",    clue: "潤肺止咳·早春先花·紫褐花蕾" },
  { id: "hehuan",     name: "合歡花", icon: "🌸", color: 0xe69ab0, shape: "lavender", clue: "解鬱安神·絨毛粉花·別名夜合" },
  { id: "xunyicao",   name: "薰衣草", icon: "🪻", color: 0x9a7fc0, shape: "lavender", clue: "安神助眠·西方紫穗·氣味芬芳" },
  // 葉 / 全草類
  { id: "bohe",       name: "薄荷",   icon: "🌿", color: 0x5aa46e, shape: "mint",     clue: "辛涼透氣·揉葉清香·入夏消暑" },
  { id: "aicao",      name: "艾草",   icon: "🍃", color: 0x8fa86a, shape: "fern",     clue: "端午懸門·溫經可灸·氣味濃烈" },
  { id: "zisu",       name: "紫蘇",   icon: "🌿", color: 0x9a6fb0, shape: "mint",     clue: "解表散寒·配蟹去腥·葉背帶紫" },
  { id: "huoxiang",   name: "藿香",   icon: "💜", color: 0x9a7fc0, shape: "lavender", clue: "解暑化濕·正氣要藥·芳香撲鼻" },
  { id: "cheqian",    name: "車前草", icon: "☘️", color: 0x6aa050, shape: "clover",   clue: "利尿通淋·路邊野草·葉脈如弓" },
  { id: "heye",       name: "荷葉",   icon: "🍃", color: 0x4a7a4a, shape: "fern",     clue: "清暑利濕·田田大葉·包飯增香" },
  { id: "sangye",     name: "桑葉",   icon: "🍃", color: 0x5a8a4a, shape: "mint",     clue: "疏散風熱·蠶之所食·經霜更佳" },
  { id: "peilan",     name: "佩蘭",   icon: "🌿", color: 0x7a9a5a, shape: "lavender", clue: "化濕醒脾·氣味芳香·近似澤蘭" },
  { id: "yuxingcao",  name: "魚腥草", icon: "☘️", color: 0x6a9a5a, shape: "clover",   clue: "清熱解毒·搓之腥氣·涼拌野菜" },
  { id: "danzhuye",   name: "淡竹葉", icon: "🎋", color: 0x7aa05a, shape: "fern",     clue: "清心利尿·細長之葉·非竹之葉" },
  { id: "yimucao",    name: "益母草", icon: "🌿", color: 0x8a6a9a, shape: "mint",     clue: "活血調經·婦人之草·方莖開花" },
  // 西洋葉草（料理 / 藥用香草）
  { id: "rosemary",   name: "迷迭香", icon: "🌿", color: 0x6f8a6a, shape: "fern" },
  { id: "thyme",      name: "百里香", icon: "🌿", color: 0x8a9a5a, shape: "mint" },
  { id: "sage",       name: "鼠尾草", icon: "🌿", color: 0x9aaa8a, shape: "clover" },
  { id: "oregano",    name: "奧勒岡", icon: "🌿", color: 0x7a8a4a, shape: "mint",   clue: "抗菌健胃·地中海香料·披薩常用" },
  { id: "basil",      name: "羅勒",   icon: "🌿", color: 0x4a8a3a, shape: "mint",   clue: "健胃驅風·義式青醬·九層塔近親" },
  { id: "marjoram",   name: "馬鬱蘭", icon: "🌿", color: 0x8a9a6a, shape: "mint",   clue: "舒緩安神·甜香草·近似奧勒岡" },
  { id: "lemonbalm",  name: "香蜂草", icon: "🌿", color: 0x6aa04a, shape: "mint" },
  { id: "tarragon",   name: "龍蒿",   icon: "🌿", color: 0x7a9a55, shape: "fern",   clue: "開胃助消化·法式香草·細長之葉" },
  { id: "bay",        name: "月桂葉", icon: "🍃", color: 0x5a7a45, shape: "clover" },
  { id: "parsley",    name: "歐芹",   icon: "🌿", color: 0x4a8a3a, shape: "clover", clue: "利尿清口氣·西餐擺盤·捲葉翠綠" },
  // 西洋花籽
  { id: "chamomile",  name: "洋甘菊", icon: "🌼", color: 0xeee2b0, shape: "daisy" },
  { id: "calendula",  name: "金盞花", icon: "🌼", color: 0xf0a040, shape: "sun",    clue: "消炎癒膚·橙黃花瓣·入藥護膚" },
  { id: "stjohns",    name: "聖約翰草",icon: "🌼", color: 0xe8c84a, shape: "daisy",  clue: "舒緩情緒·黃花五瓣·西方解鬱" },
  { id: "dill",       name: "蒔蘿",   icon: "🌿", color: 0x8aaa6a, shape: "fern",   clue: "健胃驅風·羽狀細葉·醃魚提香" },
  { id: "fennel",     name: "茴香",   icon: "🌿", color: 0x9aaa6a, shape: "fern" },
  { id: "caraway",    name: "葛縷子", icon: "🟤", color: 0x9a7a4a, shape: "berry" },
  // 擴充至 100 味（溫熱）
  { id: "ganjiang",   name: "乾薑",   color: 0xc89a5a, shape: "root" },
  { id: "fuzi",       name: "附子",   color: 0x8a6a4a, shape: "root",   clue: "回陽救逆·大熱有毒·須經炮製" },
  { id: "banxia",     name: "半夏",   color: 0xcdbb8a, shape: "root",   clue: "燥濕化痰·降逆止嘔·塊莖須製" },
  { id: "heshouwu",   name: "何首烏", color: 0x5a3a28, shape: "root",   clue: "補益精血·烏鬚黑髮·赤褐塊根" },
  { id: "houpo",      name: "厚朴",   color: 0x6a4a32, shape: "root",   clue: "行氣燥濕·樹皮厚實·味苦而辛" },
  { id: "longyan",    name: "龍眼肉", color: 0x7a4a2a, shape: "berry",  clue: "補益心脾·養血安神·桂圓乾肉" },
  { id: "wuzhuyu",    name: "吳茱萸", color: 0x6a5a2a, shape: "berry",  clue: "散寒止痛·味極辛苦·暗綠小果" },
  { id: "sharen",     name: "砂仁",   color: 0x9a7a4a, shape: "berry",  clue: "化濕行氣·芳香安胎·陽春小果" },
  { id: "xingren",    name: "杏仁",   color: 0xcdb088, shape: "berry",  clue: "止咳平喘·潤腸通便·杏核之仁" },
  { id: "dongchong",  name: "冬蟲夏草",color: 0x9a7a3a, shape: "mushroom",clue: "補腎益肺·蟲體生草·高原珍品" },
  { id: "lemongrass", name: "檸檬草", color: 0x9aaa6a, shape: "fern",   clue: "健胃驅風·檸檬清香·泰式香茅" },
  { id: "fenugreek",  name: "葫蘆巴", color: 0xb59a5a, shape: "berry" },
  // 平和
  { id: "maidong",    name: "麥冬",   color: 0xe6e0c8, shape: "root",   clue: "養陰生津·潤肺清心·紡錘白根" },
  { id: "tianma",     name: "天麻",   color: 0xd8c8a0, shape: "root",   clue: "息風止痙·治眩暈頭痛·無葉而生" },
  { id: "niuxi",      name: "牛膝",   color: 0xb09a6a, shape: "root",   clue: "活血通經·強筋健骨·莖節如膝" },
  { id: "baiguo",     name: "白果",   color: 0xd8d0a8, shape: "berry",  clue: "斂肺定喘·銀杏之果·有小毒" },
  { id: "qianshi",    name: "芡實",   color: 0xe0d6b8, shape: "berry",  clue: "益腎固精·水生而長·圓白種仁" },
  { id: "yiner",      name: "銀耳",   color: 0xeae0cf, shape: "mushroom",clue: "滋陰潤肺·白色膠質·菌形如花" },
  { id: "muer",       name: "木耳",   color: 0x3a2a28, shape: "mushroom",clue: "補氣養血·黑色膠質·木上而生" },
  { id: "wumei",      name: "烏梅",   color: 0x3a2a22, shape: "berry",  clue: "斂肺澀腸·味酸·煙燻黑梅" },
  { id: "valerian",   name: "纈草",   color: 0xb59a72, shape: "root" },
  { id: "baihe",      name: "百合",   color: 0xe8dcc8, shape: "root",   clue: "養陰潤肺·清心安神·鱗片如瓣" },
  // 寒涼
  { id: "huanglian",  name: "黃連",   color: 0xc8a83a, shape: "root",   clue: "清熱燥濕·味極苦·根黃連珠" },
  { id: "huangqin",   name: "黃芩",   color: 0xb89a4a, shape: "root",   clue: "清熱燥濕·瀉火安胎·根黃中空" },
  { id: "dahuang",    name: "大黃",   color: 0xa86a3a, shape: "root" },
  { id: "zhimu",      name: "知母",   color: 0xd8c8a0, shape: "root",   clue: "清熱瀉火·滋陰潤燥·根莖毛茸" },
  { id: "baishao",    name: "白芍",   color: 0xe0d4c0, shape: "root",   clue: "養血斂陰·柔肝止痛·芍藥白根" },
  { id: "chaihu",     name: "柴胡",   color: 0xc0a878, shape: "root",   clue: "疏散退熱·疏肝解鬱·和解少陽" },
  { id: "zhizi",      name: "梔子",   color: 0xd88a3a, shape: "berry",  clue: "瀉火除煩·橙紅之果·可作染料" },
  { id: "niubangzi",  name: "牛蒡子", color: 0x8a7a5a, shape: "berry",  clue: "疏散風熱·宣肺利咽·牛蒡之子" },
  { id: "yiyiren",    name: "薏苡仁", color: 0xe0dac4, shape: "berry",  clue: "利水滲濕·健脾止瀉·白圓薏米" },
  { id: "spearmint",  name: "綠薄荷", color: 0x4aa05a, shape: "mint" },
  { id: "yarrow",     name: "西洋蓍草",color: 0xd8d0b0, shape: "daisy" },
  { id: "nettle",     name: "蕁麻",   color: 0x4a7a3a, shape: "clover", clue: "利尿補血·葉緣螫毛·觸之刺癢" },
];

// ---------- 每味藥的一句話功效（撿起時浮出藥籤卡） ----------
const HERB_DESC = {
  // 根莖 / 樹皮
  renshen: "大補元氣，安神益智，生津止渴。",
  danggui: "補血活血，調經止痛，婦科聖藥。",
  huangqi: "補氣固表，利水消腫，托瘡生肌。",
  gancao: "補脾益氣，緩急止痛，調和諸藥。",
  baizhu: "健脾益氣，燥濕利水，止汗安胎。",
  chuanxiong: "活血行氣，祛風止痛，治頭痛要藥。",
  danshen: "活血祛瘀，涼血消癰，安神除煩。",
  dangshen: "補中益氣，健脾益肺。",
  shanyao: "補脾養胃，生津益肺，補腎澀精。",
  gegen: "解肌退熱，生津止渴，亦能解酒。",
  banlangen: "清熱解毒，涼血利咽。",
  rougui: "補火助陽，溫中散寒，活血止痛。",
  duzhong: "補肝益腎，強筋健骨，安胎。",
  jiegeng: "宣肺利咽，祛痰排膿。",
  // 果實 / 種子
  gouqi: "滋補肝腎，益精明目。",
  hongzao: "補中益氣，養血安神。",
  shanzha: "消食化積，行氣散瘀。",
  wuweizi: "斂肺滋腎，生津斂汗，寧心安神。",
  suanzaoren: "養心補肝，寧心安神，斂汗助眠。",
  juemingzi: "清肝明目，潤腸通便。",
  lianzi: "補脾止瀉，養心安神，益腎澀精。",
  sangshen: "滋陰補血，生津潤燥。",
  chenpi: "理氣健脾，燥濕化痰。",
  lianqiao: "清熱解毒，消腫散結。",
  luoshen: "生津止渴，斂肺消暑，色赤味酸。",
  // 菌類
  lingzhi: "補氣安神，止咳平喘。",
  fuling: "利水滲濕，健脾寧心。",
  zhuling: "利水滲濕，消腫退黃。",
  // 花類
  juhua: "疏散風熱，平肝明目，清熱解毒。",
  jinyinhua: "清熱解毒，疏散風熱。",
  honghua: "活血通經，散瘀止痛。",
  guihua: "溫肺散寒，化痰止痛，芳香怡人。",
  zicaoju: "增強免疫，清熱解毒。",
  pugongying: "清熱解毒，消腫散結，利尿通淋。",
  meiguihua: "行氣解鬱，和血止痛。",
  huaihua: "涼血止血，清肝瀉火。",
  kuandong: "潤肺下氣，止咳化痰。",
  hehuan: "解鬱安神，理氣開胃。",
  xunyicao: "安神助眠，舒緩放鬆。",
  // 葉 / 全草
  bohe: "疏散風熱，清利頭目，疏肝行氣。",
  aicao: "溫經止血，散寒止痛，可作艾灸。",
  zisu: "解表散寒，行氣和胃，解魚蟹毒。",
  huoxiang: "化濕解暑，和中止嘔。",
  cheqian: "利尿通淋，清熱明目，化痰。",
  heye: "清暑利濕，升發清陽，涼血止血。",
  sangye: "疏散風熱，清肺潤燥，平肝明目。",
  peilan: "化濕醒脾，解暑辟穢。",
  yuxingcao: "清熱解毒，消癰排膿，利尿。",
  danzhuye: "清熱瀉火，除煩，利尿。",
  yimucao: "活血調經，利尿消腫，婦人良藥。",
  // 西洋葉草
  rosemary: "提神醒腦，幫助消化，香氣清新。",
  thyme: "殺菌防腐，止咳化痰。",
  sage: "抗菌消炎，幫助消化，收斂。",
  oregano: "抗菌健胃，地中海料理香料。",
  basil: "健胃驅風，舒緩消化不良。",
  marjoram: "舒緩安神，幫助消化。",
  lemonbalm: "安神舒緩，幫助入眠。",
  tarragon: "開胃助消化，提味香草。",
  bay: "健胃驅風，燉煮提香。",
  parsley: "利尿清口氣，富含維生素。",
  // 西洋花籽
  chamomile: "安神助眠，舒緩腸胃。",
  calendula: "消炎癒膚，舒緩肌膚不適。",
  stjohns: "舒緩情緒，安定心神。",
  dill: "健胃驅風，助消化。",
  fennel: "溫中散寒，理氣和胃。",
  caraway: "健胃驅風，緩解脹氣。",
  // 擴充・溫熱
  ganjiang: "溫中散寒，回陽通脈。",
  fuzi: "回陽救逆，補火助陽，散寒止痛（須炮製）。",
  banxia: "燥濕化痰，降逆止嘔，消痞散結。",
  heshouwu: "補益精血，烏鬚黑髮。",
  houpo: "行氣燥濕，降逆平喘。",
  longyan: "補益心脾，養血安神。",
  wuzhuyu: "散寒止痛，降逆止嘔。",
  sharen: "化濕行氣，溫中止瀉，安胎。",
  xingren: "止咳平喘，潤腸通便。",
  dongchong: "補腎益肺，止血化痰。",
  lemongrass: "健胃驅風，提神，香氣清爽。",
  fenugreek: "溫腎助陽，散寒，健胃。",
  // 擴充・平和
  maidong: "養陰生津，潤肺清心。",
  tianma: "息風止痙，平肝潛陽，治眩暈頭痛。",
  niuxi: "活血通經，補肝腎，強筋骨。",
  baiguo: "斂肺定喘，止帶縮尿（有小毒）。",
  qianshi: "益腎固精，健脾止瀉。",
  yiner: "滋陰潤肺，養胃生津。",
  muer: "補氣養血，潤肺潤腸。",
  wumei: "斂肺止咳，澀腸，生津止渴。",
  valerian: "安神鎮靜，幫助入眠。",
  baihe: "養陰潤肺，清心安神。",
  // 擴充・寒涼
  huanglian: "清熱燥濕，瀉火解毒，味極苦。",
  huangqin: "清熱燥濕，瀉火解毒，止血安胎。",
  dahuang: "瀉熱通便，涼血解毒，逐瘀通經。",
  zhimu: "清熱瀉火，滋陰潤燥。",
  baishao: "養血斂陰，柔肝止痛。",
  chaihu: "疏散退熱，疏肝解鬱，升舉陽氣。",
  zhizi: "瀉火除煩，清熱利濕，涼血解毒。",
  niubangzi: "疏散風熱，宣肺利咽，解毒消腫。",
  yiyiren: "利水滲濕，健脾止瀉，清熱排膿。",
  spearmint: "清涼解暑，疏風，清新口氣。",
  yarrow: "止血消炎，舒緩感冒。",
  nettle: "利尿補血，舒緩過敏。",
};

// ---------- 真實名方（今日委託：照方抓藥；藥材皆取自上方 100 味） ----------
const FORMULAS = [
  { name: "四君子湯", cure: "補氣健脾，治脾胃氣虛、倦怠乏力", herbs: ["renshen","baizhu","fuling","gancao"],
    who: "面色蒼白的綢緞莊掌櫃，說近來總提不起勁。" },
  { name: "六君子湯", cure: "益氣健脾、燥濕化痰，治氣虛痰多", herbs: ["renshen","baizhu","fuling","gancao","chenpi","banxia"],
    who: "脾胃虛弱、食少痰多的老學究。" },
  { name: "異功散", cure: "健脾益氣、理氣和胃，治食少腹脹", herbs: ["renshen","baizhu","fuling","gancao","chenpi"],
    who: "面黃不思飲食的小兒，由母親抱來。" },
  { name: "生脈散", cure: "益氣生津、斂陰止汗，治暑熱耗氣", herbs: ["renshen","maidong","wuweizi"],
    who: "跑堂的小哥滿頭大汗，直喊口渴。" },
  { name: "酸棗仁湯", cure: "養血安神，治虛煩不眠、心悸盜汗", herbs: ["suanzaoren","zhimu","fuling","chuanxiong","gancao"],
    who: "夜夜難眠的繡娘，眼下一片烏青。" },
  { name: "二陳湯", cure: "燥濕化痰、理氣和中，治痰多咳嗽", herbs: ["banxia","chenpi","fuling","gancao"],
    who: "撐船的老把式咳了半月，痰多胸悶。" },
  { name: "理中丸", cure: "溫中健脾，治脾胃虛寒、腹痛吐瀉", herbs: ["renshen","ganjiang","baizhu","gancao"],
    who: "受了寒、腹痛便溏的腳夫。" },
  { name: "四逆湯", cure: "回陽救逆，治四肢厥冷、陽氣衰微", herbs: ["fuzi","ganjiang","gancao"],
    who: "渾身發冷、手足冰涼的病重老翁，家人急來求藥。" },
  { name: "當歸補血湯", cure: "補氣生血，治血虛發熱、面白乏力", herbs: ["huangqi","danggui"],
    who: "產後體虛、面色無華的少婦。" },
  { name: "左金丸", cure: "清肝瀉火、降逆止嘔，治脅痛吞酸", herbs: ["huanglian","wuzhuyu"],
    who: "動輒泛酸、脅肋脹痛的帳房先生。" },
  { name: "芍藥甘草湯", cure: "緩急止痛，治腿腳攣急、脘腹疼痛", herbs: ["baishao","gancao"],
    who: "小腿抽筋、夜裡疼醒的老農。" },
  { name: "桔梗湯", cure: "宣肺利咽，治咽喉腫痛、咳嗽", herbs: ["jiegeng","gancao"],
    who: "嗓子腫痛、說不出話的說書先生。" },
  { name: "百合知母湯", cure: "養陰清熱，治虛熱心煩、神思恍惚", herbs: ["baihe","zhimu"],
    who: "病後虛煩、坐臥不安的書生。" },
  { name: "甘草乾薑湯", cure: "溫中復陽，治虛寒、手足不溫", herbs: ["gancao","ganjiang"],
    who: "畏寒、口淡多涎的車夫。" },
  // —— 更多經典名方（組成皆取自本堂百味藥；大棗即紅棗、乾薑即本堂乾薑）——
  { name: "保元湯", cure: "補氣溫陽，治元氣虛弱、倦怠畏寒", herbs: ["renshen","huangqi","gancao","rougui"],
    who: "氣弱畏寒、說話低微的老掌櫃，動則氣喘。" },
  { name: "佛手散", cure: "養血活血、行氣調經，婦人良方（即芎歸湯）", herbs: ["danggui","chuanxiong"],
    who: "經期腹痛、面色不華的繡坊姑娘。" },
  { name: "三黃瀉心湯", cure: "瀉火解毒，治火熱亢盛、心煩吐衄", herbs: ["dahuang","huanglian","huangqin"],
    who: "面紅目赤、心煩易怒、時而鼻血的壯漢。" },
  { name: "附子理中丸", cure: "溫陽散寒、補益脾胃，治脾胃虛寒甚", herbs: ["fuzi","renshen","ganjiang","baizhu","gancao"],
    who: "腹冷喜暖、下利清穀、手足不溫的老農。" },
  { name: "葛根芩連湯", cure: "解表清裡，治身熱下利、協熱泄瀉", herbs: ["gegen","huangqin","huanglian","gancao"],
    who: "暑天貪涼、身熱腹瀉、肛門灼熱的少年。" },
  { name: "黃芩湯", cure: "清熱止利，治熱瀉熱痢、腹痛", herbs: ["huangqin","baishao","gancao","hongzao"],
    who: "腹痛下痢、瀉而臭穢、口苦的趕考書生。" },
  { name: "交泰丸", cure: "交通心腎，治心腎不交、心煩失眠", herbs: ["huanglian","rougui"],
    who: "夜不能寐、心煩口乾、多夢的賬房先生。" },
  { name: "戊己丸", cure: "疏肝清熱、和胃止痛，治肝脾不和", herbs: ["huanglian","wuzhuyu","baishao"],
    who: "脅脹泛酸、腹痛腸鳴的綢緞莊老闆娘。" },
  { name: "半夏瀉心湯", cure: "寒熱平調、消痞散結，治心下痞滿嘔利", herbs: ["banxia","huangqin","huanglian","renshen","ganjiang","gancao","hongzao"],
    who: "心下痞悶、嘔惡腸鳴、寒熱夾雜的船家。" },
  { name: "麥門冬湯", cure: "潤肺養胃、降逆下氣，治虛熱咳逆、咽乾", herbs: ["maidong","banxia","renshen","gancao","hongzao"],
    who: "乾咳少痰、咽乾氣逆、病後虛羸的私塾先生。" },
  { name: "連理湯", cure: "溫中清熱，治脾胃虛寒兼濕熱", herbs: ["renshen","baizhu","ganjiang","gancao","huanglian"],
    who: "脾胃虛寒卻又口瘡泛酸的中年茶商。" },
];
const DAY_COUNT = 4;   // 一天接幾帖藥方

// ---------- 本草圖鑑：已備 Köhler 公有領域繪圖的藥草（學名對照） ----------
// 圖檔位於 assets/herbs/<id>.jpg；來源見 CREDITS.md
const ATLAS = [
  { id: "gancao",    latin: "Glycyrrhiza glabra" },
  { id: "dahuang",   latin: "Rheum officinale" },
  { id: "ganjiang",  latin: "Zingiber officinale" },
  { id: "rougui",    latin: "Cinnamomum verum" },
  { id: "kuandong",  latin: "Tussilago farfara" },
  { id: "pugongying",latin: "Taraxacum officinale" },
  { id: "bohe",      latin: "Mentha × piperita" },
  { id: "spearmint", latin: "Mentha viridis" },
  { id: "xunyicao",  latin: "Lavandula angustifolia" },
  { id: "fennel",    latin: "Foeniculum vulgare" },
  { id: "chamomile", latin: "Matricaria recutita" },
  { id: "rosemary",  latin: "Rosmarinus officinalis" },
  { id: "sage",      latin: "Salvia officinalis" },
  { id: "thyme",     latin: "Thymus vulgaris" },
  { id: "caraway",   latin: "Carum carvi" },
  { id: "bay",       latin: "Laurus nobilis" },
  { id: "fenugreek", latin: "Trigonella foenum-graecum" },
  { id: "valerian",  latin: "Valeriana officinalis" },
  { id: "lemonbalm", latin: "Melissa officinalis" },
  { id: "yarrow",    latin: "Achillea millefolium" },
];
const NATURE_NAME = { warm: "溫熱", neutral: "平和", cold: "寒涼" };

// ---------- 房間尺寸 ----------
const ROOM = 12, HALF = ROOM / 2, WALL_H = 4.0;

// ---------- 基礎 ----------
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x140f0a);   // 室內暖暗背景

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 100);
const controls = new PointerLockControls(camera, document.body);
controls.getObject().position.set(0, 1.6, 4);   // 站在房間中央偏前，面向後牆的百子櫃
scene.add(controls.getObject());

const mat = (hex, rough = 0.95) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough });

// ---------- 燈光（藥房暖意：避光收藥，不開窗、無日照，只用暖燈）----------
scene.add(new THREE.HemisphereLight(0xffe9cc, 0x2a221a, 0.6));
scene.add(new THREE.AmbientLight(0xfff0e0, 0.5));
// 自天花板斜灑的暖燈（兼作陰影來源）——非日照，免得曬壞藥材
const sun = new THREE.DirectionalLight(0xffd9a8, 0.7);
sun.position.set(2.5, 8, 0.5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 32 });
sun.shadow.bias = -0.0004;
sun.target.position.set(0, 1, -2); scene.add(sun.target); scene.add(sun);
// 天花板暖光吊燈（室內主光）
const lamp = new THREE.PointLight(0xffc27a, 2.2, 26, 1.6);
lamp.position.set(0, 3.4, -2); scene.add(lamp);
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14),
  new THREE.MeshStandardMaterial({ color: 0xffd79a, emissive: 0xffa64d, emissiveIntensity: 1.3 }));
bulb.position.copy(lamp.position); scene.add(bulb);
const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), mat(0x2a2118, 0.9));
cord.position.set(0, 3.85, -2); scene.add(cord);

// ---------- 牆面碰撞盒（XZ 軸對齊矩形） ----------
const blockers = [];

// ---------- 蓋房間（地板 + 四面牆 + 天花板 + 窗 + 裝飾） ----------
function buildRoom() {
  // 木地板（拼接條紋貼圖）
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM, ROOM), planks());
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // 天花板
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM, ROOM), mat(0x3a2c20, 0.98));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = WALL_H; scene.add(ceil);
  // 天花板橫樑
  for (let z = -HALF + 1.2; z <= HALF - 1.0; z += 2.4) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(ROOM, 0.18, 0.16), mat(0x4a3422, 0.92));
    beam.position.set(0, WALL_H - 0.1, z); scene.add(beam);
  }

  // 四面牆（暖色灰泥木骨架）
  const wallMat = mat(0xc2a982, 0.97);   // 較亮的暖色灰泥，整體更通透
  const wall = (w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), wallMat);
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m);
  };
  wall(ROOM, WALL_H, 0, WALL_H / 2, -HALF, 0);          // 後牆
  wall(ROOM, WALL_H, 0, WALL_H / 2, HALF, 0);           // 前牆
  wall(ROOM, WALL_H, -HALF, WALL_H / 2, 0, Math.PI / 2);// 左牆
  wall(ROOM, WALL_H, HALF, WALL_H / 2, 0, Math.PI / 2); // 右牆
  // 踢腳板
  const baseMat = mat(0x5e4128, 0.9);
  [[ROOM, 0, -HALF + 0.11, 0], [ROOM, 0, HALF - 0.11, 0],
   [ROOM, -HALF + 0.11, 0, Math.PI / 2], [ROOM, HALF - 0.11, 0, Math.PI / 2]]
    .forEach(([w, x, z, ry]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, 0.1), baseMat);
      b.position.set(x, 0.14, z); b.rotation.y = ry; scene.add(b);
    });

  // 後牆不開窗（中藥需避光收存，免得日曬受潮壞掉）；改掛一方「本草堂」匾額點題
  const plaqueY = 2.85;
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.08), mat(0x4a3120, 0.7));
  plaque.position.set(0, plaqueY, -HALF + 0.12); plaque.castShadow = true; scene.add(plaque);
  const ptext = makeWallTitle("本草堂");
  ptext.scale.set(1.15, 1.15, 1); ptext.position.set(0, plaqueY, -HALF + 0.17); scene.add(ptext);

  // 前牆掛幾束風乾的藥草（裝飾）；只用「乾草」類，倒掛才合理
  const hangable = HERBS.filter((h) => ["mint", "fern", "clover", "lavender"].includes(h.shape));
  for (let i = 0; i < 7; i++) {
    const h = hangable[(Math.random() * hangable.length) | 0];
    const b = makeHerbModel(h); b.scale.setScalar(1.4);
    b.position.set(-(HALF - 1) + i * (2 * (HALF - 1) / 6), 3.1, HALF - 0.25);
    b.rotation.set(0, 0, Math.PI);   // 倒掛
    scene.add(b);
  }
  buildCabinets();
}

// 地板木條紋理
function planks() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 512;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#6b4a30"; ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    ctx.fillStyle = `hsl(28, 38%, ${24 + Math.random() * 10}%)`;
    ctx.fillRect(0, y, 512, 60);
    ctx.strokeStyle = "#2e1d10"; ctx.lineWidth = 2; ctx.strokeRect(0, y, 512, 60);
    for (let i = 0; i < 30; i++) {   // 木紋
      ctx.strokeStyle = `rgba(40,24,12,${0.05 + Math.random() * 0.12})`;
      ctx.beginPath(); ctx.moveTo(0, y + Math.random() * 60);
      ctx.bezierCurveTo(170, y + Math.random() * 60, 340, y + Math.random() * 60, 512, y + Math.random() * 60);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 4); tex.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
}

// ---------- 配藥台（客人交方處） ----------
const counterMeshes = [];
const atlasMeshes = [];     // 配藥台上的「本草圖鑑」：準星對準可翻閱
const formulaMeshes = [];   // 配藥台上的「方劑譜」：準星對準可翻閱
function buildCounter() {
  const g = new THREE.Group();
  const cz = 2.6, w = 2.2, d = 0.72, h = 0.95;
  const woodA = mat(0x5b3d29, 0.78), woodB = mat(0x6b4a35, 0.72);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodA);
  body.position.set(0, h / 2, cz); body.castShadow = body.receiveShadow = true; g.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.08, d + 0.16), woodB);
  top.position.set(0, h + 0.04, cz); top.castShadow = true; g.add(top);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.36), mat(0x7a5a36, 0.7));
  tray.position.set(0, h + 0.1, cz); g.add(tray);
  const sign = makeHeader("配藥台");
  sign.scale.set(1.1, 0.28, 1); sign.position.set(0, h + 0.36, cz - d / 2 + 0.02); g.add(sign);

  // 檯面上的「本草圖鑑」：遊戲中用準星對準、按左鍵即可翻閱收集牆（不必放開滑鼠）
  const bookY = h + 0.08;                         // 檯面上緣
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.24), mat(0x6a3320, 0.55));
  cover.position.set(-0.62, bookY + 0.035, cz); cover.castShadow = true; g.add(cover);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.05, 0.21), mat(0xefe6cf, 0.9));
  pages.position.set(-0.62, bookY + 0.035, cz); g.add(pages);
  const blabel = makeJarLabel("圖鑑");            // 浮在書上方的小金籤，標示可翻閱
  blabel.scale.set(0.24, 0.105, 1); blabel.position.set(-0.62, bookY + 0.26, cz); g.add(blabel);

  // 檯面另一側的「方劑譜」：翻閱歷來藥方（組成、功效、已學會的藥會標亮）
  const cover2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.24), mat(0x2f3a5a, 0.55));
  cover2.position.set(0.62, bookY + 0.035, cz); cover2.castShadow = true; g.add(cover2);
  const pages2 = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.05, 0.21), mat(0xefe6cf, 0.9));
  pages2.position.set(0.62, bookY + 0.035, cz); g.add(pages2);
  const blabel2 = makeJarLabel("藥方");
  blabel2.scale.set(0.24, 0.105, 1); blabel2.position.set(0.62, bookY + 0.26, cz); g.add(blabel2);
  scene.add(g);

  // 交方命中盒
  const hit = new THREE.Mesh(new THREE.BoxGeometry(w, h + 0.5, d), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(0, (h + 0.5) / 2, cz); scene.add(hit);
  hit.userData = { type: "counter" };
  counterMeshes.push(hit);
  // 圖鑑命中盒（放大好對準）
  const bhit = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.4), new THREE.MeshBasicMaterial({ visible: false }));
  bhit.position.set(-0.62, bookY + 0.12, cz); bhit.userData = { type: "atlas" }; scene.add(bhit);
  atlasMeshes.push(bhit);
  // 方劑譜命中盒
  const fhit = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.4), new THREE.MeshBasicMaterial({ visible: false }));
  fhit.position.set(0.62, bookY + 0.12, cz); fhit.userData = { type: "formula" }; scene.add(fhit);
  formulaMeshes.push(fhit);
  blockers.push({ minX: -w / 2 - 0.1, maxX: w / 2 + 0.1, minZ: cz - d / 2 - 0.2, maxZ: cz + d / 2 + 0.2 });
}

// ---------- 標籤貼圖（emoji + 名稱） ----------
function makeLabel(text, sub) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
  const ctx = cv.getContext("2d");
  // 黑底白字 + 金邊，跟謎面藥籤一致，揭曉時清楚好讀
  ctx.fillStyle = "rgba(18,16,14,0.95)";
  roundRect(ctx, 6, 6, 244, 116, 16); ctx.fill();
  ctx.strokeStyle = "rgba(231,200,115,0.95)"; ctx.lineWidth = 4; ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 4;
  ctx.fillStyle = "#ffffff"; ctx.font = "56px serif"; ctx.fillText(text, 128, sub ? 48 : 64);
  if (sub) { ctx.font = `bold 30px ${CN_FONT}`; ctx.fillStyle = "#ffe9a8"; ctx.fillText(sub, 128, 98); }
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  spr.scale.set(0.9, 0.45, 1);
  return spr;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}

// 玻璃藥罐的標籤：素雅羊皮紙藥籤，只寫藥名（無 emoji）
function makeJarLabel(name) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 96;   // 高解析，字更銳利
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#f4eed9"; roundRect(ctx, 3, 3, 250, 90, 10); ctx.fill();   // 米白紙（提亮）
  ctx.strokeStyle = "#5a3c1e"; ctx.lineWidth = 4; ctx.stroke();              // 深褐外框，與罐內物分離
  ctx.fillStyle = "#241405"; ctx.textAlign = "center"; ctx.textBaseline = "middle";   // 深褐粗字，高對比
  const fs = name.length >= 4 ? 50 : name.length === 3 ? 62 : 72;
  ctx.font = `bold ${fs}px ${CN_FONT}`;
  ctx.fillText(name, 128, 52);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  return spr;
}

// 類別牌：彩色木牌、直書類別名（掛在每一排左側）
function makeCatLabel(name, color) {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 256;
  const ctx = cv.getContext("2d");
  // 深木底牌（與木櫃同色系），只用文字顏色區分性味
  ctx.fillStyle = "#463122";
  roundRect(ctx, 8, 8, 112, 240, 16); ctx.fill();
  ctx.strokeStyle = "rgba(20,14,8,0.9)"; ctx.lineWidth = 6; ctx.stroke();                 // 外深框
  ctx.strokeStyle = "rgba(231,200,115,0.35)"; ctx.lineWidth = 2;
  roundRect(ctx, 16, 16, 96, 224, 11); ctx.stroke();                                     // 內金細框
  const c = new THREE.Color(color);
  ctx.fillStyle = `rgb(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0})`;             // 性味字色
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 4;                                // 深陰影助讀
  const chars = name.split("");
  const fs = 52, lh = fs + 8, startY = 128 - (chars.length - 1) * lh / 2;
  ctx.font = `bold ${fs}px ${CN_FONT}`;
  chars.forEach((ch, i) => ctx.fillText(ch, 64, startY + i * lh));
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  return spr;
}

// ---------- 百子櫃 + 抽屜 ----------
const state = { slots: [], herbsOnTable: [] };
const slotMeshes = [];  // 可互動：抽屜命中盒（raycast 用）
const herbMeshes = [];  // 可互動：散在桌上的乾藥材

const tableGroup = new THREE.Group();     // 地上散落的乾藥材（每輪重建）
scene.add(tableGroup);

// 依「性味（四氣）」分類：溫熱 / 平和 / 寒涼
// color = 木牌上的文字顏色（木牌底色統一為深木色，只靠字色區分性味）
const NATURES = [
  { key: "warm",    name: "溫熱", color: 0xe0a24a },   // 暖金
  { key: "neutral", name: "平和", color: 0xe8dcc0 },   // 米白
  { key: "cold",    name: "寒涼", color: 0x8fb8c4 },   // 深青
];
const NATURE_OF = {
  // 溫熱
  danggui: "warm", huangqi: "warm", baizhu: "warm", chuanxiong: "warm", rougui: "warm", duzhong: "warm",
  hongzao: "warm", shanzha: "warm", wuweizi: "warm", chenpi: "warm",
  honghua: "warm", guihua: "warm", meiguihua: "warm", kuandong: "warm",
  aicao: "warm", zisu: "warm", huoxiang: "warm",
  rosemary: "warm", thyme: "warm", sage: "warm", oregano: "warm", basil: "warm", marjoram: "warm", tarragon: "warm", bay: "warm",
  dill: "warm", fennel: "warm", caraway: "warm",
  // 平和
  renshen: "neutral", gancao: "neutral", dangshen: "neutral", shanyao: "neutral", jiegeng: "neutral",
  gouqi: "neutral", suanzaoren: "neutral", lianzi: "neutral",
  lingzhi: "neutral", fuling: "neutral", zhuling: "neutral",
  hehuan: "neutral", heye: "neutral", peilan: "neutral", parsley: "neutral",
  // 寒涼
  danshen: "cold", gegen: "cold", banlangen: "cold",
  juemingzi: "cold", sangshen: "cold", lianqiao: "cold",
  luoshen: "cold", juhua: "cold", jinyinhua: "cold", zicaoju: "cold", pugongying: "cold", huaihua: "cold", xunyicao: "cold",
  bohe: "cold", cheqian: "cold", sangye: "cold", yuxingcao: "cold", danzhuye: "cold", yimucao: "cold",
  lemonbalm: "cold", chamomile: "cold", calendula: "cold", stjohns: "cold",
  // 擴充 34 味
  ganjiang: "warm", fuzi: "warm", banxia: "warm", heshouwu: "warm", houpo: "warm",
  longyan: "warm", wuzhuyu: "warm", sharen: "warm", xingren: "warm", dongchong: "warm", lemongrass: "warm", fenugreek: "warm",
  maidong: "neutral", tianma: "neutral", niuxi: "neutral", baiguo: "neutral", qianshi: "neutral",
  yiner: "neutral", muer: "neutral", wumei: "neutral", valerian: "neutral", baihe: "neutral",
  huanglian: "cold", huangqin: "cold", dahuang: "cold", zhimu: "cold", baishao: "cold", chaihu: "cold",
  zhizi: "cold", niubangzi: "cold", yiyiren: "cold", spearmint: "cold", yarrow: "cold", nettle: "cold",
};
// 每個性味的藥材清單（依 HERBS 順序）
const NATURE_LIST = { warm: [], neutral: [], cold: [] };
HERBS.forEach((h) => { const nk = NATURE_OF[h.id]; if (nk) NATURE_LIST[nk].push(h.id); });
const MAXROW = 15;     // 一排最多幾罐，超過自動折成多排
// 玻璃藥罐架：三座，各放一種性味（左溫熱・後平和・右寒涼）
const CABS = [
  { label: "溫熱藥櫃", natures: ["warm"],    wall: "left" },
  { label: "平和藥櫃", natures: ["neutral"], wall: "back" },
  { label: "寒涼藥櫃", natures: ["cold"],    wall: "right" },
];
const JW = 0.5;        // 每罐間距（一格寬）
const JR = 0.155;      // 玻璃罐半徑
const JH = 0.34;       // 玻璃罐高
const RH = 0.56;       // 層板間距（一排高）
const SHELF_D = 0.34;  // 層架深度
const JAR_Z = 0.17;    // 罐子在層板上的 local z
const LABEL_W = 0;     // 已移除左側性味牌：置 0 讓藥罐在櫃中置中
const CAB_BASE = 0.72; // 最底排罐子的中心高
const PER_HERB = 2;    // 每種藥材 2 株 / 每罐容量 2（重質不重量）
const GLASS = new THREE.MeshStandardMaterial({ color: 0xd6ecec, roughness: 0.08, metalness: 0,
  transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
const cabContainers = [];   // 兩座櫃的容器群組（含牆面旋轉）

function clearGroup(g, arr) { while (g.children.length) g.remove(g.children[0]); arr.length = 0; }

// 橫式櫃名牌
function makeHeader(text) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 64;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "rgba(40,28,16,0.95)"; roundRect(ctx, 4, 4, 248, 56, 10); ctx.fill();
  ctx.strokeStyle = "rgba(231,200,115,0.9)"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#ffe9a8"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `bold 34px ${CN_FONT}`; ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
}

// 平貼牆面的櫃名題字（金色描字、無方框，不立體）
function makeWallTitle(text) {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 128;
  const ctx = cv.getContext("2d");
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `bold 76px ${CN_FONT}`;
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.fillStyle = "#e7c873"; ctx.fillText(text, 256, 70);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.36),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
}

// 把一個性味的藥材數量折成多排（每排不超過 MAXROW，盡量平均）
function natureRows(natureKey) {
  const C = NATURE_LIST[natureKey].length;
  const R = Math.max(1, Math.ceil(C / MAXROW));
  const base = Math.floor(C / R), extra = C % R;
  const rows = [];
  for (let r = 0; r < R; r++) rows.push({ natureKey, len: base + (r < extra ? 1 : 0) });
  return rows;
}

// 蓋兩座玻璃藥罐櫃（靜態框架，只蓋一次），各自貼到一面牆上
function buildCabinets() {
  CABS.forEach((spec) => {
    const group = new THREE.Group();
    if (spec.wall === "left") { group.position.set(-HALF + 0.32, 0, 0); group.rotation.y = Math.PI / 2; }
    else if (spec.wall === "right") { group.position.set(HALF - 0.32, 0, 0); group.rotation.y = -Math.PI / 2; }
    else { group.position.set(0, 0, -HALF + 0.32); group.rotation.y = 0; }   // 後牆
    scene.add(group);
    // 把這座櫃的各性味折成排（由下往上）
    const rows = [];
    spec.natures.forEach((nk) => natureRows(nk).forEach((r) => rows.push(r)));
    const maxLen = Math.max(...rows.map((r) => r.len));
    const W = LABEL_W + maxLen * JW;
    buildCabFrame(group, spec, rows, W);
    // 碰撞盒（世界座標）：沿牆一長條，前緣外推留站位
    const half = W / 2 + 0.1, depth = 0.32 + SHELF_D + 0.45;
    if (spec.wall === "left") blockers.push({ minX: -HALF, maxX: -HALF + depth, minZ: -half, maxZ: half });
    else if (spec.wall === "right") blockers.push({ minX: HALF - depth, maxX: HALF, minZ: -half, maxZ: half });
    else blockers.push({ minX: -half, maxX: half, minZ: -HALF, maxZ: -HALF + depth });   // 後牆
    cabContainers.push({ spec, group, rows, W });
  });
}

// 單座櫃的木框架：背板 + 層板 + 側板 + 頂冠底座 + 平貼牆面的櫃名題字
function buildCabFrame(group, spec, rows, W) {
  const woodA = mat(0x5b3d29, 0.78), woodB = mat(0x6b4a35, 0.72);
  const nrows = rows.length;
  const cabH = nrows * RH, cy = CAB_BASE + (nrows - 1) * RH / 2;
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, cabH + 0.3, 0.06), woodA);
  back.position.set(0, cy, -0.02); back.receiveShadow = true; group.add(back);
  for (let r = 0; r <= nrows; r++) {     // 層板（每排底 + 最頂）
    const board = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, 0.05, SHELF_D), woodB);
    board.position.set(0, CAB_BASE - RH / 2 + r * RH, SHELF_D / 2); board.castShadow = board.receiveShadow = true; group.add(board);
  }
  [-W / 2 - 0.03, W / 2 + 0.03].forEach((sx) => {   // 側板
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, cabH + 0.3, SHELF_D + 0.04), woodA);
    s.position.set(sx, cy, SHELF_D / 2); s.castShadow = true; group.add(s);
  });
  const crown = new THREE.Mesh(new THREE.BoxGeometry(W + 0.28, 0.16, SHELF_D + 0.2), woodB);
  crown.position.set(0, cy + cabH / 2 + 0.18, SHELF_D / 2); crown.castShadow = true; group.add(crown);
  const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.18, CAB_BASE - RH / 2, SHELF_D + 0.14), woodA);
  base.position.set(0, (CAB_BASE - RH / 2) / 2, SHELF_D / 2); base.castShadow = true; group.add(base);
  const head = makeWallTitle(spec.label);   // 櫃名：平貼牆面的金色題字（不立體）
  head.position.set(0, cy + cabH / 2 + 0.45, 0.06); group.add(head);
}

// 一輪整理：依性味把藥材的玻璃罐排進對應的排（排內順序每輪洗牌）+ 把乾藥材散到地上
function buildCabinet() {
  // 只清掉上一輪的罐子，保留兩座靜態框架
  state.slots.forEach((s) => { if (s.group.parent) s.group.parent.remove(s.group); if (s.hit.parent) s.hit.parent.remove(s.hit); });
  slotMeshes.length = 0;
  clearGroup(tableGroup, herbMeshes);
  state.slots = []; state.herbsOnTable = [];

  const byId = Object.fromEntries(HERBS.map((h) => [h.id, h]));
  const all = [];
  cabContainers.forEach(({ spec, group, rows, W }) => {
    const areaLeft = -W / 2 + LABEL_W, areaW = W - LABEL_W;
    const pool = {};
    spec.natures.forEach((nk) => (pool[nk] = shuffle([...NATURE_LIST[nk]])));   // 每性味洗牌
    rows.forEach((row, ri) => {
      const ids = pool[row.natureKey].splice(0, row.len);   // 依排長取罐
      const rowY = CAB_BASE + ri * RH;
      const startX = areaLeft + (areaW - (ids.length - 1) * JW) / 2;   // 該排罐子置中
      ids.forEach((id, ci) => { const h = byId[id]; makeJarSlot(group, h, startX + ci * JW, rowY); all.push(h); });
    });
  });

  updateHud();
  refreshJarMastery();   // 精熟的藥罐貼上金印
  startDay();
}

// 一個貼標籤的玻璃藥罐（可放 cap 份，藥材裝在罐裡看得到）
function makeJarSlot(parent, h, lx, ly) {
  const g = new THREE.Group();
  g.position.set(lx, ly, JAR_Z);
  // 玻璃罐身 + 罐底 + 罐口圈 + 軟木塞
  const body = new THREE.Mesh(new THREE.CylinderGeometry(JR, JR * 0.94, JH, 16, 1, true), GLASS);
  body.position.y = JH / 2; g.add(body);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(JR * 0.94, 16), GLASS);
  bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.003; g.add(bottom);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(JR * 0.96, 0.012, 8, 18), GLASS);
  rim.rotation.x = Math.PI / 2; rim.position.y = JH; g.add(rim);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(JR * 0.82, JR * 0.9, 0.07, 14), pMat(0xc09a5e));
  cork.position.y = JH + 0.03; cork.castShadow = true; g.add(cork);
  // 藥名標籤（羊皮紙藥籤，貼在罐身正面）
  const sign = makeJarLabel(h.name);
  // 名牌移出玻璃罐：放到罐子「下方」的層架空檔、貼齊櫃子前緣，完全不擋玻璃瓶
  sign.scale.set(JW * 0.78, 0.1, 1);
  sign.position.set(0, -0.10, SHELF_D - JAR_Z + 0.01); g.add(sign);
  // 罐內備好藥材（庫存：架子＝可抓取的藥材，照方抓藥用）
  const spacing = 0.075;
  for (let i = 0; i < PER_HERB; i++) {
    const off = (i - (PER_HERB - 1) / 2) * spacing;
    const stock = makeHerbModel(h);
    stock.scale.setScalar(0.34);
    stock.position.set(off, 0.02, 0);
    g.add(stock);
  }
  parent.add(g);
  // 命中盒（罐子範圍）
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(JR * 1.15, JR * 1.15, JH + 0.12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(lx, ly + JH / 2, JAR_Z); parent.add(hit);
  const data = { herb: h.id, group: g, hit };
  hit.userData = { type: "jar", data };
  slotMeshes.push(hit); state.slots.push(data);
}

// ====== 程序化 3D 乾藥材（低多邊形） ======
const pMat = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, ...o });

// 把鮮豔主色轉成「曬乾、陳放」的暗沉色：去飽和、壓暗、再混一點藥材褐
const DRYBROWN = new THREE.Color(0x6b5236);
function dry(hex, mix = 0.45, dl = 0) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s * 0.5, Math.max(0.1, hsl.l * 0.62 + dl));
  c.lerp(DRYBROWN, mix);
  return c.getHex();
}
// 同色微抖動，讓一堆材料每顆都略有差異
const jitter = (h, s = 0.05, l = 0.08) =>
  new THREE.Color(h).offsetHSL(0, (Math.random() - 0.5) * s, (Math.random() - 0.5) * l).getHex();

// 由藥材 id 產生穩定種子 + 可重現亂數（讓每一味造型固定、彼此不同）
function hashStr(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
// 小幫手：枯莖 / 麻繩束
function stemMesh(len, col) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.007, len, 5), pMat(jitter(col)));
  m.position.y = len / 2; m.castShadow = true; return m;
}
function addTwine(g) {
  const t = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12), pMat(0xb89a64, { roughness: 0.9 }));
  t.rotation.x = Math.PI / 2; t.position.y = 0.05; g.add(t);
}

// 依藥材身分指定造型變體（讓人參長得像根、肉桂像樹皮、靈芝像靈芝…）
const HERB_VARIANT = {
  // 乾根：0 分叉根 / 1 切片堆 / 2 樹皮捲 / 3 根莖塊
  renshen: 0, danggui: 0, danshen: 0, dangshen: 0, shanyao: 0, gegen: 0, banlangen: 0,
  huangqi: 1, gancao: 1, rougui: 2, duzhong: 2, baizhu: 3, chuanxiong: 3,
  // 乾果：0 小圓果 / 1 大皺果 / 2 扁種子 / 3 結枝果
  gouqi: 0, hongzao: 1, shanzha: 1, lianqiao: 1, suanzaoren: 2, juemingzi: 2, lianzi: 2, chenpi: 2, wuweizi: 3, sangshen: 3,
  // 乾菌：0 靈芝盤 / 1 茯苓塊 / 2 豬苓核
  lingzhi: 0, fuling: 1, zhuling: 2,
  // 乾蕨：0 羽狀 / 1 長條葉
  aicao: 0, heye: 1, danzhuye: 1, dill: 0, fennel: 0, rosemary: 1, tarragon: 1,
  // 乾草（薄荷類）：0 成對橢圓葉 / 1 細密小葉
  thyme: 1, marjoram: 1, oregano: 1,
  // 西洋種子歸入扁種子
  caraway: 2,
  // 擴充 34 味
  ganjiang: 3, fuzi: 3, banxia: 3, heshouwu: 0, houpo: 2, maidong: 3, tianma: 1, niuxi: 0,
  valerian: 0, baihe: 1, huanglian: 3, huangqin: 1, dahuang: 1, zhimu: 3, baishao: 1, chaihu: 0,
  longyan: 1, wuzhuyu: 0, sharen: 0, xingren: 2, fenugreek: 2, baiguo: 0, qianshi: 0, wumei: 1,
  zhizi: 1, niubangzi: 2, yiyiren: 2,
  dongchong: 2, yiner: 1, muer: 2, lemongrass: 1,
};

// --- 乾根：4 種變體（分叉根 / 切片堆 / 樹皮捲 / 根莖塊）---
function driedRoot(accent, rnd, variant) {
  const g = new THREE.Group();
  const tan = new THREE.Color(dry(accent, 0.5, 0.14)).lerp(new THREE.Color(0xbfa074), 0.45).getHex();
  const v = variant != null ? variant : (rnd() * 4) | 0;
  if (v === 0) {                                  // 分叉主根 + 鬚根
    const segs = 3 + ((rnd() * 2) | 0);
    for (let p = 0; p < 1 + ((rnd() * 2) | 0); p++) {
      const piece = new THREE.Group(); let py = 0, prevR = 0.05;
      for (let s = 0; s < segs; s++) { const r = 0.05 - s * 0.011;
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, prevR, 0.085, 7), pMat(jitter(tan)));
        seg.position.y = py + 0.043; seg.rotation.z = (rnd() - 0.5) * 0.7; seg.castShadow = true;
        piece.add(seg); py += 0.07; prevR = r * 0.8; }
      for (let k = 0; k < 4; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.002, 0.06, 5), pMat(dry(accent, 0.6, 0.05)));
        const a = rnd() * 6.28; w.position.set(Math.cos(a) * 0.02, 0.02, Math.sin(a) * 0.02);
        w.rotation.set((rnd() - 0.5) * 1.4, 0, (rnd() - 0.5) * 1.4); piece.add(w); }
      piece.rotation.set((rnd() - 0.5) * 0.5, rnd() * 6.28, (rnd() - 0.5) * 0.5);
      piece.position.set((p - 0.5) * 0.06, 0.01, (rnd() - 0.5) * 0.04); g.add(piece);
    }
  } else if (v === 1) {                           // 切片堆疊
    for (let i = 0; i < 4 + ((rnd() * 3) | 0); i++) {
      const sl = new THREE.Group();
      sl.add(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 14), pMat(new THREE.Color(tan).offsetHSL(0, -0.04, 0.12).getHex())));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.006, 6, 16), pMat(dry(accent, 0.6, 0)));
      rim.rotation.x = Math.PI / 2; sl.add(rim);
      const a = rnd() * 6.28, r = rnd() * 0.06; sl.position.set(Math.cos(a) * r, 0.007 + i * 0.006, Math.sin(a) * r);
      sl.rotation.set((rnd() - 0.5) * 0.3, rnd() * Math.PI, (rnd() - 0.5) * 0.3); sl.castShadow = true; g.add(sl);
    }
  } else if (v === 2) {                           // 樹皮捲（肉桂、陳皮…）
    const n = 2 + ((rnd() * 2) | 0);
    for (let i = 0; i < n; i++) {
      const bark = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.2, 10, 1, true),
        pMat(jitter(dry(accent, 0.4, 0)), { side: THREE.DoubleSide }));
      bark.rotation.z = Math.PI / 2; bark.rotation.y = (rnd() - 0.5) * 0.6;
      bark.position.set((i - (n - 1) / 2) * 0.05, 0.04 + i * 0.012, (rnd() - 0.5) * 0.03); bark.castShadow = true; g.add(bark);
    }
  } else {                                        // 薑黃狀根莖塊
    for (let i = 0; i < 3 + ((rnd() * 3) | 0); i++) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04 + rnd() * 0.02, 0), pMat(jitter(tan), { flatShading: true }));
      c.scale.set(1.4, 0.7, 0.9); const a = rnd() * 6.28, r = rnd() * 0.06;
      c.position.set(Math.cos(a) * r, 0.03 + rnd() * 0.02, Math.sin(a) * r); c.rotation.set(rnd(), rnd() * 6.28, rnd()); c.castShadow = true; g.add(c);
    }
  }
  return g;
}

// --- 乾果 / 種子：4 種變體（小圓果 / 大皺果 / 扁種子 / 結枝果）---
function driedBerries(accent, rnd, variant) {
  const g = new THREE.Group(); const v = variant != null ? variant : (rnd() * 4) | 0;
  if (v === 0) {                                  // 小圓乾果堆（枸杞）
    const col = dry(accent, 0.22, 0.04);
    for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.024, 7, 6), pMat(jitter(col, 0.04, 0.1), { roughness: 0.7 }));
      b.scale.set(1, 0.6 + rnd() * 0.3, 0.85); const a = rnd() * 6.28, r = rnd() * 0.1;
      b.position.set(Math.cos(a) * r, 0.024 + rnd() * 0.05 * (1 - r / 0.12), Math.sin(a) * r); b.rotation.set(rnd(), rnd(), rnd()); b.castShadow = true; g.add(b); }
  } else if (v === 1) {                           // 大皺果（紅棗 / 山楂）
    const col = dry(accent, 0.28, 0);
    for (let i = 0; i < 5 + ((rnd() * 3) | 0); i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 7), pMat(jitter(col, 0.03, 0.08), { roughness: 0.75 }));
      b.scale.set(1, 0.82, 0.9); const a = rnd() * 6.28, r = rnd() * 0.06;
      b.position.set(Math.cos(a) * r, 0.04, Math.sin(a) * r); b.rotation.set(rnd(), rnd(), rnd()); b.castShadow = true; g.add(b); }
  } else if (v === 2) {                           // 扁亮種子（決明子 / 酸棗仁）
    const col = dry(accent, 0.4, 0);
    for (let i = 0; i < 16; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), pMat(jitter(col, 0.03, 0.08), { roughness: 0.5, metalness: 0.05 }));
      s.scale.set(1.4, 0.45, 0.8); const a = rnd() * 6.28, r = rnd() * 0.09;
      s.position.set(Math.cos(a) * r, 0.012 + rnd() * 0.02, Math.sin(a) * r); s.rotation.set((rnd() - 0.5) * 0.4, rnd() * 6.28, (rnd() - 0.5) * 0.4); s.castShadow = true; g.add(s); }
  } else {                                        // 結在短枝上的果（五味子 / 桑椹）
    const col = dry(accent, 0.2, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.18, 5), pMat(dry(accent, 0.6, 0))); stem.position.y = 0.09; stem.rotation.z = 0.3; g.add(stem);
    for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.018, 7, 6), pMat(jitter(col, 0.04, 0.1)));
      const t = rnd(); b.position.set((rnd() - 0.5) * 0.05 + 0.05 * t, 0.03 + t * 0.14, (rnd() - 0.5) * 0.05); b.castShadow = true; g.add(b); }
  }
  return g;
}

// --- 乾菌：3 種變體（靈芝盤 / 茯苓白塊 / 豬苓黑核）---
function driedFungus(accent, rnd, variant) {
  const g = new THREE.Group(); const v = variant != null ? variant : (rnd() * 3) | 0; const col = dry(accent, 0.5, 0.04);
  if (v === 0) {                                  // 靈芝：光亮盤 + 輪紋 + 短柄
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10, 0, 6.28, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, metalness: 0.12 }));
    cap.scale.set(1.2, 0.4, 0.95); cap.position.y = 0.05; cap.castShadow = true; g.add(cap);
    for (let i = 1; i <= 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.028 * i, 0.005, 6, 18),
      pMat(new THREE.Color(col).offsetHSL(0, 0, 0.08 + i * 0.03).getHex())); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.072; g.add(ring); }
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.07, 7), pMat(0x6a3f24)); st.position.set(-0.06, 0.035, 0); st.rotation.z = 0.5; g.add(st);
  } else if (v === 1) {                           // 茯苓：白胖塊
    for (let i = 0; i < 2; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 - i * 0.03, 0), pMat(jitter(col, 0.02, 0.06), { flatShading: true }));
      c.scale.set(1.1, 0.8, 1); c.position.set(i * 0.08, 0.05 - i * 0.01, i * 0.04); c.rotation.set(rnd(), rnd() * 6.28, rnd()); c.castShadow = true; g.add(c); }
  } else {                                        // 豬苓：黑褐不規則核 + 碎塊
    for (let i = 0; i < 3 + ((rnd() * 2) | 0); i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03 + rnd() * 0.03, 0), pMat(jitter(col, 0.03, 0.07), { flatShading: true }));
      const a = rnd() * 6.28, r = rnd() * 0.06; c.position.set(Math.cos(a) * r, 0.03 + rnd() * 0.03, Math.sin(a) * r); c.rotation.set(rnd(), rnd(), rnd()); c.castShadow = true; g.add(c); }
  }
  return g;
}

// --- 乾花：日輪花頭（菊 / 桂 / 槐）---
function driedFlowerSun(accent, rnd) {
  const g = new THREE.Group(); const petalC = dry(accent, 0.3, 0.06), centerC = dry(accent, 0.5, -0.1);
  const heads = 1 + ((rnd() * 2) | 0);
  for (let h = 0; h < heads; h++) {
    const head = new THREE.Group();
    head.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.02, 12), pMat(centerC, { roughness: 0.9 })));
    const np = 10 + ((rnd() * 4) | 0);
    for (let i = 0; i < np; i++) { const petal = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.005, 0.05), pMat(jitter(petalC, 0.05, 0.1)));
      const a = (i / np) * 6.28; petal.position.set(Math.cos(a) * 0.06, 0, Math.sin(a) * 0.06); petal.rotation.set(0.2, -a, 0.2 + (rnd() - 0.5) * 0.3); head.add(petal); }
    head.position.set(heads > 1 ? (h - 0.5) * 0.09 : 0, 0.02 + h * 0.02, (rnd() - 0.5) * 0.05);
    head.rotation.set((rnd() - 0.5) * 0.6, rnd() * 6.28, (rnd() - 0.5) * 0.6); head.castShadow = true; g.add(head);
  }
  return g;
}

// --- 乾花：小花苞撮（金銀花 / 紫錐菊 / 蒲公英）---
function driedFlowerDaisy(accent, rnd) {
  const g = new THREE.Group(); const col = dry(accent, 0.32, 0.08), dark = dry(accent, 0.45, -0.02);
  for (let i = 0; i < 8 + ((rnd() * 5) | 0); i++) {
    const bud = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.026, 0), pMat(jitter(col, 0.05, 0.12), { flatShading: true })); core.scale.set(1, 0.9, 1); bud.add(core);
    for (let p = 0; p < 5; p++) { const petal = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.003, 0.022), pMat(jitter(dark, 0.04, 0.1)));
      const a = (p / 5) * 6.28; petal.position.set(Math.cos(a) * 0.02, 0.005, Math.sin(a) * 0.02); petal.rotation.set(0.7, -a, 0); bud.add(petal); }
    const a = rnd() * 6.28, r = rnd() * 0.09; bud.position.set(Math.cos(a) * r, 0.025 + rnd() * 0.05, Math.sin(a) * r);
    bud.rotation.set((rnd() - 0.5) * 1, rnd() * 6.28, (rnd() - 0.5) * 1); bud.castShadow = true; g.add(bud);
  }
  return g;
}

// --- 乾花：捲花苞 + 散絲（紅花 / 洛神 / 玫瑰）---
function driedFlowerRose(accent, rnd) {
  const g = new THREE.Group(); const col = dry(accent, 0.25, 0.04), dark = dry(accent, 0.4, -0.04);
  for (let i = 0; i < 5 + ((rnd() * 4) | 0); i++) {
    const bud = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), pMat(jitter(col, 0.05, 0.1), { flatShading: true })); ball.scale.set(0.9, 1.2, 0.9); bud.add(ball);
    for (let p = 0; p < 3; p++) { const petal = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), pMat(jitter(dark, 0.04, 0.1))); petal.scale.set(0.8, 0.25, 0.6);
      const a = (p / 3) * 6.28; petal.position.set(Math.cos(a) * 0.02, 0.01, Math.sin(a) * 0.02); petal.rotation.set(0.8, -a, 0); bud.add(petal); }
    const a = rnd() * 6.28, r = rnd() * 0.07; bud.position.set(Math.cos(a) * r, 0.03 + rnd() * 0.03, Math.sin(a) * r);
    bud.rotation.set((rnd() - 0.5) * 0.8, rnd() * 6.28, (rnd() - 0.5) * 0.8); bud.castShadow = true; g.add(bud);
  }
  for (let i = 0; i < 6; i++) { const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, 0.05, 4), pMat(jitter(dark, 0.05, 0.1)));
    const a = rnd() * 6.28, r = 0.05 + rnd() * 0.05; thread.position.set(Math.cos(a) * r, 0.012, Math.sin(a) * r); thread.rotation.set(Math.PI / 2, rnd() * 6.28, rnd()); g.add(thread); }
  return g;
}

// --- 乾花：鐘形花苞（桔梗 / 款冬）---
function driedFlowerTulip(accent, rnd) {
  const g = new THREE.Group(); const col = dry(accent, 0.3, 0.04);
  for (let i = 0; i < 5 + ((rnd() * 3) | 0); i++) {
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.008, 0.05, 6, 1, true), pMat(jitter(col, 0.05, 0.1), { side: THREE.DoubleSide }));
    const a = rnd() * 6.28, r = rnd() * 0.07; bell.position.set(Math.cos(a) * r, 0.03 + rnd() * 0.04, Math.sin(a) * r);
    bell.rotation.set((rnd() - 0.5) * 1.2, rnd() * 6.28, (rnd() - 0.5) * 1.2); bell.castShadow = true; g.add(bell);
  }
  return g;
}

// --- 乾草：莖束（0 成對橢圓葉 / 1 細密小葉）---
function driedMint(accent, rnd, variant) {
  const g = new THREE.Group();
  const leafCol = new THREE.Color(dry(accent, 0.45, 0.06)).lerp(new THREE.Color(0x7a7340), 0.35).getHex();
  const stemCol = dry(accent, 0.6, 0);
  const v = variant != null ? variant : 0;
  const n = 4 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const sprig = new THREE.Group(); const len = 0.16 + rnd() * 0.08; sprig.add(stemMesh(len, stemCol));
    if (v === 1) {                                // 細密小葉（百里香 / 馬鬱蘭 / 奧勒岡）
      for (let k = 0; k < 6; k++) { const y = len * (0.2 + 0.7 * k / 6); const side = k % 2 ? 1 : -1;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 5), pMat(jitter(leafCol, 0.05, 0.1)));
        leaf.scale.set(0.7, 0.4, 1); leaf.position.set(side * 0.015, y, 0); leaf.rotation.set(0.3, 0, side * 0.4); sprig.add(leaf); }
    } else {                                      // 成對橢圓葉（薄荷 / 紫蘇 / 羅勒…）
      for (let k = 0; k < 3; k++) { const y = len * (0.3 + k * 0.22);
        [-1, 1].forEach((side) => { const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.03, 7, 6), pMat(jitter(leafCol, 0.05, 0.1)));
          leaf.scale.set(0.5, 0.16, 1); leaf.position.set(side * 0.03, y, 0); leaf.rotation.set(0.3, 0, side * 0.5); sprig.add(leaf); }); }
    }
    sprig.rotation.set((rnd() - 0.5) * 0.5, (i / n) * 6.28, (rnd() - 0.5) * 0.4);
    sprig.position.set((rnd() - 0.5) * 0.03, 0, (rnd() - 0.5) * 0.03); sprig.castShadow = true; g.add(sprig);
  }
  addTwine(g); return g;
}

// --- 乾草：羽狀 / 長條葉（艾草 / 荷葉 / 淡竹葉）---
function driedFern(accent, rnd, variant) {
  const g = new THREE.Group();
  const col = new THREE.Color(dry(accent, 0.45, 0.05)).lerp(new THREE.Color(0x73703a), 0.35).getHex();
  const v = variant != null ? variant : (rnd() * 2) | 0;
  if (v === 0) {                                  // 羽狀複葉
    const blades = 3 + ((rnd() * 2) | 0);
    for (let b = 0; b < blades; b++) {
      const frond = new THREE.Group(); const len = 0.22 + rnd() * 0.06;
      const rachis = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, len, 4), pMat(dry(accent, 0.6, 0))); rachis.position.y = len / 2; frond.add(rachis);
      for (let k = 0; k < 5; k++) { const y = len * (0.2 + 0.7 * k / 5);
        [-1, 1].forEach((side) => { const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.045, 4), pMat(jitter(col, 0.05, 0.1)));
          leaf.scale.set(1, 1, 0.35); leaf.position.set(side * 0.015, y, 0); leaf.rotation.set(2.3, 0, side * 0.8); frond.add(leaf); }); }
      frond.rotation.set((rnd() - 0.5) * 0.5, (b / blades) * 6.28, (rnd() - 0.5) * 0.4); frond.castShadow = true; g.add(frond);
    }
  } else {                                        // 長條葉片（竹葉狀）
    for (let i = 0; i < 5 + ((rnd() * 3) | 0); i++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.24 + rnd() * 0.06, 4), pMat(jitter(col, 0.05, 0.1)));
      blade.scale.set(1, 1, 0.25); blade.position.y = 0.12; const a = (i / 6) * 6.28;
      blade.rotation.set((rnd() - 0.3) * 0.6, a, (rnd() - 0.5) * 0.5 + 0.1); blade.castShadow = true; g.add(blade);
    }
  }
  addTwine(g); return g;
}

// --- 乾草：闊葉蓮座 + 花穗（車前草 / 魚腥草）---
function driedClover(accent, rnd) {
  const g = new THREE.Group();
  const col = new THREE.Color(dry(accent, 0.45, 0.06)).lerp(new THREE.Color(0x6f7a3a), 0.3).getHex();
  const n = 5 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), pMat(jitter(col, 0.05, 0.1)));
    leaf.scale.set(0.7, 0.12, 1.1); const a = (i / n) * 6.28; leaf.position.set(Math.cos(a) * 0.03, 0.02 + rnd() * 0.02, Math.sin(a) * 0.03);
    leaf.rotation.set((rnd() - 0.5) * 0.3, -a, 0.3); leaf.castShadow = true; g.add(leaf); }
  const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.1, 6), pMat(dry(accent, 0.4, 0.05))); spike.position.y = 0.06; g.add(spike);
  return g;
}

// --- 乾草：花穗束（藿香 / 合歡 / 薰衣草 / 佩蘭）---
function driedSpike(accent, rnd) {
  const g = new THREE.Group(); const spikeC = dry(accent, 0.3, 0.04), stemC = dry(accent, 0.55, 0);
  const n = 5 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group(); const h = 0.2 + rnd() * 0.1; s.add(stemMesh(h, stemC));
    const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.026, 0.12, 6),
      pMat(jitter(spikeC, 0.05, 0.1), { emissive: dry(accent, 0.5, -0.2), emissiveIntensity: 0.25 }));
    spike.position.y = h + 0.05; s.add(spike);
    s.rotation.set((rnd() - 0.5) * 0.5, (i / n) * 6.28, (rnd() - 0.5) * 0.5); g.add(s);
  }
  addTwine(g); return g;
}

// 依 shape 取對應的乾藥材外型（每種 shape 各自獨立，重複多的類型再分子變體）
// seed 由藥材 id 產生 → 同一味造型固定，不同味彼此不同
function buildPlant(shape, accent = 0x8fbf5a, seed = 1, variant = null) {
  const rnd = makeRng(seed);
  switch (shape) {
    case "root":     return driedRoot(accent, rnd, variant);
    case "berry":    return driedBerries(accent, rnd, variant);
    case "mushroom": return driedFungus(accent, rnd, variant);
    case "sun":      return driedFlowerSun(accent, rnd);
    case "daisy":    return driedFlowerDaisy(accent, rnd);
    case "rose":     return driedFlowerRose(accent, rnd);
    case "tulip":    return driedFlowerTulip(accent, rnd);
    case "mint":     return driedMint(accent, rnd, variant);
    case "fern":     return driedFern(accent, rnd, variant);
    case "clover":   return driedClover(accent, rnd);
    case "lavender": return driedSpike(accent, rnd);
    default:         return driedMint(accent, rnd);
  }
}

// 一份乾藥材（地上 / 手上 / 格子內用）
function makeHerbModel(h) {
  const grp = new THREE.Group();
  const plant = buildPlant(h.shape, h.color, hashStr(h.id), HERB_VARIANT[h.id]);
  plant.scale.setScalar(1.25);
  grp.add(plant);
  grp.userData.plant = plant;
  return grp;
}

// 把一份乾藥材散亂地攤在地上的稻草區
function scatterHerb(h, t) {
  const grp = makeHerbModel(h);
  const inx = t.w / 2 - 0.28, inz = t.d / 2 - 0.28;
  const x = t.cx + (Math.random() * 2 - 1) * inx;
  const z = t.cz + (Math.random() * 2 - 1) * inz;
  grp.position.set(x, 0.04, z);   // 鋪在稻草上
  // 隨意散落、微微東倒西歪（乾藥材是一小堆，不整株倒地）
  const fall = Math.random() * Math.PI * 2, amt = Math.random() * 0.3;
  grp.rotation.set(Math.cos(fall) * amt, Math.random() * Math.PI * 2, Math.sin(fall) * amt);
  grp.userData.type = "herb";
  grp.userData.herb = h.id;
  tableGroup.add(grp);
  herbMeshes.push(grp);
  state.herbsOnTable.push(grp);
  return grp;
}

// ---------- 互動 ----------
const raycaster = new THREE.Raycaster();
raycaster.far = 4.4;
const center = new THREE.Vector2(0, 0);
let aimTarget = null; // { type, data/herb, object }

// 從指定的 NDC 座標射出射線，挑出最近的可互動物（桌上藥材 / 藥罐）
function pickAt(ndc) {
  raycaster.setFromCamera(ndc, camera);
  let best = null;
  // 藥罐（抓藥）
  const sh = raycaster.intersectObjects(slotMeshes, false);
  if (sh.length) best = { type: "jar", data: sh[0].object.userData.data, dist: sh[0].distance };
  // 配藥台（交方）
  const ch = raycaster.intersectObjects(counterMeshes, false);
  if (ch.length && (!best || ch[0].distance < best.dist)) best = { type: "counter", dist: ch[0].distance };
  // 兩本書（翻閱）：小目標、刻意對準，優先於配藥台（其命中盒較大會擋在書前）
  const ah = raycaster.intersectObjects(atlasMeshes, false);
  if (ah.length) best = { type: "atlas", dist: ah[0].distance };
  const fh = raycaster.intersectObjects(formulaMeshes, false);
  if (fh.length && (!best || best.type !== "atlas" || fh[0].distance < ah[0].distance)) best = { type: "formula", dist: fh[0].distance };
  return best;
}

// 手機：把螢幕點擊座標換成 NDC，並在點擊點附近容錯尋找（小目標也好點）
function clientToNdc(cx, cy) {
  return center.clone().set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
}
function pickNear(cx, cy) {
  let hit = pickAt(clientToNdc(cx, cy));
  if (hit) return hit;
  const rad = 32;   // 點偏了也能撿到附近的藥材
  for (const [dx, dy] of [[rad,0],[-rad,0],[0,rad],[0,-rad],[rad,rad],[-rad,-rad],[rad,-rad],[-rad,rad]]) {
    hit = pickAt(clientToNdc(cx + dx, cy + dy));
    if (hit) return hit;
  }
  return null;
}

function updateAim() {
  aimTarget = pickAt(center);
  const hit = aimTarget;

  const cross = document.getElementById("cross");
  const prompt = document.getElementById("prompt");
  if (hit) {
    cross.classList.add("active");
    const rx = activeRx();
    if (hit.type === "jar") {
      const id = hit.data.herb;
      if (!rx) prompt.textContent = `${nameOf(id)}（今日已收工）`;
      else if (heldHas(id)) prompt.textContent = `已抓「${nameOf(id)}」`;
      else if (rx.herbs.includes(id)) prompt.textContent = `抓藥：${nameOf(id)}`;
      else prompt.textContent = `${nameOf(id)}（這帖用不到）`;
    } else if (hit.type === "atlas") {
      prompt.textContent = "本草圖鑑 · 翻閱收集牆";
    } else if (hit.type === "formula") {
      prompt.textContent = "方劑譜 · 翻閱歷來藥方";
    } else { // counter
      if (!rx) prompt.textContent = "今日藥方已配齊 ✦";
      else {
        const have = rx.herbs.filter((x) => heldHas(x)).length;
        prompt.textContent = `配藥台 · 交方（${have}/${rx.herbs.length} 味）`;
      }
    }
    prompt.classList.add("show");
  } else {
    cross.classList.remove("active");
    prompt.classList.remove("show");
  }
}

const MAX_CARRY = 3;          // 手上最多拿幾份（種類不限，可混拿）
let heldMeshes = [];          // 手上的乾藥材（混合不同種）

const heldHas = (id) => heldMeshes.some((m) => m.userData.herb === id);

// 把手上的乾藥材在相機前一字排開
function arrangeHand() {
  const touch = IS_TOUCH;
  heldMeshes.forEach((m, i) => {
    const off = (i - (heldMeshes.length - 1) / 2) * (touch ? 0.16 : 0.2);
    if (touch) m.position.set(-0.26 + off, -0.32, -0.85);   // 手機：偏左、抬高，避開右下按鈕又不被畫面下緣切掉
    else m.position.set(0.36 + off, -0.44 - (i % 2) * 0.03, -0.9);
    m.rotation.set(0, 0, 0);
    m.scale.setScalar(touch ? 0.85 : 1.05);
  });
}

function interact(explicit) {
  if (!active()) return;
  const target = explicit || aimTarget;
  if (!target) return;
  if (target.type === "jar") takeHerb(target.data.herb, target.data);
  else if (target.type === "counter") submitFormula();
  else if (target.type === "atlas") openAtlas();
  else if (target.type === "formula") openFormulary();
}

// 從藥罐抓一味藥到藥包（只收當前藥方需要、且尚未抓過的）
function takeHerb(id, slot) {
  const rx = activeRx();
  if (!rx) { toast("今日藥方都配齊了 ✨"); return; }
  if (!rx.herbs.includes(id)) { toast(`這帖用不到「${nameOf(id)}」`); sfx.back(); return; }
  if (heldHas(id)) { toast(`已抓了「${nameOf(id)}」`); return; }
  const bundle = makeHerbModel(HERBS.find((x) => x.id === id));
  bundle.userData.type = "herb"; bundle.userData.herb = id;
  camera.add(bundle); heldMeshes.push(bundle); arrangeHand();
  if (slot) { const wp = new THREE.Vector3(); slot.group.getWorldPosition(wp); wp.y += JH / 2; sparkle(wp); }
  sfx.pick(); updateHud();
  showHerbCard(nameOf(id), HERB_DESC[id] || "");
  updateQuest();
  if (rx.herbs.every((x) => heldHas(x))) toast("藥材已齊，到配藥台交方 ⚖");
}

// 在配藥台交方：手上的藥包是否湊齊當前藥方
function submitFormula() {
  const rx = activeRx();
  if (!rx) { toast("今日藥方都配齊了 ✨"); return; }
  const missing = rx.herbs.filter((id) => !heldHas(id));
  if (missing.length) { toast("藥方還缺：" + missing.map(nameOf).join("、")); sfx.back(); return; }
  // 交方成功：清空藥包
  heldMeshes.forEach((m) => camera.remove(m)); heldMeshes = [];
  updateHud();
  const p = new THREE.Vector3(); camera.getWorldPosition(p);
  const d = new THREE.Vector3(); camera.getWorldDirection(d);
  sparkle(p.add(d.multiplyScalar(1.0)));
  dayIdx++;
  updateQuest();
  const beat = `${rx.who}<br/>「正是這帖<b>${rx.name}</b>，多謝小師傅。」<br/>客人接過藥包，道謝離去。`;
  if (dayIdx >= day.length) { sfx.win(); showStory(beat, 4200); setTimeout(() => showWin(), 4200); }
  else { sfx.full(); showStory(beat); }
}

// 倒回藥包：把手上抓的藥全部放回（重新配這一帖）
function dropHeld() {
  if (!heldMeshes.length) return;
  heldMeshes.forEach((m) => camera.remove(m));
  heldMeshes = [];
  updateHud(); updateQuest(); sfx.back();
  toast("藥包已倒回，重新抓藥");
}

// ---------- 進度 / 過關 ----------
function updateHud() {
  document.getElementById("filled").textContent = `${dayIdx}/${day.length} 帖`;
  if (!heldMeshes.length) {
    document.getElementById("held").textContent = "空手";
  } else {
    const counts = {};
    heldMeshes.forEach((m) => (counts[m.userData.herb] = (counts[m.userData.herb] || 0) + 1));
    document.getElementById("held").textContent =
      Object.entries(counts).map(([id, n]) => `${nameOf(id)}×${n}`).join(" ");
  }
}
// ---------- 今日委託：照方抓藥（老堂重啟） ----------
let day = [], dayIdx = 0;
function startDay() {
  // 解鎖循環：優先只出「所含藥材都在已解鎖性味區」的方劑，學會的馬上能用。
  // 若可填的方劑太少（避免一天無方可配），則退回全部方劑。
  let pool = FORMULAS;
  if (progress.unlockedRegions.length) {
    const ul = progress.unlockedRegions;
    const fillable = FORMULAS.filter((f) => f.herbs.every((id) => ul.includes(NATURE_OF[id])));
    if (fillable.length >= 2) pool = fillable;
  }
  day = shuffle([...pool]).slice(0, DAY_COUNT);
  dayIdx = 0;
  heldMeshes.forEach((m) => camera.remove(m)); heldMeshes = [];
  updateHud();
  updateQuest();
}
function activeRx() { return dayIdx < day.length ? day[dayIdx] : null; }
function updateQuest() {
  const q = document.getElementById("quest");
  if (!q) return;
  const rx = activeRx();
  if (!rx) {
    q.innerHTML = `<div class="q-title">今日委託</div><div class="q-goal">今日藥方已全數配齊 ✦</div>`;
    return;
  }
  const chips = rx.herbs.map((id) =>
    `<span class="q-act${heldHas(id) ? " done" : ""}">${nameOf(id)}</span>`).join("");
  q.innerHTML =
    `<div class="q-title">今日委託　第 ${dayIdx + 1}/${day.length} 帖</div>` +
    `<div class="q-goal"><b>${rx.name}</b>　${rx.cure}<br/><span class="q-who">客人：${rx.who}</span></div>` +
    `<div class="q-acts">${chips}</div>`;
}
let storyT;
function showStory(html, ms = 5500) {
  const s = document.getElementById("story");
  document.getElementById("storyCard").innerHTML = html;
  s.classList.add("show");
  clearTimeout(storyT); storyT = setTimeout(() => s.classList.remove("show"), ms);
}

// ---------- 特效：火花 ----------
const sparks = [];
function sparkle(pos) {
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
    m.position.copy(pos);
    const v = new THREE.Vector3((Math.random()-.5)*2, Math.random()*2+1, (Math.random()-.5)*2).multiplyScalar(0.04);
    m.userData = { v, life: 1 }; scene.add(m); sparks.push(m);
  }
}
function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.position.add(s.userData.v); s.userData.v.y -= 0.0025;
    s.userData.life -= dt * 1.6;
    s.scale.setScalar(Math.max(0.01, s.userData.life));
    if (s.userData.life <= 0) { scene.remove(s); sparks.splice(i, 1); }
  }
}

// ---------- 音效 ----------
let actx; let muted = false;
function tone(freq, dur=0.16, type="sine", vol=0.12) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = 0;
    o.connect(g); g.connect(actx.destination); o.start();
    g.gain.linearRampToValueAtTime(vol, actx.currentTime+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+dur);
    o.stop(actx.currentTime+dur);
  } catch(e) {}
}
const sfx = {
  pick(){ tone(520,0.1,"sine",0.08); },
  plop(c){ tone(360+c*40,0.14,"sine",0.1); },
  back(){ tone(300,0.18,"sine",0.08); },
  full(){ [659,880,1175].forEach((f,i)=>setTimeout(()=>tone(f,0.2,"triangle",0.1),i*70)); },
  win(){ [523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,0.3,"triangle",0.1),i*110)); },
};

// ---------- Toast / 名稱 ----------
let toastT;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1500);
}
function nameOf(id) { return HERBS.find((h) => h.id === id).name; }

// ---------- 撿起藥草的藥籤卡 ----------
let herbCardT;
function showHerbCard(name, desc) {
  const c = document.getElementById("herbcard");
  document.getElementById("herbName").textContent = name;
  document.getElementById("herbDesc").textContent = desc;
  c.classList.add("show");
  clearTimeout(herbCardT); herbCardT = setTimeout(() => c.classList.remove("show"), 2800);
}

// ---------- 本草收集牆（100 格：未認識=暗格、已認識=點亮、已精熟=金印「熟」） ----------
let atlasOpen = false, atlasReturnLock = false;
function collState(id) {
  if (isMastered(id)) return "mastered";
  const h = progress.herbs[id];
  return (h && h.seen) ? "seen" : "unseen";
}
function buildAtlas() {
  const grid = document.getElementById("atlasGrid");
  grid.classList.add("coll");
  const seen = HERBS.filter((h) => { const p = progress.herbs[h.id]; return p && p.seen; }).length;
  const mast = HERBS.filter((h) => isMastered(h.id)).length;
  const regionBars = NATURES.map((n) => {
    const s = regionStats(n.key);
    return `<span class="coll-rgn"><b>${n.name}</b> ${s.mastered}/${s.total}
        <span class="coll-rgn-bar"><i style="width:${Math.round(s.ratio * 100)}%"></i></span></span>`;
  }).join("");
  let html = `<div class="coll-head">
      <div class="coll-counter">已認識 <b>${seen}</b>/100　·　已精熟 <b>${mast}</b>/100</div>
      <div class="coll-regions">${regionBars}</div>
    </div>`;
  NATURES.forEach((n) => {
    const s = regionStats(n.key);
    const cells = NATURE_LIST[n.key].map((id) => {
      const st = collState(id), h = herbObj(id);
      if (st === "unseen") return `<div class="coll-cell unseen" data-id="${id}"><span class="cc-q">？</span></div>`;
      const seal = st === "mastered" ? `<span class="cc-seal">熟</span>` : "";
      return `<div class="coll-cell ${st}" data-id="${id}">
          <span class="cc-ico">${h.icon || "🌿"}</span>
          <span class="cc-name">${h.name}</span>${seal}
        </div>`;
    }).join("");
    html += `<div class="coll-section">
        <div class="coll-sec-title">${n.name}藥　<span>已精熟 ${s.mastered}/${s.total}</span></div>
        <div class="coll-grid">${cells}</div>
      </div>`;
  });
  grid.innerHTML = html;
  grid.querySelectorAll(".coll-cell").forEach((el) =>
    el.addEventListener("click", () => showAtlasDetail(el.dataset.id)));
}
function showAtlasDetail(id) {
  const h = herbObj(id), st = collState(id);
  const d = document.getElementById("atlasDetail");
  if (st === "unseen") {
    d.innerHTML =
      `<button class="back" id="atlasBack">← 返回收集牆</button>
       <div class="d-unseen"><div class="d-unseen-q">？</div>
         <div class="d-unseen-tip">這味藥<b>尚未認識</b>。<br/>到開場的「📜 認藥期」學會它，這一格就會點亮、補進收集牆。</div></div>`;
  } else {
    const e = ATLAS.find((a) => a.id === id);
    const p = herbProg(id);
    const nat = NATURE_NAME[NATURE_OF[id]] || "—";
    const visual = hasImg(id)
      ? `<img src="assets/herbs/${id}.jpg" alt="${h.name}" />`
      : herbVisualHTML(id);
    const nameDots = hasCue(id) ? dots(p.nameScore) : "—";
    const statusTag = st === "mastered"
      ? `<span class="d-master">✦ 已精熟</span>`
      : `<span class="d-review">↺ 需複習</span>`;
    d.innerHTML =
      `<button class="back" id="atlasBack">← 返回收集牆</button>
       <div class="d-body">
         <div class="d-visual">${visual}</div>
         <div class="d-info">
           <div class="d-cn">${h.name} ${statusTag}</div>
           ${e ? `<div class="d-la">${e.latin}</div>` : ""}
           <div class="d-row">性味分類：<b>${nat}</b></div>
           <div class="d-row">功效：${HERB_DESC[id] || ""}</div>
           <div class="d-row">辨識 ${nameDots}　功效 ${dots(p.effectScore)}</div>
           ${e ? `<div class="d-credit">圖：Köhler's Medizinal-Pflanzen（1887，公有領域）· 詳見 CREDITS.md</div>` : ""}
         </div>
       </div>`;
  }
  d.querySelector("#atlasBack").addEventListener("click", showAtlasGrid);
  document.getElementById("atlasGrid").classList.add("hide");
  d.classList.remove("hide");
}
function dots(n) { return "●".repeat(n) + "○".repeat(Math.max(0, 3 - n)); }
function showAtlasGrid() {
  document.getElementById("atlasDetail").classList.add("hide");
  document.getElementById("atlasGrid").classList.remove("hide");
}
function openAtlas() {
  if (atlasOpen) return;
  buildAtlas(); showAtlasGrid();
  atlasOpen = true;                          // 先設旗標，unlock 事件才不會誤彈暫停面板
  atlasReturnLock = controls.isLocked;
  if (controls.isLocked) controls.unlock();
  document.getElementById("atlas").classList.remove("hide");
}
function closeAtlas() {
  if (!atlasOpen) return;
  atlasOpen = false;
  document.getElementById("atlas").classList.add("hide");
  if (atlasReturnLock && !IS_TOUCH) controls.lock();
}
function toggleAtlas() { atlasOpen ? closeAtlas() : openAtlas(); }

// ---------- 方劑譜（藥方書）：翻閱歷來藥方，已學會的藥標亮 ----------
let formulaOpen = false, formulaReturnLock = false;
function buildFormulary() {
  document.getElementById("formulaBody").innerHTML = FORMULAS.map((f) => {
    const known = f.herbs.filter((id) => isMastered(id)).length;
    const chips = f.herbs.map((id) =>
      `<span class="fx-herb ${isMastered(id) ? "known" : ""}">${nameOf(id)}</span>`).join("");
    return `<div class="fx-card">
        <div class="fx-head"><span class="fx-name">${f.name}</span>
          <span class="fx-known">已識 ${known}/${f.herbs.length} 味</span></div>
        <div class="fx-cure">${f.cure}</div>
        <div class="fx-herbs">${chips}</div>
        <div class="fx-who">客人：${f.who}</div>
      </div>`;
  }).join("");
}
function openFormulary() {
  if (formulaOpen) return;
  buildFormulary();
  formulaOpen = true;                        // 先設旗標，unlock 事件才不會誤彈暫停面板
  formulaReturnLock = controls.isLocked;
  if (controls.isLocked) controls.unlock();
  document.getElementById("formula").classList.remove("hide");
}
function closeFormulary() {
  if (!formulaOpen) return;
  formulaOpen = false;
  document.getElementById("formula").classList.add("hide");
  if (formulaReturnLock && !IS_TOUCH) controls.lock();
}

// ---------- 過關面板 ----------
function showWin() {
  const ov = document.getElementById("overlay");
  ov.querySelector(".panel").innerHTML = `
    <div class="sigil">✦ ❖ ✦</div>
    <h2>本草堂 · 今日打烊</h2>
    <p>今日的藥方都照方抓齊、一一交到客人手中了 ✨<br/>滿架藥香，老堂又活了過來。<br/>祖父若還在，想必也會點頭吧。</p>
    <p>門外，又有腳步聲近了——<br/>本草堂的故事，還長著呢。</p>
    <div class="big">點擊畫面，再開一天 ⚗</div>
    <p class="hint">慢慢來，沒有時間限制 🍵</p>`;
  ov.classList.remove("hide");
  pendingNext = true;
}
let pendingNext = false;

// ---------- 暫停面板（按 Esc 放開滑鼠時顯示，內容與開頭不同） ----------
function showPause() {
  document.getElementById("overlay").querySelector(".panel").innerHTML = `
    <div class="sigil">⏸ ❖ ⏸</div>
    <h2>暫停 · 喝口茶歇會兒</h2>
    <p>今日已交方 <b>${dayIdx}/${day.length}</b> 帖。<br/>客人不急，慢慢配就好 🍵</p>
    <div class="keys">
      <span class="key">W A S D｜走動</span>
      <span class="key">滑鼠｜環顧</span>
      <span class="key">點擊藥罐｜抓藥</span>
      <span class="key">點擊配藥台｜交方</span>
      <span class="key">Q / 右鍵｜倒回藥包</span>
    </div>
    <div class="big">點擊畫面繼續配藥 ⚗</div>
    <p class="hint">按 Esc 可隨時放開滑鼠</p>`;
}

// ---------- 控制 / 輸入 ----------
const IS_TOUCH = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
let touchStarted = false;                  // 手機：點過開始畫面後為 true
function active() { return controls.isLocked || touchStarted; }
camera.rotation.order = "YXZ";             // 手機自行管理視角（不靠 Pointer Lock）
let yaw = 0, pitch = 0;

const keys = {};
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Escape" && atlasOpen) { closeAtlas(); return; }
  if (e.code === "Escape" && formulaOpen) { closeFormulary(); return; }
  if (e.code === "KeyB") { toggleAtlas(); return; }
  if (e.code === "KeyQ") dropHeld();
  if (e.code === "KeyM") { muted = !muted; }
});
addEventListener("keyup", (e) => (keys[e.code] = false));

// 圖鑑開關按鈕
document.getElementById("atlasBtn").addEventListener("click", openAtlas);
document.getElementById("atlasClose").addEventListener("click", closeAtlas);
document.getElementById("formulaClose").addEventListener("click", closeFormulary);

// 可收闔的「出處與致謝」頁尾（stopPropagation：在開場面板上點它不會誤觸開始遊戲）
const creditsEl = document.getElementById("credits");
creditsEl.addEventListener("click", (e) => e.stopPropagation());
document.getElementById("creditsToggle").addEventListener("click", () => creditsEl.classList.toggle("open"));
// 遊戲進行中（滑鼠鎖定/手機操作時）隱藏並收起「出處與致謝」，免得展開後卡在畫面上又點不到；
// 回到開場/暫停畫面（有游標）才再出現。
function setPlaying(on) {
  document.body.classList.toggle("playing", on);
  if (on) creditsEl.classList.remove("open");
}

const overlay = document.getElementById("overlay");
function startPlay() {
  if (pendingNext) { pendingNext = false; buildCabinet(); }   // 重新整理一輪
  if (IS_TOUCH) { touchStarted = true; setPlaying(true); overlay.classList.add("hide"); }
  else controls.lock();
}
overlay.addEventListener("click", startPlay);
controls.addEventListener("lock", () => { setPlaying(true); overlay.classList.add("hide"); });
controls.addEventListener("unlock", () => {
  if (atlasOpen || formulaOpen) return;   // 為了開書而解鎖：不要彈暫停面板
  setPlaying(false);
  if (!pendingNext) showPause();   // 非過關的解鎖 = 按 Esc 暫停，顯示暫停面板
  overlay.classList.remove("hide");
});

addEventListener("mousedown", (e) => {
  if (!controls.isLocked) return;   // 桌機（鎖定中）才用滑鼠
  if (e.button === 0) interact();
  else if (e.button === 2) dropHeld();
});
addEventListener("contextmenu", (e) => e.preventDefault());

// ---------- 觸控操作（手機）：左半虛擬搖桿走動、右半拖曳環顧、點一下互動 ----------
if (IS_TOUCH) document.body.classList.add("touch");
const joyVec = { x: 0, y: 0 };
(function setupTouch() {
  const joy = document.getElementById("joy"), knob = document.getElementById("joyKnob"), cv = document.getElementById("c");
  const R = 56;
  let joyId = null, joyBX = 0, joyBY = 0, lookId = null, lookX = 0, lookY = 0, moved = false;
  function onStart(e) {
    if (!touchStarted) return;
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth * 0.45 && joyId === null) {
        joyId = t.identifier; joyBX = t.clientX; joyBY = t.clientY;
        joy.style.left = joyBX + "px"; joy.style.top = joyBY + "px"; joy.style.display = "block";
        knob.style.transform = "translate(-50%,-50%)";
      } else if (lookId === null) { lookId = t.identifier; lookX = t.clientX; lookY = t.clientY; moved = false; }
    }
    e.preventDefault();
  }
  function onMove(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) {
        let dx = t.clientX - joyBX, dy = t.clientY - joyBY;
        const d = Math.hypot(dx, dy); if (d > R) { dx = dx / d * R; dy = dy / d * R; }
        joyVec.x = dx / R; joyVec.y = dy / R;
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      } else if (t.identifier === lookId) {
        const dx = t.clientX - lookX, dy = t.clientY - lookY; lookX = t.clientX; lookY = t.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        yaw -= dx * 0.004; pitch = Math.max(-1.4, Math.min(1.4, pitch - dy * 0.004));
        camera.rotation.set(pitch, yaw, 0);
      }
    }
    e.preventDefault();
  }
  function onEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) { joyId = null; joyVec.x = joyVec.y = 0; joy.style.display = "none"; }
      else if (t.identifier === lookId) { if (!moved) interact(pickNear(t.clientX, t.clientY)); lookId = null; }
    }
  }
  cv.addEventListener("touchstart", onStart, { passive: false });
  cv.addEventListener("touchmove", onMove, { passive: false });
  cv.addEventListener("touchend", onEnd);
  cv.addEventListener("touchcancel", onEnd);
  const dropBtn = document.getElementById("dropBtn");
  if (dropBtn) dropBtn.addEventListener("click", (e) => { e.stopPropagation(); dropHeld(); });
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.addEventListener("click", (e) => {
    e.stopPropagation(); touchStarted = false; setPlaying(false); joyVec.x = joyVec.y = 0; showPause(); overlay.classList.remove("hide");
  });
})();

// ---------- 移動（平坦地板 + 牆/家具碰撞） ----------
const dirVec = new THREE.Vector3();
function inBlocker(b, x, z, r) {
  return x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r;
}
function move(dt) {
  if (!active()) return;
  const speed = IS_TOUCH ? 1.7 : 3.0;   // 手機搖桿移動放慢，較好控制
  dirVec.set(0, 0, 0);
  if (keys["KeyW"] || keys["ArrowUp"]) dirVec.z += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) dirVec.z -= 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) dirVec.x -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) dirVec.x += 1;
  if (touchStarted) { dirVec.x += joyVec.x; dirVec.z += -joyVec.y; }   // 手機搖桿
  dirVec.normalize();

  const o = controls.getObject();
  const ox = o.position.x, oz = o.position.z;
  controls.moveRight(dirVec.x * speed * dt);
  controls.moveForward(dirVec.z * speed * dt);

  // 家具 / 櫃體碰撞（沿邊滑動）
  const r = 0.34;
  for (const b of blockers) {
    if (!inBlocker(b, o.position.x, o.position.z, r)) continue;
    if (!inBlocker(b, ox, o.position.z, r)) o.position.x = ox;        // 退回 x，沿 z 滑
    else if (!inBlocker(b, o.position.x, oz, r)) o.position.z = oz;   // 退回 z，沿 x 滑
    else { o.position.x = ox; o.position.z = oz; }
  }

  // 房間四牆邊界
  const EDGE = HALF - 0.5;
  o.position.x = Math.max(-EDGE, Math.min(EDGE, o.position.x));
  o.position.z = Math.max(-EDGE, Math.min(EDGE, o.position.z));

  o.position.y = 1.6;   // 平地板，視角高度固定
}

// ---------- 主迴圈 ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  move(dt);
  updateAim();
  updateSparks(dt);

  // 手上的乾藥材緩緩轉（桌上的維持散落不動）
  heldMeshes.forEach((m) => { if (m.userData.plant) m.userData.plant.rotation.y += dt * 1.2; });

  renderer.render(scene, camera);
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------- 啟動 ----------
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

/* ====================================================================
   認藥期（學習）—— 依《認藥期-學習設計.md》
   觀摩 8 味 → 圖→名測驗 → 症狀/功效→名測驗 → 批次小結。
   精熟：每味 nameScore / effectScore（0–3），兩者皆達 3 即「熟悉」。
   分區解鎖：某性味（溫熱/平和/寒涼）熟悉達 80% → 解鎖該性味的配藥方。
   進度存於 localStorage（雲端 Firestore 待學習設計談定後再接）。
   ==================================================================== */
const BATCH_SIZE   = 8;        // 一批幾味（設計稿預設 8）
const UNLOCK_RATIO = 0.8;      // 某性味熟悉達此比例即解鎖該區配藥
const PROGRESS_KEY = "bencao_recog_v1";

// 無照片的藥材：依外型給一個中文類別標籤（不假造圖片）
const SHAPE_CAT = { root:"根莖／樹皮", berry:"果實／種子", mushroom:"菌類",
  sun:"花類", daisy:"花類", rose:"花類", tulip:"花類", lavender:"花類",
  mint:"葉／全草", fern:"葉／全草", clover:"葉／全草" };

function herbObj(id){ return HERBS.find(h => h.id === id); }
function hasImg(id){ return ATLAS.some(a => a.id === id); }
// 有「辨識線索」= 有照片或有藥性謎面。兩者皆無者，不做第一層（辨識→名）測驗。
function hasCue(id){ return hasImg(id) || !!herbObj(id).clue; }

// ---- 進度（localStorage）----
function loadProgress(){
  try { const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (p && p.herbs) { if (!Array.isArray(p.unlockedRegions)) p.unlockedRegions = []; return p; }
  } catch (e) {}
  return { herbs: {}, unlockedRegions: [] };
}
let progress = loadProgress();
function saveProgress(){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) {} }
function herbProg(id){
  return progress.herbs[id] || (progress.herbs[id] = { seen:false, nameScore:0, effectScore:0 });
}
function bump(score, ok){ return ok ? Math.min(3, score + 1) : Math.max(0, score - 1); }
function isMastered(id){
  const h = progress.herbs[id]; if (!h) return false;
  const nameOk = hasCue(id) ? h.nameScore >= 3 : true;   // 無辨識線索：名分視同達標，只靠功效精熟
  return nameOk && h.effectScore >= 3;
}
function regionStats(nk){
  const ids = NATURE_LIST[nk]; const m = ids.filter(isMastered).length;
  return { mastered: m, total: ids.length, ratio: ids.length ? m / ids.length : 0 };
}
// 重新計算解鎖，回傳「本次新解鎖」的性味 key 陣列
function recomputeUnlocks(){
  const newly = [];
  NATURES.forEach((n) => {
    if (regionStats(n.key).ratio >= UNLOCK_RATIO && !progress.unlockedRegions.includes(n.key)) {
      progress.unlockedRegions.push(n.key); newly.push(n.key);
    }
  });
  return newly;
}

// ---- 3D 藥櫃實體填滿：精熟的藥罐貼上金色「熟」印章 ----
let SEAL_TEX = null;
function sealTexture(){
  if (SEAL_TEX) return SEAL_TEX;
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const x = cv.getContext("2d");
  x.beginPath(); x.arc(64, 64, 56, 0, Math.PI * 2); x.fillStyle = "#e7c873"; x.fill();
  x.lineWidth = 7; x.strokeStyle = "#9a7a2a"; x.stroke();
  x.fillStyle = "#3a2a0a"; x.font = `bold 74px ${CN_FONT}`;
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("熟", 64, 72);
  SEAL_TEX = new THREE.CanvasTexture(cv); SEAL_TEX.anisotropy = 4;
  return SEAL_TEX;
}
function setJarMastered(data, on){
  if (data.seal){ data.group.remove(data.seal); data.seal.material.dispose(); data.seal = null; }
  if (!on) return;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: sealTexture(), transparent: true, depthWrite: false }));
  spr.scale.set(0.13, 0.13, 1);
  spr.position.set(0, JH * 0.72, JR + 0.05);
  data.group.add(spr); data.seal = spr;
}
// 依目前精熟狀態，更新整牆藥罐的金印（開場、整理一輪、認藥結束後呼叫）
function refreshJarMastery(){ state.slots.forEach((d) => setJarMastered(d, isMastered(d.herb))); }

// ---- 選題 / 選批 ----
function distractors(id, n){
  const nk = NATURE_OF[id];
  let pool = shuffle(NATURE_LIST[nk].filter((x) => x !== id));   // 同性味誘答（有鑑別度）
  let picks = pool.slice(0, n);
  if (picks.length < n) {                                        // 同區不足時，從全部補
    const extra = shuffle(HERBS.map((h) => h.id).filter((x) => x !== id && !picks.includes(x)));
    picks = picks.concat(extra.slice(0, n - picks.length));
  }
  return picks;
}
// 從某性味取一批：先複習（已看過但未熟悉），再給新藥；都沒有則輕度複習已熟悉的
function pickBatch(nk){
  const ids = NATURE_LIST[nk];
  const review = ids.filter((id) => { const h = progress.herbs[id]; return h && h.seen && !isMastered(id); });
  const fresh  = ids.filter((id) => !(progress.herbs[id] && progress.herbs[id].seen));
  let batch = shuffle([...review]).slice(0, BATCH_SIZE);
  if (batch.length < BATCH_SIZE) batch = batch.concat(shuffle([...fresh]).slice(0, BATCH_SIZE - batch.length));
  if (batch.length === 0) batch = shuffle([...ids]).slice(0, Math.min(BATCH_SIZE, ids.length));
  return batch;
}
// 由功效造一句「需求情境」（不直說「功效是」，用主顧上門的口吻）
function scenarioOf(id){
  const d = HERB_DESC[id] || "";
  const eff = d.split(/[，。、]/).filter(Boolean).slice(0, 2).join("，");
  return `一位主顧上門，想求一味能「${eff}」的藥。<br/>你會抓哪一味？`;
}

// ---- 視覺卡：有照片用古典彩繪；無照片改用文字藥籤卡（外型類別＋謎面），不假造圖片 ----
function herbVisualHTML(id){
  const h = herbObj(id);
  if (hasImg(id)) {
    return `<div class="rc-pic"><img loading="lazy" src="assets/herbs/${id}.jpg" alt=""/></div>
            <div class="rc-caption">古典植物彩繪（整株）</div>`;
  }
  const cat = SHAPE_CAT[h.shape] || "藥材";
  return `<div class="rc-token">
            <div class="rc-token-cat">${cat}</div>
            ${h.clue
              ? `<div class="rc-token-clue">${h.clue.replace(/·/g, "・")}</div>`
              : `<div class="rc-token-hint">此味暫無圖，靠藥名與功效記憶</div>`}
          </div>`;
}

// ---- 認藥期狀態機 ----
const recogEl = document.getElementById("recog");
let recogOpen = false, curNature = null, curBatch = [];

function openRecog(){
  recogOpen = true;
  recogEl.classList.remove("hide");
  renderRegionMenu();
}
function closeRecog(){
  recogOpen = false;
  recogEl.classList.add("hide");
  recomputeUnlocks(); saveProgress();
  refreshJarMastery();                // 剛學會的藥罐即時貼上金印
  renderStartPanel();                 // 回開場面板並刷新解鎖狀態
}
function recogShell(bodyHTML){
  recogEl.innerHTML =
    `<div class="recog-box">
       <div class="recog-head">
         <span class="recog-title">📜 認藥期 · 學習</span>
         <button class="recog-x" id="recogX">✕</button>
       </div>${bodyHTML}
     </div>`;
  document.getElementById("recogX").addEventListener("click", closeRecog);
}

// 性味分區選單
function renderRegionMenu(){
  const cards = NATURES.map((n) => {
    const s = regionStats(n.key);
    const pct = Math.round(s.ratio * 100);
    const unlocked = progress.unlockedRegions.includes(n.key);
    const need = Math.ceil(s.total * UNLOCK_RATIO);
    return `<button class="region-card ${unlocked ? "" : "locked"}" data-nk="${n.key}">
        <span class="rg-name">${n.name}</span>
        <span class="rg-bar-wrap">
          <span class="rg-bar"><i style="width:${pct}%"></i></span>
          <span class="rg-meta">已熟悉 ${s.mastered}/${s.total}　·　達 ${need} 味解鎖此區配藥</span>
        </span>
        <span class="rg-badge ${unlocked ? "on" : "off"}">${unlocked ? "✦ 已解鎖" : `🔒 ${pct}%`}</span>
      </button>`;
  }).join("");
  recogShell(
    `<div class="recog-sub">祖父拿出藥材，一味一味說給你聽。<br/>
       挑一個性味分區開始：先<b>觀摩</b>八味，再做兩層小測（辨識認名、聽症取藥）。<br/>
       沒有計時、沒有失敗，答錯只是提醒你下次再看一眼。</div>
     ${cards}
     <div class="recog-actions">
       <button class="rbtn" id="recogBackPlay">← 回藥房</button>
     </div>`);
  recogEl.querySelectorAll(".region-card").forEach((el) =>
    el.addEventListener("click", () => startBatch(el.dataset.nk)));
  document.getElementById("recogBackPlay").addEventListener("click", closeRecog);
}

// 觀摩階段（可前後翻；翻到即標記 seen）
function startBatch(nk){
  curNature = nk;
  curBatch = pickBatch(nk);
  if (!curBatch.length) { renderRegionMenu(); return; }
  observeIdx = 0;
  renderObserve();
}
let observeIdx = 0;
function renderObserve(){
  const id = curBatch[observeIdx];
  const h = herbObj(id);
  herbProg(id).seen = true; saveProgress();
  const dots = curBatch.map((_, i) => `<i class="${i === observeIdx ? "on" : ""}"></i>`).join("");
  recogShell(
    `<div class="recog-sub">觀摩　第 ${observeIdx + 1}/${curBatch.length} 味 · ${NATURE_NAME[curNature]}藥</div>
     <div class="observe-stage">
       <div class="rc-frame">
         ${herbVisualHTML(id)}
         <div class="rc-name">${h.name}</div>
         <div class="rc-nature">性味：${NATURE_NAME[curNature]}</div>
         <div class="rc-desc">${HERB_DESC[id] || ""}</div>
       </div>
       <div class="observe-dots">${dots}</div>
       <div class="observe-nav">
         <button class="rbtn" id="obPrev" ${observeIdx === 0 ? "disabled" : ""}>← 上一味</button>
         <button class="rbtn primary" id="obNext">${observeIdx === curBatch.length - 1 ? "開始測驗 →" : "下一味 →"}</button>
       </div>
     </div>`);
  document.getElementById("obPrev").addEventListener("click", () => { if (observeIdx > 0) { observeIdx--; renderObserve(); } });
  document.getElementById("obNext").addEventListener("click", () => {
    if (observeIdx < curBatch.length - 1) { observeIdx++; renderObserve(); }
    else startQuiz(1);
  });
}

// 測驗階段（layer 1 = 圖→名；layer 2 = 症狀/功效→名）
let quizLayer = 1, quizIdx = 0, quizOrder = [];
function startQuiz(layer){
  quizLayer = layer; quizIdx = 0;
  // 第一層（辨識→名）只測「有照片或有謎面」的藥；其餘無線索者跳過此層
  const base = layer === 1 ? curBatch.filter(hasCue) : curBatch;
  quizOrder = shuffle([...base]);
  if (!quizOrder.length) { return layer === 1 ? startQuiz(2) : renderSummary(); }
  renderQuiz();
}
function renderQuiz(){
  const id = quizOrder[quizIdx];
  const opts = shuffle([id, ...distractors(id, 3)]);
  const layerName = quizLayer === 1 ? "辨識認名" : "聽症取藥";
  let promptHTML;
  if (quizLayer === 1) {
    const ask = hasImg(id) ? "看圖，這是哪一味藥？" : "依藥性謎面，這是哪一味藥？";
    promptHTML = `<div class="rc-frame" style="margin:0 auto;">${herbVisualHTML(id)}</div>
                  <div class="quiz-prompt">${ask}</div>`;
  } else {
    promptHTML = `<div class="quiz-prompt">${scenarioOf(id)}</div>`;
  }
  recogShell(
    `<div class="recog-sub">第 ${quizLayer} 層測驗 · ${layerName} · ${NATURE_NAME[curNature]}藥</div>
     <div class="quiz-stage">
       <div class="quiz-progress">第 ${quizIdx + 1}/${quizOrder.length} 題</div>
       ${promptHTML}
       <div class="quiz-opts">
         ${opts.map((oid) => `<button class="quiz-opt" data-id="${oid}">${nameOf(oid)}</button>`).join("")}
       </div>
       <div class="quiz-feedback" id="quizFb"></div>
       <div class="recog-actions" id="quizNext" style="display:none">
         <button class="rbtn primary" id="quizNextBtn"></button>
       </div>
     </div>`);
  recogEl.querySelectorAll(".quiz-opt").forEach((btn) =>
    btn.addEventListener("click", () => answerQuiz(btn, id)));
}
function answerQuiz(btn, correctId){
  const chosen = btn.dataset.id;
  const ok = chosen === correctId;
  const p = herbProg(correctId);
  if (quizLayer === 1) p.nameScore   = bump(p.nameScore, ok);
  else                 p.effectScore = bump(p.effectScore, ok);
  saveProgress();
  // 鎖定選項、標示對錯
  recogEl.querySelectorAll(".quiz-opt").forEach((b) => {
    b.disabled = true;
    if (b.dataset.id === correctId) b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
  });
  const fb = document.getElementById("quizFb");
  fb.className = "quiz-feedback " + (ok ? "ok" : "no");
  fb.innerHTML = ok ? "✓ 答對了！" : `↺ 正解是「${nameOf(correctId)}」，記下這味，下次再看一眼。`;
  const nextWrap = document.getElementById("quizNext");
  const nextBtn = document.getElementById("quizNextBtn");
  const last = quizIdx === quizOrder.length - 1;
  nextBtn.textContent = last ? (quizLayer === 1 ? "進入第二層測驗 →" : "看小結 →") : "下一題 →";
  nextWrap.style.display = "flex";
  nextBtn.addEventListener("click", () => {
    if (!last) { quizIdx++; renderQuiz(); }
    else if (quizLayer === 1) startQuiz(2);
    else renderSummary();
  });
}

// 批次小結 + 解鎖判定
function renderSummary(){
  const newly = recomputeUnlocks(); saveProgress();
  const rows = curBatch.map((id) => {
    const p = herbProg(id);
    const done = isMastered(id);
    const nameCell = hasCue(id) ? `名 ${p.nameScore}/3` : `名 —`;
    return `<div class="summary-row">
        <span><span class="sm-name">${nameOf(id)}</span>
          <span class="sm-dots">${nameCell}　效 ${p.effectScore}/3</span></span>
        <span class="sm-stat ${done ? "mastered" : "review"}">${done ? "✓ 已熟悉" : "↺ 需複習"}</span>
      </div>`;
  }).join("");
  const s = regionStats(curNature);
  const banner = newly.length
    ? `<div class="unlock-banner">✦ ${newly.map((k) => NATURE_NAME[k]).join("、")}區熟悉達 ${Math.round(UNLOCK_RATIO*100)}%！<br/>配藥關已解鎖此區方劑，學會的馬上能用。</div>`
    : "";
  const moreInRegion = NATURE_LIST[curNature].some((id) => !isMastered(id));
  recogShell(
    `<div class="recog-sub">批次小結 · ${NATURE_NAME[curNature]}藥（已熟悉 ${s.mastered}/${s.total}）</div>
     ${banner}
     <div class="summary-list">${rows}</div>
     <div class="recog-actions">
       <button class="rbtn ${moreInRegion ? "primary" : ""}" id="smMore" ${moreInRegion ? "" : "disabled"}>再來一批 ↻</button>
       <button class="rbtn" id="smMenu">← 學習選單</button>
       <button class="rbtn" id="smPlay">⚗ 去配藥</button>
     </div>
     ${moreInRegion ? "" : `<div class="recog-sub" style="text-align:center;margin-top:12px">本區已全部熟悉，去配藥關大顯身手吧 ✦</div>`}`);
  if (moreInRegion) document.getElementById("smMore").addEventListener("click", () => startBatch(curNature));
  document.getElementById("smMenu").addEventListener("click", renderRegionMenu);
  document.getElementById("smPlay").addEventListener("click", closeRecog);
}

// ---- 開場面板：學習進度條 + 「先認藥 / 開門營業」雙入口 ----
function unlockChipsHTML(){
  return NATURES.map((n) => {
    const s = regionStats(n.key);
    const on = progress.unlockedRegions.includes(n.key);
    return `<span class="ulchip ${on ? "on" : ""}">${n.name} ${s.mastered}/${s.total}${on ? " ✦" : ""}</span>`;
  }).join("");
}
function renderStartPanel(){
  const panel = overlay.querySelector(".panel");
  if (!panel) return;
  panel.innerHTML = `
    <div class="sigil">⚗ ❖ ⚗</div>
    <h2>本草堂 · 重啟</h2>
    <p>
      祖父走後，這座<b>本草堂</b>塵封了三年；如今你重新開張。<br/>
      老主顧們帶著<b>藥方</b>陸續上門——但要照方抓藥，得先<b>認得藥材</b>。<br/>
      先到<b>認藥期</b>跟祖父學幾味，把某性味學熟（達 ${Math.round(UNLOCK_RATIO*100)}%），<br/>
      就解鎖該區的藥方，學會的馬上能用。
    </p>
    <div class="ulrow">${unlockChipsHTML()}</div>
    <div class="start-actions">
      <button class="sbtn" id="btnLearn">📜 先認藥（學習）</button>
      <button class="sbtn primary" id="btnPlay">⚗ 開門營業（配藥）</button>
    </div>
    <div class="keys" style="margin-top:14px">
      <span class="key deskonly">W A S D｜走動</span>
      <span class="key deskonly">滑鼠｜環顧</span>
      <span class="key deskonly">點藥罐｜抓藥</span>
      <span class="key deskonly">點配藥台｜交方</span>
      <span class="key deskonly">B｜本草圖鑑</span>
      <span class="key touchonly">左半搖桿｜走動</span>
      <span class="key touchonly">右半拖曳｜環顧</span>
      <span class="key touchonly">點藥罐／配藥台｜抓藥・交方</span>
    </div>
    <p class="hint">沒有計時、沒有失敗，慢慢配方 🍵</p>`;
  panel.querySelector("#btnLearn").addEventListener("click", (e) => { e.stopPropagation(); openRecog(); });
  panel.querySelector("#btnPlay").addEventListener("click", (e) => { e.stopPropagation(); startPlay(); });
}
renderStartPanel();

// 先把場景會用到的中文字符載入（Google Fonts 的中文是按用到的字分段下載，
// 必須在畫 canvas 貼圖前載齊，否則會 fallback 成系統字），再建場景。
function startScene() { buildRoom(); buildCounter(); buildCabinet(); animate(); }
async function bootWithFont() {
  // 蒐集所有會印在 3D 標籤上的中文：藥名、性味、櫃名
  const chars = new Set();
  HERBS.forEach(h => [...h.name].forEach(c => chars.add(c)));
  NATURES.forEach(n => [...n.name].forEach(c => chars.add(c)));
  CABS.forEach(c => [...c.label].forEach(ch => chars.add(ch)));
  const text = [...chars].join("");
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.race([
        Promise.all([
          document.fonts.load(`400 48px "LXGW WenKai TC"`, text),
          document.fonts.load(`700 48px "LXGW WenKai TC"`, text),
        ]).then(() => document.fonts.ready),
        new Promise(res => setTimeout(res, 4000)),   // 最多等 4 秒，逾時就先用 fallback 開場
      ]);
    }
  } catch (e) { /* 載入失敗：以 fallback 字型開場 */ }
  startScene();
}
bootWithFont();
