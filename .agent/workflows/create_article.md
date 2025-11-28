---
description: How to create a new article in the codebase
---

# Creating a New Article

Follow this workflow to create a new article and ensure it loads correctly.

## 1. Plan the Content
- Decide on the subject, topic, and subtopic (optional).
- Gather content (text, images, key events).
- Determine if you need custom components (e.g., Timeline, Maps).

## 2. Create Components (If needed)
- If you need a new interactive component, create it in `src/components/`.
- Register the component in `src/components/ArticleContent.tsx`.
- **Verify:** Check that the component is exported correctly and imported in `ArticleContent.tsx`.

## 3. Create the Content File
- Create a JSON file in `public/content/<subject>/<topic>/<subtopic>/<article-id>.json`.
- **Important:** The file path MUST match the structure in `manifest.json`.
- Use the standard JSON structure:
  ```json
  {
    "id": "article-id",
    "title": "Article Title",
    "layout": "rich",
    "year": "Year Range",
    "category": "Category",
    "readTime": "X min read",
    "heroImage": "URL",
    "details": ["Point 1", "Point 2"],
    "content": [
      { "type": "text", "content": "..." },
      { "type": "component", "name": "ComponentName", "props": { ... } }
    ]
  }
  ```

## 4. Register in Manifest
- Open `public/content/manifest.json`.
- Add the lesson entry under the correct `subject` -> `topic` -> `subTopic` (if applicable) -> `lessons`.
- **Critical:** Ensure the `id` in manifest matches the filename (without .json) and the `id` inside the JSON file.
- **Critical:** If the article is directly under a topic (no subtopic), ensure the file is in `public/content/<subject>/<topic>/<article-id>.json`.

## 5. Verify
- Run `npm run dev` if not running.
- Open the article in the browser: `http://localhost:5173/Eiriksbok/<subject>/<topic>/<subtopic>/<article-id>`.
- **Check:**
  - Page loads (no white screen).
  - Title and content are visible.
  - Interactive components work.
  - Images load.

## Troubleshooting "White Screen"
- Check the browser console for errors.
- Verify the JSON file path matches the URL structure.
- Verify `manifest.json` structure matches the file system.
- Check `ArticleContent.tsx` for missing component imports.
