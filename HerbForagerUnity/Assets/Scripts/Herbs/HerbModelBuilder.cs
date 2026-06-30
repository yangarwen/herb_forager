using UnityEngine;
using HerbForager.Data;
using HerbForager.Prototype;

namespace HerbForager.Herbs
{
    // Ports fp.js buildPlant() to C#. Each herb becomes one vertex-colored mesh.
    // Implemented so far: root (4 variants) + berry (4 variants). Other shapes use
    // a simple fallback until they are ported.
    public static class HerbModelBuilder
    {
        static Material _mat;
        static Material SharedMaterial()
        {
            if (_mat != null) return _mat;
            var sh = Shader.Find("HerbForager/HerbVertexColor");
            if (sh == null) sh = Shader.Find("Universal Render Pipeline/Lit");
            _mat = new Material(sh) { name = "HerbShared" };
            return _mat;
        }

        // Build a TRS matrix from radian Euler (to match three.js authoring values).
        static Matrix4x4 M(Vector3 pos, Vector3 eulerRad, Vector3 scale)
            => Matrix4x4.TRS(pos, Quaternion.Euler(eulerRad * Mathf.Rad2Deg), scale);
        static readonly Vector3 One = Vector3.one;
        const float TAU = 6.28318f;

        // Per-herb "signature": deterministic macro variation from the id so two
        // herbs of the same shape still differ in size, proportion, density and tint.
        struct Sig
        {
            public float size, tall, girth, hueShift, count;
            public static Sig For(string id)
            {
                var r = new Rng(Rng.Hash(id + "~sig"));
                return new Sig
                {
                    size = 0.82f + r.Next() * 0.42f,     // overall 0.82–1.24
                    tall = 0.80f + r.Next() * 0.55f,     // height 0.80–1.35
                    girth = 0.84f + r.Next() * 0.38f,    // width 0.84–1.22
                    hueShift = (r.Next() - 0.5f) * 0.08f, // ±0.04 hue
                    count = 0.75f + r.Next() * 0.60f,    // element count 0.75–1.35
                };
            }
        }
        static Sig _sig;
        static int Cnt(int n) => Mathf.Max(1, Mathf.RoundToInt(n * _sig.count));

        public static GameObject Build(Herb h)
        {
            _sig = Sig.For(h.id);
            var mb = new MeshBuilder
            {
                Root = Matrix4x4.Scale(new Vector3(_sig.girth * _sig.size, _sig.tall * _sig.size, _sig.girth * _sig.size))
            };
            Color accent = ColorUtility.TryParseHtmlString(h.colorHex, out var c) ? c : Color.magenta;
            var rng = new Rng(Rng.Hash(h.id));
            int variant = HerbVariant.Get(h.id);
            BuildPlant(mb, h.shape, accent, ref rng, variant);

            var mesh = mb.ToMesh();
            var go = new GameObject($"Herb_{h.id}");
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            go.AddComponent<MeshRenderer>().sharedMaterial = SharedMaterial();
            var box = go.AddComponent<BoxCollider>();
            box.center = mesh.bounds.center;
            box.size = mesh.bounds.size + Vector3.one * 0.04f;   // small pad for easier aim
            var ph = go.AddComponent<PlaceholderHerb>();
            ph.id = h.id; ph.herbName = h.name;
            return go;
        }

        static void BuildPlant(MeshBuilder mb, string shape, Color accent, ref Rng rng, int variant)
        {
            accent = HerbColor.OffsetHsl(accent, _sig.hueShift, 0f, 0f);   // per-herb tint identity
            switch (shape)
            {
                case "root": DriedRoot(mb, accent, ref rng, variant); break;
                case "berry": DriedBerries(mb, accent, ref rng, variant); break;
                case "mushroom": DriedFungus(mb, accent, ref rng, variant); break;
                case "sun": DriedFlowerSun(mb, accent, ref rng); break;
                case "daisy": DriedFlowerDaisy(mb, accent, ref rng); break;
                case "rose": DriedFlowerRose(mb, accent, ref rng); break;
                case "tulip": DriedFlowerTulip(mb, accent, ref rng); break;
                case "mint": DriedMint(mb, accent, ref rng, variant); break;
                case "fern": DriedFern(mb, accent, ref rng, variant); break;
                case "clover": DriedClover(mb, accent, ref rng); break;
                case "lavender": DriedSpike(mb, accent, ref rng); break;
                default: Fallback(mb, accent, ref rng); break;
            }
        }

