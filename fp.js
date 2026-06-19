/* 藥劑師：整理香草園 —— 第一人稱 3D 版
   在陽光香草園裡走動，拾取桌上的盆栽香草，擺到木架上對應種類的架位，
   把每個架位都擺好。無計時、無失敗。 */

import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// ---------- 藥草資料 ----------
// 10 種中醫常用藥草（shape = 對應的 3D 外型模型）
const HERBS = [
  { id: "renshen",   name: "人參",   icon: "🫚", color: 0xe0cfa0, shape: "root" },
  { id: "gouqi",     name: "枸杞",   icon: "🔴", color: 0xd2342a, shape: "berry" },
  { id: "lingzhi",   name: "靈芝",   icon: "🍄", color: 0x8a3a22, shape: "mushroom" },
  { id: "juhua",     name: "菊花",   icon: "🌼", color: 0xf0c93a, shape: "sun" },
  { id: "bohe",      name: "薄荷",   icon: "🌿", color: 0x5aa46e, shape: "mint" },
  { id: "aicao",     name: "艾草",   icon: "🍃", color: 0x8fa86a, shape: "fern" },
  { id: "jinyinhua", name: "金銀花", icon: "🌸", color: 0xf2e8c0, shape: "daisy" },
  { id: "honghua",   name: "紅花",   icon: "🌺", color: 0xe0552a, shape: "rose" },
  { id: "jiegeng",   name: "桔梗",   icon: "🪻", color: 0x6f7fd0, shape: "tulip" },
  { id: "huoxiang",  name: "藿香",   icon: "💜", color: 0x9a7fc0, shape: "lavender" },
];
const ROOM = 24, HALF = ROOM / 2, WALL_H = 4.2;   // 放大花園

// ---------- 基礎 ----------
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = makeSky();
scene.fog = new THREE.Fog(0xcfe6f0, 20, 52);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 100);
const controls = new PointerLockControls(camera, document.body);
controls.getObject().position.set(0, 1.8, 9);   // 後移一點欣賞更大的花園
scene.add(controls.getObject());

// ---------- 燈光（暖色燭光氛圍） ----------
// 戶外天光：天空藍 / 草地綠的半球光 + 太陽方向光
scene.add(new THREE.HemisphereLight(0xbfe0ff, 0x6f9a48, 1.3));
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const sun = new THREE.DirectionalLight(0xfff2d6, 2.4);
sun.position.set(9, 15, 7); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 70 });
sun.shadow.bias = -0.0004;
scene.add(sun);
// 太陽本體
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff6d8 }));
sunBall.position.set(16, 22, -14); scene.add(sunBall);

// ---------- 房間 ----------
// 漸層天空貼圖
function makeSky() {
  const cv = document.createElement("canvas"); cv.width = 16; cv.height = 256;
  const ctx = cv.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#5ea8e0"); g.addColorStop(0.55, "#bfe2f2"); g.addColorStop(1, "#e9f4dc");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  return new THREE.CanvasTexture(cv);
}
const mat = (hex, rough = 0.95) => new THREE.MeshStandardMaterial({ color: hex, roughness: rough });

// ---------- 地形：小山坡（高斯隆起）----------
function terrainHeight(x, z) {
  const bump = (cx, cz, r, hgt) => hgt * Math.exp(-(((x - cx) ** 2 + (z - cz) ** 2)) / (2 * r * r));
  let y = 0;
  y += bump(7, 4.5, 3.0, 2.4);     // 右側主要小山坡
  y += bump(-7.5, 5.5, 2.6, 1.5);  // 左側小丘
  y += bump(8, -1, 2.4, 1.0);      // 右後再一個緩坡
  return y;
}

// 起伏草地（用細分平面位移做出小山坡）
const GSIZE = 64, GSEG = 128;
const groundGeo = new THREE.PlaneGeometry(GSIZE, GSIZE, GSEG, GSEG);
{
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i), ly = pos.getY(i);   // 旋轉後：世界 x=lx, 世界 z=-ly, 位移(local z)→世界 y
    pos.setZ(i, terrainHeight(lx, -ly));
  }
  groundGeo.computeVertexNormals();
}
const ground = new THREE.Mesh(groundGeo, mat(0x6fa84a, 1));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

