using System.Collections.Generic;
using UnityEngine;

namespace HerbForager.Herbs
{
    // Accumulates low-poly primitives (each placed by a Matrix4x4 and tinted with
    // a vertex color) into one combined Mesh. Mirrors the three.js primitives the
    // original used: tapered cylinders, flat-shaded icosahedrons, low UV spheres,
    // and tori. One MeshBuilder per herb -> one mesh, one draw call.
    public class MeshBuilder
    {
        readonly List<Vector3> v = new();
        readonly List<Vector3> n = new();
        readonly List<Color> c = new();
        readonly List<int> t = new();

        // Applied to every vertex — used for the per-herb "signature" scale.
        public Matrix4x4 Root = Matrix4x4.identity;

        void Vert(Matrix4x4 m, Vector3 pos, Vector3 nrm, Color col)
        {
            Matrix4x4 mm = Root * m;
            v.Add(mm.MultiplyPoint3x4(pos));
            n.Add(mm.MultiplyVector(nrm).normalized);
            c.Add(col);
        }

        // Tapered cylinder along +Y, centered at origin (y in [-h/2, h/2]).
        public void AddCylinder(Matrix4x4 m, Color col, float rTop, float rBot,
                                float h, int seg, bool capTop = true, bool capBottom = true)
        {
            float half = h * 0.5f;
            for (int i = 0; i < seg; i++)
            {
                float a0 = Mathf.PI * 2f * i / seg, a1 = Mathf.PI * 2f * (i + 1) / seg;
                Vector3 d0 = new(Mathf.Cos(a0), 0, Mathf.Sin(a0));
                Vector3 d1 = new(Mathf.Cos(a1), 0, Mathf.Sin(a1));
                Vector3 tA = d0 * rTop + Vector3.up * half, tB = d1 * rTop + Vector3.up * half;
                Vector3 bA = d0 * rBot - Vector3.up * half, bB = d1 * rBot - Vector3.up * half;
                int s = v.Count;
                Vert(m, tA, d0, col); Vert(m, tB, d1, col); Vert(m, bB, d1, col); Vert(m, bA, d0, col);
                t.Add(s); t.Add(s + 1); t.Add(s + 2); t.Add(s); t.Add(s + 2); t.Add(s + 3);
            }
            if (capTop && rTop > 1e-4f) AddCap(m, col, rTop, half, seg, true);
            if (capBottom && rBot > 1e-4f) AddCap(m, col, rBot, -half, seg, false);
        }

        void AddCap(Matrix4x4 m, Color col, float r, float y, int seg, bool up)
        {
            int center = v.Count;
            Vert(m, new Vector3(0, y, 0), up ? Vector3.up : Vector3.down, col);
            for (int i = 0; i < seg; i++)
            {
                float a0 = Mathf.PI * 2f * i / seg, a1 = Mathf.PI * 2f * (i + 1) / seg;
                Vector3 p0 = new(Mathf.Cos(a0) * r, y, Mathf.Sin(a0) * r);
                Vector3 p1 = new(Mathf.Cos(a1) * r, y, Mathf.Sin(a1) * r);
                int s = v.Count;
                Vert(m, p0, up ? Vector3.up : Vector3.down, col);
                Vert(m, p1, up ? Vector3.up : Vector3.down, col);
                if (up) { t.Add(center); t.Add(s); t.Add(s + 1); }
                else { t.Add(center); t.Add(s + 1); t.Add(s); }
            }
        }

        // Low UV sphere (smooth normals). Used for berries/leaves, often scaled to ellipsoids.
        public void AddSphere(Matrix4x4 m, Color col, float r, int rings = 7, int segs = 7)
        {
            int start = v.Count;
            for (int y = 0; y <= rings; y++)
            {
                float vlat = (float)y / rings, theta = vlat * Mathf.PI;
                float st = Mathf.Sin(theta), ct = Mathf.Cos(theta);
                for (int x = 0; x <= segs; x++)
                {
                    float ulon = (float)x / segs, phi = ulon * Mathf.PI * 2f;
                    Vector3 nrm = new(Mathf.Cos(phi) * st, ct, Mathf.Sin(phi) * st);
                    Vert(m, nrm * r, nrm, col);
                }
            }
            int row = segs + 1;
            for (int y = 0; y < rings; y++)
                for (int x = 0; x < segs; x++)
                {
                    int a = start + y * row + x, b = a + row;
                    t.Add(a); t.Add(b); t.Add(a + 1);
                    t.Add(a + 1); t.Add(b); t.Add(b + 1);
                }
        }

