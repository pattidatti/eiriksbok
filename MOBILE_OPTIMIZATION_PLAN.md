# Mobile Optimization Plan

**Goal:** Ensure Eiriksbok is fully functional and aesthetically pleasing on mobile devices.

## 1. Landing Page Fixes
- **Issue:** Subject titles (`h2`) are too large (`text-6xl`), causing horizontal overflow and cutoff.
- **Fix:** Implement fluid typography using `clamp` or responsive Tailwind tokens.
  - Change `text-6xl` to `text-4xl sm:text-6xl md:text-8xl`.
  - Add `break-words` or `hyphens-auto` for safety.
  - Adjust margins/padding for smaller screens.

## 2. Navigation (The "Missing Menu")
- **Issue:** `Layout.tsx` hides the nav menu on mobile (`hidden md:flex`) but offers no alternative.
- **Fix:** Implement a "Hamburger Menu" sheet.
  - Use `lucide-react`'s `Menu` and `X` icons.
  - Create a new component `MobileMenu.tsx` that triggers a full-screen or slide-over navigation overlay.
  - Integrate this into `Layout.tsx` for mobile viewports.

## 3. General "Touch" Improvements
- **Issue:** Touch targets might be too small.
- **Fix:** Ensure all interactive elements have `min-height: 44px`.

## 4. Execution Order
1.  **Landing Page Typography:** Quick CSS fix.
2.  **Mobile Menu Component:** Build the overlay.
3.  **Layout Integration:** Wire it up.
