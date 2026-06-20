/* 藥劑師：整理藥房 —— 第一人稱 3D 版（室內）
   在溫暖的木造藥房裡走動，把散亂、東倒西歪躺在工作桌上的乾藥材撿起來，
   拉開百子櫃對應的抽屜放進去，把每一格都收滿。無計時、無失敗。 */

import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

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
  { id: "oregano",    name: "奧勒岡", icon: "🌿", color: 0x7a8a4a, shape: "mint" },
  { id: "basil",      name: "羅勒",   icon: "🌿", color: 0x4a8a3a, shape: "mint" },
  { id: "marjoram",   name: "馬鬱蘭", icon: "🌿", color: 0x8a9a6a, shape: "mint" },
  { id: "lemonbalm",  name: "香蜂草", icon: "🌿", color: 0x6aa04a, shape: "mint" },
  { id: "tarragon",   name: "龍蒿",   icon: "🌿", color: 0x7a9a55, shape: "fern" },
  { id: "bay",        name: "月桂葉", icon: "🍃", color: 0x5a7a45, shape: "clover" },
  { id: "parsley",    name: "歐芹",   icon: "🌿", color: 0x4a8a3a, shape: "clover" },
  // 西洋花籽
  { id: "chamomile",  name: "洋甘菊", icon: "🌼", color: 0xeee2b0, shape: "daisy" },
  { id: "calendula",  name: "金盞花", icon: "🌼", color: 0xf0a040, shape: "sun" },
  { id: "stjohns",    name: "聖約翰草",icon: "🌼", color: 0xe8c84a, shape: "daisy" },
  { id: "dill",       name: "蒔蘿",   icon: "🌿", color: 0x8aaa6a, shape: "fern" },
  { id: "fennel",     name: "茴香",   icon: "🌿", color: 0x9aaa6a, shape: "fern" },
  { id: "caraway",    name: "葛縷子", icon: "🟤", color: 0x9a7a4a, shape: "berry" },
  // 擴充至 100 味（溫熱）
  { id: "ganjiang",   name: "乾薑",   color: 0xc89a5a, shape: "root" },
  { id: "fuzi",       name: "附子",   color: 0x8a6a4a, shape: "root" },
  { id: "banxia",     name: "半夏",   color: 0xcdbb8a, shape: "root" },
  { id: "heshouwu",   name: "何首烏", color: 0x5a3a28, shape: "root" },
  { id: "houpo",      name: "厚朴",   color: 0x6a4a32, shape: "root" },
  { id: "longyan",    name: "龍眼肉", color: 0x7a4a2a, shape: "berry" },
  { id: "wuzhuyu",    name: "吳茱萸", color: 0x6a5a2a, shape: "berry" },
  { id: "sharen",     name: "砂仁",   color: 0x9a7a4a, shape: "berry" },
  { id: "xingren",    name: "杏仁",   color: 0xcdb088, shape: "berry" },
  { id: "dongchong",  name: "冬蟲夏草",color: 0x9a7a3a, shape: "mushroom" },
  { id: "lemongrass", name: "檸檬草", color: 0x9aaa6a, shape: "fern" },
  { id: "fenugreek",  name: "葫蘆巴", color: 0xb59a5a, shape: "berry" },
  // 平和
  { id: "maidong",    name: "麥冬",   color: 0xe6e0c8, shape: "root" },
  { id: "tianma",     name: "天麻",   color: 0xd8c8a0, shape: "root" },
  { id: "niuxi",      name: "牛膝",   color: 0xb09a6a, shape: "root" },
  { id: "baiguo",     name: "白果",   color: 0xd8d0a8, shape: "berry" },
  { id: "qianshi",    name: "芡實",   color: 0xe0d6b8, shape: "berry" },
  { id: "yiner",      name: "銀耳",   color: 0xeae0cf, shape: "mushroom" },
  { id: "muer",       name: "木耳",   color: 0x3a2a28, shape: "mushroom" },
  { id: "wumei",      name: "烏梅",   color: 0x3a2a22, shape: "berry" },
  { id: "valerian",   name: "纈草",   color: 0xb59a72, shape: "root" },
  { id: "baihe",      name: "百合",   color: 0xe8dcc8, shape: "root" },
  // 寒涼
  { id: "huanglian",  name: "黃連",   color: 0xc8a83a, shape: "root" },
  { id: "huangqin",   name: "黃芩",   color: 0xb89a4a, shape: "root" },
  { id: "dahuang",    name: "大黃",   color: 0xa86a3a, shape: "root" },
  { id: "zhimu",      name: "知母",   color: 0xd8c8a0, shape: "root" },
  { id: "baishao",    name: "白芍",   color: 0xe0d4c0, shape: "root" },
  { id: "chaihu",     name: "柴胡",   color: 0xc0a878, shape: "root" },
  { id: "zhizi",      name: "梔子",   color: 0xd88a3a, shape: "berry" },
  { id: "niubangzi",  name: "牛蒡子", color: 0x8a7a5a, shape: "berry" },
  { id: "yiyiren",    name: "薏苡仁", color: 0xe0dac4, shape: "berry" },
  { id: "spearmint",  name: "綠薄荷", color: 0x4aa05a, shape: "mint" },
  { id: "yarrow",     name: "西洋蓍草",color: 0xd8d0b0, shape: "daisy" },
  { id: "nettle",     name: "蕁麻",   color: 0x4a7a3a, shape: "clover" },
];

