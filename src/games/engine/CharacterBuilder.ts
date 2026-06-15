import * as THREE from 'three';
import type { CharacterConfig, Emotion, CharacterType } from './types';
import { createBlobShadow } from './declarative/builders/_util';

function addOutline(mesh: THREE.Mesh, scale = 1.06): void {
    const outline = new THREE.Mesh(
        mesh.geometry,
        new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
    );
    outline.scale.setScalar(scale);
    mesh.add(outline);
}

// ─── Parametric face drawing system ─────────────────────────────────────────

export interface DrawParams {
    eyeSize: number;     // 0.5 = squinted, 1.5 = enormous
    eyeOffsetY: number;  // px, positive = upward (cheeks push eyes up)
    mouthCurve: number;  // -1 = frown, 1 = broad smile
    mouthWidth: number;  // 0.4–0.9 relative width
    mouthOpen: number;   // 0 = closed, 1 = O-gap
    cheekPuff: number;   // 0–1
    browAngle: number;   // -1 = V-furrow, 1 = raised surprised
    teethShow: number;   // 0–1 (only visible when mouthOpen > 0.3)
}

interface TypeModifier {
    browThickness: number;
    wrinkles: boolean;
    jawScale: number;
    beardHint: boolean;
}

export const EMOTION_PARAMS: Record<Emotion, DrawParams> = {
    glad:       { eyeSize: 0.7,  eyeOffsetY: 2,  mouthCurve: 0.85,  mouthWidth: 0.65, mouthOpen: 0.2,  cheekPuff: 0.75, browAngle: 0.15, teethShow: 0.0 },
    worried:    { eyeSize: 0.85, eyeOffsetY: -2, mouthCurve: -0.55, mouthWidth: 0.5,  mouthOpen: 0.0,  cheekPuff: 0.0,  browAngle: -0.6, teethShow: 0.0 },
    surprised:  { eyeSize: 1.5,  eyeOffsetY: 5,  mouthCurve: 0.0,   mouthWidth: 0.5,  mouthOpen: 0.95, cheekPuff: 0.0,  browAngle: 1.0,  teethShow: 0.0 },
    triumphant: { eyeSize: 0.55, eyeOffsetY: 4,  mouthCurve: 1.0,   mouthWidth: 0.82, mouthOpen: 0.45, cheekPuff: 1.0,  browAngle: 0.35, teethShow: 0.9 },
};

const TYPE_MODIFIERS: Record<CharacterType, TypeModifier> = {
    scientist: { browThickness: 2.2, wrinkles: true,  jawScale: 0.9,  beardHint: true  },
    farmer:    { browThickness: 1.4, wrinkles: false, jawScale: 1.15, beardHint: false },
    noble:     { browThickness: 0.8, wrinkles: false, jawScale: 0.85, beardHint: false },
    monk:      { browThickness: 0.7, wrinkles: true,  jawScale: 0.9,  beardHint: false },
};

export function lerpParams(a: DrawParams, b: DrawParams, t: number): DrawParams {
    return {
        eyeSize:    a.eyeSize    + (b.eyeSize    - a.eyeSize)    * t,
        eyeOffsetY: a.eyeOffsetY + (b.eyeOffsetY - a.eyeOffsetY) * t,
        mouthCurve: a.mouthCurve + (b.mouthCurve - a.mouthCurve) * t,
        mouthWidth: a.mouthWidth + (b.mouthWidth - a.mouthWidth) * t,
        mouthOpen:  a.mouthOpen  + (b.mouthOpen  - a.mouthOpen)  * t,
        cheekPuff:  a.cheekPuff  + (b.cheekPuff  - a.cheekPuff)  * t,
        browAngle:  a.browAngle  + (b.browAngle  - a.browAngle)  * t,
        teethShow:  a.teethShow  + (b.teethShow  - a.teethShow)  * t,
    };
}

