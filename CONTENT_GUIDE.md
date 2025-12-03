# Content Guide for Eiriksbok

This guide explains how to add new content, specifically focusing on the Religion comparison features.

## Adding a New Religion

1.  **Create the Data File**:
    *   Create a new JSON file in `public/data/religion/`.
    *   Filename should be lowercase, e.g., `buddhisme.json`.
    *   **Structure**:
        ```json
        {
          "name": "Buddhisme",
          "color": "#f59e0b",
          "dimensions": {
            "ritual": { "type": "root", "children": [...] },
            "narrative": { "type": "root", "children": [...] },
            // ... all 7 dimensions
          }
        }
        ```

2.  **Update Manifest**:
    *   Add the religion to `manifest.json` under the relevant topic (usually "Verdensreligioner").

## Adding an Article with Comparison

To make an article appear in the comparison tools:

1.  **Create the Article**:
    *   Place it in the correct folder structure: `public/content/krle/religioner/[religion]/[topic]/artikkel.json`.

2.  **Add Metadata**:
    *   **`religion`**: Reference the religion ID (filename without path).
        *   ✅ Correct: `"religion": "kristendom"`
        *   ❌ Incorrect: `"religion": "content/religion/kristendom"`
    *   **`dimension`**: One of the 7 dimensions (e.g., `ritual`, `narrative`).
    *   **`comparison_tags`**: A list of specific keywords for detailed comparison.
        *   Example: `["dåp", "livsfaser", "ritualer"]`

3.  **Content Structure (CRITICAL)**:
    *   The `content` field must be a **flat list** of blocks.
    *   **DO NOT** use nested `section` blocks. Use `header` blocks to denote new sections.
    *   Supported blocks: `text`, `image`, `header`, `list`, `component` (FactBox/Quiz).

## Comparison Features

*   **Dimension Comparison**: `/krle/sammenlign`
    *   Automatically pulls data from the `dimensions` object in the religion JSON files.
    *   Lists linked articles based on the `dimension` field in the article.

*   **Topic Comparison**: `/krle/sammenlign/tema/[tag]`
    *   Fetches ALL articles that have the matching tag in `comparison_tags`.
    *   Groups them by religion.

## Troubleshooting

*   **"Unable to find record"**: Ensure the `religion` field is just the ID (e.g., `"kristendom"`), NOT a file path. The system manually fetches `public/data/religion/[ID].json`.
*   **"String cannot represent value"**: This usually means you have invalid content structure. Check for nested `section` blocks and flatten them.
*   **No articles found**: Check that `comparison_tags` are identical (case-sensitive) across articles.
