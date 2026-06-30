using UnityEngine;

namespace HerbForager.Herbs
{
    // Deterministic RNG: FNV-1a seed + xorshift32, matching fp.js hashStr/makeRng
    // so each herb id yields a fixed, unique shape.
    public struct Rng
    {
        uint s;
        public Rng(uint seed) { s = seed == 0 ? 1u : seed; }
        public static uint Hash(string str)
        {
            uint h = 2166136261u;
            foreach (char ch in str) { h ^= ch; h *= 16777619u; }
            return h;
        }
        public float Next()   // [0,1)
        {
            s ^= s << 13; s ^= s >> 17; s ^= s << 5;
            return s / 4294967296f;
        }
        public int NextInt(int n) => (int)(Next() * n);
    }

    // Color helpers ported from fp.js: HSL transforms + the "dried/aged" tone.
    public static class HerbColor
    {
        static readonly Color Brown = New(0x6b5236);   // 藥材褐
        static readonly Color Tan = New(0xbfa074);

        public static Color New(int hex) => new(
            ((hex >> 16) & 0xff) / 255f, ((hex >> 8) & 0xff) / 255f, (hex & 0xff) / 255f);

        // --- HSL <-> RGB (matches three.js Color get/setHSL) ---
        public static void ToHsl(Color c, out float h, out float s, out float l)
        {
            float max = Mathf.Max(c.r, c.g, c.b), min = Mathf.Min(c.r, c.g, c.b);
            l = (max + min) * 0.5f;
            if (Mathf.Approximately(max, min)) { h = s = 0; return; }
            float d = max - min;
            s = l > 0.5f ? d / (2f - max - min) : d / (max + min);
            if (max == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6f : 0f);
            else if (max == c.g) h = (c.b - c.r) / d + 2f;
            else h = (c.r - c.g) / d + 4f;
            h /= 6f;
        }

        static float Hue2Rgb(float p, float q, float t)
        {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1f / 6f) return p + (q - p) * 6f * t;
            if (t < 1f / 2f) return q;
            if (t < 2f / 3f) return p + (q - p) * (2f / 3f - t) * 6f;
            return p;
        }

        public static Color FromHsl(float h, float s, float l)
        {
            if (s <= 0) return new Color(l, l, l);
            float q = l < 0.5f ? l * (1f + s) : l + s - l * s;
            float p = 2f * l - q;
            return new Color(Hue2Rgb(p, q, h + 1f / 3f), Hue2Rgb(p, q, h), Hue2Rgb(p, q, h - 1f / 3f));
        }

        // dry(hex): desaturate ~50%, darken to ~62% lightness (+dl), lerp toward brown.
        public static Color Dry(Color c, float mix = 0.45f, float dl = 0f)
        {
            ToHsl(c, out float h, out float s, out float l);
            Color d = FromHsl(h, s * 0.5f, Mathf.Max(0.1f, l * 0.62f + dl));
            return Color.Lerp(d, Brown, mix);
        }
        public static Color Dry(int hex, float mix = 0.45f, float dl = 0f) => Dry(New(hex), mix, dl);

        // Per-element jitter so a pile of material varies slightly (seeded here).
        public static Color Jitter(Color c, ref Rng rng, float s = 0.05f, float l = 0.08f)
            => OffsetHsl(c, 0f, (rng.Next() - 0.5f) * s, (rng.Next() - 0.5f) * l);

        public static Color OffsetHsl(Color c, float dh, float ds, float dl)
        {
            ToHsl(c, out float h, out float s, out float l);
            return FromHsl(h + dh, Mathf.Clamp01(s + ds), Mathf.Clamp01(l + dl));
        }

        // tan base used by driedRoot: lerp(dry(accent,0.5,0.14), 0xbfa074, 0.45)
        public static Color RootTan(Color accent) => Color.Lerp(Dry(accent, 0.5f, 0.14f), Tan, 0.45f);
    }
}