// ---------- 房間尺寸 ----------
const ROOM = 18, HALF = ROOM / 2, WALL_H = 4.0;

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
controls.getObject().position.set(0, 1.6, 6);   // 站在房間中央偏前，面向後牆的百子櫃
scene.add(controls.getObject());

const mat = (hex, rough = 0.95) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough });

// ---------- 燈光（藥房暖意） ----------
scene.add(new THREE.HemisphereLight(0xffe9cf, 0x2a2018, 0.55));
scene.add(new THREE.AmbientLight(0xfff2e0, 0.34));
// 從窗戶斜射進來的暖陽（投影）
const sun = new THREE.DirectionalLight(0xffe2b4, 1.25);
sun.position.set(8.5, 7, 5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 32 });
sun.shadow.bias = -0.0004;
sun.target.position.set(0, 1, -4); scene.add(sun.target); scene.add(sun);
// 天花板暖光吊燈
const lamp = new THREE.PointLight(0xffc27a, 1.7, 24, 1.6);
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
  // 地毯（百子櫃前）
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.2), mat(0x7a3a32, 0.98));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -5.5); scene.add(rug);

  // 天花板
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM, ROOM), mat(0x3a2c20, 0.98));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = WALL_H; scene.add(ceil);
  // 天花板橫樑
  for (let i = -3; i <= 3; i++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(ROOM, 0.18, 0.16), mat(0x4a3422, 0.92));
    beam.position.set(0, WALL_H - 0.1, i * 2.4); scene.add(beam);
  }

  // 四面牆（暖色灰泥木骨架）
  const wallMat = mat(0x9a7a58, 0.97);
  const wall = (w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), wallMat);
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m);
  };
  wall(ROOM, WALL_H, 0, WALL_H / 2, -HALF, 0);          // 後牆
  wall(ROOM, WALL_H, 0, WALL_H / 2, HALF, 0);           // 前牆
  wall(ROOM, WALL_H, -HALF, WALL_H / 2, 0, Math.PI / 2);// 左牆
  wall(ROOM, WALL_H, HALF, WALL_H / 2, 0, Math.PI / 2); // 右牆（含窗，下面再貼窗）
  // 踢腳板
  const baseMat = mat(0x5e4128, 0.9);
  [[ROOM, 0, -HALF + 0.11, 0], [ROOM, 0, HALF - 0.11, 0],
   [ROOM, -HALF + 0.11, 0, Math.PI / 2], [ROOM, HALF - 0.11, 0, Math.PI / 2]]
    .forEach(([w, x, z, ry]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, 0.1), baseMat);
      b.position.set(x, 0.14, z); b.rotation.y = ry; scene.add(b);
    });

  // 後牆的窗戶（發光玻璃 + 木框，讓暖陽有來源）；抬高到後牆藥櫃上方
  const winY = 2.95;
  const gpane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.8), new THREE.MeshBasicMaterial({ color: 0xfff0cf }));
  gpane.position.set(0, winY, -HALF + 0.11); scene.add(gpane);
  const fr = mat(0x5e4128, 0.9);
  [[3.1, winY - 1.0], [3.1, winY + 1.0]].forEach(([wd, y]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(wd, 0.16, 0.14), fr); m.position.set(0, y, -HALF + 0.12); scene.add(m);
  });
  [[-1.4], [1.4]].forEach(([x]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.9, 0.14), fr); m.position.set(x, winY, -HALF + 0.12); scene.add(m);
  });
  const mull = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.9, 0.1), fr); mull.position.set(0, winY, -HALF + 0.12); scene.add(mull);

  // 前牆掛幾束風乾的藥草（裝飾）；只用「乾草」類，倒掛才合理
  const hangable = HERBS.filter((h) => ["mint", "fern", "clover", "lavender"].includes(h.shape));
  for (let i = 0; i < 7; i++) {
    const h = hangable[(Math.random() * hangable.length) | 0];
    const b = makeHerbModel(h); b.scale.setScalar(1.4);
    b.position.set(-6 + i * 2, 3.1, HALF - 0.25);
    b.rotation.set(0, 0, Math.PI);   // 倒掛
    scene.add(b);
  }
  // 研缽（擺在地上一角當道具）
  const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.16, 16), mat(0x8a8078, 0.6));
  mortar.position.set(3.8, 0.08, -1.0); mortar.castShadow = true; scene.add(mortar);

  buildStraw();
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

