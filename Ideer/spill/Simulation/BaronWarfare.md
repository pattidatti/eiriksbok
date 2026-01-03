# ULTRATHINK: The Baron's War & The Siege of the High Keep

## 1. The Economy of War: "Stocks & Stacks"

Warfare is no longer just a gold sink. It is a **Resource Sink**. This drives the craft/economy loop for all players, not just the Baron.

### New Resources
*   **⚔️ Swords (Attack Stacks):** Crafted by Blacksmiths. Used by Attackers to deal damage to Garrison/Walls.
*   **🛡️ Armor (Defense Stacks):** Crafted by Blacksmiths. Used by Attackers to mitigate incoming damage, and by Defenders to buff Garrison.

### The Loop
1.  **Miners:** Mine Iron Ore -> Smelt to Ingots.
2.  **Blacksmiths:** Forge Swords & Armor.
3.  **The War Market:** Players sell these to:
    *   **The Baron:** To equip the *Garrison* (passive buff).
    *   **The Rebels:** To equip *themselves* (active charges).

---

## 2. The Location: The War Room ("Krigsrommet")
A secured Point of Interest (POI) accessible **only** to the reigning Baron/King.

*   **Visuals:** A dark, tactical map table, candlelit, with flags representing troop movements.
*   **Functions:**
    *   **Tax & Treasury:** Set tax rates, view income graphs.
    *   **Garrison Manager:** Equip Garrison with Swords/Armor (consumes items to boost stats).
    *   **Repair Walls:** Spend Stone/Wood to restore Wall HP.
    *   **Log:** "Night Watch Report" (Who attacked, damage dealt, defenses held).

---

## 3. The Event: "The Siege" (Beleiringen)

This is not a simple button press. It is a **Multiplayer Co-op Event**.

### Triggering
*   **Rebel Leader** approaches the Castle.
*   Uses item **"War Horn"** (or pays high Stamina/Gold cost).
*   **GLOBAL ALERT:** "🔔 BELEIRING! Opprørere angriper Baroniet Vest! (Trykk for å bli med)"

### The Minigame: "Storming the Keep"
A rich, graphical interface (Top-Down or Isometric view).

**Phase 1: The Outer Walls (The Breach)**
*   **Objective:** Destroy the Gate.
*   **Gameplay:** Players click/tap to attack the Gate.
    *   *Action:* "Attack" (Consumes 1 Sword stack). Deals X damage.
    *   *Hazard:* Arrows rain down from the classic "Murder Holes".
    *   *Defense:* Players must toggle "Shield Wall" (Consumes Armor stacks) to block arrow volleys.
*   **Visuals:** Animated arrows, gate health bar cracking, players piling in.

**Phase 2: The Courtyard (The Skirmish)**
*   **Objective:** Defeat the Garrison Captain (NPC Boss).
*   **Gameplay:**
    *   The NPC Captain has high HP and deals heavy damage.
    *   **Movement:** Players must move out of "Red Zones" (Catapult/AoE attacks) on a grid/lane.
    *   **Co-op:** One player must "Taunt" (Shield up) while others "Flank" (Sword attack).
*   **Live Drop-in:** Other online players can join the fray instantly, appearing as reinforcements.

**Phase 3: The Throne Room (The Judgment)**
*   **Objective:** Seize the Throne.
*   **Victory:** If Phase 2 is won, the Region Bribe Progress jumps significantly (e.g., +25%).
*   If the King/Baron is online, they can enter this phase to fight **PvP** as the Final Boss.

---

## 4. Implementation Steps

### Phase 2.1: The War Chest (Backend)
- [ ] Add `garrison` object to Region: `{ swords: 0, armor: 0, hp: 1000, maxHp: 1000 }`.
- [ ] Implement `craftItem` logic for Swords/Armor.

### Phase 2.2: The War Room (UI)
- [ ] Create `SimulationWarRoom.tsx` component.
- [ ] Add "Access Check" (Role == BARON || KING).

### Phase 2.3: The Siege Engine (Minigame)
- [ ] **Canvas/Grid Engine:** A React component for the visual battlefield.
- [ ] **Lobby System:** "Active Siege" state in Firebase. Listeners for "Join".
- [ ] **Combat Logic:** Tick-based loop handling damage exchange (Players vs Garrison).
- [ ] **Rewards:** Loot distribution from the Garrison's "Drop Table" (Baron's unspent equipment).

---

## 5. Technical analysis of "Movement"
For a web-based React app, true real-time movement (WASD) with multiple players is complex due to Firebase latency (~200ms).
**Solution:** **"Tactical Positioning"**
*   The battlefield has 3 Lanes: Left, Center, Right.
*   Boss attacks heavily telegraphed "Center Lane needs to evacuate!"
*   Players click "Move Right" -> Animation plays -> Server updates position.
*   This fits the "Commander/Tactical" feel and works perfectly with Firebase latency.
