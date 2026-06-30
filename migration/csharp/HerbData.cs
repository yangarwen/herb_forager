using System;
using System.Collections.Generic;

// Data model for Herb Forager, ported from the three.js version (fp.js).
// Plain serializable DTOs intended to be loaded from migration/data/*.json.
//
// Loading notes:
//  - Newtonsoft JSON (com.unity.nuget.newtonsoft-json) deserializes the
//    top-level arrays directly:  JsonConvert.DeserializeObject<List<Herb>>(text)
//  - Unity's built-in JsonUtility CANNOT parse a top-level JSON array, so if
//    you avoid Newtonsoft you must wrap the json as {"items":[...]} first.
//  - colorHex is "#rrggbb"; use ColorUtility.TryParseHtmlString(h.colorHex, out var c).

namespace HerbForager.Data
{
    [Serializable]
    public class Herb
    {
        public string id;        // stable key, e.g. "renshen"
        public string name;      // display name, e.g. "人參"
        public string icon;      // emoji used on labels (may be null)
        public string colorHex;  // "#rrggbb" tint for the low-poly model
        public string shape;     // model archetype, see HerbShape
        public string nature;    // "warm" | "neutral" | "cold"  (四氣 / cabinet grouping)
        public string clue;      // riddle shown on the drawer slot (may be null)
        public string desc;      // one-line effect shown when picked up (may be null)
        public string latin;     // botanical name for atlas entries (null if no illustration)
    }

    [Serializable]
    public class Formula
    {
        public string name;          // e.g. "四君子湯"
        public string cure;          // what it treats
        public List<string> herbs;   // herb ids that make up the prescription
        public string who;           // flavor: the customer who requests it
    }

    // The 11 procedural model archetypes from fp.js. One low-poly prefab each,
    // tinted at runtime by Herb.colorHex — no need for 100 unique meshes.
    public enum HerbShape
    {
        Root,      // 根莖 / 樹皮 (29)
        Berry,     // 果實 / 種子 (22)
        Mint,      // 對生葉草 (10)
        Fern,      // 羽狀 / 長葉 (8)
        Clover,    // 闊葉野草 (6)
        Mushroom,  // 菌類 (6)
        Daisy,     // 多瓣小花 (6)
        Sun,       // 黃色團花 (4)
        Lavender,  // 紫穗花 (4)
        Rose,      // 花萼 / 花蕾 (3)
        Tulip,     // 鈴鐘花 (2)
    }

    public enum HerbNature
    {
        Warm,     // 溫熱 (40) → 左牆櫃
        Neutral,  // 平和 (25) → 後牆櫃
        Cold,     // 寒涼 (35) → 右牆櫃
    }
}
