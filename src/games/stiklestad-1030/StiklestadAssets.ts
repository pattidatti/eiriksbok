import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { addNPC, addProp, addTarget, addLauncher, addZoneTitle, addCrowd } from '../engine/declarative';
import { LAYOUT, buildStiklestadMap } from './StiklestadMap';
import { PALETTE } from './StiklestadPalette';
import { tormodDialogs, hirdDialogs, bondeDialogs, olavDialogs } from './StiklestadDialogs';
import { stiklestadMonologs } from './StiklestadMonologs';

// ─── Stiklestad 1030 - gameplay-wiring ───────────────────────────────────────
// Faser: leiren → treningen → kvelden → slaget → etterspillet. Bruker hele Fase 8:
// terreng + 'terrain'-sentinel, snapToTerrain-crowd, kits (bål/fane/glød/sonetittel),
// zone-intro + glide-cinematic (i Config), charge-throw + launcher + targets +
// spawnProjectile (treningen + ekte kamp i slaget).

export function setupStiklestadScene(engine: GameEngineRef): void {
    const refs = buildStiklestadMap(engine);

    // Atmosfære ved start: klar skumringskveld, lav vind.
    engine.setWeather({ type: 'clear', intensity: 0 });
    void engine.playAmbient('proc:wind-outdoor', { volume: 0.28, fadeIn: 2.5 });

    // Registrer alle monologer.
    for (const node of Object.values(stiklestadMonologs)) engine.registerMonolog(node);

    // ── NPC-er ───────────────────────────────────────────────────────────────
    addNPC(engine, {
        id: 'tormod', name: 'Tormod', characterType: 'monk', pos: LAYOUT.TORMOD_POS,
        colors: { body: PALETTE.woodDark, head: PALETTE.skin, legs: PALETTE.woodDark },
        dialogs: tormodDialogs, greetingDialog: 'tormod_greeting', questMarker: true,
    });
    addNPC(engine, {
        id: 'olav', name: 'Kong Olav', characterType: 'noble', pos: LAYOUT.OLAV_POS,
        colors: { body: PALETTE.bannerRed, head: PALETTE.skin, legs: PALETTE.ironDark },
        dialogs: olavDialogs, greetingDialog: 'olav_greeting', emotion: 'triumphant',
    });
    addNPC(engine, {
        id: 'sigurd', name: 'Sigurd', characterType: 'farmer', pos: LAYOUT.HIRD_POS,
        colors: { body: PALETTE.hirdBlue, head: PALETTE.skin, legs: PALETTE.ironDark },
        dialogs: hirdDialogs, greetingDialog: 'hird_greeting', questMarker: true,
    });
    addNPC(engine, {
        id: 'baard', name: 'Bård', characterType: 'farmer', pos: LAYOUT.BONDE_POS,
        colors: { body: PALETTE.bondeBrown, head: PALETTE.skin, legs: PALETTE.woodDark },
        dialogs: bondeDialogs, greetingDialog: 'bonde_greeting', questMarker: true,
    });
    // Markører styres manuelt per fase (motorens auto-logikk passer ikke disse fasene).
    // Skjul alle ved start; leiren viser Tormod, kvelden viser de tre bål-NPC-ene.
    for (const id of ['tormod', 'sigurd', 'baard']) engine.setCharacterMarkerVisible(id, false);
    engine.setCharacterMarkerVisible('tormod', true);

    // ── Wire dialog-flagg (ren data → motor-state her) ───────────────────────
    // Tormods kveld-variant (indeks [1]): de tre valgene farger slutt-teksten.
    const tormodEntry = tormodDialogs.tormod_greeting as DialogNode[];
    const kveld = tormodEntry[1];
    wireAction(kveld, 0, () => engine.setFlag('elevens-syn', 'tro'));
    wireAction(kveld, 1, () => engine.setFlag('elevens-syn', 'tvil'));
    wireAction(kveld, 2, () => engine.setFlag('elevens-syn', 'ettermaele'));
    wireEnd(tormodDialogs.tormod_ettermaele_slutt as DialogNode, () => {
        engine.setFlag('snakket-ettermaele', true);
        engine.setCharacterMarkerVisible('tormod', false);
    });
    // Leiren-snakk med Tormod låser opp treningen.
    wireEnd(tormodEntry[2], () => markTalkedTormod());
    wireEnd(tormodDialogs.tormod_bonder as DialogNode, () => markTalkedTormod());
    wireEnd(tormodDialogs.tormod_olav2 as DialogNode, () => markTalkedTormod());
    wireEnd(tormodDialogs.tormod_tap as DialogNode, () => markTalkedTormod());
    // Tro/tvil-samtalene (alle utgangs-noder setter flagget + skjuler markøren).
    for (const n of Object.values(hirdDialogs)) wireEnd(n, () => {
        engine.setFlag('snakket-tro', true);
        engine.setCharacterMarkerVisible('sigurd', false);
    });
    for (const n of Object.values(bondeDialogs)) wireEnd(n, () => {
        engine.setFlag('snakket-tvil', true);
        engine.setCharacterMarkerVisible('baard', false);
    });

    function markTalkedTormod(): void {
        if (engine.getFlag('snakket-tormod')) return;
        engine.setFlag('snakket-tormod', true);
        engine.setCharacterMarkerVisible('tormod', false);
        if (engine.getPhase() === 'leiren') startTraining();
    }

    // ── Treningsbane (Pakke C: launcher + targets + charge-throw) ────────────
    addLauncher(engine, {
        id: 'trenings-spyd', kind: 'spear', pos: LAYOUT.LAUNCHER_POS, ammo: 12,
        onHitTarget: () => registerTrainingHit(),
    });
    const trainTargetsHit = new Set<string>();
    LAYOUT.TRAIN_TARGETS.forEach((t, i) => {
        const id = `blink-${i}`;
        addTarget(engine, {
            id, pos: [t[0], 'terrain', t[1]], reactions: ['knock', 'flash'], resetAfterMs: 2600,
            onHit: () => { trainTargetsHit.add(id); registerTrainingHit(); },
        });
    });
    // To kaste-økser (charge-throw via registerPickup, ikke inventar).
    [[22, 50], [38, 50]].forEach(([x, z], i) => {
        const axe = addProp(engine, {
            id: `kaste-oks-${i}`,
            model: { primitive: 'box', size: [0.1, 0.5, 0.12], color: PALETTE.iron },
            pos: [x, 'terrain', z], dynamic: { mass: 1 },
        });
        engine.registerPickup(axe.primary as THREE.Mesh, {
            label: 'Ta øks (E), hold F for å kaste',
            throwForce: 9, charge: { maxForce: 18, chargeTimeMs: 800 },
        });
    });

    // 2 av 3 treff holder (ikke alle tre) - mildere krav for svakere spillere.
    const TRAIN_HITS_NEEDED = 2;
    function registerTrainingHit(): void {
        if (engine.getPhase() !== 'treningen') return;
        if (trainTargetsHit.size >= TRAIN_HITS_NEEDED && !engine.getFlag('trening-ferdig')) {
            engine.setFlag('trening-ferdig', true);
            startKvelden();
        }
    }

    // ── Sonetitler ───────────────────────────────────────────────────────────
    addZoneTitle(engine, {
        id: 'sone-trening', area: { minX: 18, maxX: 44, minZ: 34, maxZ: 58 },
        title: 'Treningsbanen', subtitle: 'Hold F for å lade kastet',
    });
    addZoneTitle(engine, {
        id: 'sone-ryggen', area: { minX: -30, maxX: 30, minZ: -6, maxZ: 16 },
        title: 'Ryggen', subtitle: 'Skjoldborgen står her',
    });

    // ── Bondehæren (Pakke A: crowd med snapToTerrain) ────────────────────────
    const BONDE_PALETTE = { shirts: [PALETTE.bondeBrown, 0x5a4a36, 0x6e5a3e, 0x4a3e2c], skin: PALETTE.skin, caps: PALETTE.woodDark, pants: PALETTE.ironDark };
    addCrowd(engine, {
        id: 'bondehaer-massen', count: 380, mode: 'static',
        area: LAYOUT.ENEMY_AREA, y: 0, palette: BONDE_PALETTE, snapToTerrain: true,
    });
    addCrowd(engine, {
        id: 'bondehaer-kolonne', count: 130, mode: 'march',
        path: [...LAYOUT.ENEMY_MARCH], width: 22, speed: 0, palette: BONDE_PALETTE, snapToTerrain: true,
    });

    // ── Slaget: kongefigur + skjoldborg + fiendekrigere (bygges skjult) ──────
    const battle = buildBattlePieces(engine);

    // ── Fase-logikk + atmosfære + kamp (per frame) ───────────────────────────
    let battleTimer = 0;
    let nextDrum = 0;
    let olavFell = false;
    let treningElapsed = 0;

    engine.registerUpdate((dt) => {
        const phase = engine.getPhase();
        const p = engine.getPlayerPosition();

        // Treningen: gå videre etter ~35s selv om eleven sliter med å treffe (anti-stuck).
        if (phase === 'treningen' && !engine.getFlag('trening-ferdig')) {
            treningElapsed += dt;
            if (treningElapsed > 35) {
                engine.setFlag('trening-ferdig', true);
                startKvelden();
            }
        }

        // kvelden → klar for slag når alle tre samtaler er ført.
        if (phase === 'kvelden' && engine.getFlag('snakket-tro') && engine.getFlag('snakket-tvil') && engine.getFlag('snakket-ettermaele') && !engine.getFlag('klar-for-slag')) {
            engine.setFlag('klar-for-slag', true);
            engine.playMonolog('til_ryggen');
        }
        // Gå nord over porten → slaget begynner.
        if (phase === 'kvelden' && engine.getFlag('klar-for-slag') && p.z < LAYOUT.GATE_RIDGE_Z) {
            startSlaget();
        }

        if (phase === 'slaget' && !olavFell) {
            battleTimer += dt;
            updateBattle(dt, battleTimer);
            // Trommer + sammenstøt.
            nextDrum -= dt;
            if (nextDrum <= 0) {
                nextDrum = 0.7 + Math.random() * 0.4;
                engine.playOneShot('proc:drum-hit', { volume: 0.5 });
            }
        }
    });

    // ── Faseoverganger ───────────────────────────────────────────────────────
    function startTraining(): void {
        engine.setPhase('treningen');
        engine.playMonolog('til_trening');
    }

    function startKvelden(): void {
        engine.setPhase('kvelden');
        engine.setFlag('phase-kvelden', true); // aktiverer Tormods ettermæle-variant
        engine.setTimeOfDay(0.76);
        // Vis markører på de tre bål-NPC-ene så eleven finner alle samtalene.
        if (!engine.getFlag('snakket-tro')) engine.setCharacterMarkerVisible('sigurd', true);
        if (!engine.getFlag('snakket-tvil')) engine.setCharacterMarkerVisible('baard', true);
        if (!engine.getFlag('snakket-ettermaele')) engine.setCharacterMarkerVisible('tormod', true);
        engine.playMonolog('trening_ferdig');
        engine.schedule(() => engine.playMonolog('kvelden'), 2600);
    }

    function startSlaget(): void {
        if (engine.getPhase() === 'slaget') return;
        engine.setPhase('slaget');
        engine.setFlag('phase-slaget', true);
        engine.setTimeOfDay(0.5);
        engine.setWeather({ type: 'rain', intensity: 0.25 });
        engine.setBloom(0.2);
        battle.reveal();
        // Hæren velter frem.
        engine.setCrowdSpeed('bondehaer-kolonne', 1.6);
        // Auto-utrust spilleren med et kaste-spyd (ekte kamp).
        engine.equipLauncher({
            minForce: 9, maxForce: 20, upBias: 1.2, chargeTimeMs: 750, ammo: 99,
            fire: (origin, velocity) => {
                engine.spawnProjectile({
                    from: origin, velocity, visual: 'spear',
                    onHit: (hit) => { if (hit.target) engine.cameraShake(0.15, 0.2); },
                });
            },
        });
        void engine.playAmbient('proc:crowd-murmur', { volume: 0.5, fadeIn: 1 });
        engine.playMonolog('slaget_start');
    }

    function updateBattle(dt: number, t: number): void {
        battle.update(dt, engine.getPlayerPosition());
        const felled = battle.felled();
        // Skjoldborgen brister: midtveis i tid ELLER når halve bølgen er felt.
        if ((t > 11 || felled >= Math.ceil(battle.enemyTotal / 2)) && !engine.getFlag('skjoldborg-brast')) {
            engine.setFlag('skjoldborg-brast', true);
            battle.breakShieldwall();
            engine.playMonolog('skjoldborg_brister');
            engine.screenFlash();
        }
        // Klimaks (hybrid): kongen faller når hele bølgen er felt (tidligst etter 8s,
        // så det føles fortjent) ELLER etter 24s uansett (garanterer framdrift).
        const cleared = felled >= battle.enemyTotal && t > 8;
        if ((cleared || t > 24) && !olavFell) {
            olavFell = true;
            olavFalls();
        }
    }

    function olavFalls(): void {
        engine.setCrowdSpeed('bondehaer-kolonne', 0.4);
        const kp = battle.kingPos();
        void engine.playCinematic([
            { duration: 2.2, cameraPos: [kp.x + 4, kp.y + 2.4, kp.z + 5], lookAt: [kp.x, kp.y + 1.2, kp.z], fov: 42, transition: 'cut' },
            { duration: 2.0, cameraPos: [kp.x + 2, kp.y + 1.4, kp.z + 2.5], lookAt: [kp.x, kp.y + 0.4, kp.z], fov: 40, transition: 'glide' },
        ]);
        engine.schedule(() => { battle.toppleKing(); engine.cameraShake(0.35, 0.5); engine.screenFlash(); }, 1600);
        engine.schedule(() => engine.playMonolog('olav_faller'), 2600);
        engine.schedule(() => startEtterspill(), 7000);
    }

    function startEtterspill(): void {
        if (engine.getPhase() === 'etterspillet') return;
        engine.setPhase('etterspillet');
        void (async () => {
            await engine.fadeToBlack(1200);
            // Stille dal et år etter: slukk bål, rydd kampen, sett opp pilegrim + jærtegn.
            for (const f of refs.campfires) f.setLit(false);
            battle.clearToAftermath();
            engine.setWeather({ type: 'clear', intensity: 0 });
            engine.setTimeOfDay(0.62);
            engine.setBloom(0.4);
            // Pilegrim + helgenlys der kongen falt.
            const kp = battle.kingPos();
            addNPC(engine, {
                id: 'pilegrim', name: 'Pilegrim', characterType: 'monk', pos: [kp.x + 1.5, 'terrain', kp.z + 1.5],
                colors: { body: PALETTE.tentDark, head: PALETTE.skin, legs: PALETTE.woodDark },
                talkable: false,
            });
            battle.placeShrineGlow();
            engine.teleportPlayer(kp.x + 4, engine.getTerrainHeight(kp.x + 4, kp.z + 7) + 1.8, kp.z + 7);
            await engine.fadeFromBlack(1400);
            engine.showZoneTitle('Stiklestad', { subtitle: 'Et år senere', durationMs: 3600 });
            engine.schedule(() => engine.playMonolog('etterspill'), 1200);
            // Syntese-quiz som fast landing.
            engine.schedule(() => engine.openPuzzle(), 14000);
        })();
    }

    // Siste puzzle-steg fullfører spillet.
    const steps = engine.config.puzzle?.steps;
    if (steps && steps.length > 0) {
        steps[steps.length - 1].onCorrect = () => engine.schedule(() => engine.triggerEnd(), 1600);
    }

    // ── Start ────────────────────────────────────────────────────────────────
    engine.setPhase('leiren');
    engine.schedule(() => engine.playMonolog('vaakner'), 1400);
}