// 木柵欄圍一圈（貼合地形高度）
function fencePost(x, z) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.16), mat(0x7a5636, 0.9));
  p.position.set(x, terrainHeight(x, z) + 0.55, z); p.castShadow = true; scene.add(p);
}
function fenceRail(x, z, len, horiz) {
  [0.8, 0.45].forEach((y) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 0.1, 0.12, horiz ? 0.1 : len), mat(0x8a663f, 0.9));
    r.position.set(x, terrainHeight(x, z) + y, z); scene.add(r);
  });
}
for (let i = -HALF; i <= HALF; i += 1.6) {
  fencePost(i, -HALF); fencePost(i, HALF); fencePost(-HALF, i); fencePost(HALF, i);
}
fenceRail(0, -HALF, ROOM, true); fenceRail(0, HALF, ROOM, true);
fenceRail(-HALF, 0, ROOM, false); fenceRail(HALF, 0, ROOM, false);

// 樹（坐落在地形上）
function tree(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 1.5 * s, 8), mat(0x6b4a2f, 0.9));
  trunk.position.y = 0.75 * s; trunk.castShadow = true; g.add(trunk);
  const foliMat = mat(0x4f8a3a, 0.9);
  [[0,1.7,0,1],[-0.45,1.5,0.2,0.7],[0.45,1.55,-0.2,0.75],[0,2.05,0,0.7]].forEach(([fx,fy,fz,fs]) => {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * s * fs, 0), foliMat);
    f.position.set(fx * s, fy * s, fz * s); f.castShadow = true; g.add(f);
  });
  g.position.set(x, terrainHeight(x, z), z); scene.add(g);
}
// 山坡頂與四周點綴幾棵樹
tree(7, 4.5, 1.3); tree(-7.5, 5.5, 1.1); tree(-10, -8, 1.2); tree(10, -8, 1);
tree(-10, 9, 1.2); tree(10, 9.5, 1.3); tree(8, -1, 1);

// 開花小灌木叢
function bush(x, z, color) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), mat(0x4f8a3a, 0.9));
  base.position.y = 0.4; base.castShadow = true; g.add(base);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(0.2) }));
    const a = Math.random() * Math.PI * 2, r = 0.32 + Math.random() * 0.12;
    f.position.set(Math.cos(a) * r, 0.4 + Math.random() * 0.32, Math.sin(a) * r); g.add(f);
  }
  g.position.set(x, terrainHeight(x, z), z); scene.add(g);
}
[[-6,3.6,0xff6f9a],[6,3.8,0xffd24a],[-8,-3,0x9a7fd6],[8,2,0xff8a5a],[9,0.5,0xffffff],
 [-9,0.6,0xff6f9a],[5.5,6,0xffd24a],[-5.5,7,0x9a7fd6]]
  .forEach(([x, z, c]) => bush(x, z, c));

// 踏腳石小徑（從園子通往屋門，貼合地形）
for (let i = 0; i < 9; i++) {
  const z = 5.5 - i * 1.2;
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 14), mat(0xa39c8c, 1));
  s.position.set(0, terrainHeight(0, z) + 0.03, z); s.receiveShadow = true; scene.add(s);
}

// ---------- 整理小屋（架子在屋內，要走進去） ----------
const blockers = [];   // 牆面碰撞盒（XZ 軸對齊矩形）
(function buildRoom() {
  const wallMat = mat(0xe2d2b2, 0.95);
  const wallH = 2.7, wt = 0.2;
  const minX = -3.9, maxX = 3.9, frontZ = -4.6, backZ = -7.7, doorHalf = 0.85;
  const midZ = (frontZ + backZ) / 2, depth = frontZ - backZ;
  function addWall(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wallMat);
    m.position.set(cx, wallH / 2, cz); m.castShadow = m.receiveShadow = true; scene.add(m);
    blockers.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  addWall(0, backZ, (maxX - minX) + wt, wt);                 // 後牆
  addWall(minX, midZ, wt, depth);                            // 左牆
  addWall(maxX, midZ, wt, depth);                            // 右牆
  const segW = (-doorHalf) - minX;                           // 前牆左 / 右段（留門洞）
  addWall((minX - doorHalf) / 2, frontZ, segW, wt);
  addWall((maxX + doorHalf) / 2, frontZ, segW, wt);
  // 門框
  [-doorHalf, doorHalf].forEach((dx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.25, 0.26), mat(0x6b4a2f, 0.9));
    post.position.set(dx, 1.12, frontZ); scene.add(post);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorHalf * 2 + 0.3, 0.24, 0.26), mat(0x6b4a2f, 0.9));
  lintel.position.set(0, 2.25, frontZ); scene.add(lintel);
  // 屋頂橫樑（不全封，保持採光）
  for (let i = -2; i <= 2; i++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry((maxX - minX) + 0.4, 0.1, 0.12), mat(0x6b4a2f, 0.9));
    beam.position.set(0, wallH + 0.06, midZ + i * 0.72); scene.add(beam);
  }
  // 室內木地板
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(maxX - minX, depth + 0.1), mat(0x8a6a44, 1));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.02, midZ); fl.receiveShadow = true; scene.add(fl);
  // 門口地墊
  const matRug = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), mat(0x9a5f44, 1));
  matRug.rotation.x = -Math.PI / 2; matRug.position.set(0, 0.025, frontZ + 0.6); scene.add(matRug);
})();

