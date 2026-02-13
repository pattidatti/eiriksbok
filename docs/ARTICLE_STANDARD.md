# Standard for Artikler i Eiriks Lærebok

> [!WARNING]
> **DEPRECATED**: Dette dokumentet er utdatert. 
> For moderne standarder og komponent-oversikt, vennligst se skillen `article-implementation` og [CONTENT_SYSTEM.md](file:///home/irik/eiriksbok/docs/CONTENT_SYSTEM.md).

Vi har innført en standardisert layout for artikler som gir en rikere leseopplevelse med hero-bilde, flytende navigasjon og sidebar med nøkkelpunkter.

## Hvordan opprette en ny artikkel

1.  Opprett en ny JSON-fil i riktig mappe under `public/content/`.
2.  Legg til artikkelen i `public/content/manifest.json`.
3.  Bruk følgende struktur i JSON-filen:

```json
{
    "id": "min-artikkel-id",
    "title": "Min Artikkel Tittel",
    "layout": "rich",
    "year": "2024",
    "category": "Kategori (f.eks. Verden)",
    "readTime": "5 min lesning",
    "heroImage": "https://url-til-bilde.jpg",
    "externalUrl": "https://snl.no/relevant-artikkel",
    "details": [
        "Nøkkelpunkt 1",
        "Nøkkelpunkt 2",
        "Nøkkelpunkt 3"
    ],
    "content": [
        {
            "type": "text",
            "content": "Første avsnitt..."
        },
        {
            "type": "text",
            "content": "Andre avsnitt..."
        },
        {
            "type": "section",
            "title": "Underseksjon",
            "content": [
                { "type": "text", "content": "Tekst i seksjon..." }
            ]
        },
        {
            "type": "list",
            "items": ["Punkt 1", "Punkt 2"]
        }
    ]
}
```

## Feltbeskrivelser

*   `layout`: Må settes til `"rich"` for å aktivere den nye layouten. Hvis utelatt, brukes standardvisningen.
*   `heroImage`: URL til et stort bilde som vises øverst.
*   `year`: Årstall eller periode for hendelsen.
*   `category`: Kategori som vises som en "tag" (f.eks. "Norge", "Verden", "Politikk").
*   `readTime`: Estimert lesetid.
*   `details`: En liste med korte punkter som vises i sidebaren ("Nøkkelpunkter").
*   `externalUrl`: Link til ekstern kilde (f.eks. SNL) som vises som en knapp i sidebaren.
*   `content`: En liste med innholdsblokker. Støtter `type: "text"`, `"header"`, `"image"`, `"component"`, `"section"`, og `"list"`.

## Demo

Se `public/content/samfunnsfag/historie/demo-artikkel.json` for et fungerende eksempel.
Du kan se artikkelen i appen under Historie -> Demo Artikkel.
