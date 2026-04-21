import * as THREE from 'three';
import type { CharacterConfig } from './types';

function addOutline(mesh: THREE.Mesh, scale = 1.06): void {
    const outline = new THREE.Mesh(
        mesh.geometry,
        new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
    );
    outline.scale.setScalar(scale);
    mesh.add(outline);
}

function makeFaceTex(style: 'happy' | 'excited', renderer: THREE.WebGLRenderer): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const x = c.getContext('2d')!;
    x.clearRect(0, 0, 128, 128);

    if (style === 'happy') {
        x.fillStyle = '#1a1008';
        x.beginPath(); x.arc(42, 48, 10, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.arc(86, 48, 10, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#fff';
        x.beginPath(); x.arc(46, 44, 4, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.arc(90, 44, 4, 0, Math.PI * 2); x.fill();
        x.strokeStyle = '#1a1008'; x.lineWidth = 4; x.lineCap = 'round';
        x.beginPath(); x.arc(64, 62, 22, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
        x.fillStyle = 'rgba(220,120,100,0.35)';
        x.beginPath(); x.arc(30, 68, 12, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.arc(98, 68, 12, 0, Math.PI * 2); x.fill();
    } else {
        x.fillStyle = '#1a1008';
        x.beginPath(); x.arc(42, 46, 12, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.arc(86, 46, 12, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#fff';
        x.beginPath(); x.arc(47, 42, 5, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.arc(91, 42, 5, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#1a1008';
        x.beginPath(); x.arc(64, 68, 20, 0, Math.PI); x.fill();
        x.fillStyle = '#fff';
        x.fillRect(50, 68, 28, 6);
        x.strokeStyle = '#1a1008'; x.lineWidth = 3; x.lineCap = 'round';
        x.beginPath(); x.moveTo(28, 30); x.quadraticCurveTo(42, 22, 56, 30); x.stroke();
        x.beginPath(); x.moveTo(72, 30); x.quadraticCurveTo(86, 22, 100, 30); x.stroke();
        x.fillStyle = 'rgba(220,120,100,0.3)';
        x.beginPath(); x.arc(28, 70, 10, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.arc(100, 70, 10, 0, Math.PI * 2); x.fill();
    }

    void renderer;
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
}

export interface BuiltCharacter {
    group: THREE.Group;
    body: THREE.Mesh;
    head: THREE.Mesh;
    lArm: THREE.Mesh;
    rArm: THREE.Mesh;
    lLeg: THREE.Mesh;
    rLeg: THREE.Mesh;
    marker?: THREE.Mesh;
}

export function buildCharacter(
    config: CharacterConfig,
    toonMat: (color: number, opts?: Record<string, unknown>) => THREE.MeshToonMaterial,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene
): BuiltCharacter {
    const g = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.35),
        toonMat(config.colors.body)
    );
    body.position.y = 0.9; body.castShadow = true;
    addOutline(body);
    g.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        toonMat(config.colors.head)
    );
    head.position.y = 1.55; head.castShadow = true;
    addOutline(head, 1.08);
    g.add(head);

    if (config.face) {
        const faceTex = makeFaceTex(config.face, renderer);
        const facePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.28, 0.28),
            new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })
        );
        facePlane.position.set(0, 1.55, 0.24);
        g.add(facePlane);
    }

    const lArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.7, 0.15),
        toonMat(config.colors.body)
    );
    lArm.position.set(-0.33, 0.95, 0); lArm.castShadow = true; g.add(lArm);

    const rArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.7, 0.15),
        toonMat(config.colors.body)
    );
    rArm.position.set(0.33, 0.95, 0); rArm.castShadow = true; g.add(rArm);

    const lLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.5, 0.18),
        toonMat(config.colors.legs)
    );
    lLeg.position.set(-0.12, 0.25, 0); lLeg.castShadow = true; g.add(lLeg);

    const rLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.5, 0.18),
        toonMat(config.colors.legs)
    );
    rLeg.position.set(0.12, 0.25, 0); rLeg.castShadow = true; g.add(rLeg);

    if (config.extras) config.extras(g);

    g.position.set(...config.position);
    scene.add(g);

    let marker: THREE.Mesh | undefined;
    if (config.marker) {
        marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffdd66 })
        );
        marker.position.y = 2.2;
        (marker.material as THREE.MeshBasicMaterial).transparent = true;
        g.add(marker);
    }

    return { group: g, body, head, lArm, rArm, lLeg, rLeg, marker };
}

export function buildCollectibleMesh(
    geometry: 'cylinder' | 'torus' | 'sphere' | 'box',
    color: number,
    toonMat: (color: number, opts?: Record<string, unknown>) => THREE.MeshToonMaterial
): THREE.Group {
    const g = new THREE.Group();

    const geoMap = {
        cylinder: new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16),
        torus: new THREE.TorusGeometry(0.2, 0.08, 8, 16),
        sphere: new THREE.SphereGeometry(0.2, 12, 12),
        box: new THREE.BoxGeometry(0.3, 0.3, 0.3),
    };

    const mesh = new THREE.Mesh(geoMap[geometry], toonMat(color));
    mesh.castShadow = true;
    addOutline(mesh);
    g.add(mesh);

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.04, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0xffdd66, transparent: true, opacity: 0.7 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.3;
    g.add(ring);

    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2, 6),
        new THREE.MeshBasicMaterial({ color: 0xffdd66, transparent: true, opacity: 0.15 })
    );
    pillar.position.y = 0.5;
    g.add(pillar);

    g.userData.baseMesh = mesh;
    g.userData.ring = ring;
    g.userData.pillar = pillar;

    return g;
}
