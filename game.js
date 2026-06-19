/* 藥劑師：填滿藥草櫃 —— 療癒版
   沒有計時、沒有失敗。
   把採集籃裡的藥草，拖進牆上「同種類」的玻璃罐，
   把每個罐子裝滿，這一櫃就整理完成。 */

const HERBS = [
  { id: "lavender", name: "薰衣草", icon: "💜", color: "#9a7fd6" },
  { id: "mint",     name: "薄荷",   icon: "🌿", color: "#5aa46e" },
  { id: "rose",     name: "玫瑰",   icon: "🌹", color: "#d65a7a" },
  { id: "mushroom", name: "魔菇",   icon: "🍄", color: "#c46a4a" },
  { id: "clover",   name: "三葉草", icon: "🍀", color: "#4fa04f" },
  { id: "maple",    name: "楓葉",   icon: "🍁", color: "#d6823c" },
  { id: "sun",      name: "日輪花", icon: "🌻", color: "#e0b84a" },
  { id: "chili",    name: "火椒",   icon: "🌶️", color: "#d6463c" },
];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v));
  return `rgb(${c((n>>16)+amt)},${c(((n>>8)&255)+amt)},${c((n&255)+amt)})`;
}

const state = {
  level: 1,
  jars: [],     // { herb, cap, count }
  basket: [],   // { id, herb }
  drag: null,
};
let seq = 0;
let muted = false;

const $ = (s) => document.querySelector(s);
const cabinetEl = $("#cabinet");
const basketEl = $("#basket");

// ---------- 柔和音效 ----------
let actx;
function tone(freq, dur = 0.18, type = "sine", vol = 0.12) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = 0;
    o.connect(g); g.connect(actx.destination); o.start();
    g.gain.linearRampToValueAtTime(vol, actx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch (e) {}
}
const sfx = {
  plop(c)  { tone(360 + c * 40, 0.14, "sine", 0.1); },   // 裝一株，音調隨裝填上升
  back()   { tone(300, 0.18, "sine", 0.08); },
  full()   { [659, 880, 1175].forEach((f,i)=>setTimeout(()=>tone(f,0.2,"triangle",0.1), i*70)); },
  win()    { [523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,0.3,"triangle",0.1), i*110)); },
};

// ---------- 建立一櫃 ----------
function buildLevel(level) {
  const jarCount = Math.min(3 + Math.floor(level / 2), HERBS.length);
  const herbs = shuffle([...HERBS]).slice(0, jarCount);

  state.jars = herbs.map((h) => ({
    herb: h.id,
    cap: 3 + Math.floor(Math.random() * 4),  // 每罐 3~6 格
    count: 0,
  }));

  // 採集籃：剛好裝滿每個罐子所需的藥草
  state.basket = [];
  state.jars.forEach((jar) => {
    for (let i = 0; i < jar.cap; i++) state.basket.push({ id: ++seq, herb: jar.herb });
  });
  shuffle(state.basket);

  $("#levelNum").textContent = level;
  renderAll();
}

// ---------- 渲染 ----------
function renderAll() {
  cabinetEl.innerHTML = "";
  state.jars.forEach((jar, idx) => cabinetEl.appendChild(makeJar(jar, idx)));

  basketEl.innerHTML = "";
  state.basket.forEach((h) => basketEl.appendChild(makeHerb(h)));
  attachBasketZone();

  updateFilledCount();
}

function makeJar(jar, idx) {
  const herb = HERBS.find((h) => h.id === jar.herb);
  const full = jar.count >= jar.cap;
  const wrap = document.createElement("div");
  wrap.className = "jar-cell" + (full ? " full" : "");
  wrap.dataset.herb = jar.herb;
  wrap.style.color = herb.color;

  // 罐內裝填層（高度 = 比例）
  const pct = (jar.count / jar.cap) * 100;
  // 罐內已裝的藥草圖示
  let contentsIcons = "";
  for (let i = 0; i < jar.count; i++) {
    const x = 12 + (i % 3) * 26 + (Math.floor(i / 3) % 2) * 12;
    const y = 8 + Math.floor(i / 3) * 18;
    contentsIcons += `<span class="in-herb" style="left:${x}%;bottom:${4 + Math.floor(i/3)*22}%">${herb.icon}</span>`;
  }

  wrap.innerHTML = `
    <div class="jar">
      <div class="cork"></div>
      <div class="glass">
        <div class="fill" style="height:${pct}%; background:linear-gradient(${shade(herb.color,40)}, ${shade(herb.color,-10)});"></div>
        <div class="contents">${contentsIcons}</div>
        <div class="shine"></div>
      </div>
    </div>
    <div class="jar-label">
      <span class="jar-icon">${herb.icon}</span>
      <span class="jar-name">${herb.name}</span>
      <span class="jar-count">${full ? "✨ 滿" : jar.count + "/" + jar.cap}</span>
    </div>`;

  attachJarZone(wrap, jar);
  return wrap;
}

function makeHerb(h) {
  const herb = HERBS.find((x) => x.id === h.herb);
  const el = document.createElement("div");
  el.className = "herb";
  el.dataset.id = h.id;
  el.draggable = true;
  el.title = herb.name;
  el.innerHTML = `<span class="herb-glyph">${herb.icon}</span>`;
  el.style.setProperty("--hc", herb.color);

  el.addEventListener("dragstart", (e) => {
    state.drag = h.id;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(h.id));
  });
  el.addEventListener("dragend", () => { el.classList.remove("dragging"); state.drag = null; });
  enableTouch(el, h);
  return el;
}

