using System.Collections;
using UnityEngine;

namespace HerbForager.Prototype
{
    // A growing plant in the garden. Aim + E forages it into the basket; it
    // hides, then regrows. Mirrors fp.js pickFromGarden / REGROW_MS.
    public class ForageStation : MonoBehaviour, IInteractable
    {
        const float RegrowSec = 7f;

        public string herbId;
        public string herbName;
        public GameObject plant;

        bool _picked;

        public string Prompt(GameState gs)
        {
            if (_picked) return $"{herbName}（已採·生長中）";
            return $"採摘：{herbName}（籃中 {gs.BasketCount} 株，帶回屋內補罐）";
        }

        public void Interact(GameState gs)
        {
            if (_picked) return;
            gs.Forage(herbId);
            _picked = true;
            if (plant) plant.SetActive(false);
            StartCoroutine(Regrow());
        }

        IEnumerator Regrow()
        {
            yield return new WaitForSeconds(RegrowSec);
            _picked = false;
            if (plant) plant.SetActive(true);
        }
    }
}