        // --- shared bundle helpers (mint / fern / lavender) ---
        static void Stem(MeshBuilder mb, Matrix4x4 parent, float len, Color col)
            => mb.AddCylinder(parent * M(new Vector3(0, len / 2f, 0), Vector3.zero, One), col, 0.005f, 0.007f, len, 5);

        static void Twine(MeshBuilder mb)
            => mb.AddTorus(M(new Vector3(0, 0.05f, 0), Vector3.zero, One), HerbColor.New(0xb89a64), 0.03f, 0.008f, 6, 12);

        // --- root: 4 variants (forked / sliced / bark curl / rhizome chunk) ---
        static void DriedRoot(MeshBuilder mb, Color accent, ref Rng rng, int variant)
        {
            int v = variant >= 0 ? variant : rng.NextInt(4);

            if (v == 0)   // ginseng-like: one dominant tapering root + a side fork + whiskers
            {
                // pale cream body, lightly aged (not browned)
                Color body = Color.Lerp(HerbColor.Dry(accent, 0.22f, 0.16f), HerbColor.New(0xe7d6ab), 0.3f);
                Color whisk = HerbColor.Dry(accent, 0.42f, 0.14f);
                float baseYaw = rng.Next() * TAU;
                float lean = (rng.Next() - 0.5f);
                var rootM = M(Vector3.zero, new Vector3(0, baseYaw, 0), One);

                // main root: long plump spindle, gently curving, tapering to a tip
                float[] prof = { 0.05f, 0.052f, 0.046f, 0.036f, 0.024f, 0.012f };
                float py = 0f;
                for (int s = 0; s < 5; s++)
                {
                    var sm = rootM * M(new Vector3(lean * s * 0.018f, py + 0.045f, 0),
                                       new Vector3(0, 0, lean * 0.18f + (rng.Next() - 0.5f) * 0.15f), One);
                    mb.AddCylinder(sm, HerbColor.Jitter(body, ref rng, 0.03f, 0.05f), prof[s + 1], prof[s], 0.09f, 8);
                    py += 0.082f;
                }
                // reed-head (蘆頭) knob on top
                mb.AddIco(rootM * M(new Vector3(lean * 5 * 0.018f, py + 0.01f, 0),
                          new Vector3(rng.Next(), rng.Next(), rng.Next()), new Vector3(1.1f, 0.7f, 1.1f)),
                          HerbColor.Jitter(body, ref rng), 0.018f);

                // one shorter fork leg branching low off one side
                float dir = rng.Next() < 0.5f ? 1f : -1f;
                var legM = rootM * M(new Vector3(0, 0.05f, 0), new Vector3(0, 0, dir * (0.6f + rng.Next() * 0.3f)), One);
                float ly = 0f, lprev = 0.034f;
                for (int s = 0; s < 3; s++)
                {
                    float r = 0.03f - s * 0.009f;
                    mb.AddCylinder(legM * M(new Vector3(0, ly + 0.04f, 0), new Vector3(0, 0, (rng.Next() - 0.5f) * 0.3f), One),
                                   HerbColor.Jitter(body, ref rng, 0.03f, 0.05f), r, lprev, 0.07f, 7);
                    ly += 0.06f; lprev = r;
                }

                // fine whiskers trailing from the lower body
                int wc = 12 + rng.NextInt(6);
                for (int k = 0; k < wc; k++)
                {
                    float yy = 0.04f + rng.Next() * 0.22f;
                    float len = 0.06f + rng.Next() * 0.09f;
                    float wa = rng.Next() * TAU;
                    var wm = rootM * M(new Vector3(Mathf.Cos(wa) * 0.025f, yy, Mathf.Sin(wa) * 0.025f),
                                       new Vector3(1.7f + (rng.Next() - 0.5f) * 0.7f, wa, 0), One);
                    mb.AddCylinder(wm, whisk, 0.0013f, 0.0032f, len, 4);
                }
            }
            else if (v == 1)   // stacked slices (甘草/黃耆: 內檸檬黃、外紅褐皮)
            {
                Color core = Color.Lerp(HerbColor.Dry(accent, 0.12f, 0.22f), HerbColor.New(0xe8d27a), 0.45f); // lemon-yellow fibrous core
                Color barkRim = HerbColor.OffsetHsl(HerbColor.Dry(accent, 0.45f, -0.02f), -0.03f, 0.22f, 0);  // reddish-brown bark
                int count = Cnt(4 + rng.NextInt(3));
                for (int i = 0; i < count; i++)
                {
                    float a = rng.Next() * TAU, rr = rng.Next() * 0.06f;
                    var sm = M(new Vector3(Mathf.Cos(a) * rr, 0.007f + i * 0.006f, Mathf.Sin(a) * rr),
                               new Vector3((rng.Next() - 0.5f) * 0.3f, rng.Next() * Mathf.PI, (rng.Next() - 0.5f) * 0.3f), One);
                    mb.AddCylinder(sm, HerbColor.Jitter(core, ref rng, 0.03f, 0.06f), 0.052f, 0.052f, 0.012f, 14);
                    mb.AddTorus(sm, barkRim, 0.052f, 0.007f, 6, 16);
                }
            }
            else if (v == 2)   // bark quills (肉桂: 中空捲管、紅褐、細長)
            {
                Color bark = HerbColor.OffsetHsl(HerbColor.Dry(accent, 0.32f, -0.02f), -0.02f, 0.16f, 0); // red-brown
                int n = 2 + rng.NextInt(2);
                for (int i = 0; i < n; i++)
                {
                    float roll = Mathf.PI / 2f + (rng.Next() - 0.5f) * 0.3f;
                    var bm = M(new Vector3((i - (n - 1) / 2f) * 0.045f, 0.028f + i * 0.01f, (rng.Next() - 0.5f) * 0.03f),
                               new Vector3(0, (rng.Next() - 0.5f) * 0.6f, roll), One);
                    // outer quill + a thinner inner curl, for a rolled-scroll read
                    mb.AddCylinder(bm, HerbColor.Jitter(bark, ref rng), 0.024f, 0.027f, 0.26f, 10, false, false);
                    mb.AddCylinder(bm * M(new Vector3(0, 0, 0.004f), Vector3.zero, One),
                                   HerbColor.Jitter(HerbColor.OffsetHsl(bark, 0, 0, -0.08f), ref rng), 0.015f, 0.017f, 0.24f, 8, false, false);
                }
            }
            else   // rhizome: flattened knobby hand (乾薑/薑黃狀)
            {
                Color rz = Color.Lerp(HerbColor.Dry(accent, 0.3f, 0.16f), HerbColor.New(0xd9c69a), 0.4f); // beige-tan
                mb.AddIco(M(new Vector3(0, 0.03f, 0), new Vector3(0, rng.Next() * TAU, 0), new Vector3(1.6f, 0.55f, 1.1f)),
                          HerbColor.Jitter(rz, ref rng, 0.03f, 0.05f), 0.055f);   // flattened central mass
                int fingers = 3 + rng.NextInt(3);
                for (int i = 0; i < fingers; i++)
                {
                    float a = i / (float)fingers * TAU + (rng.Next() - 0.5f) * 0.4f;
                    var fm = M(new Vector3(Mathf.Cos(a) * 0.05f, 0.028f, Mathf.Sin(a) * 0.05f),
                               new Vector3(0, -a, 0), new Vector3(1.5f, 0.5f, 0.9f));   // finger lobes
                    mb.AddIco(fm, HerbColor.Jitter(rz, ref rng, 0.03f, 0.05f), 0.026f + rng.Next() * 0.012f);
                }
            }
        }

