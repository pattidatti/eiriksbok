import { defineConfig } from "tinacms";

export default defineConfig({
    branch: "main",
    clientId: null, // Get this from tina.io
    token: null, // Get this from tina.io
    build: {
        outputFolder: "admin",
        publicFolder: "public",
    },
    media: {
        tina: {
            mediaRoot: "images/uploads",
            publicFolder: "public",
        },
    },
    schema: {
        collections: [
            {
                name: "manifest",
                label: "Fag og Emner (Manifest)",
                path: "public/content",
                format: "json",
                ui: {
                    allowedActions: {
                        create: false,
                        delete: false,
                    },
                },
                match: {
                    include: "manifest",
                },
                fields: [
                    {
                        type: "object",
                        name: "subjects",
                        label: "Fag",
                        list: true,
                        fields: [
                            { type: "string", name: "id", label: "ID" },
                            { type: "string", name: "title", label: "Tittel" },
                            {
                                type: "object",
                                name: "topics",
                                label: "Emner",
                                list: true,
                                fields: [
                                    { type: "string", name: "id", label: "ID" },
                                    { type: "string", name: "title", label: "Tittel" },
                                    { type: "string", name: "description", label: "Beskrivelse" },
                                    { type: "image", name: "image", label: "Bilde" },
                                    {
                                        type: "object",
                                        name: "lessons",
                                        label: "Leksjoner",
                                        list: true,
                                        fields: [
                                            { type: "string", name: "id", label: "ID" },
                                            { type: "string", name: "title", label: "Tittel" },
                                            { type: "string", name: "description", label: "Beskrivelse" },
                                            { type: "image", name: "image", label: "Bilde" },
                                            { type: "string", name: "tags", label: "Tags", list: true },
                                            { type: "datetime", name: "createdDate", label: "Opprettet Dato" },
                                            { type: "datetime", name: "lastUpdated", label: "Sist Oppdatert" },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: "article",
                label: "Artikler",
                path: "public/content",
                format: "json",
                match: {
                    include: "**/*",
                    exclude: "manifest",
                },
                ui: {
                    filename: {
                        // Example: historie/vikingtiden/artikkel
                        slugify: (values) => {
                            return `${values.topic}/${values.id || 'ny-artikkel'}/artikkel`;
                        },
                    },
                },
                fields: [
                    { type: "string", name: "title", label: "Tittel" },
                    { type: "string", name: "subject", label: "Fag" },
                    { type: "string", name: "topic", label: "Emne" },
                    { type: "datetime", name: "createdDate", label: "Opprettet Dato" },
                    { type: "datetime", name: "lastUpdated", label: "Sist Oppdatert" },
                    {
                        type: "string",
                        name: "religion",
                        label: "Tilknyttet Religion (ID)",
                        description: "F.eks. 'kristendom' eller 'islam'",
                    },
                    {
                        type: "string",
                        name: "dimension",
                        label: "Dimensjon (Ninian Smart)",
                        options: [
                            { value: "ritual", label: "Ritualer og kult" },
                            { value: "narrative", label: "Fortellinger og myter" },
                            { value: "experiential", label: "Opplevelser og erfaringer" },
                            { value: "social", label: "Sosial organisering" },
                            { value: "ethical", label: "Etikk og moral" },
                            { value: "doctrinal", label: "Lære og filosofi" },
                            { value: "material", label: "Materielle og estetiske uttrykk" },
                        ],
                    },
                    {
                        type: "string",
                        name: "comparison_tags",
                        label: "Sammenligningstemaer",
                        list: true,
                        description: "F.eks. 'skapelsesmyte', 'bønn', 'døden'",
                    },
                    { type: "string", name: "fact", label: "Fakta", ui: { component: "textarea" } },
                    { type: "string", name: "tags", label: "Tags", list: true },
                    {
                        type: "object",
                        name: "content",
                        label: "Innhold",
                        list: true,
                        templates: [
                            {
                                name: "text",
                                label: "Tekst",
                                fields: [
                                    { type: "string", name: "content", label: "Tekst", ui: { component: "textarea" } },
                                ],
                            },
                            {
                                name: "image",
                                label: "Bilde",
                                fields: [
                                    { type: "image", name: "src", label: "Bilde" },
                                    { type: "string", name: "caption", label: "Bildetekst" },
                                    { type: "string", name: "alt", label: "Alt tekst" },
                                ],
                            },
                            {
                                name: "header",
                                label: "Overskrift",
                                fields: [
                                    { type: "string", name: "text", label: "Tekst" },
                                ],
                            },
                            {
                                name: "list",
                                label: "Liste",
                                fields: [
                                    { type: "string", name: "items", label: "Punkter", list: true },
                                ],
                            },
                            {
                                name: "component",
                                label: "Komponent",
                                fields: [
                                    {
                                        type: "string",
                                        name: "name",
                                        label: "Type",
                                        options: ["FactBox", "Quiz"],
                                    },
                                    {
                                        type: "object",
                                        name: "props",
                                        label: "Egenskaper",
                                        fields: [
                                            { type: "string", name: "content", label: "Innhold (FactBox)", ui: { component: "textarea" } },
                                            {
                                                type: "object",
                                                name: "questions",
                                                label: "Spørsmål (Quiz)",
                                                list: true,
                                                fields: [
                                                    { type: "string", name: "question", label: "Spørsmål" },
                                                    { type: "string", name: "options", label: "Alternativer", list: true },
                                                    { type: "string", name: "answer", label: "Riktig Svar" },
                                                    { type: "string", name: "explanation", label: "Forklaring", ui: { component: "textarea" } },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: "religion",
                label: "Religioner",
                path: "public/data/religion",
                format: "json",
                match: {
                    include: "**/*",
                },
                fields: [
                    { type: "string", name: "name", label: "Navn", isTitle: true, required: true },
                    { type: "string", name: "color", label: "Farge (Hex)", ui: { component: "color" } },
                    { type: "image", name: "icon", label: "Ikon/Symbol" },
                    {
                        type: "object",
                        name: "dimensions",
                        label: "De 7 Dimensjonene",
                        fields: [
                            { type: "rich-text", name: "ritual", label: "Ritualer og kult" },
                            { type: "rich-text", name: "narrative", label: "Fortellinger og myter" },
                            { type: "rich-text", name: "experiential", label: "Opplevelser og erfaringer" },
                            { type: "rich-text", name: "social", label: "Sosial organisering" },
                            { type: "rich-text", name: "ethical", label: "Etikk og moral" },
                            { type: "rich-text", name: "doctrinal", label: "Lære og filosofi" },
                            { type: "rich-text", name: "material", label: "Materielle og estetiske uttrykk" },
                        ],
                    },
                ],
            },
        ],
    },
});
