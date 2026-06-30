using System.Collections.Generic;
using UnityEngine;
using HerbForager.Data;
using HerbForager.Herbs;

namespace HerbForager.Prototype
{
    // Holds the hand, the day's commissions, per-herb jar stock, and the forage
    // basket. Submitting consumes stock; foraging outside and walking back in
    // refills it. Mirrors fp.js stock / basket / depositBasket.
    public class GameState : MonoBehaviour
    {
        const int StockStart = 3, StockCap = 6;

        public Transform handAnchor;        // the player camera
        public readonly DayManager day = new();

        readonly List<string> _heldIds = new();
        readonly List<GameObject> _heldGo = new();
        readonly Dictionary<string, int> _stock = new();
        readonly Dictionary<string, int> _basket = new();
        readonly List<JarStation> _jars = new();

        Transform _player;
        bool _wasOutside;
        float _insideMaxZ = 6f;

        public IReadOnlyList<string> Held => _heldIds;
        public int HeldCount => _heldIds.Count;
        public bool HeldHas(string id) => _heldIds.Contains(id);
        public int StockOf(string id) => _stock.TryGetValue(id, out var n) ? n : 0;
        public int BasketCount { get { int s = 0; foreach (var v in _basket.Values) s += v; return s; } }

        public void Configure(float roomHalf) => _insideMaxZ = roomHalf;
        public void RegisterJar(JarStation j) => _jars.Add(j);

        void Start()
        {
            day.StartDay();
            foreach (var h in HerbDb.All) _stock[h.id] = StockStart;
            _player = handAnchor ? handAnchor.parent : null;
            RefreshJars();
        }

        void Update()
        {
            if (_player == null) return;
            bool outside = _player.position.z > _insideMaxZ;
            if (!outside && _wasOutside) Deposit();   // carried the basket back indoors
            _wasOutside = outside;
        }

        void RefreshJars()
        {
            var rx = day.Current;
            foreach (var j in _jars)
            {
                j.SetStock(StockOf(j.herbId));
                bool needed = rx != null && rx.herbs.Contains(j.herbId)
                              && !HeldHas(j.herbId) && StockOf(j.herbId) > 0;
                j.SetHighlight(needed);
            }
        }

        // Grab one prescribed, in-stock herb into the hand (no duplicates).
        public bool TryTake(string id)
        {
            var rx = day.Current;
            if (rx == null || !rx.herbs.Contains(id)) return false;
            if (HeldHas(id) || StockOf(id) <= 0) return false;

            _heldIds.Add(id);
            var go = HerbModelBuilder.Build(HerbDb.Get(id));
            if (go.TryGetComponent<Collider>(out var col)) col.enabled = false;
            go.transform.SetParent(handAnchor, false);
            _heldGo.Add(go);
            ArrangeHand();
            RefreshJars();        // the herb you just grabbed no longer needs a marker
            return true;
        }

        // Hand in the current prescription; consumes one stock of each herb used.
        public bool Submit()
        {
            var rx = day.Current;
            if (rx == null) return false;
            foreach (var id in rx.herbs)
                if (!HeldHas(id)) return false;
            foreach (var id in rx.herbs)
                _stock[id] = Mathf.Max(0, StockOf(id) - 1);
            ClearHand();
            day.Advance();
            RefreshJars();
            return true;
        }

        public void DropAll() => ClearHand();

        // Start a fresh day: new commissions, stock topped up, hand/basket cleared.
        public void RestartDay()
        {
            day.StartDay();
            foreach (var h in HerbDb.All) _stock[h.id] = StockStart;
            _basket.Clear();
            ClearHand();
            RefreshJars();
        }

        // Forage one plant in the garden into the basket.
        public void Forage(string id)
            => _basket[id] = (_basket.TryGetValue(id, out var n) ? n : 0) + 1;

        // Tip the whole basket back into the jars (capped), on returning indoors.
        void Deposit()
        {
            if (BasketCount == 0) return;
            foreach (var kv in _basket)
                _stock[kv.Key] = Mathf.Min(StockCap, StockOf(kv.Key) + kv.Value);
            _basket.Clear();
            RefreshJars();
        }

        void ClearHand()
        {
            foreach (var go in _heldGo) Destroy(go);
            _heldGo.Clear();
            _heldIds.Clear();
        }

        void ArrangeHand()
        {
            for (int i = 0; i < _heldGo.Count; i++)
            {
                float off = (i - (_heldGo.Count - 1) / 2f) * 0.22f;
                _heldGo[i].transform.localPosition = new Vector3(0.3f + off, -0.32f, 0.8f);
                _heldGo[i].transform.localRotation = Quaternion.identity;
                _heldGo[i].transform.localScale = Vector3.one * 1.4f;
            }
        }
    }
}
