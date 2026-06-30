# Unity 遷移 · Phase 3 核心玩法系統拆解

把 three.js 版([../fp.js](../fp.js))的玩法邏輯拆成 Unity 的系統/元件結構。
每個系統列出:**做什麼 → 關鍵狀態 → 調校常數 → Unity 對應**。

> 核心循環一句話:**接今日委託(名方)→ 到藥罐抓對應藥材(最多拿 3 味)→ 配藥台交方 → 藥罐庫存扣減 → 出門採藥補罐**。穿插**認藥期**學習測驗,熟悉某性味達 80% 即解鎖該性味的新藥方。無計時、無失敗。

---

## 調校常數總表(先抽成一份 ScriptableObject `GameConfig`)

| 常數 | 值 | 意義 | 來源 |
|---|---|---|---|
| `MAX_CARRY` | 3 | 手上最多拿幾味(可混) | 1445 |
| `DAY_COUNT` | 4 | 一天接幾帖藥方 | 294 |
| `STOCK_START` | 3 | 每味藥開局庫存 | 872 |
| `STOCK_CAP`(=JAR_SHOW_MAX) | 6 | 罐子庫存上限 | 870/872 |
| `REGROW_MS` | 7000 | 採摘後幾秒長回 | 640 |
| 移動速度 | 3.0 / 1.7(觸控) | 公尺/秒 | 1913 |
| 視角高度 | 1.6 | 相機 y | 1948 |
| 互動射程 | 4.4 | raycast far | 1369 |
| 碰撞半徑 | 0.34 | 玩家圓柱半徑 | 1928 |
| `BATCH_SIZE` | 8 | 認藥期一批幾味 | 1985 |
| `UNLOCK_RATIO` | 0.8 | 性味熟悉達此比例即解鎖 | 1986 |
| 房間 / 花園 | ROOM 12 · 花園半寬 16 · 縱深約 26 | 場景尺寸 | 323/638 |

---

## 系統 1:玩家控制與移動
- **做什麼**:第一人稱。WASD/方向鍵 + 滑鼠環顧(PointerLock);觸控為左半搖桿走動、右半拖曳環顧。
- **關鍵狀態**:相機位置、朝向;`active()`(是否已鎖滑鼠/開始觸控)。
- **碰撞**:對家具/櫃體做 AABB 命中,沿邊滑動;邊界用 z>HALF 判斷室內/室外,室外 x 範圍放寬。
- **Unity 對應**:`CharacterController` + **Starter Assets「First Person」**控制器 + **新版 Input System**。
  **碰撞直接交給 Unity 物理 collider**(BoxCollider/MeshCollider)→ 省掉手寫 AABB 與滑動邏輯,是一大簡化。室內/室外用 Trigger 區或 bounds 判定。

## 系統 2:準星射線互動
- **做什麼**:從畫面正中央射線(射程 4.4),命中可互動物:`jar` 藥罐 / `counter` 配藥台 / `forage` 園中植株 / `atlas` 圖鑑 / `formula` 方劑譜。顯示準星高亮 + 情境提示文字。觸控點擊有 32px 容錯(`pickNear`)。
- **關鍵狀態**:`aimTarget = { type, data }`。
- **Unity 對應**:`Physics.Raycast(camera中心, maxDistance=4.4)`,用 **layer/tag** 區分類型;定義 `IInteractable` 介面,各物件實作 `OnAim()`/`OnInteract()`。準星 + 提示用 UI Canvas。

## 系統 3:手持 / 藥包
- **做什麼**:最多拿 3 味、可混種;手上藥材掛在相機前一字排開、緩緩自轉。`heldHas(id)` 判重複。
- **Unity 對應**:`Hand` 元件持 `List<HeldHerb>`(上限 3);實體 prefab 設為相機子物件,`arrangeHand` 改成排版函式;每幀轉 y。

## 系統 4:今日委託 / 配藥迴圈(核心)
- **做什麼**:`startDay()` 從「藥材全在已解鎖性味」的方劑池抽 `DAY_COUNT` 帖(可填方劑 <2 則退回全部)。
  - `takeHerb`:只收「當前藥方需要、未抓過、且罐存>0」的藥;成功播音效、浮藥籤卡、更新委託。
  - `submitFormula`:手上湊齊當前方 → 清空藥包、**每味扣 1 庫存**、`dayIdx++`、播劇情;`dayIdx` 滿 → 過關。
- **關鍵狀態**:`day[]`(當日藥方)、`dayIdx`、`activeRx()`。
- **Unity 對應**:`DayManager`(抽方/推進)+ `Prescription`(對應 [data/formulas.json](data/formulas.json) 的 `Formula`)。用 C# event 通知 UI 更新委託面板。比對純資料邏輯,可直接照搬。

## 系統 5:庫存與採藥補給迴圈
- **做什麼**:每味藥有庫存(開局 3、上限 6)。交方時扣庫存→罐內可見株數變少(`refreshAllStock`)。
  出門到花園 `pickFromGarden` 採摘 → 入採集籃 `basket`,植株隱藏 `REGROW_MS` 後重長。
  **跨過門檻回到室內那一刻**(`!outside && wasOutside`)→ `depositBasket` 一次把整籃入庫(上限封頂)。無計時、無懲罰。
