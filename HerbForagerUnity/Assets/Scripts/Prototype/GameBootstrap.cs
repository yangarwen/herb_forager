using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using HerbForager.Data;
using HerbForager.Herbs;

namespace HerbForager.Prototype
{
    // Builds the apothecary in code: a room, three nature cabinets holding all
    // 100 herb jars, a dispensing counter, the player, and the game systems.
    // Add to an empty GameObject in SampleScene and press Play.
    public class GameBootstrap : MonoBehaviour
    {
        const float ROOM = 12f, HALF = ROOM / 2f;

        // Self-spawn so the game runs in a build (or any scene) with no manual setup.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void AutoStart()
        {
            if (FindAnyObjectByType<GameBootstrap>() == null)
                new GameObject("GameBootstrap").AddComponent<GameBootstrap>();
        }

        void Start()
        {
            BuildRoom();
            var cam = SpawnPlayer();

            var gs = new GameObject("Game").AddComponent<GameState>();
            gs.handAnchor = cam;
            gs.Configure(HALF);
            cam.GetComponent<Interactor>().gs = gs;

            BuildCabinets(gs);
            BuildCounter();
            BuildGarden(gs);
            BuildDoor(cam);
            BuildRoof();
            Debug.Log("[Prototype] Apothecary + garden ready — fill commissions; when a jar runs dry, forage outside the front door and carry the basket back inside.");
        }

        // ---------- room ----------
        void BuildRoom()
        {
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
            floor.name = "Floor";
            floor.transform.localScale = Vector3.one * (ROOM / 10f);
            floor.GetComponent<Renderer>().sharedMaterial = Wood(new Vector2(3, 3));

            Wall(new Vector3(0, 2, -HALF), new Vector3(ROOM, 4, 0.3f), "Wall_Back");
            Wall(new Vector3(-HALF, 2, 0), new Vector3(0.3f, 4, ROOM), "Wall_Left");
            Wall(new Vector3(HALF, 2, 0), new Vector3(0.3f, 4, ROOM), "Wall_Right");
            // front wall with a central doorway to the garden
            const float doorW = 2.6f, seg = (ROOM - doorW) / 2f;
            Wall(new Vector3(-(doorW / 2f + seg / 2f), 2, HALF), new Vector3(seg, 4, 0.3f), "Wall_FrontL");
            Wall(new Vector3(doorW / 2f + seg / 2f, 2, HALF), new Vector3(seg, 4, 0.3f), "Wall_FrontR");

            // ceiling + beams (cozy, enclosed interior)
            var ceiling = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ceiling.name = "Ceiling";
            ceiling.transform.position = new Vector3(0, 4f, 0);
            ceiling.transform.localScale = new Vector3(ROOM, 0.2f, ROOM);
            ceiling.GetComponent<Renderer>().sharedMaterial = Wood(new Vector2(3, 3), 0.6f);
            for (int i = -1; i <= 1; i++)
            {
                var beam = GameObject.CreatePrimitive(PrimitiveType.Cube);
                beam.name = "Beam";
                beam.transform.position = new Vector3(i * 3f, 3.75f, 0);
                beam.transform.localScale = new Vector3(0.25f, 0.25f, ROOM);
                beam.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.24f, 0.17f, 0.11f));
                if (beam.TryGetComponent<Collider>(out var bc)) bc.enabled = false;
            }

            // light it ourselves: warm sun for the garden + a warm hanging lamp indoors
            foreach (var existing in Object.FindObjectsByType<Light>(FindObjectsSortMode.None))
                existing.gameObject.SetActive(false);

            var sun = new GameObject("Sun").AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.color = new Color(1f, 0.95f, 0.84f);
            sun.intensity = 1.15f;
            sun.shadows = LightShadows.Soft;
            sun.transform.rotation = Quaternion.Euler(48f, 30f, 0f);

            var lamp = new GameObject("Lamp").AddComponent<Light>();
            lamp.type = LightType.Point;
            lamp.color = new Color(1f, 0.8f, 0.55f);
            lamp.intensity = 4.5f;
            lamp.range = 16f;
            lamp.transform.position = new Vector3(0, 3.4f, -0.5f);

