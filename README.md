# 🌿 Herb Forager · 採藥歸櫃

第一人稱 3D 療癒小遊戲:在陽光下的香草園裡**採摘 10 種中藥材**,綁成一束帶回**藥房**,擺進藥櫃上對應的格子。沒有計時、沒有失敗,慢慢逛慢慢整理。

A cozy first-person 3D game: forage 10 traditional Chinese medicinal herbs across a hilly garden, then tidy them into the matching compartments of an apothecary cabinet. No timer, no fail state.

## 玩法
- **點擊畫面**:進入遊戲 / 採摘 / 擺放
- **W A S D**:走動(走上小山坡視角會跟著起伏)
- **滑鼠**:環顧四周
- **Q / 右鍵**:把手上的藥草放回地上
- **Esc**:放開滑鼠

一次最多可混拿 3 束藥草;走到藥櫃對應格子,會自動把符合的擺進去。每種藥材要採滿 3 株、擺滿一格,10 格全部歸位即完成。

## 10 種中藥材
人參、枸杞、靈芝、菊花、薄荷、艾草、金銀花、紅花、桔梗、藿香 —— 每種都有專屬的低多邊形 3D 造型。

## 執行方式
這是純前端網頁,但 3D 版用到 ES module + CDN,需要透過本機伺服器開啟:

```bash
python -m http.server 8137
# 然後瀏覽器開啟 http://localhost:8137/index.html
```

> 需要連網(Three.js 由 CDN 載入)。

## 檔案
| 檔案 | 說明 |
|------|------|
| `index.html` | 第一人稱 3D 版入口 |
| `fp.js` | 3D 遊戲主程式(Three.js) |
| `flat.html` | 早期 2D 拖拉版入口 |
| `game.js` / `style.css` | 2D 版程式與樣式 |

## 技術
[Three.js](https://threejs.org/)(r160,CDN) · PointerLockControls · 程序化地形與植物模型 · WebAudio 合成音效。

---
🤖 Built with [Claude Code](https://claude.com/claude-code)