        // --- berry: 4 variants (small round / big wrinkled / flat seed / on-twig) ---
        static void DriedBerries(MeshBuilder mb, Color accent, ref Rng rng, int variant)
        {
            int v = variant >= 0 ? variant : rng.NextInt(4);

            if (v == 0)   // small oblong shriveled berries (枸杞: 橢長皺縮橘紅)
            {
                Color col = HerbColor.Dry(accent, 0.12f, 0.06f);   // keep it red-orange, lightly aged
                int cnt = Cnt(14);
                for (int i = 0; i < cnt; i++)
                {
                    float a = rng.Next() * TAU, rr = rng.Next() * 0.1f;
                    float y = 0.022f + rng.Next() * 0.05f * (1f - rr / 0.12f);
                    var bm = M(new Vector3(Mathf.Cos(a) * rr, y, Mathf.Sin(a) * rr),
                               new Vector3((rng.Next() - 0.5f) * 2.6f, rng.Next() * TAU, (rng.Next() - 0.5f) * 2.6f),
                               new Vector3(0.62f, 0.62f, 1.35f));   // raisin-like spindle
                    mb.AddSphere(bm, HerbColor.Jitter(col, ref rng, 0.04f, 0.12f), 0.024f, 6, 7);
                }
            }
            else if (v == 1)   // big wrinkled fruit (紅棗: 橢圓皺縮深紅)
            {
                Color col = HerbColor.Dry(accent, 0.16f, -0.04f);   // deep red-brown
                int count = Cnt(5 + rng.NextInt(3));
                for (int i = 0; i < count; i++)
                {
                    float a = rng.Next() * TAU, rr = rng.Next() * 0.06f;
                    var bm = M(new Vector3(Mathf.Cos(a) * rr, 0.045f, Mathf.Sin(a) * rr),
                               new Vector3((rng.Next() - 0.5f) * 2f, rng.Next() * TAU, (rng.Next() - 0.5f) * 2f),
                               new Vector3(0.82f, 0.82f, 1.25f));   // oval date
                    mb.AddSphere(bm, HerbColor.Jitter(col, ref rng, 0.04f, 0.12f), 0.045f, 7, 6);
                }
            }
            else if (v == 2)   // angular glossy seeds (決明子: 菱柱亮褐)
            {
                Color col = HerbColor.Dry(accent, 0.22f, 0.02f);
                int cnt = Cnt(16);
                for (int i = 0; i < cnt; i++)
                {
                    float a = rng.Next() * TAU, rr = rng.Next() * 0.09f;
                    var sm = M(new Vector3(Mathf.Cos(a) * rr, 0.014f + rng.Next() * 0.018f, Mathf.Sin(a) * rr),
                               new Vector3((rng.Next() - 0.5f) * 0.5f, rng.Next() * TAU, (rng.Next() - 0.5f) * 0.5f),
                               new Vector3(0.7f, 0.6f, 1.7f));   // little rhombic prisms
                    mb.AddIco(sm, HerbColor.Jitter(col, ref rng, 0.03f, 0.08f), 0.016f);
                }
            }
            else   // berries clustered on a stalk (五味子/桑椹: 緊簇暗紅)
            {
                Color col = HerbColor.Dry(accent, 0.14f, -0.04f);   // dark juicy-dried red
                mb.AddCylinder(M(new Vector3(0, 0.09f, 0), new Vector3(0, 0, 0.3f), One),
                               HerbColor.Dry(accent, 0.6f, 0), 0.006f, 0.008f, 0.18f, 5);
                int cnt = Cnt(14);
                for (int i = 0; i < cnt; i++)
                {
                    float tt = rng.Next();
                    var bm = M(new Vector3((rng.Next() - 0.5f) * 0.03f + 0.045f * tt, 0.03f + tt * 0.13f, (rng.Next() - 0.5f) * 0.03f),
                               new Vector3(rng.Next(), rng.Next(), rng.Next()), One);
                    mb.AddSphere(bm, HerbColor.Jitter(col, ref rng, 0.04f, 0.12f), 0.017f, 7, 6);
                }
            }
        }

