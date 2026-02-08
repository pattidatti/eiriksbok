import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSectionProps {
    id: string;
    children: (
        attributes: React.HTMLAttributes<HTMLElement>,
        listeners: ReturnType<typeof useSortable>['listeners']
    ) => React.ReactNode;
}

export const SortableSection: React.FC<SortableSectionProps> = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 'auto',
    };

    // We want the whole section to be the draggable item (setNodeRef),
    // but the handle logic (listeners) will be passed down to children or applied here depending on design.
    // The plan says: "Håndtaket skal være på boksen til seksjonstittel"
    // So we need to pass `attributes` and `listeners` to the handle element inside the child.
    // OR we can make a Context or render prop pattern.
    // Simpler: Just render a div here that wraps everything, and pass handle props?
    // Actually, `useSortable` usage usually implies the wrapper is the draggable.

    // To make ONLY the header the handle, we need to apply `listeners` to the header.
    // Since the header is inside `children` (CompositionTool map), we can:
    // 1. Pass a `dragHandleProps` object to children.
    // 2. Or wrap the children in a context.

    // Let's use a render prop or just cloneElement? No, `children` is complex.
    // Let's make `SortableSection` accept a `render` prop? 
    // OR simply export a Hook or Context?

    // The cleanest for this existing codebase (CompositionTool mapping):
    // Modify `CompositionTool` to wrap the section in `SortableSection`. 
    // `SortableSection` sets the Ref on the outer div.
    // We need a way to attach listeners to the inner header.

    // Let's try this: 
    // `SortableSection` provides a context `SortableHandleContext`.
    // The `SectionHeader` (which is inline in CompositionTool right now) can use it.
    // BUT `CompositionTool` has the header inline.

    // QUICK FIX conformant to plan:
    // Create a specific `SortableHandle` component or expose props.

    return (
        <div ref={setNodeRef} style={style} className="mb-6 touch-none">
            {/* Pass listeners to children via a prop if we could, but here we can't easily without refactoring CompositionTool significantly. */}
            {/* OPTION B: Make the WHOLE section draggable for now? User said "Håndtaket skal være på boksen til seksjonstittel". */}
            {/* OPTION C: Make `SortableSection` accept `renderHandle`? */}

            {/* Let's use the cloneElement approach if direct children is the section container? */}
            {/* Actually, looking at `CompositionTool.tsx`, the map returns a `div` with `key={section.id}`. */}
            {/* We can just put the `SortableSection` component *inside* the map. */}

            {/* To strictly follow "handle on title box": */}
            {/* We will expose the listeners via a Render Prop pattern. */}

            {children(attributes, listeners)}
        </div>
    );
};
