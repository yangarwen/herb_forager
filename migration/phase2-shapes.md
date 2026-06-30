# Unity 遷移 · Phase 2 建模規格(11 種 shape)

把 three.js 版([../fp.js](../fp.js) 第 1035–1337 行)的程序化乾藥材造型,轉成 Unity 可重建的規格。
每味藥的 `shape` / `colorHex` 來自 [data/herbs.json](data/herbs.json)。

---

## 0. 先做一個關鍵建議:**移植程序化生成,不要手刻 100 個 prefab**

原版的造型有三個特性,手刻模型會全部失去:

1. **每味藥用 id 當種子(`hashStr(id)`)生成** → 同一味造型固定、100 味彼此都不同。
2. **同 shape 內還有「子變體」**(`HERB_VARIANT`):例如 root 有分叉根/切片堆/樹皮捲/根莖塊 4 種。
3. **顏色微抖動 + 曬乾色調** → 一堆材料每顆都略有差異。

而且 **Unity 內建的 Sphere/Cylinder 是高面數的**(預設球 ≈768 三角面),做不出低多邊形感,也無法做「上下不同半徑的錐柱」「開口圓筒」「半球菌蓋」這些原版用到的參數化幾何。

> **建議路線:把 `buildPlant()` 這段(約 280 行)移植成 C# 的程序化 mesh 產生器**,用相同的低段數重建幾何。這條路最忠於原設計、工作量比手刻 + 美術調整還小,而且 100 味的獨特性、變體、抖動全部免費保留。
> 手刻 prefab 只在「想徹底重新美術設計」時才值得。以下規格兩條路都能用。

---

## 1. 共用規則(所有 shape 都適用)

| 項目 | 規格 | 來源 |
|---|---|---|
| 單位 | 1 Unity unit = 1 公尺。整份藥材約 **0.2–0.3 unit**(一小撮、約 20–30cm) | 元件半徑多為 0.02–0.09 |
| 整體縮放 | 最後對整株 `scale = 1.25` | `makeHerbModel` |
| 樞紐 | 底部置中(y=0 為桌面),元件向上堆疊 | 各函式 position.y |
| 著色 | 由 `colorHex` 經 **dry() 曬乾轉換**後上色,逐元件再 jitter | 見下方公式 |
| 低多邊形 | cylinder 4–14 邊、icosahedron(細分 0)、sphere 6–8 段、cone 4 邊、torus 6 段、box | 各函式 |
| 平面著色 | 塊狀元件(icosahedron)用 flat shading | `flatShading:true` |
| 麻繩束 | 束狀類(mint/fern/lavender)底部加一圈 torus 麻繩(色 `#b89a64`) | `addTwine` |

### dry() 曬乾色調(務必在 C#/shader 重現)
把鮮豔主色轉成乾燥陳放的暗沉色:
```
dry(hex, mix=0.45, dl=0):
  hsl = RGBtoHSL(hex)
  c   = HSLtoRGB(hsl.h, hsl.s * 0.5, max(0.1, hsl.l * 0.62 + dl))
  return Lerp(c, #6b5236, mix)        // 朝藥材褐 #6b5236 混合
```
`jitter(col)`:對 HSL 的 S、L 各加 ±0.025 / ±0.04 的隨機偏移,讓每顆略有差異。

### 種子與變體
- 種子 = `hashStr(id)`(FNV-1a),配 xorshift 亂數 → 同 id 造型固定。
- `variant` = `HERB_VARIANT[id]`(見 fp.js 1072–1092),null 時用亂數選。

---

## 2. 十一種 shape 規格

### root 根莖 / 樹皮(29 味,4 變體)
| 變體 | 造型 | 主要元件 |
|---|---|---|
| 0 分叉根 | 1–3 條主根,每條 3–5 節漸細,帶 4 條鬚根 | 漸細 cylinder(7 邊)+ 細 cylinder 鬚根 |
| 1 切片堆 | 4–7 片圓切片散疊,每片帶外緣環 | cylinder(14 邊,扁)+ torus 緣 |
| 2 樹皮捲 | 2–4 個開口捲筒(肉桂、陳皮) | 開口 cylinder(10 邊,雙面) |
| 3 根莖塊 | 3–6 個薑黃狀團塊 | icosahedron 縮放(1.4,0.7,0.9),flat |

### berry 果實 / 種子(22 味,4 變體)
| 變體 | 造型 | 主要元件 |
|---|---|---|
| 0 小圓果堆 | 14 顆小果疊成小丘(枸杞) | sphere(7×6),scale(1,~0.7,0.85) |
| 1 大皺果 | 5–8 顆大果(紅棗/山楂) | sphere(8×7),scale(1,0.82,0.9) |
| 2 扁亮種子 | 16 顆扁種子(決明子/酸棗仁) | sphere 壓扁 scale(1.4,0.45,0.8),微金屬 |
| 3 結枝果 | 一根短枝串 12 顆果(五味子/桑椹) | cylinder 枝 + sphere 果 |