// ---------- 標籤貼圖（emoji + 名稱） ----------
function makeLabel(text, sub) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "rgba(20,14,22,0.82)";
  roundRect(ctx, 4, 4, 248, 120, 18); ctx.fill();
  ctx.strokeStyle = "rgba(231,200,115,0.8)"; ctx.lineWidth = 3; ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "54px serif"; ctx.fillText(text, 128, 50);
  if (sub) { ctx.font = "bold 30px 'Microsoft JhengHei',sans-serif"; ctx.fillStyle = "#efe2c4"; ctx.fillText(sub, 128, 96); }
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  spr.scale.set(0.9, 0.45, 1);
  return spr;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}

// ---------- 櫃子 + 架位 ----------
const state = { level: 1, slots: [], herbsOnTable: [], held: null, heldCount: 0 };
const slotMeshes = [];  // 可互動：架位（raycast 用）
const herbMeshes = [];  // 可互動：盆栽

const cabinetGroup = new THREE.Group();
scene.add(cabinetGroup);
const tableGroup = new THREE.Group();
scene.add(tableGroup);

const SHELF_Z = -7.45, SHELF_TOP = 1.05, POT_Y = 1.05, TABLE_TOP = 0.99;   // 固定在小屋內
function clearGroup(g, arr) { while (g.children.length) g.remove(g.children[0]); arr.length = 0; }

const PER_HERB = 3;   // 每種藥草的株數 / 每格容量

function buildCabinet() {
  // 移除上一輪已擺好的藥草束（它們加在 scene 上）
  state.slots.forEach((s) => (s.placedMeshes || []).forEach((m) => scene.remove(m)));
  clearGroup(cabinetGroup, slotMeshes);
  clearGroup(tableGroup, herbMeshes);
  state.slots = []; state.herbsOnTable = [];

  // 單一關卡：全部 10 種，排成一整面中藥櫃（cols × rows 個小格）
  const chosen = shuffle([...HERBS]);
  const cols = 5, rows = 2;                 // 5 格 × 2 層 = 10 格
  const cellW = 1.32, cellH = 0.66;
  const cw = cols * cellW, baseY = 0.84;    // 最底層的層板頂面
  const cabH = rows * cellH;

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x5b3d29, roughness: 0.8 });
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x6b4a35, roughness: 0.8 });

  // 背板
  const back = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.16, cabH + 0.2, 0.1), frameMat);
  back.position.set(0, baseY + cabH / 2 - 0.02, SHELF_Z - 0.28); back.receiveShadow = true; cabinetGroup.add(back);
  // 水平層板（每層一塊 + 最上面頂板）
  for (let r = 0; r <= rows; r++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.16, 0.07, 0.62), boardMat);
    board.position.set(0, baseY + r * cellH - 0.035, SHELF_Z); board.castShadow = board.receiveShadow = true;
    cabinetGroup.add(board);
  }
  // 垂直分隔板（做出每一格）
  for (let c = 0; c <= cols; c++) {
    const div = new THREE.Mesh(new THREE.BoxGeometry(0.07, cabH, 0.6), frameMat);
    div.position.set(-cw / 2 + c * cellW, baseY + cabH / 2 - 0.035, SHELF_Z); div.castShadow = true;
    cabinetGroup.add(div);
  }

  // 屋前藥圃的種植點：較大的網格、留出中央小徑，再打散（需要 30 個，含山坡）
  const spots = [];
  for (let gx = -9; gx <= 9; gx += 1.3) {
    for (let gz = -3.6; gz <= 8.5; gz += 1.3) {
      if (Math.abs(gx) < 0.9) continue;
      spots.push([gx + (Math.random() - 0.5) * 0.5, gz + (Math.random() - 0.5) * 0.5]);
    }
  }
  shuffle(spots);
  let si = 0;

  // 逐格建立架位（每格容量 3）+ 在藥圃種出 3 株對應藥草
  chosen.forEach((h, idx) => {
    const col = idx % cols;
    const row = rows - 1 - Math.floor(idx / cols);     // 先填上層
    const x = -cw / 2 + cellW * (col + 0.5);
    const topY = baseY + row * cellH;
    makeSlot(h, x, topY, PER_HERB);
    for (let k = 0; k < PER_HERB; k++) {
      const spot = spots[si++ % spots.length];
      plantHerb(h, spot[0], spot[1]);
    }
  });

  updateHud();
}