// ---------- 地上的稻草區（攤鋪乾藥材的地方） ----------
const STRAW = [
  { cx: 0,    cz: -2.2, w: 7.5, d: 4.4 },   // 中央
  { cx: -5.6, cz: 3.0,  w: 4.8, d: 5.6 },   // 左前
  { cx: 5.6,  cz: 3.0,  w: 4.8, d: 5.6 },   // 右前
];
// 乾淨的暖色稻草貼圖（同向細稻稈，無格線、無雜質）
function makeMatTexture() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#c6a85e"; ctx.fillRect(0, 0, 256, 256);   // 暖色稻草底
  const cols = ["#cdb06a", "#d8c179", "#c2a052", "#caa860", "#bb9850"];
  for (let i = 0; i < 2200; i++) {                            // 近水平、同向的細稻稈，乾淨不雜亂
    ctx.strokeStyle = cols[(Math.random() * cols.length) | 0];
    ctx.globalAlpha = 0.25 + Math.random() * 0.35;
    ctx.lineWidth = 1 + Math.random() * 1.2;
    const x = Math.random() * 256, y = Math.random() * 256, len = 14 + Math.random() * 30, a = (Math.random() - 0.5) * 0.22;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  return tex;
}
// 鋪稻草：每區一塊乾淨的稻草墊（可踩、不擋路）
function buildStraw() {
  STRAW.forEach(({ cx, cz, w, d }) => {
    const tex = makeMatTexture();
    tex.repeat.set(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(d / 3)));
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(cx, 0.02, cz); pad.receiveShadow = true; scene.add(pad);
  });
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
  if (sub) { ctx.font = "bold 30px 'Microsoft JhengHei',sans-serif"; ctx.fillStyle = "#ffe9a8"; ctx.fillText(sub, 128, 98); }
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
  const cv = document.createElement("canvas"); cv.width = 200; cv.height = 92;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#efe6cf"; roundRect(ctx, 4, 4, 192, 84, 9); ctx.fill();   // 米白紙
  ctx.strokeStyle = "#7a5a36"; ctx.lineWidth = 3; ctx.stroke();              // 外框
  ctx.strokeStyle = "#b39565"; ctx.lineWidth = 1; roundRect(ctx, 11, 11, 178, 70, 6); ctx.stroke();  // 內細框
  ctx.fillStyle = "#4a3320"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fs = name.length >= 4 ? 38 : name.length === 3 ? 46 : 54;
  ctx.font = `${fs}px "Microsoft JhengHei", serif`;
  ctx.fillText(name, 100, 48);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  return spr;
}