### mushroom 菌(6 味,3 變體)
| 變體 | 造型 | 主要元件 |
|---|---|---|
| 0 靈芝盤 | 半球菌蓋(壓扁)+ 2 圈輪紋 + 斜短柄,微光澤 | 半球 sphere(開上半)+ torus×2 + cylinder 柄 |
| 1 茯苓塊 | 2 個白胖塊 | icosahedron 縮放,flat |
| 2 豬苓核 | 3–5 個黑褐不規則小核 | icosahedron 小塊,flat |

### sun 團花(4 味:菊/桂/槐)
- 1–3 個花頭;每頭 = 中心扁 cylinder(12 邊)+ 10–14 片放射 box 花瓣(0.018×0.005×0.05)。

### daisy 多瓣小花(6 味:金銀花/紫錐菊/蒲公英…)
- 8–12 個小花苞撮;每苞 = icosahedron 花心 + 5 片 box 花瓣放射。

### rose 花萼 / 花蕾(3 味:紅花/洛神/玫瑰)
- 5–9 個花苞(縱長 icosahedron 球 + 3 片壓扁 sphere 花瓣)+ 6 條散落細絲(極細 cylinder)。

### tulip 鈴鐘花(2 味:桔梗/款冬)
- 5–8 個鐘形花苞:開口漸縮 cylinder(上 0.022 / 下 0.008,6 邊,雙面),隨機朝向散布。

### mint 對生葉草(10 味,2 變體)
| 變體 | 造型 |
|---|---|
| 0 成對橢圓葉 | 4–6 枝,每枝莖 + 3 層對生橢圓葉(壓扁 sphere scale(0.5,0.16,1)) |
| 1 細密小葉 | 每枝沿莖交錯 6 片小葉(百里香/馬鬱蘭/奧勒岡) |
- 底部加麻繩束。

### fern 羽葉 / 長葉(8 味,2 變體)
| 變體 | 造型 |
|---|---|
| 0 羽狀複葉 | 3–5 條羽葉:中軸 cylinder + 兩側各 5 片 cone 小葉(壓扁) |
| 1 長條葉 | 5–7 片竹葉狀長 cone(壓扁 scale z=0.25) |
- 底部加麻繩束。

### clover 闊葉野草(6 味:車前草/魚腥草…)
- 5–7 片闊葉蓮座(極扁 sphere scale(0.7,0.12,1.1))環狀鋪開 + 中央 1 根花穗 cylinder。

### lavender 紫穗花(4 味:藿香/合歡/薰衣草/佩蘭)
- 5–8 枝;每枝莖 + 頂端漸寬花穗 cylinder(上 0.012 / 下 0.026),帶微弱自發光。
- 底部加麻繩束。

---

## 3. three.js → Unity 幾何對照(移植用)

| three.js | Unity 做法 |
|---|---|
| `CylinderGeometry(rTop,rBot,h,seg)` | 自寫 mesh 產生器(支援上下不同半徑);或 ProBuilder |
| `CylinderGeometry(...,openEnded)` | 開口圓筒 → 不封頂的 mesh(樹皮捲、鐘花) |
| `IcosahedronGeometry(r,0)` | 低面 icosphere mesh 資產 + flat shading |
| `SphereGeometry(r,w,h)` | 低段數 UV sphere(段數要小,別用內建高面球) |
| `ConeGeometry(r,h,4)` | 4 邊錐(rTop=0 的 cylinder) |
| `TorusGeometry(r,t,6,seg)` | 低面 torus mesh 資產 |
| `BoxGeometry` | Unity Cube(可直接用) |
| `MeshStandardMaterial` | URP/Lit;`roughness`→ Smoothness(約 1−rough);`emissive`→ Emission |
| flatShading | mesh 重算法線為 per-face,或 shader flat |

---

## 4. Phase 2 建議產出

- `HerbModelBuilder.cs`:移植 `buildPlant` + 11 個 `Dried*` 函式 + `dry()`/`jitter()`/種子。
- 低面基礎 mesh:icosphere、torus、tapered-cylinder、cone 各一份(程式產生或匯入資產)。
- 一個共用 URP 材質,runtime 用 `MaterialPropertyBlock` 套每味的 dry(colorHex) 主色(避免 100 份材質)。
- 驗證:在空場景生成全 100 味排成一排,對照舊版 [../index.html](../index.html) 檢查外型。
