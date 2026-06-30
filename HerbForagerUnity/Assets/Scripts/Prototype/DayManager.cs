using System.Collections.Generic;
using System.Linq;
using HerbForager.Data;

namespace HerbForager.Prototype
{
    // Today's commissions: pick DayCount prescriptions, track the current one,
    // advance on each successful submit. Mirrors fp.js startDay/activeRx.
    public class DayManager
    {
        public const int DayCount = 4;

        List<Formula> _day = new();
        int _idx;

        public void StartDay()
        {
            var all = HerbDatabase.LoadFormulas();
            for (int i = all.Count - 1; i > 0; i--)   // Fisher–Yates
            {
                int j = UnityEngine.Random.Range(0, i + 1);
                (all[i], all[j]) = (all[j], all[i]);
            }
            _day = all.Take(DayCount).ToList();
            _idx = 0;
        }

        public Formula Current => _idx < _day.Count ? _day[_idx] : null;
        public int Index => _idx;
        public int Total => _day.Count;
        public bool Done => _idx >= _day.Count;
        public void Advance() => _idx++;
    }
}
