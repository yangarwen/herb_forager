using System.Text;
using UnityEngine;
using UnityEngine.InputSystem;
using HerbForager.Data;

namespace HerbForager.Prototype
{
    // Center-screen raycast onto IInteractable stations (jars, counter). Shows a
    // crosshair + context prompt + the commission HUD (IMGUI, no Canvas needed).
    public class Interactor : MonoBehaviour
    {
        public float reach = 4.4f;          // matches fp.js raycaster.far
        public GameState gs;

        IInteractable _aim;
        string _prompt;

        void Update()
        {
            _aim = null; _prompt = null;
            if (Physics.Raycast(transform.position, transform.forward, out var hit, reach))
            {
                _aim = hit.collider.GetComponentInParent<IInteractable>();
                if (_aim != null) _prompt = _aim.Prompt(gs);
            }

            var kb = Keyboard.current;
            if (kb == null) return;
            if (kb.eKey.wasPressedThisFrame && _aim != null) _aim.Interact(gs);
            if (kb.qKey.wasPressedThisFrame) gs.DropAll();      // tip everything back
            if (kb.rKey.wasPressedThisFrame) gs.RestartDay();   // fresh day
        }

        void OnGUI()
        {
            GUI.skin.font = GuiFont.Get();   // CJK font so Chinese shows in builds
            float cx = Screen.width / 2f, cy = Screen.height / 2f;

            // crosshair
            GUI.color = _aim != null ? Color.yellow : new Color(1, 1, 1, 0.6f);
            GUI.DrawTexture(new Rect(cx - 3, cy - 3, 6, 6), Texture2D.whiteTexture);
            GUI.color = Color.white;

            var mid = new GUIStyle(GUI.skin.label) { fontSize = 18, alignment = TextAnchor.MiddleCenter };
            if (_prompt != null)
                GUI.Label(new Rect(cx - 250, cy + 16, 500, 26), _prompt + "（按 E）", mid);

            DrawHud();

            // controls hint (bottom-center)
            var help = new GUIStyle(GUI.skin.label) { fontSize = 13, alignment = TextAnchor.MiddleCenter };
            help.normal.textColor = new Color(1, 1, 1, 0.65f);
            GUI.Label(new Rect(cx - 320, Screen.height - 26, 640, 20),
                "WASD 走動 · 滑鼠環顧 · E 互動 · Q 倒回 · R 重來一天 · Esc 放開滑鼠", help);
        }

        void DrawHud()
        {
            var label = new GUIStyle(GUI.skin.label) { fontSize = 15, richText = true };

            // held hand
            var sb = new StringBuilder("手上：");
            if (gs.HeldCount == 0) sb.Append("空手");
            else for (int i = 0; i < gs.Held.Count; i++) sb.Append(HerbDb.Name(gs.Held[i])).Append(i < gs.Held.Count - 1 ? "、" : "");
            GUI.Label(new Rect(16, 10, 700, 24), sb.ToString(), label);

            // forage basket (bottom-left)
            if (gs.BasketCount > 0)
                GUI.Label(new Rect(16, Screen.height - 30, 460, 24),
                    $"<color=#bfe08a>採集籃：{gs.BasketCount} 株（帶回屋內補罐）</color>", label);

            // today's commission
            var rx = gs.day.Current;
            var box = new GUIStyle(GUI.skin.box)
            {
                fontSize = 15,
                alignment = TextAnchor.UpperLeft,
                richText = true,
                wordWrap = true,
                padding = new RectOffset(12, 12, 10, 10)
            };
            const float boxW = 540f;
            if (gs.day.Done)
            {
                string done = "今日委託　全數配齊 ✦\n<b>今日收工，過關！</b>\n<size=13>按 R 再來一天</size>";
                GUI.Box(new Rect(16, 40, boxW, box.CalcHeight(new GUIContent(done), boxW)), done, box);
                return;
            }
            var t = new StringBuilder();
            t.Append($"今日委託　第 {gs.day.Index + 1}/{gs.day.Total} 帖\n");
            t.Append($"<b>{rx.name}</b>　{rx.cure}\n");
            t.Append("需要：");
            for (int i = 0; i < rx.herbs.Count; i++)
            {
                var id = rx.herbs[i];
                bool have = gs.HeldHas(id);
                string nm = $"{HerbDb.Name(id)}<size=11>（{HerbDb.NatureWall(id)}）</size>";
                t.Append(have ? $"<color=#7ec87e>{nm}✓</color>" : nm);
                if (i < rx.herbs.Count - 1) t.Append("　");
            }
            t.Append($"\n<size=12>客人：{rx.who}</size>");
            string content = t.ToString();
            GUI.Box(new Rect(16, 40, boxW, box.CalcHeight(new GUIContent(content), boxW)), content, box);
        }
    }
}
