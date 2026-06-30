using System.Collections.Generic;
using System.Linq;

namespace HerbForager.Data
{
    // Loads the herb list once and indexes it by id for quick lookup.
    public static class HerbDb
    {
        static List<Herb> _all;
        static Dictionary<string, Herb> _byId;

        static void EnsureLoaded()
        {
            if (_all != null) return;
            _all = HerbDatabase.LoadHerbs();
            _byId = _all.ToDictionary(h => h.id);
        }

        public static IReadOnlyList<Herb> All { get { EnsureLoaded(); return _all; } }

        public static Herb Get(string id)
        {
            EnsureLoaded();
            return _byId.TryGetValue(id, out var h) ? h : null;
        }

        public static string Name(string id) => Get(id)?.name ?? id;

        // Which cabinet wall a herb lives on, by its nature.
        public static string NatureWall(string id) => Get(id)?.nature switch
        {
            "warm" => "溫熱·左",
            "neutral" => "平和·後",
            "cold" => "寒涼·右",
            _ => "",
        };
    }
}