// 一個架位（一格可放 cap 株）：cap 個目標圈 + 標籤 + 隱形命中盒
function makeSlot(h, x, topY, cap) {
  // cap 個並排的擺放位置與目標圈
  const positions = [];
  const rings = [];
  const spread = 0.42;                       // 三個位置的左右間距
  for (let i = 0; i < cap; i++) {
    const off = (i - (cap - 1) / 2) * spread;
    positions.push(off);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 20),
      new THREE.MeshStandardMaterial({ color: h.color, emissive: h.color, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.9 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x + off, topY + 0.02, SHELF_Z);
    cabinetGroup.add(ring); rings.push(ring);
  }

  // 每格自己的小標籤（貼在格子上緣）
  const sign = makeLabel(h.icon, h.name);
  sign.scale.set(0.55, 0.275, 1);
  sign.position.set(x, topY + 0.5, SHELF_Z - 0.05);
  cabinetGroup.add(sign);

  const hit = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.6, 0.55),
    new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(x, topY + 0.3, SHELF_Z); cabinetGroup.add(hit);

  const data = { herb: h.id, x, y: topY, cap, count: 0, positions, rings, filled: false, placedMeshes: [] };
  hit.userData = { type: "slot", data };
  slotMeshes.push(hit);
  state.slots.push(data);
}

// ====== 程序化 3D 香草（低多邊形真實模型）======
const pMat = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6, ...o });
const LEAF = 0x5aa44e, STEMC = 0x4a7c34;

function makeStem(h = 0.3, r = 0.012, color = STEMC) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.4, h, 6), pMat(color));
  m.position.y = h / 2; m.castShadow = true;
  return m;
}
function makeLeaf(size = 1, color = LEAF) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), pMat(color, { roughness: 0.45 }));
  m.scale.set(0.55 * size, 0.22 * size, 1.2 * size);
  m.castShadow = true;
  return m;
}

