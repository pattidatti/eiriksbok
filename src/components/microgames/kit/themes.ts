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
};

export const DEFAULT_THEME = THEMES.viking;
