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
            Debug.Log("[Prototype] Apothecary + garden ready — fill commissions; when a jar runs dry, forage outside the front door and carry the basket back inside.");
        }

        // ---------- room ----------
        void BuildRoom()
        {
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
            floor.name = "Floor";
            floor.transform.localScale = Vector3.one * (ROOM / 10f);
            floor.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.40f, 0.31f, 0.22f));

            Wall(new Vector3(0, 2, -HALF), new Vector3(ROOM, 4, 0.3f), "Wall_Back");
            Wall(new Vector3(-HALF, 2, 0), new Vector3(0.3f, 4, ROOM), "Wall_Left");
            Wall(new Vector3(HALF, 2, 0), new Vector3(0.3f, 4, ROOM), "Wall_Right");
            // front wall with a central doorway to the garden
            const float doorW = 2.6f, seg = (ROOM - doorW) / 2f;
            Wall(new Vector3(-(doorW / 2f + seg / 2f), 2, HALF), new Vector3(seg, 4, 0.3f), "Wall_FrontL");
            Wall(new Vector3(doorW / 2f + seg / 2f, 2, HALF), new Vector3(seg, 4, 0.3f), "Wall_FrontR");

            if (FindAnyObjectByType<Light>() == null)
            {
                var l = new GameObject("Lamp").AddComponent<Light>();
                l.type = LightType.Directional;
                l.color = new Color(1f, 0.92f, 0.82f);
                l.intensity = 1.1f;
                l.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
            }
            RenderSettings.ambientLight = new Color(0.5f, 0.46f, 0.4f);
        }

        void Wall(Vector3 pos, Vector3 scale, string name)
        {
            var w = GameObject.CreatePrimitive(PrimitiveType.Cube);
            w.name = name;
            w.transform.position = pos;
            w.transform.localScale = scale;
            w.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.36f, 0.28f, 0.2f));
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
            camGO.AddComponent<Camera>();
            camGO.AddComponent<AudioListener>();
            camGO.AddComponent<Interactor>();

            var fpc = player.AddComponent<FirstPersonController>();
            fpc.cam = camGO.transform;
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

        void BuildJar(Herb herb, Vector3 pos, GameState gs)
        {
            var jar = new GameObject($"Jar_{herb.id}");
            jar.transform.position = pos;

            // small saucer base (no enclosing jar — keep the herb visible)
            var saucer = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            saucer.name = "Base";
            saucer.transform.SetParent(jar.transform, false);
            saucer.transform.localScale = new Vector3(0.15f, 0.02f, 0.15f);
            saucer.transform.localPosition = new Vector3(0, -0.13f, 0);
            saucer.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.5f, 0.42f, 0.3f));
            if (saucer.TryGetComponent<Collider>(out var sc)) sc.enabled = false;

            // the herb itself, sitting on the saucer, clearly visible
            var model = HerbModelBuilder.Build(herb);
            model.transform.SetParent(jar.transform, false);
            model.transform.localPosition = new Vector3(0, -0.13f, 0);
            model.transform.localScale = Vector3.one * 1.3f;
            if (model.TryGetComponent<Collider>(out var mc)) mc.enabled = false;

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
            counter.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.45f, 0.32f, 0.2f));
            counter.AddComponent<CounterStation>();
        }

        // ---------- garden (through the front door) ----------
        void BuildGarden(GameState gs)
        {
            var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Garden";
            ground.transform.position = new Vector3(0, 0.001f, HALF + 10f);
            ground.transform.localScale = new Vector3(2.2f, 1f, 2.2f);   // ~22×22
            ground.GetComponent<Renderer>().sharedMaterial = Lit(new Color(0.40f, 0.52f, 0.26f));

            foreach (var h in HerbDb.All)
            {
                var holder = new GameObject($"Forage_{h.id}");
                holder.transform.position = new Vector3(Random.Range(-8.5f, 8.5f), 0f, HALF + 3f + Random.Range(0f, 15f));
                holder.transform.rotation = Quaternion.Euler(0, Random.value * 360f, 0);

                var plant = HerbModelBuilder.Build(h);
                plant.transform.SetParent(holder.transform, false);
                plant.transform.localScale = Vector3.one * 1.6f;
                if (plant.TryGetComponent<Collider>(out var pc)) pc.enabled = false;

                var box = holder.AddComponent<BoxCollider>();
                box.center = new Vector3(0, 0.12f, 0);
                box.size = new Vector3(0.42f, 0.42f, 0.42f);

                var fs = holder.AddComponent<ForageStation>();
                fs.herbId = h.id; fs.herbName = h.name; fs.plant = plant;
            }
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
    }
}