export function drawFace(ctx: CanvasRenderingContext2D, p: DrawParams, type: CharacterType): void {
    const mod = TYPE_MODIFIERS[type];
    ctx.clearRect(0, 0, 128, 128);

    // Blush cheeks
    if (p.cheekPuff > 0.05) {
        ctx.fillStyle = `rgba(220,110,90,${(0.45 * p.cheekPuff).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(22, 72, 12 * p.cheekPuff, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(106, 72, 12 * p.cheekPuff, 0, Math.PI * 2); ctx.fill();
    }

    // Eyes
    const eyeY = 50 - p.eyeOffsetY * 1.8;
    const ew = 13 * p.eyeSize, eh = 15 * p.eyeSize;
    ctx.fillStyle = '#1a1008';
    ctx.beginPath(); ctx.ellipse(38, eyeY, ew / 2, eh / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(90, eyeY, ew / 2, eh / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(38 + ew * 0.22, eyeY - eh * 0.22, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(90 + ew * 0.22, eyeY - eh * 0.22, 3, 0, Math.PI * 2); ctx.fill();

    // Eyebrows
    const browY = eyeY - eh / 2 - 6;
    ctx.strokeStyle = '#1a1008';
    ctx.lineWidth = 3 * mod.browThickness;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(26, browY); ctx.quadraticCurveTo(39, browY - p.browAngle * 12, 52, browY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(76, browY); ctx.quadraticCurveTo(89, browY - p.browAngle * 12, 102, browY); ctx.stroke();

    // Mouth
    const mx = 64, mouthY = 84, mw = p.mouthWidth * 26;
    if (p.mouthOpen > 0.3) {
        ctx.fillStyle = '#1a1008';
        ctx.beginPath(); ctx.ellipse(mx, mouthY, mw, p.mouthOpen * 13, 0, 0, Math.PI * 2); ctx.fill();
        if (p.teethShow > 0.1) {
            ctx.fillStyle = `rgba(255,252,240,${p.teethShow.toFixed(2)})`;
            ctx.beginPath(); ctx.ellipse(mx, mouthY - 2, mw - 3, p.mouthOpen * 6.5, 0, Math.PI, Math.PI * 2); ctx.fill();
        }
    } else {
        ctx.strokeStyle = '#1a1008';
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(mx - mw, mouthY); ctx.quadraticCurveTo(mx, mouthY + p.mouthCurve * 16, mx + mw, mouthY); ctx.stroke();
    }

    // Scientist extras
    if (mod.wrinkles) {
        ctx.strokeStyle = 'rgba(100,60,20,0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(38, eyeY + eh / 2 + 3, 7, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(90, eyeY + eh / 2 + 3, 7, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(44, 22); ctx.quadraticCurveTo(64, 20, 84, 22); ctx.stroke();
    }
    if (mod.beardHint) {
        ctx.fillStyle = 'rgba(160,140,120,0.5)';
        ctx.beginPath(); ctx.ellipse(64, 103, 22, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
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
    nameLabel?: THREE.Sprite;
    interactLabel?: THREE.Sprite;
    faceCanvas?: HTMLCanvasElement;
    faceCtx?: CanvasRenderingContext2D;
    faceTexture?: THREE.CanvasTexture;
    characterType?: CharacterType;
    currentEmotion?: Emotion;
    defaultEmotion?: Emotion;
}

function createInteractLabel(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffd45a';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Snakk (E)', 128, 32);
    ctx.shadowBlur = 0;
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false })
    );
    sprite.renderOrder = 999;
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
}

function createNameLabel(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false })
    );
    sprite.renderOrder = 999;
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
}

export function buildCharacter(
    config: CharacterConfig,
    toonMat: (color: number, opts?: Record<string, unknown>) => THREE.MeshStandardMaterial,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    // Toon-outlines dobler draw calls per karakter (BackSide-barn). Skrus av på low-tier
    // for færre draw calls; toon-looken overlever uten dem.
    outlines = true
): BuiltCharacter {
    const g = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.35),
        toonMat(config.colors.body)
    );
    body.position.y = 0.9; body.castShadow = true;
    if (outlines) addOutline(body);
    g.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        toonMat(config.colors.head)
    );
    head.position.y = 1.55; head.castShadow = true;
    if (outlines) addOutline(head, 1.08);
    g.add(head);

    let faceCanvas: HTMLCanvasElement | undefined;
    let faceCtx: CanvasRenderingContext2D | undefined;
    let faceTexture: THREE.CanvasTexture | undefined;

    if (config.characterType) {
        faceCanvas = document.createElement('canvas');
        faceCanvas.width = 128;
        faceCanvas.height = 128;
        faceCtx = faceCanvas.getContext('2d')!;
        drawFace(faceCtx, EMOTION_PARAMS[config.defaultEmotion ?? 'glad'], config.characterType);
        faceTexture = new THREE.CanvasTexture(faceCanvas);
        const facePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.28, 0.28),
            new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true, depthWrite: false })
        );
        facePlane.position.set(0, 1.55, 0.24);
        g.add(facePlane);
    }

    void renderer;

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

    let nameLabel: THREE.Sprite | undefined;
    let interactLabel: THREE.Sprite | undefined;
    if (config.showName !== false) {
        nameLabel = createNameLabel(config.name);
        nameLabel.position.y = 1.95;
        g.add(nameLabel);
        interactLabel = createInteractLabel();
        interactLabel.position.y = 2.40;
        interactLabel.visible = false;
        g.add(interactLabel);
    }

    // LOW-baseline: falsk kontaktskygge når ekte skygger er av (low-tier). Lagt som
    // barn av karakter-gruppa så den følger NPC-en når den går. Se _util.addGroundShadow.
    if (!renderer.shadowMap.enabled) {
        const blob = createBlobShadow(scene, 0.5);
        blob.position.y = 0.02;
        g.add(blob);
    }

    g.position.set(...config.position);
    g.userData.npcId = config.id;
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

    return {
        group: g, body, head, lArm, rArm, lLeg, rLeg, marker, nameLabel, interactLabel,
        faceCanvas, faceCtx, faceTexture,
        characterType: config.characterType,
        currentEmotion: config.defaultEmotion ?? (config.characterType ? 'glad' : undefined),
        defaultEmotion: config.defaultEmotion,
    };
}

// Animerer en NPC eller spiller basert på userData._isWalking flagg.
// Brukes både av AIDirector-styrte NPCer og engine player-loop (player setter selv flag).
export function updateCharacterAnim(char: BuiltCharacter, dt: number): void {
    const ud = char.group.userData as { _isWalking?: boolean; _walkPhase?: number; _walkSpeed?: number };
    const walking = !!ud._isWalking;
    const speed = ud._walkSpeed ?? 1.4;

    if (walking) {
        ud._walkPhase = (ud._walkPhase ?? 0) + dt * speed * 6;
        const phase = ud._walkPhase;
        char.lLeg.rotation.x = Math.sin(phase) * 0.55;
        char.rLeg.rotation.x = -Math.sin(phase) * 0.55;
        char.lArm.rotation.x = -Math.sin(phase) * 0.4;
        char.rArm.rotation.x = Math.sin(phase) * 0.4;
        char.body.position.y = 0.9 + Math.abs(Math.sin(phase)) * 0.05;
    } else {
        // Lerp mot 0
        const k = Math.min(1, dt * 8);
        char.lLeg.rotation.x *= 1 - k;
        char.rLeg.rotation.x *= 1 - k;
        char.lArm.rotation.x *= 1 - k;
        char.rArm.rotation.x *= 1 - k;
        char.body.position.y += (0.9 - char.body.position.y) * k;
    }
}

export function buildCollectibleMesh(
    geometry: 'cylinder' | 'torus' | 'sphere' | 'box',
    color: number,
    toonMat: (color: number, opts?: Record<string, unknown>) => THREE.MeshStandardMaterial
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