        // --- mushroom: 3 variants (lingzhi / fuling / zhuling) ---
        static void DriedFungus(MeshBuilder mb, Color accent, ref Rng rng, int variant)
        {
            int v = variant >= 0 ? variant : rng.NextInt(3);
            Color col = HerbColor.Dry(accent, 0.5f, 0.04f);
            if (v == 0)   // lingzhi: flat glossy fan/kidney cap + bands + edge stalk
            {
                Color capC = HerbColor.OffsetHsl(HerbColor.Dry(accent, 0.25f, -0.04f), -0.02f, 0.18f, 0); // reddish-brown
                // wide, flat, fan-shaped cap; nudged forward so the stalk sits at the rim
                mb.AddSphere(M(new Vector3(0, 0.05f, 0.03f), Vector3.zero, new Vector3(1.5f, 0.28f, 1.15f)), capC, 0.085f, 8, 14);
                for (int i = 1; i <= 3; i++)
                    mb.AddTorus(M(new Vector3(0, 0.062f, 0.03f), Vector3.zero, new Vector3(1.3f, 1f, 1f)),
                                HerbColor.OffsetHsl(capC, 0, 0, 0.06f + i * 0.022f), 0.02f * i, 0.004f, 6, 20);
                mb.AddCylinder(M(new Vector3(0, 0.03f, -0.085f), new Vector3(0.4f, 0, 0.08f), One),
                               HerbColor.New(0x5a3420), 0.012f, 0.018f, 0.08f, 7);
            }
            else if (v == 1)   // fuling: pale lumpy block (茯苓白塊)
            {
                Color pale = Color.Lerp(col, HerbColor.New(0xe8e0d0), 0.5f);
                int lumps = 3 + rng.NextInt(2);
                for (int i = 0; i < lumps; i++)
                {
                    float a = rng.Next() * TAU, rr = rng.Next() * 0.05f;
                    mb.AddIco(M(new Vector3(Mathf.Cos(a) * rr, 0.04f + rng.Next() * 0.03f, Mathf.Sin(a) * rr),
                               new Vector3(rng.Next(), rng.Next() * TAU, rng.Next()), new Vector3(1.1f, 0.85f, 1f)),
                              HerbColor.Jitter(pale, ref rng, 0.02f, 0.05f), 0.045f + rng.Next() * 0.025f);
                }
            }
            else   // zhuling: dark irregular cores
            {
                int count = Cnt(3 + rng.NextInt(2));
                for (int i = 0; i < count; i++)
                {
                    float a = rng.Next() * TAU, rr = rng.Next() * 0.06f;
                    mb.AddIco(M(new Vector3(Mathf.Cos(a) * rr, 0.03f + rng.Next() * 0.03f, Mathf.Sin(a) * rr),
                               new Vector3(rng.Next(), rng.Next(), rng.Next()), One),
                              HerbColor.Jitter(col, ref rng, 0.03f, 0.07f), 0.03f + rng.Next() * 0.03f);
                }
            }
        }

