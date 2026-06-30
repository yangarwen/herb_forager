using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace HerbForager.Data
{
    // One-click sanity check that the JSON data loads correctly inside Unity.
    // Run from the top menu:  HerbForager > Validate Data  → see the Console.
    public static class HerbDataValidator
    {
        [MenuItem("HerbForager/Validate Data")]
        public static void Validate()
        {
            var herbs = HerbDatabase.LoadHerbs();
            var formulas = HerbDatabase.LoadFormulas();

            Debug.Log($"[HerbForager] herbs = {herbs.Count}  (expect 100)");
            Debug.Log($"[HerbForager] formulas = {formulas.Count}  (expect 25)");

            var byNature = herbs.GroupBy(h => h.nature)
                                .Select(g => $"{g.Key}:{g.Count()}");
            Debug.Log("[HerbForager] nature => " + string.Join(", ", byNature));

            int withLatin = herbs.Count(h => !string.IsNullOrEmpty(h.latin));
            Debug.Log($"[HerbForager] withLatin = {withLatin}  (expect 20)");

            // Formula → herb reference integrity (no dangling ids).
            var ids = new HashSet<string>(herbs.Select(h => h.id));
            var missing = formulas.SelectMany(f => f.herbs)
                                  .Where(id => !ids.Contains(id))
                                  .Distinct().ToList();
            Debug.Log(missing.Count == 0
                ? "[HerbForager] formula refs OK (no dangling herb ids)"
                : "[HerbForager] MISSING refs: " + string.Join(", ", missing));

            // Spot-check a sample row + color parsing.
            var s = herbs[0];
            Debug.Log($"[HerbForager] sample: {s.id} / {s.name} / {s.colorHex} / {s.shape}-{s.nature} / \"{s.desc}\"");
            bool ok = ColorUtility.TryParseHtmlString(s.colorHex, out Color c);
            Debug.Log($"[HerbForager] color parse {s.colorHex} -> ok={ok}, rgb={c}");

            Debug.Log($"[HerbForager] sample formula: {formulas[0].name} = " +
                      string.Join("+", formulas[0].herbs));
        }
    }
}
