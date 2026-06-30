using UnityEngine;
using UnityEngine.InputSystem;   // new Input System (already in this project)

namespace HerbForager.Prototype
{
    // Minimal first-person controller: WASD move + mouse look, on a
    // CharacterController. Polls the new Input System directly (Keyboard/Mouse
    // .current) so no input-action asset wiring is needed.
    [RequireComponent(typeof(CharacterController))]
    public class FirstPersonController : MonoBehaviour
    {
        public Transform cam;                 // child camera (pitch)
        public float moveSpeed = 3f;          // matches fp.js desktop speed
        public float lookSensitivity = 0.08f;

        // play-area bounds (set by the bootstrap): room is narrow, garden is wide
        public float roomHalf = 6f, gardenHalfW = 11f, gardenFar = 28f;

        private CharacterController cc;
        private float yaw, pitch;

        void Awake()
        {
            cc = GetComponent<CharacterController>();
            LockCursor(true);
            yaw = transform.eulerAngles.y;
        }

        void Update()
        {
            var kb = Keyboard.current;
            var mouse = Mouse.current;
            if (kb == null || mouse == null) return;

            // Cursor lock toggle (Esc release / click to re-lock)
            if (kb.escapeKey.wasPressedThisFrame) LockCursor(false);
            if (mouse.leftButton.wasPressedThisFrame && Cursor.lockState != CursorLockMode.Locked)
                LockCursor(true);

            bool looking = Cursor.lockState == CursorLockMode.Locked;

            // Look
            if (looking)
            {
                Vector2 d = mouse.delta.ReadValue();
                yaw += d.x * lookSensitivity;
                pitch = Mathf.Clamp(pitch - d.y * lookSensitivity, -85f, 85f);
                transform.rotation = Quaternion.Euler(0f, yaw, 0f);
                if (cam) cam.localRotation = Quaternion.Euler(pitch, 0f, 0f);
            }

            // Move (relative to facing; horizontal only)
            float x = (kb.dKey.isPressed ? 1 : 0) - (kb.aKey.isPressed ? 1 : 0);
            float z = (kb.wKey.isPressed ? 1 : 0) - (kb.sKey.isPressed ? 1 : 0);
            Vector3 dir = (transform.right * x + transform.forward * z);
            if (dir.sqrMagnitude > 1f) dir.Normalize();
            cc.SimpleMove(dir * moveSpeed);   // SimpleMove applies gravity

            // keep the player on solid ground: narrow room indoors, wide garden outdoors
            Vector3 p = transform.position;
            bool outside = p.z > roomHalf;
            float xLim = (outside ? gardenHalfW : roomHalf) - 0.4f;
            p.x = Mathf.Clamp(p.x, -xLim, xLim);
            p.z = Mathf.Clamp(p.z, -(roomHalf - 0.4f), gardenFar - 0.4f);
            transform.position = p;
        }

        void LockCursor(bool on)
        {
            Cursor.lockState = on ? CursorLockMode.Locked : CursorLockMode.None;
            Cursor.visible = !on;
        }
    }
}