        // --- sun: radial petal heads (菊 / 桂 / 槐) ---
        static void DriedFlowerSun(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color petalC = HerbColor.Dry(accent, 0.25f, 0.08f), centerC = HerbColor.Dry(accent, 0.45f, -0.05f);
            int heads = 1 + rng.NextInt(2);
            for (int h = 0; h < heads; h++)
            {
                var hm = M(new Vector3(heads > 1 ? (h - 0.5f) * 0.09f : 0, 0.02f + h * 0.02f, (rng.Next() - 0.5f) * 0.05f),
                           new Vector3((rng.Next() - 0.5f) * 0.6f, rng.Next() * TAU, (rng.Next() - 0.5f) * 0.6f), One);
                mb.AddCylinder(hm, centerC, 0.028f, 0.04f, 0.018f, 12);
                // dense, layered petals forming a rounded pompom (菊花)
                const int layers = 3;
                for (int L = 0; L < layers; L++)
                {
                    float rad = 0.058f - L * 0.014f;   // inner rings smaller
                    float lift = 0.004f + L * 0.013f;  // inner rings higher
                    float tilt = 0.15f + L * 0.5f;     // inner petals tip upward
                    int np = Cnt(14 - L * 2);
                    float baseA = rng.Next() * TAU;
                    for (int i = 0; i < np; i++)
                    {
                        float a = baseA + (float)i / np * TAU;
                        var pm = hm * M(new Vector3(Mathf.Cos(a) * rad, lift, Mathf.Sin(a) * rad),
                                        new Vector3(tilt, -a, (rng.Next() - 0.5f) * 0.2f), One);
                        mb.AddBox(pm, HerbColor.Jitter(petalC, ref rng, 0.05f, 0.1f), 0.011f, 0.004f, rad * 0.95f);
                    }
                }
            }
        }

