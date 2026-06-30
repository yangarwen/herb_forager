namespace HerbForager.Prototype
{
    // Anything the player can aim at and press E on (jar, counter, …).
    public interface IInteractable
    {
        string Prompt(GameState gs);   // context text shown when aimed at
        void Interact(GameState gs);   // run when the player presses E
    }
}
