---
description: Designprinsipper og teknisk implementasjon for nye interaktive læringskomponenter. Håndhever lyst tema, pedagogisk fokus og juicy feedback.
---

# Skill: Build Interactive Component

Bruk denne skillet når du skal lage en ny interaktiv læringskomponent til artikler eller læringsstier.

---

## Design Law — Ikke forhandlingsbart

### 1. Lys bakgrunn alltid
- Base: `bg-white` eller `bg-slate-50`. **Aldri** `bg-slate-900`, `bg-gray-900` eller andre mørke baser som default.
- Komponenten har ikke sin egen mørk-modus — den arver omgivelsene.

### 2. Én pedagogisk kjerne
Definer **lyspære-øyeblikket** FØR du skriver én linje kode:
> *"Etter denne interaksjonen skal eleven forstå/føle/kunne: ___"*

Én ting. Ikke tre. Én. Resten er støy.

### 3. Fem-sekunders-regelen
Eleven skal vite **nøyaktig hva de skal gjøre** innen 5 sekunder. Ingen velkomstmodal. Ingen instruksjonsmodus. Ingen forklaringsskjerm. Handlingen er synlig og åpenbar fra første render.

### 4. Juicy feedback — checklist
- [ ] **Umiddelbar respons** på absolutt alle klikk/dra/skriv (visuelt, ikke bare state)
- [ ] **Suksessanimasjon** ved fullføring (Framer Motion, ikke bare fargeskift)
- [ ] **Tydelig completion-state** — eleven vet utvetydig at de er ferdige
- [ ] **Reset-knapp** alltid tilgjengelig (aldri skjult bak en annen modal)

### 5. Ingen intern scrolling
Hele komponenten passer i sin plass i artikkelen. Ingen `overflow-y-auto` inni komponenten. Hvis innholdet er for mye, del det opp i steg — ikke skroll.

---

## Visuell Standard — Color & Shape Law

| Element | Tailwind-klasser |
|---|---|
| Base | `bg-white` / `bg-slate-50` |
| Border | `border border-slate-200` |
| Rounded | `rounded-xl` |
| Shadow hvile | `shadow-sm` |
| Shadow hover/aktiv | `shadow-md` |
| Primær CTA | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2` |
| Sekundær CTA | `bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2` |
| Suksess-tilstand | `bg-emerald-50 border-emerald-200 text-emerald-700` |
| Feil-tilstand | `bg-rose-50 border-rose-200 text-rose-700` |
| Nøytral info | `bg-blue-50 border-blue-200 text-blue-700` |
| Ikoner | Lucide React |
| Animasjoner | Framer Motion **kun** — ikke CSS transitions for state-endringer |

---

## Anbefalt Anatomisk Struktur

```
┌───────────────────────────────────────┐
│ [Ikon] Komponenttittel / Mål          │  ← Lys header, klar hensikt
├───────────────────────────────────────┤
│                                       │
│  [Primær interaksjonsflate]           │  ← Kjerneaktiviteten
│                                       │
├───────────────────────────────────────┤
│ [Feedback-sone]                       │  ← Alltid synlig (ikke conditional render)
├───────────────────────────────────────┤
│ [Primær CTA]          [Tilbakestill] │  ← Faste posisjoner, konsistente på tvers
└───────────────────────────────────────┘
```

- **Header**: Ikon (Lucide) + tittel + én-linje-beskrivelse av hva eleven skal gjøre
- **Interaksjonsflate**: Kjernen. Ingen distraksjoner rundt den.
- **Feedback-sone**: Alltid til stede i DOM-et. Vis en nøytral placeholder-tekst når ingen feedback ennå.
- **Kontrollrad**: Primær CTA til venstre, "Tilbakestill"-knapp til høyre.

---

## Tilstandsmaskin-mønster

Alle komponenter følger én av disse to modellene — velg én og hold deg til den:

**Enkel (for enkeltinteraksjoner):**
```
idle → active → complete
```

**Flerstegs (for sekvensielle aktiviteter):**
```
step-0 → step-1 → step-2 → ... → done
```

Bruk en `type State = 'idle' | 'active' | 'complete'` union type — aldri en løs streng.

---

## Teknisk Implementasjon

### Filstruktur
- Fil: `src/components/content/interactive/[KomponentNavn].tsx`
- Named export **kun** — ingen default export
- Inline prop-interface øverst i filen

### Kodemal

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconName } from 'lucide-react';

interface [KomponentNavn]Props {
    title?: string;
    // ... props
}

type Phase = 'idle' | 'active' | 'complete';

export function [KomponentNavn]({ title = 'Standard tittel', ...props }: [KomponentNavn]Props) {
    const [phase, setPhase] = useState<Phase>('idle');

    const handleReset = () => {
        setPhase('idle');
        // reset other state
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <IconName className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Én linje — hva eleven skal gjøre</p>
                </div>
            </div>

            {/* Primær interaksjonsflate */}
            <div className="p-6">
                {/* ... */}
            </div>

            {/* Feedback-sone */}
            <AnimatePresence mode="wait">
                {phase !== 'idle' && (
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"
                    >
                        {/* Feedback-tekst */}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={() => setPhase('complete')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                >
                    Bekreft / Send
                </button>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
```

### Registrering i ComponentRegistry

1. Legg til lazy import i `src/components/ComponentRegistry.tsx`:
```tsx
const [KomponentNavn] = lazy(() =>
    import('./content/interactive/[KomponentNavn]').then((m) => ({ default: m.[KomponentNavn] }))
);
```

2. Legg til i `componentRegistry`-objektet:
```tsx
[KomponentNavn]: [KomponentNavn],
```

### JSON-referanse i artikler

```json
{ "type": "component", "name": "[KomponentNavn]", "props": { ... } }
```

---

## Valideringsliste — Sjekkpunkter før du er ferdig

- [ ] Lyst tema — ingen `bg-slate-900` eller annen mørk base
- [ ] Lyspære-øyeblikket er definert og tydelig i UX
- [ ] Fem-sekunders-regelen bestås — ingen instruksjonsskjerm nødvendig
- [ ] Feedback på absolutt alle interaksjoner
- [ ] Suksessanimasjon ved fullføring (Framer Motion)
- [ ] Reset-knapp er synlig og funksjonell
- [ ] Ingen intern scrolling (`overflow-y-auto` er forbudt inni komponenten)
- [ ] Responsiv ned til 768px bredde
- [ ] Named export (ikke default)
- [ ] Prop-interface er inline og typet
- [ ] Framer Motion for animasjoner — ikke CSS transitions for state
- [ ] Registrert i `ComponentRegistry.tsx` med lazy import
- [ ] Testet i en artikkel med `{ "type": "component", "name": "..." }`
