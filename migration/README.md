# Unity 遷移 · 資料層(Phase 1)

把 three.js 版([../fp.js](../fp.js))的遊戲資料抽出成引擎中立的格式,Unity 一裝好即可載入。
方向決策見記憶 `unity-migration-decision`。

## 產出檔案

| 檔案 | 內容 |
|------|------|
| [data/herbs.json](data/herbs.json) | 100 味藥材,每筆含 id / name / icon / colorHex / shape / nature / clue / desc / latin |
| [data/formulas.json](data/formulas.json) | 25 個真實名方:name / cure / herbs[] / who |
| [csharp/HerbData.cs](csharp/HerbData.cs) | 對應的 C# DTO 類別 + `HerbShape` / `HerbNature` 列舉 |
| [phase2-shapes.md](phase2-shapes.md) | Phase 2:11 種 shape 的建模/移植規格 |
| [phase3-systems.md](phase3-systems.md) | Phase 3:核心玩法系統拆解 + Unity 架構雛形 |

資料由 `scratchpad/extract.mjs` 從 fp.js 直接解析產生(非手抄)。完整性已驗證:
100 味全有性味與功效、25 方所有藥材引用都對得上、無斷鏈。

## 資料模型重點

- **colorHex** 是 `#rrggbb`。Unity:`ColorUtility.TryParseHtmlString(h.colorHex, out var c)`。
- **nature**(四氣)決定藥材歸到哪座櫃:`warm`→左牆、`neutral`→後牆、`cold`→右牆。
  分布:溫熱 40 / 寒涼 35 / 平和 25。
- **shape** 是模型原型,只有 **11 種**。關鍵:不需要 100 個獨立模型,
  做 11 個低多邊形 prefab、用 colorHex 染色即可(沿用 three.js 做法)。

  | shape | 數量 | shape | 數量 |
  |---|---|---|---|
  | root 根莖 | 29 | mushroom 菌 | 6 |
  | berry 果實 | 22 | daisy 多瓣花 | 6 |
  | mint 對生葉 | 10 | sun 團花 | 4 |
  | fern 羽葉 | 8 | lavender 紫穗 | 4 |
  | clover 闊葉 | 6 | rose 花萼 | 3 |
  |  |  | tulip 鈴花 | 2 |

- **latin**:僅 20 味有(圖鑑用,對應 [../assets/herbs/&lt;id&gt;.jpg](../assets/));其餘為 null。

## Unity 載入建議

1. 把 `data/*.json` 放進 `Assets/StreamingAssets/`(或 `Resources/`)。
2. 加 `com.unity.nuget.newtonsoft-json` 套件,直接反序列化頂層陣列:
   ```csharp
   var herbs = JsonConvert.DeserializeObject<List<Herb>>(jsonText);
   ```
   (Unity 內建的 `JsonUtility` 無法解析頂層陣列,需先包成 `{"items":[...]}`。)
3. 進階:可改用 ScriptableObject,做成可在編輯器檢視/編輯的資產。

## 重新產生資料

若日後改了 fp.js 的資料,重跑抽取腳本即可:
```bash
node migration/extract.mjs   # 來源 fp.js → 輸出 migration/data/*.json
```
