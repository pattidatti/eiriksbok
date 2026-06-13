import * as THREE from 'three';

/**
 * Billig gradient-himmeldome (LOW-baseline, Fase 9).
 *
 * Den prosedyrale `SkySystem` (Rayleigh) er forbeholdt `sky: 'procedural'`-scener
 * (typisk `preset: 'open'`). Alle andre scener fikk før en flat solid bakgrunnsfarge.
 * Denne domen erstatter den flate fargen med en enkel vertikal 2-stops gradient
 * (zenit → horisont) på en stor invertert kule. Horisontfargen settes lik
 * scene-fogfargen, slik at fjerne objekter blir rene silhuetter mot horisonten —
 * billig dybde uten ekstra lys eller post-prosessering.
 *
 * Shaderen tar IKKE inn fog-chunks, så selve domen blir aldri tåkelagt (den ER
 * horisonten). Geometrien er stor nok til å omslutte ikke-åpne scener (far ≤ 100).
 */
const SKY_VERT = /* glsl */ `
varying vec3 vWorldDir;
void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldDir = normalize(world.xyz - cameraPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform float uExponent;
varying vec3 vWorldDir;
void main() {
    float h = clamp(vWorldDir.y, 0.0, 1.0);
    float t = pow(h, uExponent);
    gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0);
}
`;

/**
 * Lag en gradient-himmeldome. `horizon` bør være lik scene-fogfargen.
 * `radius` skal ligge innenfor kameraets far-plan så den ikke klippes bort.
 */
export function createSkyDome(horizon: THREE.Color, radius = 90): THREE.Mesh {
    // Topp = horisontfargen blandet mot en dyp blå-grå skifer for en himmel-følelse.
    const top = horizon.clone().lerp(new THREE.Color(0x223044), 0.55);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTop: { value: top },
            uHorizon: { value: horizon.clone() },
            uExponent: { value: 0.6 },
        },
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
    });

    const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), material);
    dome.name = 'gradient-sky-dome';
    dome.renderOrder = -1000;
    dome.frustumCulled = false;
    return dome;
}
