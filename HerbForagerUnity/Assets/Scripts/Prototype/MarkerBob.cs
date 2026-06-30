using UnityEngine;

namespace HerbForager.Prototype
{
    // Gentle bob + spin so the "needed herb" marker reads as a live indicator.
    public class MarkerBob : MonoBehaviour
    {
        Vector3 _base;
        void Start() => _base = transform.localPosition;
        void Update()
        {
            transform.localPosition = _base + Vector3.up * Mathf.Sin(Time.time * 3f) * 0.02f;
            transform.Rotate(0, 90f * Time.deltaTime, 0);
        }
    }
}