// ── Dialog-wiring-hjelpere ───────────────────────────────────────────────────
function wireAction(node: DialogNode, choiceIndex: number, fn: () => void): void {
    const c = node.choices[choiceIndex];
    const prev = c.action;
    c.action = () => { prev?.(); fn(); };
}
function wireEnd(node: DialogNode, fn: () => void): void {
    const prev = node.onEnd;
    node.onEnd = () => { prev?.(); fn(); };
}

// ── Slag-stykker: kongefigur, skjoldborg, fiendekrigere ──────────────────────
interface BattlePieces {
    reveal: () => void;
    update: (dt: number, player: { x: number; y: number; z: number }) => void;
    breakShieldwall: () => void;
    toppleKing: () => void;
    kingPos: () => THREE.Vector3;
    clearToAftermath: () => void;
    placeShrineGlow: () => void;
    felled: () => number;     // antall fiender spilleren har felt
    enemyTotal: number;       // hvor mange stormer totalt
}

function buildBattlePieces(engine: GameEngineRef): BattlePieces {
    const tier = engine.getQualityTier();
    const enemyCount = tier === 'low' ? 6 : tier === 'medium' ? 9 : 12;
    const ground = (x: number, z: number) => engine.getTerrainHeight(x, z);

    // Kongefigur på ryggen (egen prop så vi kan velte den - ikke NPC-en).
    const kingPos = new THREE.Vector3(LAYOUT.OLAV_RIDGE_POS[0], 0, LAYOUT.OLAV_RIDGE_POS[2]);
    kingPos.y = ground(kingPos.x, kingPos.z);
    // Kongen: gull-hjelm + skjold, litt større, vendt mot fienden (nord, -z).
    const king = makeWarrior(PALETTE.bannerRed, PALETTE.bannerGold, 1.22, { helmet: true, helmetColor: PALETTE.bannerGold });
    king.position.copy(kingPos);
    king.rotation.y = Math.PI;
    king.visible = false;
    engine.scene.add(king);

    // Skjoldborg: en rad hirdmenn med hjelm + skjold, vendt mot fienden.
    const shieldwall: THREE.Group[] = [];
    for (let i = -4; i <= 4; i++) {
        const x = kingPos.x + i * 1.4;
        const z = kingPos.z + 3.2;
        const w = makeWarrior(PALETTE.hirdBlue, PALETTE.iron, 1.0, { helmet: true });
        w.position.set(x, ground(x, z), z);
        w.rotation.y = Math.PI;
        w.visible = false;
        engine.scene.add(w);
        shieldwall.push(w);
    }

    // Fiendekrigere som stormer (egne proximity-mål, så spydet kan felle dem).
    interface Enemy { group: THREE.Group; alive: boolean; speed: number; }
    const enemies: Enemy[] = [];
    for (let i = 0; i < enemyCount; i++) {
        const x = kingPos.x + (i - enemyCount / 2) * 2.2;
        const z = kingPos.z - 16 - (i % 3) * 4;
        // Bønder: spyd, vekslende hjelm, ingen skjold (lettere + tydelig "angripende").
        const g = makeWarrior(PALETTE.bondeBrown, PALETTE.ironDark, 1.0, { helmet: i % 2 === 0, shield: false });
        g.position.set(x, ground(x, z), z);
        g.visible = false;
        engine.scene.add(g);
        const enemy: Enemy = { group: g, alive: true, speed: 1.6 + Math.random() * 0.8 };
        enemies.push(enemy);
        // Live proximity-mål: center = figurens posisjon (følger den når den løper).
        engine.addProjectileTarget({
            id: `fiende-${i}`,
            center: g.position,
            radius: 0.9,
            onHit: () => fellEnemy(enemy),
        });
    }
    const fallen: THREE.Group[] = [];
    let felledCount = 0;
    // Blod-sprut: små mørkerøde biter som spruter ut og faller, fader på ~0.6s.
    const puffs: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
    function spawnBloodPuff(x: number, y: number, z: number): void {
        for (let i = 0; i < 6; i++) {
            const m = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 5, 4),
                new THREE.MeshBasicMaterial({ color: i % 2 ? PALETTE.blood : PALETTE.bloodDark, transparent: true, opacity: 0.95 }),
            );
            m.position.set(x, y, z);
            engine.scene.add(m);
            puffs.push({
                mesh: m,
                vel: new THREE.Vector3((Math.random() - 0.5) * 2.4, 1.5 + Math.random() * 1.5, (Math.random() - 0.5) * 2.4),
                life: 0,
            });
        }
    }
    function fellEnemy(e: Enemy): void {
        if (!e.alive) return;
        e.alive = false;
        felledCount++;
        e.group.rotation.x = -Math.PI / 2.1;
        engine.removeProjectileTarget(idOf(e));
        fallen.push(e.group);
        const pos = e.group.position;
        spawnBloodPuff(pos.x, pos.y + 1.0, pos.z);
        engine.playOneShot('proc:drum-hit', { position: [pos.x, pos.y + 1, pos.z], volume: 0.45 });
    }
    function idOf(e: Enemy): string {
        return `fiende-${enemies.indexOf(e)}`;
    }

    let shrineGlow: THREE.Sprite | null = null;

    return {
        reveal() {
            king.visible = true;
            for (const w of shieldwall) w.visible = true;
            for (const e of enemies) e.group.visible = true;
        },
        update(dt, player) {
            // Fiender løper mot kongen/spilleren til de felles eller når frem.
            for (const e of enemies) {
                if (!e.alive) continue;
                const tx = kingPos.x, tz = kingPos.z + 2;
                const dx = tx - e.group.position.x;
                const dz = tz - e.group.position.z;
                const d = Math.hypot(dx, dz);
                if (d > 1.5) {
                    e.group.position.x += (dx / d) * e.speed * dt;
                    e.group.position.z += (dz / d) * e.speed * dt;
                    e.group.position.y = ground(e.group.position.x, e.group.position.z);
                    e.group.rotation.y = Math.atan2(dx, dz);
                }
            }
            // Blod-sprut: tyngde + fade, ryddes når de er ferdige.
            for (let i = puffs.length - 1; i >= 0; i--) {
                const pf = puffs[i];
                pf.life += dt;
                pf.vel.y -= 9 * dt;
                pf.mesh.position.addScaledVector(pf.vel, dt);
                (pf.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.95 - pf.life / 0.6);
                if (pf.life >= 0.6) {
                    engine.scene.remove(pf.mesh);
                    pf.mesh.geometry.dispose();
                    (pf.mesh.material as THREE.Material).dispose();
                    puffs.splice(i, 1);
                }
            }
            void player;
        },
        breakShieldwall() {
            // Halve skjoldborgen faller når den brister.
            shieldwall.forEach((w, i) => { if (i % 2 === 0) w.rotation.z = (i % 4 === 0 ? 1 : -1) * 1.2; });
        },
        toppleKing() {
            king.rotation.x = -Math.PI / 2.2;
        },
        kingPos: () => kingPos.clone(),
        clearToAftermath() {
            // Rydd hæren og kampfigurene; behold den falne kongen som et minne.
            engine.setCrowdVisible('bondehaer-massen', false);
            engine.setCrowdVisible('bondehaer-kolonne', false);
            for (const e of enemies) e.group.visible = false;
            for (const w of shieldwall) w.visible = false;
        },
        placeShrineGlow() {
            shrineGlow = new THREE.Sprite(new THREE.SpriteMaterial({
                color: PALETTE.holyLight, transparent: true, opacity: 0.9,
                blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            shrineGlow.scale.set(5, 6, 1);
            shrineGlow.position.set(kingPos.x, kingPos.y + 2.2, kingPos.z);
            engine.scene.add(shrineGlow);
            // En søyle av lys + et pulserende halo gjør jærtegnet tydelig på lav tier.
            engine.registerUpdate((_dt, t) => {
                if (!shrineGlow) return;
                const s = 1 + Math.sin(t * 1.5) * 0.12;
                shrineGlow.scale.set(5 * s, 6 * s, 1);
            });
        },
        felled: () => felledCount,
        enemyTotal: enemyCount,
    };
}

// Kriger: kropp + hode + valgfri hjelm/skjold/spyd. Egen gruppe så vi kan velte den.
// Holdt enkel (få meshes) - kampen har mange figurer + folkemengde på lav tier.
interface WarriorOpts { helmet?: boolean; helmetColor?: number; shield?: boolean; spear?: boolean; }
function makeWarrior(bodyColor: number, trimColor: number, scale: number, opts: WarriorOpts = {}): THREE.Group {
    const { helmet = false, shield = true, spear = true } = opts;
    const mat = (c: number, r = 0.85, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    const g = new THREE.Group();
    g.scale.setScalar(scale);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 1.0, 7), mat(bodyColor, 0.9));
    body.position.y = 0.7;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 7), mat(PALETTE.skin, 0.8));
    head.position.y = 1.32;
    g.add(head);

    if (helmet) {
        const helm = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
            mat(opts.helmetColor ?? PALETTE.iron, 0.5, 0.3),
        );
        helm.position.y = 1.36;
        g.add(helm);
    }

    if (shield) {
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 16), mat(trimColor, 0.7, 0.15));
        sh.rotation.x = Math.PI / 2;
        sh.position.set(0.34, 0.8, 0.24);
        g.add(sh);
    }

    if (spear) {
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.2, 5), mat(PALETTE.wood, 0.9));
        shaft.position.set(-0.34, 1.0, 0.05);
        shaft.rotation.z = 0.16;
        g.add(shaft);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), mat(PALETTE.iron, 0.4, 0.5));
        tip.position.set(-0.52, 2.05, 0.05);
        tip.rotation.z = 0.16;
        g.add(tip);
    }
    return g;
}
