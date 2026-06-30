using UnityEngine;

namespace HerbForager.Prototype
{
    // The dispensing counter. Aim + E hands in the current prescription.
    // Mirrors fp.js submitFormula.
    public class CounterStation : MonoBehaviour, IInteractable
    {
        public string Prompt(GameState gs)
        {
            var rx = gs.day.Current;
            if (rx == null) return "今日藥方已配齊 ✦";
            int have = 0;
            foreach (var id in rx.herbs)
                if (gs.HeldHas(id)) have++;
            return $"配藥台 · 交方（{have}/{rx.herbs.Count} 味）";
        }

        public void Interact(GameState gs) => gs.Submit();
    }
}
