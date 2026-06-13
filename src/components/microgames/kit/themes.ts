// Era-temapaletter for mikrospill. Samme motor, men distinkt visuell identitet
// per emne - så et romersk spill ikke ser ut som et vikingspill. Send temaet til
// MicroCanvas (background/fog) og bruk fargene i scene-parts.
//
//   const t = THEMES.viking;
//   <MicroGameScaffold canvas={{ background: t.sky, fog: { near: 26, far: 50 } }} ... />
//   <GroundPlane color={t.ground} /> <WaterPlane color={t.water} />

export interface KitTheme {
    sky: string; // bakgrunn/himmel
    fog: string; // tåkefarge (vanligvis = sky)
    ground: string; // bakke/terreng
    water: string; // vann
    wood: string; // tre/bjelker
    stone: string; // stein/mur
    leaf: string; // løv/vegetasjon
    accent: string; // signalfarge (seil, bannere, fremhevet)
}

export const THEMES: Record<string, KitTheme> = {
    // Nordisk kyst - lys, kjølig, grønt og fjordblått.
    viking: {
        sky: '#bfe0f2',
        fog: '#cfe4ee',
        ground: '#7aa84f',
        water: '#3d7fa6',
        wood: '#5c3f26',
        stone: '#8a8f96',
        leaf: '#3f6b39',
        accent: '#a23b2e',
    },
    // Middelhavet - varm sand, kalkstein, dyp rød.
    roman: {
        sky: '#f6ecd2',
        fog: '#f1e6cf',
        ground: '#d4be8f',
        water: '#3f7f94',
        wood: '#7a5535',
        stone: '#cbb48a',
        leaf: '#5e7a3a',
        accent: '#7a1f1f',
    },
    // Industriell - overskyet, sot, murstein og maskinrødt.
    industrial: {
        sky: '#c4c8cc',
        fog: '#bcc0c4',
        ground: '#6f6f5e',
        water: '#4a5a64',
        wood: '#5a4632',
        stone: '#7a3b2a',
        leaf: '#4a5a3a',
        accent: '#c0392b',
    },
    // Nilen - blekt ørkenlys, sand, kalkstein og nilblått.
    egypt: {
        sky: '#e9d8a6',
        fog: '#e4d39a',
        ground: '#d8c18a',
        water: '#4a7c8c',
        wood: '#9c7b4a',
        stone: '#c2a878',
        leaf: '#7a8a3a',
        accent: '#2d6a8f',
    },
    // Egeerhavet - skarp lys, hvit marmor, dyp blå sjø, oliven.
    greek: {
        sky: '#dceaf2',
        fog: '#d6e6ef',
        ground: '#cdbd92',
        water: '#1f6fa0',
        wood: '#8a6a3f',
        stone: '#eee9dd',
        leaf: '#6e7d3e',
        accent: '#b5482f',
    },
    // Middelalder/norrønt-kristent - kjølig stein, skoggrønt, heraldisk rødt og gull.
    medieval: {
        sky: '#cdd6dc',
        fog: '#c6d0d6',
        ground: '#6f7e4c',
        water: '#3c6b86',
        wood: '#4a3420',
        stone: '#8d8a82',
        leaf: '#37592f',
        accent: '#8a2b2b',
    },
    // Opplysningstiden - raffinert by, pergament, brostein og messing/blått.
    enlightenment: {
        sky: '#ece3cf',
        fog: '#e6ddc8',
        ground: '#9a9476',
        water: '#4a6f86',
        wood: '#6e4d2e',
        stone: '#c3b291',
        leaf: '#5f6f3c',
        accent: '#2e5e86',
    },
    // Moderne / kald krig - betong, stål, asfalt, signalrødt.
    modern: {
        sky: '#cdd3d6',
        fog: '#c6ccd0',
        ground: '#6b7068',
        water: '#46606e',
        wood: '#5a5048',
        stone: '#9aa0a2',
        leaf: '#5a6a4a',
        accent: '#c0392b',
    },
    // Kosmisk / abstrakt - lysende, ikke mørkt (lys stil-regelen): blek lavendel + gull.
    cosmic: {
        sky: '#e8e2f2',
        fog: '#e0d8ee',
        ground: '#cfc6dd',
        water: '#7f9fd0',
        wood: '#8a7d9a',
        stone: '#d6cfe2',
        leaf: '#9a8fb0',
        accent: '#e3b23c',
    },
    // Samisk / arktisk - kaldt, lyst: snøhvitt, isblått, varm rød lavvo-aksent.
    arctic: {
        sky: '#dceaf2',
        fog: '#e4eef4',
        ground: '#e8eef2',
        water: '#7fb0cc',
        wood: '#6a5038',
        stone: '#b8c4cc',
        leaf: '#5a7a6a',
        accent: '#b5402f',
    },
    // Øst-Asia / risdyrking - dis, rismarkgrønt, lakkrødt og vermillon.
    asian: {
        sky: '#e2ebe6',
        fog: '#dce8e2',
        ground: '#7a9456',
        water: '#5a8a8a',
        wood: '#6e2f2a',
        stone: '#b6ada0',
        leaf: '#4a7a3a',
        accent: '#c0392b',
    },
    // Mesoamerika - frodig jungel, kalkstein, jade og rødt.
    mesoamerican: {
        sky: '#dbe6cf',
        fog: '#d4e0c6',
        ground: '#5c7a3a',
        water: '#3f8a86',
        wood: '#6e4a2c',
        stone: '#c6bb9a',
        leaf: '#356b2f',
        accent: '#1f8a7a',
    },
};

export const DEFAULT_THEME = THEMES.viking;