            RenderSettings.ambientLight = new Color(0.42f, 0.39f, 0.34f);
        }

        void Wall(Vector3 pos, Vector3 scale, string name)
        {
            var w = GameObject.CreatePrimitive(PrimitiveType.Cube);
            w.name = name;
            w.transform.position = pos;
            w.transform.localScale = scale;
            w.GetComponent<Renderer>().sharedMaterial = Wood(new Vector2(2, 2));
        }

        // ---------- pitched roof (gable, over the cabin) ----------
        void BuildRoof()
        {
            const float eaveX = HALF + 0.6f;     // overhang past the walls
            const float eaveY = 3.9f, ridgeY = 6f, length = ROOM + 1.2f;
            float angle = Mathf.Atan2(ridgeY - eaveY, eaveX) * Mathf.Rad2Deg;   // slope tilt
            float slopeLen = Mathf.Sqrt(eaveX * eaveX + (ridgeY - eaveY) * (ridgeY - eaveY));
            var roofMat = Wood(new Vector2(6, 3), 0.82f);

            // two slopes meeting at the ridge
            for (int side = -1; side <= 1; side += 2)
            {
                var slope = GameObject.CreatePrimitive(PrimitiveType.Cube);
                slope.name = "RoofSlope";
                slope.transform.position = new Vector3(side * eaveX / 2f, (ridgeY + eaveY) / 2f, 0);
                slope.transform.rotation = Quaternion.Euler(0, 0, -side * angle);
                slope.transform.localScale = new Vector3(slopeLen, 0.16f, length);
                slope.GetComponent<Renderer>().sharedMaterial = roofMat;
                if (slope.TryGetComponent<Collider>(out var sc)) sc.enabled = false;
            }

            // ridge beam
            var ridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ridge.name = "Ridge";
            ridge.transform.position = new Vector3(0, ridgeY, 0);
            ridge.transform.localScale = new Vector3(0.24f, 0.24f, length);
            ridge.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.22f, 0.15f, 0.1f));
            if (ridge.TryGetComponent<Collider>(out var rc)) rc.enabled = false;

            // gable triangles filling front & back
            Gable(HALF);
            Gable(-HALF);
        }

        void Gable(float z)
        {
            var go = new GameObject("Gable");
            var m = new Mesh();
            Vector3 a = new(-HALF, 4f, z), b = new(HALF, 4f, z), c = new(0, 6f, z);
            m.vertices = new[] { a, b, c, a, c, b };          // double-sided
            m.triangles = new[] { 0, 1, 2, 3, 4, 5 };
            m.RecalculateNormals();
            m.RecalculateBounds();
            go.AddComponent<MeshFilter>().sharedMesh = m;
            go.AddComponent<MeshRenderer>().sharedMaterial = Wood(new Vector2(2, 1), 0.85f);
        }

        // ---------- player ----------
        Transform SpawnPlayer()
        {
            if (Camera.main) Camera.main.gameObject.SetActive(false);

            var player = new GameObject("Player");
            player.transform.position = new Vector3(0f, 1f, 4.2f);
            player.transform.rotation = Quaternion.Euler(0, 180f, 0);   // face the cabinets
            var cc = player.AddComponent<CharacterController>();
            cc.height = 1.7f; cc.radius = 0.34f; cc.center = new Vector3(0, 0.85f, 0);

            var camGO = new GameObject("PlayerCamera");
            camGO.tag = "MainCamera";
            camGO.transform.SetParent(player.transform);
            camGO.transform.localPosition = new Vector3(0f, 1.6f, 0f);
            var camComp = camGO.AddComponent<Camera>();
            camComp.clearFlags = CameraClearFlags.SolidColor;
            camComp.backgroundColor = new Color(0.66f, 0.76f, 0.85f);   // soft sky beyond the garden
            camGO.AddComponent<AudioListener>();
            camGO.AddComponent<Interactor>();

            var fpc = player.AddComponent<FirstPersonController>();
            fpc.cam = camGO.transform;
            fpc.roomHalf = HALF;
            fpc.gardenHalfW = 11f;          // garden ground half-width
            fpc.gardenFar = HALF + 22f;     // garden ground far edge (centre HALF+11, half-size 11)
            return camGO.transform;
        }

        // ---------- cabinets of jars ----------
        void BuildCabinets(GameState gs)
        {
            var herbs = HerbDb.All;
            PlaceWall(herbs.Where(h => h.nature == "warm").ToList(), "left", gs);
            PlaceWall(herbs.Where(h => h.nature == "neutral").ToList(), "back", gs);
            PlaceWall(herbs.Where(h => h.nature == "cold").ToList(), "right", gs);
        }

        void PlaceWall(List<Herb> list, string wall, GameState gs)
        {
            const int rows = 4;
            int cols = Mathf.CeilToInt(list.Count / (float)rows);
            const float span = 9f, y0 = 0.8f, dy = 0.55f;
            float dx = span / Mathf.Max(1, cols - 1);

            int usedRows = Mathf.CeilToInt(list.Count / (float)cols);
            for (int r = 0; r < usedRows; r++)
                Shelf(wall, y0 + r * dy - 0.16f, span + 0.8f);

            for (int i = 0; i < list.Count; i++)
            {
                int c = i % cols, r = i / cols;
                float along = -span / 2f + c * dx;
                float y = y0 + r * dy;
                Vector3 pos = wall switch
                {
                    "left" => new Vector3(-HALF + 0.4f, y, along),
                    "right" => new Vector3(HALF - 0.4f, y, along),
                    _ => new Vector3(along, y, -HALF + 0.4f),
                };
                BuildJar(list[i], pos, gs);
            }
        }

        void Shelf(string wall, float y, float length)
        {
            const float depth = 0.34f, thick = 0.05f, inset = 0.36f;
            var plank = GameObject.CreatePrimitive(PrimitiveType.Cube);
            plank.name = "Shelf";
            if (wall == "left")
            { plank.transform.position = new Vector3(-HALF + inset, y, 0); plank.transform.localScale = new Vector3(depth, thick, length); }
            else if (wall == "right")
            { plank.transform.position = new Vector3(HALF - inset, y, 0); plank.transform.localScale = new Vector3(depth, thick, length); }
            else
            { plank.transform.position = new Vector3(0, y, -HALF + inset); plank.transform.localScale = new Vector3(length, thick, depth); }
            plank.GetComponent<Renderer>().sharedMaterial = Wood(new Vector2(4, 1), 1.1f);
            if (plank.TryGetComponent<Collider>(out var c)) c.enabled = false;
        }

        void BuildJar(Herb herb, Vector3 pos, GameState gs)
        {
            var jar = new GameObject($"Jar_{herb.id}");
            jar.transform.position = pos;

            // small saucer base (no enclosing jar — keep the herb visible)
            var saucer = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            saucer.name = "Base";
            saucer.transform.SetParent(jar.transform, false);
            saucer.transform.localScale = new Vector3(0.3f, 0.02f, 0.3f);
            saucer.transform.localPosition = new Vector3(0, -0.13f, 0);
            saucer.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.5f, 0.42f, 0.3f));
            if (saucer.TryGetComponent<Collider>(out var sc)) sc.enabled = false;

            // the herb itself, sitting on the saucer, clearly visible
            var model = HerbModelBuilder.Build(herb);
            model.transform.SetParent(jar.transform, false);
            // fit each herb fully inside the glass (by both height and width), base on the saucer
            float scale = 0.9f, seat = -0.13f;
            if (model.TryGetComponent<MeshFilter>(out var mf) && mf.sharedMesh != null)
            {
                var b = mf.sharedMesh.bounds;
                float by = Mathf.Max(0.001f, b.size.y);
                float bxz = Mathf.Max(0.001f, b.size.x, b.size.z);
                scale = Mathf.Min(0.26f / by, 0.24f / bxz);
                seat = -0.13f - b.min.y * scale;
            }
            model.transform.localScale = Vector3.one * scale;
            model.transform.localPosition = new Vector3(0, seat, 0);
            if (model.TryGetComponent<Collider>(out var mc)) mc.enabled = false;

            // translucent glass jar around the herb (drawn after the herb, so it shows through)
            var glass = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            glass.name = "Glass";
            glass.transform.SetParent(jar.transform, false);
            glass.transform.localScale = new Vector3(0.28f, 0.15f, 0.28f);   // ~Ø0.28, 0.30 tall
            glass.transform.localPosition = Vector3.zero;
            if (glass.TryGetComponent<Collider>(out var gc)) gc.enabled = false;
            glass.GetComponent<Renderer>().sharedMaterial = Glass();

            // one interaction collider covering the whole display
            var box = jar.AddComponent<BoxCollider>();
            box.center = new Vector3(0, -0.02f, 0);
            box.size = new Vector3(0.3f, 0.36f, 0.3f);

            // glowing "needed now" marker, hidden until the commission calls for it
            var marker = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            marker.name = "Marker";
            marker.transform.SetParent(jar.transform, false);
            marker.transform.localPosition = new Vector3(0, 0.2f, 0);
            marker.transform.localScale = Vector3.one * 0.05f;
            if (marker.TryGetComponent<Collider>(out var mkc)) mkc.enabled = false;
            marker.GetComponent<Renderer>().sharedMaterial = Glow(new Color(1f, 0.85f, 0.4f));
            marker.AddComponent<MarkerBob>();
            marker.SetActive(false);

            var st = jar.AddComponent<JarStation>();
            st.herbId = herb.id; st.herbName = herb.name; st.herbModel = model; st.marker = marker;
            gs.RegisterJar(st);
        }

        // ---------- counter ----------
        void BuildCounter()
        {
            var counter = GameObject.CreatePrimitive(PrimitiveType.Cube);   // collider doubles as a barrier
            counter.name = "Counter";
            counter.transform.position = new Vector3(0f, 0.55f, 2.4f);
            counter.transform.localScale = new Vector3(2.2f, 1.1f, 0.8f);
            counter.GetComponent<Renderer>().sharedMaterial = Wood(new Vector2(2, 1), 1.05f);
            counter.AddComponent<CounterStation>();
        }

        // ---------- garden (through the front door) ----------
        void BuildGarden(GameState gs)
        {
            var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Garden";
            ground.transform.position = new Vector3(0, 0.001f, HALF + 11f);   // near edge sits at the doorway, not inside
            ground.transform.localScale = new Vector3(2.2f, 1f, 2.2f);   // ~22×22
            ground.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.40f, 0.52f, 0.26f));

            // lay the herbs out in neat planting beds with walkways between them
            var herbs = HerbDb.All;
            const int perRow = 4, perCol = 3, perBed = perRow * perCol;
            const float bedW = 3.4f, bedD = 2.2f, pitchX = 5.0f, pitchZ = 4.2f;
            const int bedCols = 3;
            float startZ = HALF + 4f;

            int beds = Mathf.CeilToInt(herbs.Count / (float)perBed);
            int idx = 0;
            for (int bed = 0; bed < beds && idx < herbs.Count; bed++)
            {
                int bc = bed % bedCols, br = bed / bedCols;
                float bx = (bc - (bedCols - 1) / 2f) * pitchX;
                float bz = startZ + br * pitchZ;

                var soil = GameObject.CreatePrimitive(PrimitiveType.Cube);
                soil.name = "Bed";
                soil.transform.position = new Vector3(bx, 0.05f, bz);
                soil.transform.localScale = new Vector3(bedW, 0.1f, bedD);
                soil.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.30f, 0.22f, 0.14f));
                if (soil.TryGetComponent<Collider>(out var sc)) sc.enabled = false;

                for (int r = 0; r < perCol && idx < herbs.Count; r++)
                    for (int c = 0; c < perRow && idx < herbs.Count; c++, idx++)
                    {
                        float px = bx + (c - (perRow - 1) / 2f) * (bedW / perRow);
                        float pz = bz + (r - (perCol - 1) / 2f) * (bedD / perCol);
                        PlantForage(herbs[idx], new Vector3(px, 0.1f, pz));
                    }
            }
        }

        // ---------- hinged door at the garden doorway ----------
        void BuildDoor(Transform player)
        {
            const float doorHalf = 1.3f, height = 2.4f;

            // hinge on the left edge of the doorway
            var hinge = new GameObject("DoorHinge");
            hinge.transform.position = new Vector3(-doorHalf, 0, HALF);

            // door panel extends from the hinge across the gap
            var panel = GameObject.CreatePrimitive(PrimitiveType.Cube);
            panel.name = "DoorPanel";
            panel.transform.SetParent(hinge.transform, false);
            panel.transform.localPosition = new Vector3(doorHalf, height / 2f, 0);
            panel.transform.localScale = new Vector3(doorHalf * 2f - 0.06f, height, 0.07f);
            panel.GetComponent<Renderer>().sharedMaterial = Wood(new Vector2(2, 3), 0.95f);
            if (panel.TryGetComponent<Collider>(out var pc)) pc.enabled = false;   // auto-open, never traps

            // knob near the free edge
            var knob = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            knob.name = "Knob";
            knob.transform.SetParent(hinge.transform, false);
            knob.transform.localPosition = new Vector3(doorHalf * 2f - 0.18f, 1.05f, 0.08f);
            knob.transform.localScale = Vector3.one * 0.08f;
            knob.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.18f, 0.13f, 0.08f));
            if (knob.TryGetComponent<Collider>(out var kc)) kc.enabled = false;

            var d = hinge.AddComponent<Door>();
            d.player = player;
            d.hinge = hinge.transform;
            d.doorway = new Vector3(0, 0, HALF);
        }

        void PlantForage(Herb herb, Vector3 pos)
        {
            var holder = new GameObject($"Forage_{herb.id}");
            holder.transform.position = pos;
            holder.transform.rotation = Quaternion.Euler(0, Random.value * 360f, 0);

            var plant = HerbModelBuilder.Build(herb);
            plant.transform.SetParent(holder.transform, false);
            float scale = 2f;
            if (plant.TryGetComponent<MeshFilter>(out var mf) && mf.sharedMesh != null)
            {
                var s = mf.sharedMesh.bounds.size;
                float m = Mathf.Max(s.x, Mathf.Max(s.y, s.z));
                if (m > 0.001f) scale = 0.45f / m;   // uniform plant size across the garden
            }
            plant.transform.localScale = Vector3.one * scale;
            if (plant.TryGetComponent<Collider>(out var pc)) pc.enabled = false;

            var box = holder.AddComponent<BoxCollider>();
            box.center = new Vector3(0, 0.22f, 0);
            box.size = new Vector3(0.5f, 0.5f, 0.5f);

            var fs = holder.AddComponent<ForageStation>();
            fs.herbId = herb.id; fs.herbName = herb.name; fs.plant = plant;
        }

        // ---------- material helper ----------
        static Material Lit(Color c)
        {
            var sh = Shader.Find("Universal Render Pipeline/Lit");
            var m = new Material(sh != null ? sh : Shader.Find("Standard"));
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);
            else m.color = c;
            return m;
        }

        static Material Glow(Color c)
        {
            var m = Lit(c);
            m.EnableKeyword("_EMISSION");
            m.globalIlluminationFlags = MaterialGlobalIlluminationFlags.RealtimeEmissive;
            if (m.HasProperty("_EmissionColor")) m.SetColor("_EmissionColor", c * 2.2f);
            return m;
        }

        // ---------- wood (procedural plank texture, no art assets) ----------
        static Texture2D _wood;
        static Texture2D WoodTex()
        {
            if (_wood != null) return _wood;
            const int S = 128, planks = 5;
            var rnd = new System.Random(1234);
            var shade = new float[planks];
            for (int p = 0; p < planks; p++) shade[p] = 0.82f + (float)rnd.NextDouble() * 0.32f;

            var t = new Texture2D(S, S);
            for (int y = 0; y < S; y++)
            {
                float fy = (float)y / S * planks; int p = (int)fy; float frac = fy - p;
                bool seam = frac < 0.04f || frac > 0.96f;
                for (int x = 0; x < S; x++)
                {
                    float grain = 0.9f + 0.1f * Mathf.PerlinNoise(x * 0.06f, y * 0.35f);
                    float s = shade[p % planks] * grain;
                    if (seam) s *= 0.5f;
                    t.SetPixel(x, y, new Color(0.52f * s, 0.37f * s, 0.22f * s));
                }
            }
            t.Apply();
            t.wrapMode = TextureWrapMode.Repeat;
            _wood = t;
            return t;
        }

        static Material Wood(Vector2 tiling, float bright = 1f)
        {
            var m = Lit(new Color(bright, bright, bright));
            m.SetTexture("_BaseMap", WoodTex());
            m.SetTextureScale("_BaseMap", tiling);
            return m;
        }

        // ---------- translucent glass (URP Lit transparent) ----------
        static Material _glass;
        static Material Glass()
        {
            if (_glass != null) return _glass;
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            m.SetFloat("_Surface", 1f);       // transparent
            m.SetFloat("_Blend", 0f);         // alpha
            m.SetFloat("_ZWrite", 0f);
            m.SetFloat("_SrcBlend", (float)UnityEngine.Rendering.BlendMode.SrcAlpha);
            m.SetFloat("_DstBlend", (float)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            m.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            m.SetShaderPassEnabled("ShadowCaster", false);
            m.renderQueue = (int)UnityEngine.Rendering.RenderQueue.Transparent;
            if (m.HasProperty("_Smoothness")) m.SetFloat("_Smoothness", 0.9f);
            m.SetColor("_BaseColor", new Color(0.82f, 0.92f, 0.95f, 0.20f));
            _glass = m;
            return m;
        }
    }
}
