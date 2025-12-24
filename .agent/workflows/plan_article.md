---
description: Combined workflow for planning and implementing new articles/topics.
---

# Unified Article Workflow

This workflow covers the entire lifecycle of an article, from the initial pedagogical design to technical implementation and verification.

---

## Phase 1: Planning & Design
Focus on the "Soul" of the content before writing any code.

### 1. Pedagogical Vision
- **Tone:** Wondering, pedagogical, and narrative-driven. 
- **Method:** "Show, don't just tell." Use concrete examples and narrations.
- **Complexity:** Explain complex concepts (e.g., "Feudalisme") in an accessible way.
- **Cross-linking:** Identify other articles or topics mentioned that should be linked (interndisiplinær kobling).

### 2. Content Structure
- **Length:** 1200 - 3000+ words (Dybdeartikler: 4000+).
- **Introduction:** Engaging hook and overview.
- **Core Sections:** Use `header` blocks (NOT nested sections).
- **Summary:** Concise wrap-up or "Deep Dive" conclusion.

### 3. Layout & Components
- **Rich Layout (`"layout": "rich"`):** 
    - Required for historical topics with timelines.
    - Includes interactive sidebar with TOC and map links.
- **Component Selection:**
    - `TimelineComponent`: Use inside articles with `compact: true`.
    - `Comparison`: For comparing concepts/figures.
    - `QuoteBlock`: For primary sources.
    - `FactBox`: For technical details.

---

## Phase 2: Technical Implementation
Focus on the "Bones" of the JSON structure.

### 1. Manifest Entry
- Add the lesson to `public/content/manifest.json`.
- The `id` must match the filename and the `id` inside the JSON.

### 2. JSON Structure Rules
- **Flat Content:** The `content` array MUST be flat.
- **No Markdown Bolding:** Never use `**text**` for emphasis. Use the concept system.
- **Cross-linking:** Use `[Link Text](/subject/topic/article-id)` for internal links.
- **Lists:** Use `{ "type": "list", "items": [...] }`. NEVER use markdown `-` lists.

### 3. Global Data Sync
- **Timeline:** Add events to `public/content/global-timeline.json`.
- **Glossary & People:** 
    - Add new technical terms to `public/content/concepts/`.
    - Add historical figures to `public/content/people/` (MUST include `lifespan` and `link`).
- **Quiz:** Add 3-5 multiple-choice questions to the article JSON (under a `quiz` field).

---

## Phase 3: Visuals & Verification
Final polish and technical checks.

### 1. Image Generation
- **Style:** Use image-style-guide.md
- **Path:** `public/images/<topic>/<article-id>-hero.jpg`.
- **Consistency:** Ensure the hero image matches the card image in Topic overview.

### 2. Verification Checklist
- [ ] JSON is syntax-valid.
- [ ] No bold text in body text.
- [ ] Table of Contents works.
- [ ] Internal links (cross-linking) are correct and functional.
- [ ] Concepts are clickable and show in sidebar.
- [ ] Timeline events appear correctly.
- [ ] Images load without errors.
- **Data Synchronization:**
    - [ ] Run `node scripts/scan-concepts.js` to update the global glossary and people records.

---

## Usage
Simply state: **"Plan en ny artikkel om [tema] ved å bruke /plan_article"**. 
I will then present the plan for Phase 1. When you say **"GO"**, I proceed to Phase 2 and 3.