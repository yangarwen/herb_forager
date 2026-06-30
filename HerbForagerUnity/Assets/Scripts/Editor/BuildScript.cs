using System.IO;
using UnityEditor;
using UnityEngine;

namespace HerbForager.EditorTools
{
    // One-click standalone Windows build. Menu: HerbForager > Build Windows (.exe).
    // The game self-spawns at runtime (GameBootstrap.AutoStart), so the scene
    // contents don't matter — any scene in the build boots the apothecary.
    public static class BuildScript
    {
        const string Scene = "Assets/Scenes/SampleScene.unity";

        // Shaders our materials create at runtime via Shader.Find. Unless they are
        // in "Always Included Shaders" the build strips them and everything renders
        // magenta. Keep this list in sync with GameBootstrap / HerbModelBuilder.
        static readonly string[] RuntimeShaders =
        {
            "Universal Render Pipeline/Lit",
            "Universal Render Pipeline/Unlit",
            "HerbForager/HerbVertexColor",
        };

        [MenuItem("HerbForager/Fix Build Shaders (always-included)")]
        public static void FixShaders()
        {
            var assets = AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/GraphicsSettings.asset");
            if (assets.Length == 0) { Debug.LogError("[Build] GraphicsSettings not found."); return; }

            var so = new SerializedObject(assets[0]);
            var list = so.FindProperty("m_AlwaysIncludedShaders");
            int added = 0;

            foreach (var name in RuntimeShaders)
            {
                var shader = Shader.Find(name);
                if (shader == null) { Debug.LogWarning($"[Build] shader not found: {name}"); continue; }

                bool present = false;
                for (int i = 0; i < list.arraySize; i++)
                    if (list.GetArrayElementAtIndex(i).objectReferenceValue == shader) { present = true; break; }

                if (!present)
                {
                    list.InsertArrayElementAtIndex(list.arraySize);
                    list.GetArrayElementAtIndex(list.arraySize - 1).objectReferenceValue = shader;
                    added++;
                }
            }

            so.ApplyModifiedProperties();
            AssetDatabase.SaveAssets();
            Debug.Log($"[Build] Always-included shaders ensured ({added} added).");
        }

        [MenuItem("HerbForager/Build Windows (.exe)")]
        public static void BuildWindows()
        {
            FixShaders();   // make sure runtime shaders survive stripping

            string dir = Path.Combine(Directory.GetParent(Application.dataPath).FullName, "Build");
            string exe = Path.Combine(dir, "HerbForager.exe");
            Directory.CreateDirectory(dir);

            var report = BuildPipeline.BuildPlayer(
                new[] { Scene }, exe, BuildTarget.StandaloneWindows64, BuildOptions.None);

            var s = report.summary;
            if (s.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
            {
                Debug.Log($"[Build] OK → {exe}  ({s.totalSize / (1024 * 1024)} MB)");
                EditorUtility.RevealInFinder(exe);
            }
            else
            {
                Debug.LogError($"[Build] {s.result} — {s.totalErrors} error(s). See console above.");
            }
        }
    }
}
