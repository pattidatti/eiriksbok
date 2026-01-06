---
description: Performs a comprehensive "ULTRATHINK" analysis of the codebase, covering architecture, code quality, design consistency, and performance.
---

1. **System Health Check**
   - Run linting validation.
   - Run type checking.
   
   ```bash
   npm run lint
   npx tsc -b --noEmit
   ```

2. **Content & integrity Check**
   - Scan content to ensure manifest is synchronized.
   - Check for missing visual assets.
   
   ```bash
   npm run scan:content
   python find_missing_images.py
   ```

3. **Performance Analysis**
   - Run a production build to check for bundle issues and size warnings.
   
   ```bash
   npm run build
   ```

4. **Component & Design Audit**
   - Identify usage of core UI components vs raw HTML/Tailwind to ensure "Dark Immersion" consistency.
   - Search for "TODO", "FIXME", or deprecated patterns.
   
   ```bash
   grep -r "ImmersiveCard" src/components
   grep -r "TODO" src
   ```

5. **Report Generation**
   - Synthesize all findings into a structured "ULTRATHINK Report" artifact (`ultrathink_report.md`).
   - The report must cover:
     - **Technical Health**: Lint/Type errors, Build status.
     - **Architecture**: Manifest integrity, Component reusability.
     - **UX/UI**: Adherence to "Dark Immersion", Mobile responsiveness (inferred from code), Accessibility.
     - **Content**: Missing assets, Structure.
     - **Action Plan**: Prioritized list of improvements.