// 依外型 shape 搭建一株植物（基座在 y=0，高約 0.3）
function buildPlant(shape) {
  const g = new THREE.Group();
  switch (shape) {
    case "root": {                           // 人參：分叉的米黃色根 + 頂端小葉
      const main = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.22, 8),
        pMat(0xe6d6ae, { roughness: 0.85 }));
      main.position.y = 0.13; main.castShadow = true; g.add(main);
      // 分叉的鬚根
      [-1, 1, 0].forEach((dir, k) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.006, 0.16, 6),
          pMat(0xe0cfa0, { roughness: 0.85 }));
        leg.position.set(dir * 0.04, 0.04, (k - 1) * 0.03);
        leg.rotation.z = dir * 0.5; leg.rotation.x = (k - 1) * 0.3;
        leg.castShadow = true; g.add(leg);
      });
      // 細小鬚
      for (let i = 0; i < 4; i++) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.002, 0.06, 4), pMat(0xcdbb8c));
        const a = Math.random() * Math.PI * 2;
        w.position.set(Math.cos(a) * 0.03, 0.02, Math.sin(a) * 0.03);
        w.rotation.z = (Math.random() - 0.5) * 1.2; g.add(w);
      }
      // 頂端莖葉
      g.add(makeStem(0.12, 0.01, 0x3f7a30));
      for (let k = 0; k < 3; k++) {
        const lf = makeLeaf(0.7, 0x4f8a3a); const a = (k / 3) * Math.PI * 2;
        lf.position.set(Math.cos(a) * 0.04, 0.26, Math.sin(a) * 0.04);
        lf.rotation.y = -a; lf.rotation.x = -0.6; g.add(lf);
      }
      // 一兩顆人參紅果
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), pMat(0xc83030));
      fruit.position.set(0, 0.3, 0); g.add(fruit);
      break;
    }
    case "lavender": {                       // 藿香：多根細莖 + 紫色花穗
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Group();
        const h = 0.26 + Math.random() * 0.12;
        s.add(makeStem(h, 0.008, 0x4f7a3a));
        const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.032, 0.15, 6),
          pMat(0x9a7fd6, { emissive: 0x37265e, emissiveIntensity: 0.35 }));
        spike.position.y = h + 0.07; spike.castShadow = true; s.add(spike);
        s.rotation.z = (Math.random() - 0.5) * 0.55;
        s.rotation.y = (i / 6) * Math.PI * 2;
        g.add(s);
      }
      break;
    }
    case "mint": {                           // 薄荷：成對綠葉
      const h = 0.24; g.add(makeStem(h, 0.013, 0x3f7a30));
      for (let i = 0; i < 4; i++) {
        const y = 0.06 + i * 0.055;
        [-1, 1].forEach((side) => {
          const l = makeLeaf(1.0 - i * 0.13, 0x5fb24e);
          l.position.set(side * 0.055, y, 0);
          l.rotation.z = side * 0.55; l.rotation.y = (i % 2) * Math.PI / 2;
          g.add(l);
        });
      }
      const top = makeLeaf(0.7, 0x6fc25a); top.position.y = h + 0.015; top.rotation.x = Math.PI / 2; g.add(top);
      break;
    }
    case "rose": {                           // 玫瑰：莖 + 葉 + 多層花瓣
      const h = 0.22; g.add(makeStem(h, 0.014, 0x3f7a30));
      [-1, 1].forEach((s) => { const l = makeLeaf(0.85, 0x4f8a3a); l.position.set(s * 0.05, 0.1, 0); l.rotation.z = s * 0.6; g.add(l); });
      const bloom = new THREE.Group(); bloom.position.y = h + 0.03;
      bloom.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pMat(0xb83048)));
      [[0, 0xd6446a], [1, 0xe6688a]].forEach(([ring, col]) => {
        const count = 5 + ring * 3, rad = 0.04 + ring * 0.035;
        for (let i = 0; i < count; i++) {
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), pMat(col, { roughness: 0.4 }));
          petal.scale.set(0.7, 0.3, 1);
          const a = (i / count) * Math.PI * 2;
          petal.position.set(Math.cos(a) * rad, ring * 0.005, Math.sin(a) * rad);
          petal.rotation.y = -a; petal.rotation.x = 0.6; bloom.add(petal);
        }
      });
      bloom.castShadow = true; g.add(bloom);
      break;
    }
    case "mushroom": {                       // 靈芝：光亮的腎形褐紅菌蓋
      [[-0.05, 1], [0.06, 0.72]].forEach(([x, sc]) => {
        const mg = new THREE.Group(); mg.position.x = x;
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * sc, 0.028 * sc, 0.12 * sc, 8),
          pMat(0x7a4a2a, { roughness: 0.8 }));
        st.position.set(-0.04 * sc, 0.06 * sc, 0); st.castShadow = true; mg.add(st);
        // 腎形菌蓋：壓扁的半球，帶光澤同心環
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.085 * sc, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0x8a3a22, roughness: 0.25, metalness: 0.15 }));
        cap.scale.set(1.15, 0.5, 0.9); cap.position.y = 0.12 * sc; cap.castShadow = true; mg.add(cap);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05 * sc, 0.006 * sc, 6, 18),
          pMat(0xb86a3a, { roughness: 0.4 }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = 0.135 * sc; mg.add(ring);
        g.add(mg);
      });
      break;
    }
    case "clover": {                         // 三葉草：三梗，各頂三圓葉
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Group(); const h = 0.16 + Math.random() * 0.06;
        s.add(makeStem(h, 0.009, 0x4f9a3a));
        for (let k = 0; k < 3; k++) {
          const lf = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), pMat(0x5fb24e, { roughness: 0.5 }));
          lf.scale.set(1, 0.4, 1); const a = (k / 3) * Math.PI * 2;
          lf.position.set(Math.cos(a) * 0.04, h + 0.005, Math.sin(a) * 0.04); lf.castShadow = true; s.add(lf);
        }
        s.rotation.y = (i / 3) * Math.PI * 2; s.rotation.z = (Math.random() - 0.5) * 0.3;
        g.add(s);
      }
      break;
    }
    case "sun": {                            // 日輪花：向日葵頭
      const h = 0.28; g.add(makeStem(h, 0.018, 0x3f7a30));
      [-1, 1].forEach((s) => { const l = makeLeaf(1.1, 0x4f8a3a); l.position.set(s * 0.06, 0.12, 0); l.rotation.z = s * 0.7; g.add(l); });
      const head = new THREE.Group(); head.position.y = h + 0.02; head.rotation.x = -0.45;
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), pMat(0x6b4423, { roughness: 0.9 }));
      center.scale.y = 0.5; head.add(center);
      for (let i = 0; i < 12; i++) {
        const petal = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.006, 0.07),
          pMat(0xf0b81f, { roughness: 0.5, emissive: 0x3a2a00, emissiveIntensity: 0.25 }));
        const a = (i / 12) * Math.PI * 2; petal.position.set(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08);
        petal.rotation.y = -a; head.add(petal);
      }
      head.castShadow = true; g.add(head);
      break;
    }
    case "tulip": {                          // 桔梗：紫藍色鐘形花
      const h = 0.26; g.add(makeStem(h, 0.014, 0x3f7a30));
      [-1, 1].forEach((s) => {
        const l = makeLeaf(1.1, 0x4f9a3a); l.position.set(s * 0.04, 0.1, 0);
        l.rotation.z = s * 0.4; g.add(l);
      });
      const bloom = new THREE.Group(); bloom.position.y = h + 0.03;
      for (let i = 0; i < 5; i++) {                       // 五角星形的花瓣
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), pMat(0x6f7fd0, { roughness: 0.4 }));
        petal.scale.set(0.55, 0.7, 0.28);
        const a = (i / 5) * Math.PI * 2;
        petal.position.set(Math.cos(a) * 0.04, 0.01, Math.sin(a) * 0.04);
        petal.rotation.y = -a; petal.rotation.x = 0.7; bloom.add(petal);
      }
      const heart = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pMat(0xe9ecff));
      heart.scale.y = 0.5; bloom.add(heart);
      bloom.castShadow = true; g.add(bloom);
      break;
    }
    case "daisy": {                          // 雛菊：白瓣黃心
      const h = 0.24; g.add(makeStem(h, 0.012, 0x3f7a30));
      [-1, 1].forEach((s) => { const l = makeLeaf(0.8, 0x4f8a3a); l.position.set(s * 0.05, 0.1, 0); l.rotation.z = s * 0.6; g.add(l); });
      const head = new THREE.Group(); head.position.y = h + 0.02; head.rotation.x = -0.4;
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), pMat(0xf0c93a));
      center.scale.y = 0.5; head.add(center);
      for (let i = 0; i < 11; i++) {
        const petal = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.005, 0.06), pMat(0xfafaf0, { roughness: 0.5 }));
        const a = (i / 11) * Math.PI * 2; petal.position.set(Math.cos(a) * 0.055, 0, Math.sin(a) * 0.055);
        petal.rotation.y = -a; head.add(petal);
      }
      head.castShadow = true; g.add(head);
      break;
    }
    case "fern": {                           // 蕨葉：扇形展開的葉片
      for (let i = 0; i < 7; i++) {
        const blade = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.36, 5), pMat(0x4a9440, { roughness: 0.5 }));
        blade.position.y = 0.18; blade.scale.set(1, 1, 0.4);
        const tilt = (i / 6 - 0.5);
        blade.rotation.z = tilt * 0.95; blade.rotation.x = -0.12;
        blade.rotation.y = (i / 7) * Math.PI * 2; blade.castShadow = true;
        g.add(blade);
      }
      break;
    }
    case "berry": {                          // 莓果：綠叢加紅果
      const bushTop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), pMat(0x4f8a3a, { roughness: 0.6 }));
      bushTop.position.y = 0.14; bushTop.castShadow = true; g.add(bushTop);
      const extra = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), pMat(0x57973f));
      extra.position.set(0.08, 0.2, 0.04); g.add(extra);
      for (let i = 0; i < 8; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8),
          pMat(0xd23a4a, { roughness: 0.3, emissive: 0x3a0a0e, emissiveIntensity: 0.2 }));
        const a = Math.random() * Math.PI * 2, r = 0.1 + Math.random() * 0.06;
        b.position.set(Math.cos(a) * r, 0.08 + Math.random() * 0.2, Math.sin(a) * r); b.castShadow = true; g.add(b);
      }
      break;
    }
  }
  return g;
}

