using UnityEngine;

namespace HerbForager.Prototype
{
    // A jar on the cabinet wall. Aim + E grabs its herb if the current
    // prescription calls for it and there is stock. Mirrors fp.js takeHerb.
    public class JarStation : MonoBehaviour, IInteractable
    {
        public string herbId;
        public string herbName;
        public GameObject herbModel;   // the herb shown on the saucer
        public GameObject marker;      // glowing "needed now" indicator

        int _stock;

        public void SetStock(int n)
        {
            _stock = n;
            if (herbModel) herbModel.SetActive(n > 0);   // empty jar reads as empty
        }

        public void SetHighlight(bool on)
        {
            if (marker) marker.SetActive(on);
        }

        public string Prompt(GameState gs)
        {
            if (_stock <= 0) return $"{herbName}（罐空·去藥草園採補）";
            var rx = gs.day.Current;
            if (rx == null) return $"{herbName}（今日已收工）";
            if (gs.HeldHas(herbId)) return $"已抓「{herbName}」";
            if (rx.herbs.Contains(herbId)) return $"抓藥：{herbName}　罐存 {_stock}";
            return $"{herbName}（這帖用不到）";
        }

        public void Interact(GameState gs)
        {
            var rx = gs.day.Current;
            if (rx == null || !rx.herbs.Contains(herbId)) return;
            gs.TryTake(herbId);
        }
    }
}