        // --- daisy: clusters of little buds (金銀花 / 紫錐菊 / 蒲公英) ---
        static void DriedFlowerDaisy(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color col = HerbColor.Dry(accent, 0.32f, 0.08f), dark = HerbColor.Dry(accent, 0.45f, -0.02f);
            int n = Cnt(8 + rng.NextInt(5));
            for (int i = 0; i < n; i++)
            {
                float a = rng.Next() * TAU, r = rng.Next() * 0.09f;
                var bm = M(new Vector3(Mathf.Cos(a) * r, 0.025f + rng.Next() * 0.05f, Mathf.Sin(a) * r),
                           new Vector3((rng.Next() - 0.5f) * 1f, rng.Next() * TAU, (rng.Next() - 0.5f) * 1f), One);
                mb.AddIco(bm * M(Vector3.zero, Vector3.zero, new Vector3(1, 0.9f, 1)),
                          HerbColor.Jitter(col, ref rng, 0.05f, 0.12f), 0.026f);
                for (int p = 0; p < 5; p++)
                {
                    float pa = (float)p / 5 * TAU;
                    var pm = bm * M(new Vector3(Mathf.Cos(pa) * 0.02f, 0.005f, Mathf.Sin(pa) * 0.02f),
                                    new Vector3(0.7f, -pa, 0), One);
                    mb.AddBox(pm, HerbColor.Jitter(dark, ref rng, 0.04f, 0.1f), 0.01f, 0.003f, 0.022f);
                }
            }
        }

        // --- rose: curled buds + scattered threads (紅花 / 洛神 / 玫瑰) ---
        static void DriedFlowerRose(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color col = HerbColor.Dry(accent, 0.25f, 0.04f), dark = HerbColor.Dry(accent, 0.4f, -0.04f);
            int n = Cnt(5 + rng.NextInt(4));
            for (int i = 0; i < n; i++)
            {
                float a = rng.Next() * TAU, r = rng.Next() * 0.07f;
                var bm = M(new Vector3(Mathf.Cos(a) * r, 0.03f + rng.Next() * 0.03f, Mathf.Sin(a) * r),
                           new Vector3((rng.Next() - 0.5f) * 0.8f, rng.Next() * TAU, (rng.Next() - 0.5f) * 0.8f), One);
                mb.AddIco(bm * M(Vector3.zero, Vector3.zero, new Vector3(0.9f, 1.2f, 0.9f)),
                          HerbColor.Jitter(col, ref rng, 0.05f, 0.1f), 0.03f);
                for (int p = 0; p < 3; p++)
                {
                    float pa = (float)p / 3 * TAU;
                    mb.AddSphere(bm * M(new Vector3(Mathf.Cos(pa) * 0.02f, 0.01f, Mathf.Sin(pa) * 0.02f),
                                        new Vector3(0.8f, -pa, 0), new Vector3(0.8f, 0.25f, 0.6f)),
                                 HerbColor.Jitter(dark, ref rng, 0.04f, 0.1f), 0.025f, 6, 5);
                }
            }
            for (int i = 0; i < 6; i++)
            {
                float a = rng.Next() * TAU, r = 0.05f + rng.Next() * 0.05f;
                mb.AddCylinder(M(new Vector3(Mathf.Cos(a) * r, 0.012f, Mathf.Sin(a) * r),
                                 new Vector3(Mathf.PI / 2f, rng.Next() * TAU, rng.Next()), One),
                               HerbColor.Jitter(dark, ref rng, 0.05f, 0.1f), 0.003f, 0.002f, 0.05f, 4);
            }
        }

