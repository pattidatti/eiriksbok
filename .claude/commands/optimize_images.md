---
description: Optimaliser bilder for ytelse (WebP + Resizing)
---

Bruk denne workflowen når du har lagt til nye bilder (kart, illustrasjoner) i prosjektet for å sikre at de ikke sinker ned applikasjonen.

## Fremgangsmåte

1. **Sjekk eksisterende assets:**
   Finn ut hvilke bilder som trenger optimalisering (f.eks. de som er > 1MB eller i JPG/PNG format).

// turbo
2. **Kjør optimaliserings-skriptet:**
   Dette skriptet vil automatisk scanne `public/content` og optimalisere WebP-filer til en standardisert størrelse (2560px bredde for kart, 1600px for andre).
   ```powershell
   node scripts/optimize-images.js
   ```

3. **Verifisering:**
   Sjekk filstørrelsen i filutforskeren eller i terminalen:
   ```powershell
   Get-ChildItem -Path public/content -Recurse -Filter *.webp | Select-Object Name, @{Name="Size(MB)";Expression={$_.Length / 1MB}}
   ```

4. **Kvalitetssjekk:**
   Åpne applikasjonen og verifiser at bildene fremdeles har god nok detaljrikdom (spesielt tekst på kart).

> [!TIP]
> Hvis du har lagt til rå-filer (JPG/PNG), bør disse først konverteres til WebP. Skriptet `optimize-images.js` jobber primært med å skalere ned og komprimere eksisterende WebP-filer for maksimal ytelse.
