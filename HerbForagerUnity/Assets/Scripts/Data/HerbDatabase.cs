using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HerbForager.Data
{
    // Loads herbs.json / formulas.json from StreamingAssets.
    //
    // Uses Unity's built-in JsonUtility (no extra packages). JsonUtility cannot
    // parse a top-level JSON array, so we wrap the text as {"items":[...]} first.
    //
    // File.ReadAllText works in the Editor and in Windows/Mac/Linux standalone
    // builds (StreamingAssets stays as loose files there) — which is our Steam
    // target. NOTE: Android/WebGL would need UnityWebRequest instead.
    public static class HerbDatabase
    {
        [System.Serializable]
        private class Wrapper<T> { public List<T> items; }

        private static List<T> LoadArray<T>(string fileName)
        {
            string path = Path.Combine(Application.streamingAssetsPath, fileName);
            string json = File.ReadAllText(path);
            string wrapped = "{\"items\":" + json + "}";
            return JsonUtility.FromJson<Wrapper<T>>(wrapped).items;
        }

        public static List<Herb> LoadHerbs() => LoadArray<Herb>("herbs.json");
        public static List<Formula> LoadFormulas() => LoadArray<Formula>("formulas.json");
    }
}