- **關鍵狀態**:`stock{id:n}`、`basket{id:n}`、`wasOutside`。
- **Unity 對應**:`StockSystem`(`Dictionary<string,int>`)+ `Basket`;花園植株做 prefab + 重長協程(coroutine);回室內補罐用進門 Trigger 偵測。罐內可見株數 = 切換 N 個株 mesh 的顯示。

## 系統 6:認藥期(學習測驗)— ⚠️ 改寫量最大
- **做什麼**(依 [../docs/認藥期-學習設計.md](../docs/認藥期-學習設計.md)):選一性味批次(8 味,先複習未熟、再給新藥)→ **觀摩** → **圖/謎面→名 測驗** → **情境(功效)→名 測驗** → **批次小結**。
  - 精熟:每味有 `nameScore`/`effectScore`(0–3,答對 +1 答錯 −1);兩者皆達 3 即「熟悉」(無辨識線索者名分視同達標)。
  - 誘答從**同性味**取(有鑑別度)。
  - 某性味熟悉比例達 `UNLOCK_RATIO` → 解鎖該性味的配藥方(`recomputeUnlocks`)。
- **關鍵狀態**:`progress.herbs[id] = { seen, nameScore, effectScore }`、`progress.unlockedRegions[]`。
- **Unity 對應**:這塊是 fp.js 裡約 330 行、**重度 UI 驅動**(觀摩卡、選擇題、小結)。建議用 **UI Toolkit**(或 uGUI)做成獨立畫面流程;選題/精熟/解鎖的純邏輯可照搬。**注意**:所有題目都是中文 → 一定要先處理好 TMP 中文字型(見 Phase 4)。

## 系統 7:進度持久化
- **做什麼**:`progress`(藥材精熟 + 已解鎖性味)存 `localStorage`(key `bencao_recog_v1`)。
- **Unity 對應**:改存 **`Application.persistentDataPath` 下的 JSON 檔**(或 PlayerPrefs)。上 Steam 後可再接 **Steam Cloud** 同步。設計稿原本提到「雲端 Firestore 待定」——Steam 版改用 Steam Cloud 即可。

## 系統 8:精熟視覺回饋
- **做什麼**:精熟的藥罐貼金色「熟」印章(`setJarMastered` / `refreshJarMastery`)。
- **Unity 對應**:藥罐 prefab 上放一個可切換顯示的印章 sprite/decal;`isMastered` 為真時開啟。

## 系統 9:回饋層(特效 / 音效 / 提示)
- **做什麼**:採摘/交方的火花粒子(`sparkle`)、WebAudio 合成音效(`tone`:pick/back/full/win)、toast 浮字、藥籤卡、劇情卡、過關/暫停面板。
- **Unity 對應**:`ParticleSystem` 取代 sparkle;`AudioSource`(可重新合成或錄成音檔)取代 WebAudio;toast/卡片/面板用 UI Canvas。

## 系統 10:HUD 與書本 UI
- **做什麼**:委託面板、`x/4 帖`進度、手持顯示、準星與提示;**本草圖鑑**(100 格收集牆,未識=暗格/已識=點亮/精熟=金印)、**方劑譜**(歷來藥方,已學會的藥標亮);開場/暫停/過關面板。
- **Unity 對應**:uGUI 或 UI Toolkit。**全中文 → TMP + 中文字型(Phase 4 第一要務)**。

---

## 建議的 Unity 架構雛形

```
GameConfig (ScriptableObject)      ← 上方常數總表
HerbDatabase (載入 herbs/formulas.json)
─ Scene: Apothecary (室內) + Garden (室外，可同場景或分區)
  Player (CharacterController + FirstPersonController + 新Input)
    └ Camera ─ Hand(手持) ─ Interactor(中心射線)
  Managers (空物件掛各系統)
    ├ DayManager        系統4 委託/配藥
    ├ StockSystem       系統5 庫存
    ├ ForageSystem      系統5 採園/採集籃
    ├ RecognitionFlow   系統6 認藥期(UI 流程)
    ├ ProgressStore     系統7 存讀檔(JSON)
    └ FeedbackFX        系統9 粒子/音效/toast
  UI (Canvas)
    ├ HUD(委託/進度/手持/準星)
    ├ AtlasBook 圖鑑 · FormularyBook 方劑譜
    └ Panels(開場/暫停/過關/認藥期)
  Interactables: Jar(×100罐) · Counter · GardenPlant · BookProps
```

## 建議實作順序(風險由低到高)
1. **系統 1+2+3**:能走動、準星瞄準、撿起藥材掛在手上(先用佔位方塊)。
2. **系統 4+5**:委託 → 抓藥 → 交方 → 扣庫存 → 採園補罐,跑通整個核心迴圈。
3. **系統 8+9+10**:藥櫃、HUD、書本、特效音效(此時開始需要 Phase 4 中文字型)。
4. **系統 6**:認藥期測驗(UI 量最大,放最後)。
5. **系統 7**:存讀檔 + 之後接 Steam Cloud。

> 兩個最大的「不同於原版」之處:① 碰撞改用 Unity 物理(簡化);② 認藥期 + 全部中文 UI 是工作量重心,且依賴 TMP 中文字型。