// ---------- 拖放 ----------
function attachJarZone(wrap, jar) {
  wrap.ondragover = (e) => { e.preventDefault(); wrap.classList.add("drag-over"); };
  wrap.ondragleave = () => wrap.classList.remove("drag-over");
  wrap.ondrop = (e) => {
    e.preventDefault();
    wrap.classList.remove("drag-over");
    const id = Number(e.dataTransfer.getData("text/plain")) || state.drag;
    if (id) dropIntoJar(id, jar, e.clientX, e.clientY);
  };
}
function attachBasketZone() {
  basketEl.ondragover = (e) => { e.preventDefault(); };
  basketEl.ondrop = (e) => e.preventDefault();
}

function dropIntoJar(id, jar, x, y) {
  const bi = state.basket.findIndex((b) => b.id === id);
  if (bi < 0) return;
  const item = state.basket[bi];

  // 種類不符 → 溫柔彈回
  if (item.herb !== jar.herb) {
    bounce(id);
    sfx.back();
    toast("這株是「" + HERBS.find(h=>h.id===item.herb).name + "」，要放進對應的罐子喔");
    return;
  }
  // 罐子已滿
  if (jar.count >= jar.cap) {
    bounce(id);
    toast("這罐已經滿了 ✨");
    return;
  }

  // 裝進去
  state.basket.splice(bi, 1);
  jar.count++;
  sfx.plop(jar.count);
  burst(x, y, HERBS.find(h=>h.id===jar.herb).color);
  renderAll();

  if (jar.count >= jar.cap) {
    sfx.full();
    const cell = cabinetEl.querySelector(`.jar-cell[data-herb="${jar.herb}"]`);
    if (cell) sparkle(cell);
  }
  checkWin();
}

function bounce(id) {
  const el = basketEl.querySelector(`.herb[data-id="${id}"]`);
  if (el) el.animate(
    [{transform:"translateY(0)"},{transform:"translateY(-12px)"},{transform:"translateY(0)"}],
    {duration:300, easing:"ease-out"});
}

// ---------- 進度 / 過關 ----------
function updateFilledCount() {
  const done = state.jars.filter((j) => j.count >= j.cap).length;
  $("#filled").textContent = done + "/" + state.jars.length;
}

function checkWin() {
  updateFilledCount();
  if (!state.jars.every((j) => j.count >= j.cap)) return;

  setTimeout(() => {
    sfx.win();
    celebrate();
    showOverlay(
      `第 ${state.level} 櫃 · 全部裝滿`,
      `每個罐子都收得滿滿的，藥草櫃整整齊齊 ✨<br/><br/>架上還有空櫃等著整理呢。`,
      "整理下一櫃",
      () => { state.level++; buildLevel(state.level); hideOverlay(); }
    );
  }, 380);
}

// ---------- 特效 ----------
function sparkle(cell) {
  const r = cell.getBoundingClientRect();
  for (let i = 0; i < 16; i++)
    setTimeout(() => burst(r.left + Math.random()*r.width, r.top + 20 + Math.random()*60, "#ffe9a8"), i*25);
}
function celebrate() {
  const cx = window.innerWidth/2;
  for (let i = 0; i < 6; i++)
    setTimeout(() => burst(cx + (Math.random()-.5)*440, window.innerHeight*0.4, "#bfe8a0"), i*120);
}
function burst(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = x+"px"; s.style.top = y+"px";
    s.style.background = `radial-gradient(circle, #fff, ${color} 60%, transparent)`;
    document.body.appendChild(s);
    const a = Math.random()*Math.PI*2, d = 22+Math.random()*56;
    s.animate(
      [{transform:"translate(0,0) scale(1)",opacity:1},
       {transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-14}px) scale(0)`,opacity:0}],
      {duration:650+Math.random()*300, easing:"cubic-bezier(.2,.7,.3,1)"}
    ).onfinish = () => s.remove();
  }
}
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
}

// ---------- Overlay ----------
function showOverlay(title, text, btnText, onBtn) {
  $("#ovTitle").innerHTML = title;
  $("#ovText").innerHTML = text;
  const btn = $("#ovBtn");
  btn.textContent = btnText; btn.onclick = onBtn;
  $("#overlay").classList.add("show");
}
function hideOverlay() { $("#overlay").classList.remove("show"); }

// ---------- 觸控 ----------
function enableTouch(el, h) {
  let ghost = null;
  el.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    state.drag = h.id;
    ghost = el.cloneNode(true);
    Object.assign(ghost.style, {position:"fixed",pointerEvents:"none",opacity:".85",zIndex:"90"});
    document.body.appendChild(ghost); moveGhost(t);
    el.classList.add("dragging");
  }, { passive: true });
  el.addEventListener("touchmove", (e) => { if (ghost) moveGhost(e.touches[0]); }, { passive: true });
  el.addEventListener("touchend", (e) => {
    el.classList.remove("dragging");
    if (!ghost) return;
    const t = e.changedTouches[0];
    ghost.remove(); ghost = null;
    const tgt = document.elementFromPoint(t.clientX, t.clientY);
    const cell = tgt && tgt.closest(".jar-cell");
    if (cell) {
      const jar = state.jars.find((j) => j.herb === cell.dataset.herb);
      if (jar) dropIntoJar(h.id, jar, t.clientX, t.clientY);
    }
    state.drag = null;
  });
  function moveGhost(t){ ghost.style.left = t.clientX-18+"px"; ghost.style.top = t.clientY-18+"px"; }
}

// ---------- 工具 ----------
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// ---------- 綁定 ----------
$("#ovBtn").onclick = () => { buildLevel(state.level); hideOverlay(); };
$("#muteBtn").onclick = () => { muted = !muted; $("#muteBtn").textContent = muted ? "🔇" : "🔊"; };
