# Whitespace Optimization Plan (Padding & Layout)

**Goal:** Reduce unnecessary vertical space to improve content density and reading experience on smaller screens.

## 1. Header Section (`InteractiveArticle.tsx`)
- **Current:** `pt-24 pb-12`
- **Fix:** `pt-20 pb-6 md:pt-24 md:pb-8`
- **Reason:** Header doesn't need 6rem (96px) of top padding on mobile, and bottom padding is excessive.

## 2. Hero Image
- **Current:** `h-[400px] md:h-[500px]`, `mb-16`
- **Fix:** `h-[200px] sm:h-[300px] md:h-[450px]`, `mb-8 md:mb-12`
- **Reason:** 400px height on mobile pushes the entire article below the fold.

## 3. Content Box
- **Current:** `p-8 md:p-12`
- **Fix:** `p-5 md:p-10`
- **Reason:** 2rem (32px) padding on mobile eats up horizontal space. `p-5` (20px) is sufficient.

## 4. Grid Gaps
- **Current:** `gap-16`
- **Fix:** `gap-8 md:gap-12`
- **Reason:** 4rem gap between article and sidebar is huge.

## 5. Main Title
- **Current:** `text-4xl md:text-6xl`, `mb-6`
- **Fix:** `text-3xl md:text-5xl lg:text-6xl`, `mb-4`
- **Reason:** Tighter title spacing.