// 收成後用麻繩綁起來的香草束（無盆，桌上 / 手上 / 架上用）
function makeHerbModel(h) {
  const grp = new THREE.Group();
  const plant = buildPlant(h.shape);
  plant.scale.setScalar(1.2);          // 無盆，植株放大一點更顯眼
  grp.add(plant);
  // 底部用麻繩束起來
  const twine = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.014, 6, 14),
    pMat(0xcaa86a, { roughness: 0.9 }));
  twine.rotation.x = Math.PI / 2; twine.position.y = 0.05; grp.add(twine);
  grp.userData.plant = plant;
  return grp;
}

// 種一株長在地上、可採摘的香草（帶小土堆，無麻繩）
function plantHerb(h, x, z) {
  const grp = new THREE.Group();
  const plant = buildPlant(h.shape); plant.scale.setScalar(1.8); grp.add(plant);  // 放大，明顯地長在園子裡
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    pMat(0x4a3320, { roughness: 1 }));
  mound.scale.y = 0.4; grp.add(mound);
  grp.position.set(x, terrainHeight(x, z), z);
  grp.userData.type = "herb";
  grp.userData.herb = h.id;
  grp.userData.plant = plant;
  tableGroup.add(grp);
  herbMeshes.push(grp);
  state.herbsOnTable.push(grp);
  return grp;
}

