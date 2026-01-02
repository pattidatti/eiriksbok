# ULTRATHINK: Meta-Gameplay & Social Dynamics Architecture (v5)

> [!IMPORTANT]
> **Core Philosophy:** Power is not given; it is bought, seized, or stolen.  
> **Design Pivot:** Addressing "Offline Reality" and "Deadlocks". The game must function even when the King is asleep.

---

### 1. The Starting Experience: Tabula Rasa
*Everyone starts as **Peasant (Bonde)**.*

*   **The "Grinder":** Survival is the first goal.
*   **Career Choice (Level 3 Required):**
    *   **Soldier:** Purchased at the *Vaktårn* (Watchtower). Cost: `200 Gold`.
    *   **Merchant:** Purchased at the *Markedsplass* (Marketplace). Cost: `500 Gold`.

---

### 2. The Vertical Ascent: Claiming Power

#### A. The Vacant Throne (Resource Pooling)
**Mechanic:** *Tribute* (Direct P2P Transactions). We support two modes of transfer:
*   **Gave (Gift/One-way):** *"Here is 500 Wood."* (Ideal for taxes, bribes, pooling).
*   **Byttehandel (Trade/Two-way):** *"I offer 100 Iron for 200 Gold."* (Requires Recipient Approval).

#### B. The Challenge: Usurpation Mechanics
| Vector | Method | Mechanic |
| :--- | :--- | :--- |
| **Economic** | Hostile Takeover | **Folkegave (Bribes):** Merchant dumps gold to active players in region to lower Baron loyalty. |
| **Military** | Coup (Garrison) | **Asynchronous Siege:** Attackers vs. NPC Walls/Guards funded by the Baron. |
| **Political** | Revolt (Tinget) | **Weighted Voting:** Barons (60%) + People (40%). |

---

### 3. Deep Dive: The Economy & Trade
*Critique addressed: Focus on Iron Ore scarcity.*

#### Regional Arbitrage (The Merchant's Loop)
Artificial scarcity implemented via yield modifiers.

| Region | Primary Yields | Economic Profile |
| :--- | :--- | :--- |
| **Region Vest** (Forest/Mines) | Iron Ore: `+50%`<br>Wood: `+20%` | **Industrial Hub:** Rich in construction materials and weaponry. |
| **Region Ost** (Plains) | Iron Ore: `-50%`<br>Wood: `-20%` | **The Breadbasket:** High dependency on Vest for tools/defense. |

> **The Loop:** Iron flows East. Grain yields remain standard/flat to ensure basic survival is possible in all territories.

---

### 4. UI/UX Architecture: "Where does it live?"
*Constraint: No visual map upgrades. Focus on functional overlays.*

#### A. Player Interaction (The "Society" Tab)
*   **Location:** Expanded `Samfunn` Tab.
*   **New Section:** `Folkeregister` (Census).
    *   Lists all active players in the current region.
    *   **Action:** Clicking a name opens the **Player Profile Modal**.
    *   **View:** Role, Level, Equipment (Inspect).
    *   **Quick Actions:** `Gi Gave`, `Tilby Handel`, `Utfordre til Duell` (Soldier only).

#### B. Career & Building Menus
*   **Soldier:** Accessed via **Vaktårn** (Watchtower) -> `Karriere` Tab -> `Verv deg som Soldat`.
*   **Merchant:** Accessed via **Markedsplass** -> `Karriere` Tab -> `Kjøp Handelsbrev`.

#### C. Trade Interface: The "Handelsbrev" (Contract) Modal
*   **Initiator View:**
    *   `Din Tilbud` (Input slots) vs. `Ditt Krav` (Input slots).
    *   Action: `Send Tilbud`.
*   **Recipient View:**
    *   Notification: `📜 Nytt Handelstilbud fra [Navn]`.
    *   Modal Options: `Godta` (Accept) / `Avslå` (Decline).

---

### 5. Implementation Roadmap

#### Phase 1: The Social Fabric (High Priority)
*   [ ] **Player Inspector:** Clickable names in chat/lists leading to Profile Modal.
*   [ ] **Trade Backend:** Logic for `offerTrade`, `acceptTrade`, and `giveTribute`.
*   [ ] **UI:** The `Folkeregister` (Census) list within the Society Tab.

#### Phase 2: The Economy
*   [ ] **Resource Modifiers:** Regional yield logic for West vs. East.
*   [ ] **Role Logic:** Backend validation for Level 3 + Gold requirements.

#### Phase 3: The Hierarchy
*   [ ] **Pooling Logic:** Contribution tracking for communal buildings.
*   [ ] **Legitimacy Engine:** Implementation of the power-dynamic formulas.