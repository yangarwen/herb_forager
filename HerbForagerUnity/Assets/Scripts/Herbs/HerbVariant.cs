using System.Collections.Generic;

namespace HerbForager.Herbs
{
    // Ported from fp.js HERB_VARIANT: which sub-shape each herb uses so 人參 looks
    // like a forked root, 肉桂 like bark, etc. Returns -1 when unspecified (caller
    // then picks randomly from the seeded RNG).
    public static class HerbVariant
    {
        static readonly Dictionary<string, int> Map = new()
        {
            // dried root: 0 forked / 1 sliced / 2 bark curl / 3 rhizome chunk
            {"renshen",0},{"danggui",0},{"danshen",0},{"dangshen",0},{"shanyao",0},{"gegen",0},{"banlangen",0},
            {"huangqi",1},{"gancao",1},{"rougui",2},{"duzhong",2},{"baizhu",3},{"chuanxiong",3},
            // dried berry: 0 small round / 1 big wrinkled / 2 flat seed / 3 on-twig
            {"gouqi",0},{"hongzao",1},{"shanzha",1},{"lianqiao",1},{"suanzaoren",2},{"juemingzi",2},
            {"lianzi",2},{"chenpi",2},{"wuweizi",3},{"sangshen",3},
            // dried fungus: 0 lingzhi / 1 fuling / 2 zhuling
            {"lingzhi",0},{"fuling",1},{"zhuling",2},
            // dried fern: 0 pinnate / 1 long blade
            {"aicao",0},{"heye",1},{"danzhuye",1},{"dill",0},{"fennel",0},{"rosemary",1},{"tarragon",1},
            // dried mint: 0 paired oval / 1 small leaves
            {"thyme",1},{"marjoram",1},{"oregano",1},
            {"caraway",2},
            // expansion 34
            {"ganjiang",3},{"fuzi",3},{"banxia",3},{"heshouwu",0},{"houpo",2},{"maidong",3},{"tianma",1},{"niuxi",0},
            {"valerian",0},{"baihe",1},{"huanglian",3},{"huangqin",1},{"dahuang",1},{"zhimu",3},{"baishao",1},{"chaihu",0},
            {"longyan",1},{"wuzhuyu",0},{"sharen",0},{"xingren",2},{"fenugreek",2},{"baiguo",0},{"qianshi",0},{"wumei",1},
            {"zhizi",1},{"niubangzi",2},{"yiyiren",2},
            {"dongchong",2},{"yiner",1},{"muer",2},{"lemongrass",1},
        };

        public static int Get(string id) => Map.TryGetValue(id, out int v) ? v : -1;
    }
}
