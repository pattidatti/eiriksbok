// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: "main",
  clientId: null,
  // Get this from tina.io
  token: null,
  // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images/uploads",
      publicFolder: "public"
    }
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
            delete: false
          }
        },
        match: {
          include: "manifest"
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
                      { type: "string", name: "tags", label: "Tags", list: true }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "article",
        label: "Artikler",
        path: "public/content",
        format: "json",
        match: {
          include: "**/*",
          exclude: "manifest"
        },
        ui: {
          filename: {
            // Example: historie/vikingtiden/artikkel
            slugify: (values) => {
              return `${values.topic}/${values.id || "ny-artikkel"}/artikkel`;
            }
          }
        },
        fields: [
          { type: "string", name: "title", label: "Tittel" },
          { type: "string", name: "subject", label: "Fag" },
          { type: "string", name: "topic", label: "Emne" },
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
                  { type: "string", name: "content", label: "Tekst", ui: { component: "textarea" } }
                ]
              },
              {
                name: "image",
                label: "Bilde",
                fields: [
                  { type: "image", name: "src", label: "Bilde" },
                  { type: "string", name: "caption", label: "Bildetekst" },
                  { type: "string", name: "alt", label: "Alt tekst" }
                ]
              },
              {
                name: "component",
                label: "Komponent",
                fields: [
                  {
                    type: "string",
                    name: "name",
                    label: "Type",
                    options: ["FactBox", "Quiz"]
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
                        label: "Sp\xF8rsm\xE5l (Quiz)",
                        list: true,
                        fields: [
                          { type: "string", name: "question", label: "Sp\xF8rsm\xE5l" },
                          { type: "string", name: "options", label: "Alternativer", list: true },
                          { type: "string", name: "answer", label: "Riktig Svar" },
                          { type: "string", name: "explanation", label: "Forklaring", ui: { component: "textarea" } }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
