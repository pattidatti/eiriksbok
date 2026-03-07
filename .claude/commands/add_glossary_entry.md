---
description: Add a person or concept to the glossary
---

# Add Glossary Entry

Use this workflow when the user wants to add a **known** person or concept to the glossary without running scan-concepts.js.

## Required Information

Ask the user for (if not provided):
1. **Term** - The name/term (e.g., "Ronald Reagan", "Casus belli")
2. **Type** - `person` or `concept`
3. **Definition** - A brief Norwegian description

For **persons**, also gather:
- `lifespan` (required, e.g., "1911 - 2004" or "1870-1924")
- `aliases` (optional, e.g., ["Reagan"])
- `tags` (relevant topics, lowercase)
- `subject` (usually "historie")
- `topic` (optional, e.g., "den-kalde-krigen", "forste-verdenskrig")
- `fullName` (optional, if different from term)
- `image` (optional, path like "/images/people/name.jpg")

For **concepts**, also gather:
- `tags` (relevant topics, lowercase)
- `subject` (e.g., "historie", "samfunnskunnskap", "krle")
- `topic` (optional, e.g., "den-kalde-krigen")

> [!NOTE]
> The `type` field is required for persons but sometimes omitted in concept files. Always include it for consistency.

## Steps

// turbo-all

1. **Generate filename**: Convert term to lowercase, replace spaces with hyphens, remove special characters (like æøå → aeoa).
   - Example: "Ronald Reagan" → `ronald-reagan.json`
   - Example: "Truman-doktrinen" → `truman-doktrinen.json`

2. **Create the JSON file** in the appropriate directory:
   - Persons: `public/content/people/{filename}`
   - Concepts: `public/content/concepts/{filename}`

3. **Update glossary.json** directly:
   - Read `public/data/glossary.json`
   - Parse and add the new entry in alphabetical order by `term`
   - Write back the updated file

4. **Confirm** the entry was added by showing the user the created file path.

## Example Person Entry

```json
{
    "term": "Harry S. Truman",
    "aliases": ["Truman"],
    "definition": "USAs 33. president (1945–1953) som styrte under begynnelsen av den kalde krigen.",
    "type": "person",
    "tags": ["USA", "president", "den kalde krigen"],
    "subject": "historie",
    "lifespan": "1884 - 1972"
}
```

## Example Concept Entry

```json
{
    "term": "Glasnost",
    "definition": "En reformpolitikk lansert av Mikhail Gorbatsjov i Sovjetunionen på 1980-tallet.",
    "subject": "historie",
    "topic": "den-kalde-krigen",
    "tags": ["sovjet", "reform", "frihet"]
}
```

> [!TIP]
> Check existing files in `public/content/people/` and `public/content/concepts/` for reference if unsure about format.