        // --- tulip: bell-shaped buds (桔梗 / 款冬) ---
        static void DriedFlowerTulip(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color col = HerbColor.Dry(accent, 0.3f, 0.04f);
            int n = Cnt(5 + rng.NextInt(3));
            for (int i = 0; i < n; i++)
            {
                float a = rng.Next() * TAU, r = rng.Next() * 0.07f;
                mb.AddCylinder(M(new Vector3(Mathf.Cos(a) * r, 0.03f + rng.Next() * 0.04f, Mathf.Sin(a) * r),
                                 new Vector3((rng.Next() - 0.5f) * 1.2f, rng.Next() * TAU, (rng.Next() - 0.5f) * 1.2f), One),
                               HerbColor.Jitter(col, ref rng, 0.05f, 0.1f), 0.022f, 0.008f, 0.05f, 6, false, false);
            }
        }

        // --- mint: leafy sprigs, twined (0 paired oval / 1 small leaves) ---
        static void DriedMint(MeshBuilder mb, Color accent, ref Rng rng, int variant)
        {
            Color leafCol = Color.Lerp(HerbColor.Dry(accent, 0.45f, 0.06f), HerbColor.New(0x7a7340), 0.35f);
            Color stemCol = HerbColor.Dry(accent, 0.6f, 0);
            int v = variant >= 0 ? variant : 0;
            int n = Cnt(4 + rng.NextInt(3));
            for (int i = 0; i < n; i++)
            {
                float len = 0.16f + rng.Next() * 0.08f;
                var sm = M(new Vector3((rng.Next() - 0.5f) * 0.03f, 0, (rng.Next() - 0.5f) * 0.03f),
                           new Vector3((rng.Next() - 0.5f) * 0.5f, (float)i / n * TAU, (rng.Next() - 0.5f) * 0.4f), One);
                Stem(mb, sm, len, stemCol);
                if (v == 1)
                {
                    for (int k = 0; k < 6; k++)
                    {
                        float y = len * (0.2f + 0.7f * k / 6f); int side = k % 2 == 1 ? 1 : -1;
                        mb.AddSphere(sm * M(new Vector3(side * 0.015f, y, 0), new Vector3(0.3f, 0, side * 0.4f), new Vector3(0.7f, 0.4f, 1f)),
                                     HerbColor.Jitter(leafCol, ref rng, 0.05f, 0.1f), 0.016f, 6, 5);
                    }
                }
                else
                {
                    for (int k = 0; k < 3; k++)
                    {
                        float y = len * (0.3f + k * 0.22f);
                        foreach (int side in new[] { -1, 1 })
                            mb.AddSphere(sm * M(new Vector3(side * 0.03f, y, 0), new Vector3(0.3f, 0, side * 0.5f), new Vector3(0.5f, 0.16f, 1f)),
                                         HerbColor.Jitter(leafCol, ref rng, 0.05f, 0.1f), 0.03f, 7, 6);
                    }
                }
            }
            Twine(mb);
        }

        // --- fern: pinnate fronds / long blades, twined ---
        static void DriedFern(MeshBuilder mb, Color accent, ref Rng rng, int variant)
        {
            Color col = Color.Lerp(HerbColor.Dry(accent, 0.45f, 0.05f), HerbColor.New(0x73703a), 0.35f);
            int v = variant >= 0 ? variant : rng.NextInt(2);
            if (v == 0)
            {
                int blades = Cnt(3 + rng.NextInt(2));
                for (int b = 0; b < blades; b++)
                {
                    float len = 0.22f + rng.Next() * 0.06f;
                    var fm = M(Vector3.zero, new Vector3((rng.Next() - 0.5f) * 0.5f, (float)b / blades * TAU, (rng.Next() - 0.5f) * 0.4f), One);
                    mb.AddCylinder(fm * M(new Vector3(0, len / 2f, 0), Vector3.zero, One), HerbColor.Dry(accent, 0.6f, 0), 0.004f, 0.004f, len, 4);
                    for (int k = 0; k < 5; k++)
                    {
                        float y = len * (0.2f + 0.7f * k / 5f);
                        foreach (int side in new[] { -1, 1 })
                            mb.AddCylinder(fm * M(new Vector3(side * 0.015f, y, 0), new Vector3(2.3f, 0, side * 0.8f), new Vector3(1, 1, 0.35f)),
                                           HerbColor.Jitter(col, ref rng, 0.05f, 0.1f), 0f, 0.012f, 0.045f, 4);
                    }
                }
            }
            else
            {
                int count = Cnt(5 + rng.NextInt(3));
                for (int i = 0; i < count; i++)
                {
                    float a = (float)i / 6 * TAU;
                    mb.AddCylinder(M(new Vector3(0, 0.12f, 0), new Vector3((rng.Next() - 0.3f) * 0.6f, a, (rng.Next() - 0.5f) * 0.5f + 0.1f), new Vector3(1, 1, 0.25f)),
                                   HerbColor.Jitter(col, ref rng, 0.05f, 0.1f), 0f, 0.018f, 0.24f + rng.Next() * 0.06f, 4);
                }
            }
            Twine(mb);
        }

