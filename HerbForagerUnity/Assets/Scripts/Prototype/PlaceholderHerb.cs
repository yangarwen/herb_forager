using UnityEngine;

namespace HerbForager.Prototype
{
    // Tag component on a placeholder herb pickup; carries its identity so the
    // Interactor can show the name and (later) feed the real systems.
    public class PlaceholderHerb : MonoBehaviour
    {
        public string id;
        public string herbName;
    }
}
