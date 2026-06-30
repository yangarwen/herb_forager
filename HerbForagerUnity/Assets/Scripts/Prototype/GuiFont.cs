using UnityEngine;

namespace HerbForager.Prototype
{
    // A dynamic IMGUI font built from an installed Windows CJK font, so Chinese
    // text renders in standalone builds (the default GUI font has no CJK glyphs).
    public static class GuiFont
    {
        static Font _font;

        public static Font Get()
        {
            if (_font == null)
                _font = Font.CreateDynamicFontFromOSFont(
                    new[] { "Microsoft JhengHei UI", "Microsoft JhengHei",
                            "Microsoft YaHei UI", "Microsoft YaHei",
                            "PMingLiU", "SimSun" }, 16);
            return _font;
        }
    }
}