        // --- clover: broad-leaf rosette + spike (車前草 / 魚腥草) ---
        static void DriedClover(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color col = Color.Lerp(HerbColor.Dry(accent, 0.45f, 0.06f), HerbColor.New(0x6f7a3a), 0.3f);
            int n = Cnt(5 + rng.NextInt(3));
            for (int i = 0; i < n; i++)
            {
                float a = (float)i / n * TAU;
                mb.AddSphere(M(new Vector3(Mathf.Cos(a) * 0.03f, 0.02f + rng.Next() * 0.02f, Mathf.Sin(a) * 0.03f),
                               new Vector3((rng.Next() - 0.5f) * 0.3f, -a, 0.3f), new Vector3(0.7f, 0.12f, 1.1f)),
                             HerbColor.Jitter(col, ref rng, 0.05f, 0.1f), 0.05f, 8, 6);
            }
            mb.AddCylinder(M(new Vector3(0, 0.06f, 0), Vector3.zero, One), HerbColor.Dry(accent, 0.4f, 0.05f), 0.006f, 0.01f, 0.1f, 6);
        }

        // --- lavender/spike: flower-spike bundle, twined (藿香 / 合歡 / 薰衣草 / 佩蘭) ---
        static void DriedSpike(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color spikeC = HerbColor.Dry(accent, 0.28f, 0.06f), stemC = HerbColor.Dry(accent, 0.55f, 0);
            int n = Cnt(5 + rng.NextInt(3));
            for (int i = 0; i < n; i++)
            {
                float h = 0.2f + rng.Next() * 0.1f;
                var sm = M(Vector3.zero, new Vector3((rng.Next() - 0.5f) * 0.5f, (float)i / n * TAU, (rng.Next() - 0.5f) * 0.5f), One);
                Stem(mb, sm, h, stemC);
                // flower spike = a column of little floret bumps, tapering to the tip
                int florets = 5 + rng.NextInt(3);
                for (int f = 0; f < florets; f++)
                {
                    float fy = h + 0.02f + f * 0.022f;
                    float fr = 0.02f * (1f - f / (float)(florets + 1));
                    float fa = f * 2.4f;
                    mb.AddSphere(sm * M(new Vector3(Mathf.Cos(fa) * fr, fy, Mathf.Sin(fa) * fr), Vector3.zero, new Vector3(1f, 0.9f, 1f)),
                                 HerbColor.Jitter(spikeC, ref rng, 0.06f, 0.12f), 0.014f, 6, 6);
                }
            }
            Twine(mb);
        }

        // Temporary stand-in for shapes not yet ported.
        static void Fallback(MeshBuilder mb, Color accent, ref Rng rng)
        {
            Color col = HerbColor.Dry(accent, 0.35f, 0.05f);
            for (int i = 0; i < 4; i++)
            {
                float a = rng.Next() * TAU, rr = rng.Next() * 0.05f;
                var m = M(new Vector3(Mathf.Cos(a) * rr, 0.04f + rng.Next() * 0.04f, Mathf.Sin(a) * rr),
                          new Vector3(rng.Next(), rng.Next(), rng.Next()), One);
                mb.AddIco(m, HerbColor.Jitter(col, ref rng), 0.035f + rng.Next() * 0.02f);
            }
        }
    }
}