// ---------- 互動 ----------
const raycaster = new THREE.Raycaster();
raycaster.far = 4.2;
const center = new THREE.Vector2(0, 0);
let aimTarget = null; // { type, data/herb, object }

function updateAim() {
  raycaster.setFromCamera(center, camera);

  // 採摘目標（藥圃裡的藥草）
  let herbHit = null;
  const hh = raycaster.intersectObjects(herbMeshes, true);
  if (hh.length) {
    let o = hh[0].object; while (o && !o.userData.type) o = o.parent;
    if (o) herbHit = { type: "herb", herb: o.userData.herb, object: o, dist: hh[0].distance };
  }
  // 擺放目標（藥櫃格，需手上有藥草才有意義）
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
      if (heldMeshes.length >= MAX_CARRY) prompt.textContent = `手上已滿（${MAX_CARRY} 束）`;
      else prompt.textContent = `採摘 ${nameOf(hit.herb)}（手上 ${heldMeshes.length}/${MAX_CARRY}）`;
    } else {
      const slot = hit.data;
      if (slot.count >= slot.cap) prompt.textContent = nameOf(slot.herb) + " 已擺滿 ✨";
      else if (heldHas(slot.herb)) prompt.textContent = `擺上藥櫃：${nameOf(slot.herb)}（${slot.count}/${slot.cap}）`;
      else prompt.textContent = `這格要擺「${nameOf(slot.herb)}」(手上沒有)`;
    }
    prompt.classList.add("show");
  } else {
    cross.classList.remove("active");
    prompt.classList.remove("show");
  }
}

const MAX_CARRY = 3;          // 手上最多拿幾束（種類不限，可混拿）
let heldMeshes = [];          // 手上的藥草束（混合不同種）

const heldHas = (id) => heldMeshes.some((m) => m.userData.herb === id);

// 把手上的藥草束在相機前一字排開
function arrangeHand() {
  heldMeshes.forEach((m, i) => {
    const off = (i - (heldMeshes.length - 1) / 2) * 0.2;
    m.position.set(0.36 + off, -0.44 - (i % 2) * 0.03, -0.9);
    m.scale.setScalar(1.05);
  });
}

function interact() {
  if (!controls.isLocked || !aimTarget) return;

  if (aimTarget.type === "herb") {
    // 採摘（一次最多拿 MAX_CARRY 束，種類不限可混拿）
    if (heldMeshes.length >= MAX_CARRY) { toast(`手上已滿（${MAX_CARRY} 束）`); return; }
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
    if (slot.count >= slot.cap) { toast("這格已經擺滿了 ✨"); return; }
    if (!heldHas(slot.herb)) { toast("手上沒有「" + nameOf(slot.herb) + "」"); sfx.back(); return; }
    // 從手上挑出符合這格的藥草，擺到滿為止
    const avail = heldMeshes.filter((m) => m.userData.herb === slot.herb).length;
    const n = Math.min(avail, slot.cap - slot.count);
    for (let j = 0; j < n; j++) {
      const i = slot.count;
      const px = slot.x + slot.positions[i], sy = slot.y;
      const k = heldMeshes.findIndex((m) => m.userData.herb === slot.herb);
      const pot = heldMeshes.splice(k, 1)[0];
      camera.remove(pot);
      pot.rotation.set(0, Math.random() * 0.4 - 0.2, 0);
      pot.scale.setScalar(0.7);
      pot.position.set(px, sy, SHELF_Z);
      scene.add(pot);
      slot.placedMeshes.push(pot);
      slot.rings[i].visible = false;
      slot.count++;
      if (slot.count >= slot.cap) slot.filled = true;
      const t0 = performance.now();
      (function drop(m) {
        (function step() {
          const t = Math.min(1, (performance.now() - t0) / 180);
          m.position.y = (sy + 0.22) + (sy - (sy + 0.22)) * t;
          if (t < 1) requestAnimationFrame(step);
        })();
      })(pot);
      sparkle(new THREE.Vector3(px, sy + 0.15, SHELF_Z));
    }
    arrangeHand();
    sfx.plop(slot.count);
    updateHud();
    checkWin();
  }
}