// 類別牌：彩色木牌、直書類別名（掛在每一排左側）
function makeCatLabel(name, color) {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 256;
  const ctx = cv.getContext("2d");
  const c = new THREE.Color(color);
  ctx.fillStyle = `rgb(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0})`;
  roundRect(ctx, 8, 8, 112, 240, 16); ctx.fill();
  ctx.strokeStyle = "rgba(28,20,12,0.85)"; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = "#1a120a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,255,255,0.4)"; ctx.shadowBlur = 2;
  const chars = name.split("");
  const fs = 52, lh = fs + 8, startY = 128 - (chars.length - 1) * lh / 2;
  ctx.font = `bold ${fs}px 'Microsoft JhengHei', serif`;
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
const NATURES = [
  { key: "warm",    name: "溫熱", color: 0xc8603a },
  { key: "neutral", name: "平和", color: 0xb89a5a },
  { key: "cold",    name: "寒涼", color: 0x4f8aa8 },
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
const LABEL_W = 0.95;  // 左側類別牌寬
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
  ctx.font = "bold 34px 'Microsoft JhengHei', serif"; ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
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

// 單座櫃的木框架：背板 + 層板 + 側板 + 頂冠底座 + 櫃名牌 + 每排性味牌
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
  const head = makeHeader(spec.label);     // 櫃名牌
  head.scale.set(2.0, 0.5, 1); head.position.set(0, cy + cabH / 2 + 0.18, SHELF_D + 0.14); group.add(head);
  rows.forEach((row, ri) => {              // 每排左側性味牌
    const nat = NATURES.find((n) => n.key === row.natureKey);
    const sign = makeCatLabel(nat.name, nat.color);
    sign.scale.set(LABEL_W * 0.7, RH * 0.82, 1);
    sign.position.set(-W / 2 + LABEL_W / 2, CAB_BASE + ri * RH, SHELF_D + 0.05); group.add(sign);
  });
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

  // 把每種藥材的 PER_HERB 份攤到地上的稻草區（依面積加權挑區）
  const totalArea = STRAW.reduce((a, t) => a + t.w * t.d, 0);
  const pickArea = () => {
    let r = Math.random() * totalArea;
    for (const t of STRAW) { r -= t.w * t.d; if (r <= 0) return t; }
    return STRAW[0];
  };
  all.forEach((h) => { for (let k = 0; k < PER_HERB; k++) scatterHerb(h, pickArea()); });

  updateHud();
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
  sign.scale.set(JW * 0.76, JH * 0.35, 1); sign.position.set(0, JH * 0.34, JR + 0.02); g.add(sign);
  // 目標圈 + 放置位置（罐內 local：整齊一排、等距置中）
  const positions = [], rings = [];
  const ringMat = new THREE.MeshStandardMaterial({ color: h.color, emissive: h.color, emissiveIntensity: 0.5, transparent: true, opacity: 0.5 });
  const spacing = 0.075;
  for (let i = 0; i < PER_HERB; i++) {
    const off = (i - (PER_HERB - 1) / 2) * spacing;
    positions.push(off);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.005, 8, 16), ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.set(off, 0.015, 0); g.add(ring); rings.push(ring);
  }
  parent.add(g);
  // 命中盒（罐子範圍）
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(JR * 1.15, JR * 1.15, JH + 0.12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(lx, ly + JH / 2, JAR_Z); parent.add(hit);
  const data = { herb: h.id, cap: PER_HERB, count: 0, positions, rings, group: g, hit, trayY: 0.02, filled: false, placedMeshes: [] };
  hit.userData = { type: "slot", data };
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

function updateAim() {
  raycaster.setFromCamera(center, camera);

  // 撿拾目標（桌上的乾藥材）
  let herbHit = null;
  const hh = raycaster.intersectObjects(herbMeshes, true);
  if (hh.length) {
    let o = hh[0].object; while (o && !o.userData.type) o = o.parent;
    if (o) herbHit = { type: "herb", herb: o.userData.herb, object: o, dist: hh[0].distance };
  }
  // 擺放目標（抽屜，需手上有藥材才有意義）
  let slotHit = null;
  if (heldMeshes.length) {
    const sh = raycaster.intersectObjects(slotMeshes, false);
    if (sh.length) slotHit = { type: "slot", data: sh[0].object.userData.data, dist: sh[0].distance };
  }
  // 取較近的那個
  let hit = null;
  if (herbHit && slotHit) hit = herbHit.dist <= slotHit.dist ? herbHit : slotHit;
  else hit = herbHit || slotHit;
  aimTarget = hit;

  const cross = document.getElementById("cross");
  const prompt = document.getElementById("prompt");
  if (hit) {
    cross.classList.add("active");
    if (hit.type === "herb") {
      if (heldMeshes.length >= MAX_CARRY) prompt.textContent = `手上已滿（${MAX_CARRY} 份）`;
      else prompt.textContent = `撿起 ${nameOf(hit.herb)}（手上 ${heldMeshes.length}/${MAX_CARRY}）`;
    } else {
      const slot = hit.data;
      if (slot.count >= slot.cap) prompt.textContent = nameOf(slot.herb) + " 已裝滿 ✨";
      else if (heldHas(slot.herb)) prompt.textContent = `裝入藥罐：${nameOf(slot.herb)}（${slot.count}/${slot.cap}）`;
      else prompt.textContent = `這罐要裝「${nameOf(slot.herb)}」(手上沒有)`;
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
  heldMeshes.forEach((m, i) => {
    const off = (i - (heldMeshes.length - 1) / 2) * 0.2;
    m.position.set(0.36 + off, -0.44 - (i % 2) * 0.03, -0.9);
    m.rotation.set(0, 0, 0);
    m.scale.setScalar(1.05);
  });
}

function interact() {
  if (!active() || !aimTarget) return;

  if (aimTarget.type === "herb") {
    // 撿拾（一次最多拿 MAX_CARRY 份，種類不限可混拿）
    if (heldMeshes.length >= MAX_CARRY) { toast(`手上已滿（${MAX_CARRY} 份）`); return; }
    const o = aimTarget.object;
    const herbId = o.userData.herb;
    (o.parent || tableGroup).remove(o);
    const idx = herbMeshes.indexOf(o); if (idx >= 0) herbMeshes.splice(idx, 1);
    const hi = state.herbsOnTable.indexOf(o); if (hi >= 0) state.herbsOnTable.splice(hi, 1);
    const bundle = makeHerbModel(HERBS.find((x) => x.id === herbId));
    bundle.userData.type = "herb"; bundle.userData.herb = herbId;
    camera.add(bundle); heldMeshes.push(bundle); arrangeHand();
    sparkle(new THREE.Vector3().setFromMatrixPosition(o.matrixWorld));
    sfx.pick(); updateHud();

  } else if (aimTarget.type === "slot" && heldMeshes.length) {
    const slot = aimTarget.data;
    if (slot.count >= slot.cap) { toast("這罐已經裝滿了 ✨"); return; }
    if (!heldHas(slot.herb)) { toast("手上沒有「" + nameOf(slot.herb) + "」"); sfx.back(); return; }
    // 從手上挑出符合這格的藥材，放到滿為止
    const avail = heldMeshes.filter((m) => m.userData.herb === slot.herb).length;
    const n = Math.min(avail, slot.cap - slot.count);
    for (let j = 0; j < n; j++) {
      const i = slot.count;
      const k = heldMeshes.findIndex((m) => m.userData.herb === slot.herb);
      const pot = heldMeshes.splice(k, 1)[0];
      camera.remove(pot);
      pot.scale.setScalar(0.34);
      // 完美歸位：直立、朝同一方向、等距排成一排（清除手上把玩時的旋轉）
      pot.rotation.set(0, 0, 0);
      if (pot.userData.plant) pot.userData.plant.rotation.set(0, 0, 0);
      pot.position.set(slot.positions[i], slot.trayY, 0);
      slot.group.add(pot);
      slot.placedMeshes.push(pot);
      slot.rings[i].visible = false;
      slot.count++;
      if (slot.count >= slot.cap) slot.filled = true;
      const wp = new THREE.Vector3(); slot.group.getWorldPosition(wp); wp.y += JH / 2;
      sparkle(wp);
    }
    arrangeHand();
    if (slot.filled) sfx.full(); else sfx.plop(slot.count);
    updateHud();
    checkWin();
  }
}

function dropHeld() {
  if (!heldMeshes.length) return;
  // 把手上的全部放回地上（相機前方散開）
  const p = new THREE.Vector3(); camera.getWorldPosition(p);
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const base = p.clone().add(dir.multiplyScalar(1.2)); base.y = 0;
  heldMeshes.forEach((m, i) => {
    camera.remove(m);
    const a = (i / heldMeshes.length) * Math.PI * 2;
    const mx = base.x + Math.cos(a) * 0.5, mz = base.z + Math.sin(a) * 0.5;
    m.position.set(mx, 0.03, mz);
    m.scale.setScalar(1);
    m.rotation.set(Math.random() * 0.3, Math.random() * Math.PI * 2, 0);
    tableGroup.add(m);
    herbMeshes.push(m); state.herbsOnTable.push(m);
  });
  heldMeshes = [];
  updateHud();
}

// ---------- 進度 / 過關 ----------
function updateHud() {
  const placed = state.slots.reduce((a, s) => a + s.count, 0);
  const need = state.slots.reduce((a, s) => a + s.cap, 0);
  document.getElementById("filled").textContent = placed + "/" + need;
  if (!heldMeshes.length) {
    document.getElementById("held").textContent = "空手";
  } else {
    const counts = {};
    heldMeshes.forEach((m) => (counts[m.userData.herb] = (counts[m.userData.herb] || 0) + 1));
    document.getElementById("held").textContent =
      Object.entries(counts).map(([id, n]) => `${nameOf(id)}×${n}`).join(" ");
  }
}
function checkWin() {
  if (!state.slots.length || !state.slots.every((s) => s.count >= s.cap)) return;
  sfx.win();
  setTimeout(() => showWin(), 500);
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

// ---------- 過關面板 ----------
function showWin() {
  const ov = document.getElementById("overlay");
  ov.querySelector(".panel").innerHTML = `
    <div class="sigil">✦ ❖ ✦</div>
    <h2>整理完成 · 藥罐全部歸位</h2>
    <p>地上的雜亂乾藥材都分類裝進玻璃藥罐了 ✨<br/>滿架藥罐，藥香宜人。</p>
    <div class="big">點擊畫面再整理一次 ⚗</div>
    <p class="hint">慢慢來，沒有時間限制 🍵</p>`;
  ov.classList.remove("hide");
  pendingNext = true;
}
let pendingNext = false;

// ---------- 暫停面板（按 Esc 放開滑鼠時顯示，內容與開頭不同） ----------
function showPause() {
  const placed = state.slots.reduce((a, s) => a + s.count, 0);
  const need = state.slots.reduce((a, s) => a + s.cap, 0);
  document.getElementById("overlay").querySelector(".panel").innerHTML = `
    <div class="sigil">⏸ ❖ ⏸</div>
    <h2>暫停 · 喝口茶歇會兒</h2>
    <p>目前已收好 <b>${placed}/${need}</b> 份藥材。<br/>藥材不會跑掉，慢慢來就好 🍵</p>
    <div class="keys">
      <span class="key">W A S D｜走動</span>
      <span class="key">滑鼠｜環顧</span>
      <span class="key">點擊｜撿起 / 裝入藥罐</span>
      <span class="key">Q / 右鍵｜放回地上</span>
    </div>
    <div class="big">點擊畫面繼續整理 ⚗</div>
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
  if (e.code === "KeyQ") dropHeld();
  if (e.code === "KeyM") { muted = !muted; }
});
addEventListener("keyup", (e) => (keys[e.code] = false));

const overlay = document.getElementById("overlay");
function startPlay() {
  if (pendingNext) { pendingNext = false; buildCabinet(); }   // 重新整理一輪
  if (IS_TOUCH) { touchStarted = true; overlay.classList.add("hide"); }
  else controls.lock();
}
overlay.addEventListener("click", startPlay);
controls.addEventListener("lock", () => overlay.classList.add("hide"));
controls.addEventListener("unlock", () => {
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
      else if (t.identifier === lookId) { if (!moved) interact(); lookId = null; }
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
    e.stopPropagation(); touchStarted = false; joyVec.x = joyVec.y = 0; showPause(); overlay.classList.remove("hide");
  });
})();

// ---------- 移動（平坦地板 + 牆/家具碰撞） ----------
const dirVec = new THREE.Vector3();
function inBlocker(b, x, z, r) {
  return x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r;
}
function move(dt) {
  if (!active()) return;
  const speed = 3.0;
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
buildRoom();
buildCabinet();
animate();
