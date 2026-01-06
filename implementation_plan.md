# Layout Optimization Plan

**Goal:** Clean up the article header by moving utility elements to the sidebar (Desktop) and compacting them on Mobile.

## 1. The Strategy
We will split the UI based on screen size:
-   **Desktop:** The Header is PURELY the Title. The "Utility Belt" (Audio, Metadata, Tags) lives in the Sticky Sidebar.
-   **Mobile:** The Sidebar is at the bottom (too far). We will keep a **compact** metadata row and audio button under the title, but minimal.

## 2. Changes to `RichSidebar.tsx`
-   **New Props:**
    -   `audioState`: `{ isPlaying, isPaused, hasVoice, onToggle }`
    -   `metadata`: `{ year, readTime, category }`
-   **New UI Section (Top of Sidebar):**
    -   **Audio Player Card:** A prominent, colorful card to start listening.
    -   **Quick Stats:** A small grid or row showing `Year` | `Read Time`.

## 3. Changes to `InteractiveArticle.tsx`
-   **Remove:** The large centered `pt-4` container with Metadata and Audio Button.
-   **Add (Mobile Only):** A `md:hidden` compact row below the title:
    -   `[Category] • 5 min • [Audio Icon]`
-   **Pass Props:** Connect `useTextToSpeech` state to the `RichSidebar`.

## 4. Visual Verification
-   **Desktop:** Title should look clean and "magazine-like". Sidebar will have the tools.
-   **Mobile:** Tighter vertical rhythm, no huge buttons pushing text down.