        // Icosahedron (20 flat-shaded faces) — chunky rocks/roots/cores.
        public void AddIco(Matrix4x4 m, Color col, float r)
        {
            float tt = (1f + Mathf.Sqrt(5f)) * 0.5f;
            Vector3[] p = {
                new(-1, tt, 0), new(1, tt, 0), new(-1, -tt, 0), new(1, -tt, 0),
                new(0, -1, tt), new(0, 1, tt), new(0, -1, -tt), new(0, 1, -tt),
                new(tt, 0, -1), new(tt, 0, 1), new(-tt, 0, -1), new(-tt, 0, 1)
            };
            for (int i = 0; i < p.Length; i++) p[i] = p[i].normalized * r;
            int[][] f = {
                new[]{0,11,5}, new[]{0,5,1}, new[]{0,1,7}, new[]{0,7,10}, new[]{0,10,11},
                new[]{1,5,9}, new[]{5,11,4}, new[]{11,10,2}, new[]{10,7,6}, new[]{7,1,8},
                new[]{3,9,4}, new[]{3,4,2}, new[]{3,2,6}, new[]{3,6,8}, new[]{3,8,9},
                new[]{4,9,5}, new[]{2,4,11}, new[]{6,2,10}, new[]{8,6,7}, new[]{9,8,1}
            };
            foreach (var face in f)
            {
                Vector3 a = p[face[0]], b = p[face[1]], cc = p[face[2]];
                Vector3 nrm = Vector3.Cross(b - a, cc - a).normalized;
                int s = v.Count;
                Vert(m, a, nrm, col); Vert(m, b, nrm, col); Vert(m, cc, nrm, col);
                t.Add(s); t.Add(s + 1); t.Add(s + 2);
            }
        }

        // Torus in the XZ plane (axis +Y) — slice rims / lingzhi rings.
        public void AddTorus(Matrix4x4 m, Color col, float R, float rad, int rs = 6, int ts = 14)
        {
            int start = v.Count;
            for (int i = 0; i <= rs; i++)
            {
                float u = Mathf.PI * 2f * i / rs;
                Vector3 center = new(Mathf.Cos(u) * R, 0, Mathf.Sin(u) * R);
                Vector3 outDir = new(Mathf.Cos(u), 0, Mathf.Sin(u));
                for (int j = 0; j <= ts; j++)
                {
                    float vv = Mathf.PI * 2f * j / ts;
                    Vector3 nrm = outDir * Mathf.Cos(vv) + Vector3.up * Mathf.Sin(vv);
                    Vert(m, center + nrm * rad, nrm, col);
                }
            }
            int row = ts + 1;
            for (int i = 0; i < rs; i++)
                for (int j = 0; j < ts; j++)
                {
                    int a = start + i * row + j, b = a + row;
                    t.Add(a); t.Add(b); t.Add(a + 1);
                    t.Add(a + 1); t.Add(b); t.Add(b + 1);
                }
        }

        // Flat-shaded box centered at origin — flower petals, tiny chips.
        public void AddBox(Matrix4x4 m, Color col, float sx, float sy, float sz)
        {
            float x = sx * 0.5f, y = sy * 0.5f, z = sz * 0.5f;
            Vector3[,] faces = {
                {new(-x,-y, z), new( x,-y, z), new( x, y, z), new(-x, y, z)}, // +Z
                {new( x,-y,-z), new(-x,-y,-z), new(-x, y,-z), new( x, y,-z)}, // -Z
                {new( x,-y, z), new( x,-y,-z), new( x, y,-z), new( x, y, z)}, // +X
                {new(-x,-y,-z), new(-x,-y, z), new(-x, y, z), new(-x, y,-z)}, // -X
                {new(-x, y, z), new( x, y, z), new( x, y,-z), new(-x, y,-z)}, // +Y
                {new(-x,-y,-z), new( x,-y,-z), new( x,-y, z), new(-x,-y, z)}, // -Y
            };
            for (int f = 0; f < 6; f++)
            {
                Vector3 a = faces[f, 0], b = faces[f, 1], cc = faces[f, 2], d = faces[f, 3];
                Vector3 nrm = Vector3.Cross(b - a, cc - a).normalized;
                int s = v.Count;
                Vert(m, a, nrm, col); Vert(m, b, nrm, col); Vert(m, cc, nrm, col); Vert(m, d, nrm, col);
                t.Add(s); t.Add(s + 1); t.Add(s + 2); t.Add(s); t.Add(s + 2); t.Add(s + 3);
            }
        }

        public Mesh ToMesh()
        {
            var mesh = new Mesh { name = "HerbMesh" };
            if (v.Count > 65000) mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
            mesh.SetVertices(v);
            mesh.SetNormals(n);
            mesh.SetColors(c);
            mesh.SetTriangles(t, 0);
            mesh.RecalculateBounds();
            return mesh;
        }
    }
}