function dropHeld() {
  if (!heldMeshes.length) return;
  // 把手上的全部放回地上（相機前方散開）
  const p = new THREE.Vector3(); camera.getWorldPosition(p);
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const base = p.clone().add(dir.multiplyScalar(1.3)); base.y = 0;
  heldMeshes.forEach((m, i) => {
    camera.remove(m);
    const a = (i / heldMeshes.length) * Math.PI * 2;
    const mx = base.x + Math.cos(a) * 0.5, mz = base.z + Math.sin(a) * 0.5;
    m.position.set(mx, terrainHeight(mx, mz), mz);
    m.scale.setScalar(1); m.rotation.set(0, 0, 0);
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
    <h2>整理完成 · 藥櫃全部歸位</h2>
    <p>十種藥材、每格各三株都採齊擺好 ✨<br/>藥房清爽，藥香宜人。</p>
    <div class="big">點擊畫面再整理一次 ⚗</div>
    <p class="hint">慢慢來，沒有時間限制 🍵</p>`;
  ov.classList.remove("hide");
  pendingNext = true;
}
let pendingNext = false;

// ---------- 控制 / 輸入 ----------
const keys = {};
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "KeyQ") dropHeld();
  if (e.code === "KeyM") { muted = !muted; }
});
addEventListener("keyup", (e) => (keys[e.code] = false));

const overlay = document.getElementById("overlay");
overlay.addEventListener("click", () => {
  if (pendingNext) { pendingNext = false; buildCabinet(); }   // 單一關卡：重新整理同一座
  controls.lock();
});
controls.addEventListener("lock", () => overlay.classList.add("hide"));
controls.addEventListener("unlock", () => { if (!pendingNext) overlay.classList.add("hide"); });

addEventListener("mousedown", (e) => {
  if (!controls.isLocked) return;
  if (e.button === 0) interact();
  else if (e.button === 2) dropHeld();
});
addEventListener("contextmenu", (e) => e.preventDefault());

// ---------- 移動 ----------
const velocity = new THREE.Vector3();
const dirVec = new THREE.Vector3();
function inBlocker(b, x, z, r) {
  return x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r;
}
function move(dt) {
  if (!controls.isLocked) return;
  const speed = 3.2;
  dirVec.set(0, 0, 0);
  if (keys["KeyW"] || keys["ArrowUp"]) dirVec.z += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) dirVec.z -= 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) dirVec.x -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) dirVec.x += 1;
  dirVec.normalize();

  const o = controls.getObject();
  const ox = o.position.x, oz = o.position.z;
  controls.moveRight(dirVec.x * speed * dt);
  controls.moveForward(dirVec.z * speed * dt);

  // 牆面碰撞（沿牆滑動）
  const r = 0.34;
  for (const b of blockers) {
    if (!inBlocker(b, o.position.x, o.position.z, r)) continue;
    if (!inBlocker(b, ox, o.position.z, r)) o.position.x = ox;        // 退回 x，沿 z 滑
    else if (!inBlocker(b, o.position.x, oz, r)) o.position.z = oz;   // 退回 z，沿 x 滑
    else { o.position.x = ox; o.position.z = oz; }
  }

  // 世界邊界（圍欄內）
  o.position.x = Math.max(-HALF + 0.5, Math.min(HALF - 0.5, o.position.x));
  o.position.z = Math.max(-7.6, Math.min(HALF - 0.5, o.position.z));   // 後方止於小屋

  // 視角高度貼合地形（走上山坡會升高）
  o.position.y = terrainHeight(o.position.x, o.position.z) + 1.6;
}

// ---------- 主迴圈 ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  move(dt);
  updateAim();
  updateSparks(dt);

  // 藥圃藥草輕輕搖；手上的藥草緩緩轉
  const sway = Math.sin(performance.now() * 0.002) * 0.08;
  herbMeshes.forEach((h) => { if (h.userData.plant) h.userData.plant.rotation.z = sway; });
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
buildCabinet();
animate();
