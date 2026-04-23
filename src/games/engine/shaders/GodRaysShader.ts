// Fase 2.5: enkel skjermrom-volumetrisk lys / god rays.
// Radial sampling fra sol-posisjon i NDC ([0,1] etter projeksjon). Ikke en
// fullstendig volumetrisk implementasjon — scenens bright pixels (fra bloom-
// pipelinen) fungerer som lyskilde, og vi lager stråler utover fra sun-punktet.

import * as THREE from 'three';

export const GodRaysShader = {
    uniforms: {
        tDiffuse: { value: null },
        sunScreenPos: { value: new THREE.Vector2(0.5, 0.85) }, // NDC i [0,1]
        exposure: { value: 0.15 },
        decay: { value: 0.96 },
        density: { value: 0.85 },
        weight: { value: 0.4 },
        sunVisible: { value: 1.0 },          // 0 = slått av (sol under horisont / bak kamera)
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 sunScreenPos;
        uniform float exposure;
        uniform float decay;
        uniform float density;
        uniform float weight;
        uniform float sunVisible;
        varying vec2 vUv;

        void main() {
            vec4 baseColor = texture2D(tDiffuse, vUv);
            if (sunVisible < 0.5) { gl_FragColor = baseColor; return; }

            vec2 delta = (vUv - sunScreenPos) * density / 48.0;
            vec2 sampleUv = vUv;
            float illum = decay;
            vec3 accum = vec3(0.0);

            for (int i = 0; i < 48; i++) {
                sampleUv -= delta;
                vec3 s = texture2D(tDiffuse, sampleUv).rgb;
                // Kun bright pixels bidrar — løft over 0.6 luminance
                float lum = dot(s, vec3(0.299, 0.587, 0.114));
                s *= smoothstep(0.55, 0.95, lum);
                accum += s * illum * weight;
                illum *= decay;
            }

            gl_FragColor = vec4(baseColor.rgb + accum * exposure, 1.0);
        }
    `,
};
