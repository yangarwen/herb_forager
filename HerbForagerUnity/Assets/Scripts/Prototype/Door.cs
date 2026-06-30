using UnityEngine;

namespace HerbForager.Prototype
{
    // A hinged door that swings inward when the player is near and closes when
    // they leave. Auto-opening, so it never traps the player (no blocking collider).
    public class Door : MonoBehaviour
    {
        public Transform player;
        public Transform hinge;
        public Vector3 doorway;
        public float openDist = 2.4f;
        public float openAngle = 95f;     // swings inward (into the room)
        public float speed = 4.5f;

        float _open;

        void Update()
        {
            if (player == null || hinge == null) return;

            Vector3 a = player.position; a.y = 0;
            Vector3 b = doorway; b.y = 0;
            float target = Vector3.Distance(a, b) < openDist ? 1f : 0f;
            _open = Mathf.MoveTowards(_open, target, speed * Time.deltaTime);

            hinge.localRotation = Quaternion.Euler(0, openAngle * _open, 0);
        }
    }
}
