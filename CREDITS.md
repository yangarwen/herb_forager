# 素材與來源・致謝（Credits, Sources & Acknowledgements）

本檔記錄《本草堂》使用或預計使用的所有外部素材、其授權方式與出處，
以及可取得「真實藥草圖片」的來源調查結果。

> 原則：優先採用 **CC0／公有領域（Public Domain）** 素材；其次採用 **CC‑BY**（需署名，會在本檔逐筆記錄出處）。
> 凡非原創素材，一律在此登記「檔名 → 來源網址 → 作者 → 授權」。

最後更新：2026-06-26

---

## 1. 程式與函式庫

| 項目 | 版本 | 授權 | 來源 |
|---|---|---|---|
| [three.js](https://threejs.org/) | r0.160.0 | MIT | 透過 unpkg CDN 載入（`index.html` importmap） |
| PointerLockControls（three.js addon） | r0.160.0 | MIT | three.js examples/jsm |

## 2. 字型

| 字型 | 用途 | 授權 | 來源／作者 |
|---|---|---|---|
| 霞鶩文楷 **LXGW WenKai TC** | 場景內中文（藥罐、木牌、藥籤、委託卡） | SIL Open Font License 1.1 | 作者 LXGW（落霞孤鶩）；透過 [Google Fonts](https://fonts.google.com/specimen/LXGW+WenKai+TC) 載入。專案頁：<https://github.com/lxgw/LxgwWenKai> |
| Microsoft JhengHei／Segoe UI／system-ui | HTML 介面備援字型 | 系統內建 | 使用者作業系統 |

## 3. 美術素材（3D 模型／貼圖）

| 項目 | 來源 | 授權 |
|---|---|---|
| 100 味藥草的 3D 外型 | **本專案程序化生成**（`fp.js` 內 `buildPlant` 等） | 本專案原創 |
| 木櫃／玻璃罐／房間／稻草／地毯等貼圖 | **本專案以 Canvas 程序化生成** | 本專案原創 |

目前遊戲**不含任何外部圖片檔**；唯一的外部素材是上述函式庫與字型。

## 4. 藥草資料、功效與方劑

- 藥草名稱、性味分類、一句功效：整理自公開之中醫藥常識。
- 方劑（四君子湯、生脈散、酸棗仁湯、二陳湯、理中丸、四逆湯、當歸補血湯、左金丸、芍藥甘草湯、桔梗湯、百合知母湯、甘草乾薑湯、六君子湯、異功散等）：組成依《傷寒論》《金匱要略》《太平惠民和劑局方》等經典方書整理。
- ⚠️ **本遊戲僅供教育與娛樂，所有內容不構成任何醫療建議。**

---

## 5. 真實藥草圖片來源調查（CC0 / 公有領域優先）

> 結論：**沒有**單一來源能同時滿足「真實照片 ＋ 嚴格 CC0 ＋ 涵蓋全部 100 味中藥」。
> 最務實的組合是：**Köhler 古典植物彩繪（PD）為主**，輔以 **Smithsonian（CC0）** 與 **Wikimedia（逐張確認授權）**。

### 5a. 最推薦：真正 CC0 / 公有領域

| 來源 | 內容 | 授權 | 涵蓋度 | 備註 |
|---|---|---|---|---|
| **Köhler's Medizinal‑Pflanzen** [（Wikimedia 分類）](https://commons.wikimedia.org/wiki/Category:K%C3%B6hlers_Medizinal-Pflanzen) | 19 世紀藥用植物**彩色繪圖** | 公有領域（作者 1879 歿、1887 出版） | 高：含人參、當歸、甘草、大黃、肉桂及多數西洋香草 | 是**整株植物繪圖**而非乾藥材照——對「認識藥草本草」其實更理想。學名為拉丁文。 |
| **Smithsonian Open Access** [openaccess](https://www.si.edu/openaccess) ・[植物典藏](https://collections.nmnh.si.edu/search/botany/) | 500 萬+ 蠟葉**標本照**與插圖 | **CC0** | 中高（依物種） | 多為壓製標本照；可用 API 批次下載。 |
| **rawpixel – Public Domain / CC0** [植物](https://www.rawpixel.com/board/1300208/public-domain-plant-images-royalty-free-high-resolution-cc0-images)・[醫用植物](https://www.rawpixel.com/board/326905/medical-botany-illustrations-free-public-domain-images) | 已數位化的 PD 植物畫（含 Köhler） | 標示 CC0 | 中 | 下載方便、已去背版本多。 |
| **Biodiversity Heritage Library (BHL)** [bhl flickr](https://www.flickr.com/photos/biodivlibrary/) | 古典博物學／植物插圖 | 多為 PD / No known copyright | 中 | 來自掃描古籍。 |
| **Openverse** <https://openverse.org/> | 跨站聚合搜尋 | **可篩 CC0** | 視搜尋而定 | 搜尋時把授權篩選設為 CC0。 |
| **StockSnap.io** [醫用植物](https://stocksnap.io/search/medicinal%20plant) | 實拍照片 | CC0 | 低（多為通用花草） | 特定中藥涵蓋少。 |

### 5b. 可用但需「逐張確認 / 需署名」

| 來源 | 內容 | 授權 | 注意 |
|---|---|---|---|
| **Wikimedia Commons** [中藥材分類](https://commons.wikimedia.org/wiki/Category:Chinese_herbal_medicines)・[中醫](https://commons.wikimedia.org/wiki/Category:Traditional_Chinese_medicine) | 乾藥材（飲片）與植物**實拍照** | **逐張不同**：CC0 / CC‑BY / CC‑BY‑SA 皆有 | 乾藥材實拍**多為 CC‑BY‑SA（需署名＋相同方式分享）**，並非 CC0。每張都要點進去看授權，並把作者記到本檔。 |

### 5c.「免費可商用」但**嚴格說不是 CC0**（用前留意）

| 來源 | 授權 | 注意 |
|---|---|---|
| [Pixabay](https://pixabay.com/) | Pixabay Content License | 免署名、可商用，但**非 CC0**；不得原樣轉售、含可辨識人物/商標另有限制。 |
| [Unsplash](https://unsplash.com/) | Unsplash License | 免署名，但**非 CC0**；不得用以複製 Unsplash 服務本身。 |
| [Pexels](https://www.pexels.com/) | Pexels License | 同上性質。 |

### 建議做法
1. **以 Köhler PD 繪圖為主**：美觀、授權乾淨、涵蓋廣，最適合「認識藥草」關卡。
2. 缺的物種用 **Smithsonian CC0 標本照** 或 **Wikimedia 上篩 PD/CC0** 補。
3. 真的只有 **CC‑BY** 版本時 → 仍可用，但**務必把作者與出處逐筆登記到下方 §6 表格**並在遊戲內致謝頁顯示。
4. 避免直接用 Getty／iStock／Adobe Stock／Dreamstime 等商用圖庫（非免費授權）。

---

## 6. 各藥草圖片對照表

### 6a. 已收錄（Köhler's Medizinal‑Pflanzen，公有領域）

來源：**Köhler's Medizinal‑Pflanzen**（Gera, 1887–1898），繪者 Walther Müller／C. F. Schmidt，編者 Gustav Pabst／Franz Eugen Köhler。
授權：**公有領域（Public Domain Mark 1.0）**——無須署名，但本檔仍完整登記出處以示尊重。
取得方式：Wikimedia Commons `Special:FilePath/<檔名>`，存於 `assets/herbs/<id>.jpg`。
> ⚠️ 這些是 19 世紀的**植物彩繪**（非照片），物種以拉丁學名為準；少數與中藥材的基原略有差異（已於下表標注）。

| 藥草 | 檔案 | 物種（學名） | Köhler 圖版 | 授權 |
|---|---|---|---|---|
| 甘草 | assets/herbs/gancao.jpg | *Glycyrrhiza glabra* | Tafel 207 | PD |
| 大黃 | assets/herbs/dahuang.jpg | *Rheum officinale* | Tafel 256 | PD |
| 乾薑 | assets/herbs/ganjiang.jpg | *Zingiber officinale* | Tafel 146 | PD |
| 肉桂 | assets/herbs/rougui.jpg | *Cinnamomum verum*（錫蘭肉桂，與中藥肉桂 *C. cassia* 同屬近緣） | Tafel 182 | PD |
| 薄荷 | assets/herbs/bohe.jpg | *Mentha × piperita*（胡椒薄荷） | Tafel 095 | PD |
| 綠薄荷 | assets/herbs/spearmint.jpg | *Mentha viridis* | Tafel 096 | PD |
| 薰衣草 | assets/herbs/xunyicao.jpg | *Lavandula angustifolia* | Tafel 087 | PD |
| 茴香 | assets/herbs/fennel.jpg | *Foeniculum vulgare* | Tafel 148 | PD |
| 洋甘菊 | assets/herbs/chamomile.jpg | *Matricaria recutita* | Tafel 091 | PD |
| 迷迭香 | assets/herbs/rosemary.jpg | *Rosmarinus officinalis* | Tafel 258 | PD |
| 鼠尾草 | assets/herbs/sage.jpg | *Salvia officinalis* | Tafel 126 | PD |
| 百里香 | assets/herbs/thyme.jpg | *Thymus vulgaris* | Tafel 271 | PD |
| 葛縷子 | assets/herbs/caraway.jpg | *Carum carvi* | Tafel 172 | PD |
| 月桂葉 | assets/herbs/bay.jpg | *Laurus nobilis* | Tafel 086 | PD |
| 蒲公英 | assets/herbs/pugongying.jpg | *Taraxacum officinale* | Tafel 135 | PD |
| 款冬花 | assets/herbs/kuandong.jpg | *Tussilago farfara* | Tafel 142 | PD |
| 葫蘆巴 | assets/herbs/fenugreek.jpg | *Trigonella foenum-graecum* | Tafel 273 | PD |
| 纈草 | assets/herbs/valerian.jpg | *Valeriana officinalis* | Tafel 143 | PD |
| 香蜂草 | assets/herbs/lemonbalm.jpg | *Melissa officinalis* | Tafel 094 | PD |
| 西洋蓍草 | assets/herbs/yarrow.jpg | *Achillea millefolium* | Tafel 149 | PD |

各圖檔對應的 Wikimedia 原始頁面：`https://commons.wikimedia.org/wiki/File:<學名> - Köhler–s Medizinal-Pflanzen-<圖版>.jpg`

### 6b. Köhler 未涵蓋、待別處取圖的藥草（部分）

下列核心中藥**不在 Köhler 圖集**中（其偏歐洲/殖民時期藥用植物），日後需改用 Wikimedia 實拍照（多為 CC‑BY‑SA，需署名）或 Smithsonian CC0 標本照：
人參（*Panax ginseng*）、當歸（*Angelica sinensis*）、黃連（*Coptis chinensis*）、五味子（*Schisandra*）、枸杞（*Lycium*）、菊花（*Chrysanthemum morifolium*）、山楂（*Crataegus*）、紅花（*Carthamus tinctorius*）、金銀花、連翹、靈芝、茯苓 等。

---

## 7. 致謝

- 感謝 **three.js** 社群提供開源 3D 函式庫。
- 感謝 **LXGW（落霞孤鶩）** 開源「霞鶩文楷」字型。
- 感謝 **Hermann A. Köhler／Franz Eugen Köhler** 之《Medizinal‑Pflanzen》使珍貴藥用植物繪圖進入公有領域。
- 感謝 **Smithsonian Institution** 以 CC0 釋出大量植物典藏。
- 感謝 **Wikimedia Commons／Biodiversity Heritage Library** 眾多貢獻者保存並分享植物影像。

---

### 來源連結彙整
- three.js：<https://threejs.org/>
- 霞鶩文楷：<https://github.com/lxgw/LxgwWenKai>・<https://fonts.google.com/specimen/LXGW+WenKai+TC>
- Köhler's Medizinal‑Pflanzen（Wikimedia）：<https://commons.wikimedia.org/wiki/Category:K%C3%B6hlers_Medizinal-Pflanzen>
- Köhler's Medicinal Plants（維基百科）：<https://en.wikipedia.org/wiki/K%C3%B6hler's_Medicinal_Plants>
- Smithsonian Open Access：<https://www.si.edu/openaccess>
- Smithsonian 植物典藏：<https://collections.nmnh.si.edu/search/botany/>
- rawpixel CC0 植物：<https://www.rawpixel.com/board/1300208/public-domain-plant-images-royalty-free-high-resolution-cc0-images>
- Openverse：<https://openverse.org/>
- StockSnap：<https://stocksnap.io/search/medicinal%20plant>
- Wikimedia 中藥材分類：<https://commons.wikimedia.org/wiki/Category:Chinese_herbal_medicines>
