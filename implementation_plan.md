# Refactor Section Layout for Compactness

## Goal
Integrate the Section Header (name, controls, instruments) into the same grid layout as the Bars (measures) to save vertical space and create a uniform "card-based" UI. This directly addresses the user's request: "Gjør seksjonsboksene samme størrelse som takter boksene".

## Proposed Changes

### [Music Feature]

#### [MODIFY] [NotationEditor.tsx](file:///home/irik/eiriksbok/src/features/music/components/composition/NotationEditor.tsx)
- Add optional `headerContent` prop (ReactNode).
- Render `headerContent` as the first item in the flex/grid container.
- Apply the same responsive width classes (`w-full md:w-1/2 lg:w-1/3 xl:w-1/4`) to the header container as the bars.

#### [MODIFY] [SectionItem.tsx](file:///home/irik/eiriksbok/src/features/music/components/composition/SectionItem.tsx)
- Extract the existing header JSX.
- Pass this JSX into `NotationEditor` via the new `headerContent` prop.
- Refactor the header styling to fit within the `min-h-[140px]` card constraints (vertical layout if necessary).
- Ensure drag handle (`GripVertical`) remains accessible or is integrated into the card.

## Implementation Details
1.  **Section Card Styling:** Use a distinct background or border style to differentiate the Section Card from Bar Cards, while maintaining identical dimensions.
2.  **Controls:** Stack controls vertically or use a compact grid within the card to fit all instruments and settings.
