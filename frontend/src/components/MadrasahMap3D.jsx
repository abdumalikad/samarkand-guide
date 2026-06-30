import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════
// ПРОЦЕДУРНЫЕ ТЕКСТУРЫ (canvas) — для реалистичности без файлов
// ════════════════════════════════════════════════════════════════

function makeStoneTexture(base, dark, light) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  // Кладка из плит
  const rows = 8, cols = 6;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (256 / cols / 2);
    for (let cI = -1; cI <= cols; cI++) {
      const x = cI * (256 / cols) + offset;
      const y = r * (256 / rows);
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, 256 / cols, 256 / rows);
      // лёгкая вариация тона
      if (Math.random() > 0.55) {
        ctx.fillStyle = Math.random() > 0.5 ? light : dark;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(x, y, 256 / cols, 256 / rows);
        ctx.globalAlpha = 1;
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeTileTexture(c1, c2, c3) {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 128, 128);
  // Геометрический исламский узор — ромбовидная сетка
  const s = 16;
  ctx.strokeStyle = c3;
  ctx.lineWidth = 1.2;
  for (let y = -s; y < 128 + s; y += s) {
    for (let x = -s; x < 128 + s; x += s) {
      ctx.fillStyle = (Math.floor(x/s) + Math.floor(y/s)) % 2 === 0 ? c2 : c1;
      ctx.beginPath();
      ctx.moveTo(x + s/2, y);
      ctx.lineTo(x + s, y + s/2);
      ctx.lineTo(x + s/2, y + s);
      ctx.lineTo(x, y + s/2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeDomeTexture(c1, c2) {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 64;
  const ctx = cv.getContext('2d');
  const stripes = 16;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? c1 : c2;
    ctx.fillRect((i / stripes) * 128, 0, 128 / stripes, 64);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export default function MadrasahMap3D({ selectedPoiId, onSelectZone, highContrast }) {
  const mountRef = useRef(null);
  const threeRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;

    // ── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // ── Scene + градиентное небо ───────────────────────────────
    const scene = new THREE.Scene();

    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 2; skyCanvas.height = 256;
    const skyCtx = skyCanvas.getContext('2d');
    const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
    if (highContrast) {
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, '#0a0a0a');
    } else {
      grad.addColorStop(0, '#0f1a2e');
      grad.addColorStop(0.5, '#3a3550');
      grad.addColorStop(1, '#8a6a4a');
    }
    skyCtx.fillStyle = grad;
    skyCtx.fillRect(0, 0, 2, 256);
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    scene.background = skyTex;
    scene.fog = new THREE.Fog(highContrast ? '#0a0a0a' : '#3a3550', 75, 140);

    // ── Camera ──────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 500);

    // ── Lights ──────────────────────────────────────────────────
    const hemi = new THREE.HemisphereLight(
      highContrast ? 0x444444 : 0xbfd4ff,
      highContrast ? 0x111111 : 0x6b5240,
      highContrast ? 0.5 : 0.65
    );
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0cc, highContrast ? 0.7 : 1.3);
    sun.position.set(18, 42, 28);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 130;
    sun.shadow.camera.left = -50; sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50; sun.shadow.camera.bottom = -50;
    sun.shadow.bias = -0.0015;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xaaccff, 0.25);
    fill.position.set(-22, 18, -18);
    scene.add(fill);

    // ── Палитра ─────────────────────────────────────────────────
    const C = {
      stone:  highContrast ? '#2e2e2e' : '#D8C7A8',
      stoneD: highContrast ? '#191919' : '#AD9876',
      stoneL: highContrast ? '#3e3e3e' : '#EAE0C8',
      tile1:  highContrast ? '#163016' : '#1E6B4A',
      tile2:  highContrast ? '#0c1c0c' : '#0E4430',
      tile3:  highContrast ? '#2a4a2a' : '#D4B84A',
      gold:   highContrast ? '#FACC15' : '#C9A23A',
      goldD:  highContrast ? '#A88A0E' : '#8A6E1E',
      ground: highContrast ? '#0c0c0c' : '#5C4632',
      pave:   highContrast ? '#161616' : '#6E5640',
      court:  highContrast ? '#221d12' : '#9C8B68',
      active: highContrast ? '#FACC15' : '#38BDF8',
      winD:   '#08121c',
    };

    // ── Текстуры ────────────────────────────────────────────────
    const texStone = makeStoneTexture(C.stone, C.stoneD, C.stoneL);
    texStone.repeat.set(3, 2);
    const texStoneFlig = makeStoneTexture(C.stone, C.stoneD, C.stoneL);
    texStoneFlig.repeat.set(2.2, 1.6);
    const texTile = makeTileTexture(C.tile2, C.tile1, C.tile3);
    texTile.repeat.set(2.5, 4);
    const texDome = makeDomeTexture(C.tile1, C.tile2);
    texDome.repeat.set(6, 1);

    // ── Материалы (для подсветки зон через .color) ──────────────
    const matWestWall  = new THREE.MeshPhongMaterial({ map: texStoneFlig, shininess: 15 });
    const matPortal     = new THREE.MeshPhongMaterial({ color: C.stoneL, shininess: 35 });
    const matCourtyard  = new THREE.MeshPhongMaterial({ color: C.court, shininess: 6 });
    const matMinaret    = new THREE.MeshPhongMaterial({ color: C.stone, shininess: 30 });

    const ZM = { portal: matPortal, courtyard: matCourtyard, west_side: matWestWall, minarets: matMinaret };
    const BASE = {
      portal: () => { matPortal.color.set(C.stoneL); matPortal.emissiveIntensity = 0; matPortal.emissive?.set('#000'); },
      courtyard: () => { matCourtyard.color.set(C.court); matCourtyard.emissiveIntensity = 0; matCourtyard.emissive?.set('#000'); },
      west_side: () => { matWestWall.color.set('#ffffff'); matWestWall.emissiveIntensity = 0; matWestWall.emissive?.set('#000'); },
      minarets: () => { matMinaret.color.set(C.stone); matMinaret.emissiveIntensity = 0; matMinaret.emissive?.set('#000'); },
    };
    [matPortal, matCourtyard, matWestWall, matMinaret].forEach(m => { m.emissive = new THREE.Color('#000'); m.emissiveIntensity = 0; });

    // ── Вспомогательные материалы ───────────────────────────────
    const mStone = new THREE.MeshPhongMaterial({ map: texStone, shininess: 15 });
    const mSD = new THREE.MeshPhongMaterial({ color: C.stoneD, shininess: 10 });
    const mSL = new THREE.MeshPhongMaterial({ color: C.stoneL, shininess: 30 });
    const mGold = new THREE.MeshPhongMaterial({ color: C.gold, shininess: 100, specular: '#fff8dc' });
    const mGoldD = new THREE.MeshPhongMaterial({ color: C.goldD, shininess: 80 });
    const mTile = new THREE.MeshPhongMaterial({ map: texTile, shininess: 50 });
    const mDome = new THREE.MeshPhongMaterial({ map: texDome, shininess: 70 });
    const mDomeD = new THREE.MeshPhongMaterial({ color: C.tile2, shininess: 70 });
    const mGround = new THREE.MeshPhongMaterial({ color: C.ground, shininess: 2 });
    const mPave = new THREE.MeshPhongMaterial({ color: C.pave, shininess: 4 });
    const mWin = new THREE.MeshPhongMaterial({ color: C.winD, shininess: 130, transparent: true, opacity: 0.92 });

    const clickables = [];

    // ── Хелперы ─────────────────────────────────────────────────
    const mesh = (geo, mat, x, y, z, rx = 0, ry = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (rx) m.rotation.x = rx;
      if (ry) m.rotation.y = ry;
      m.castShadow = true; m.receiveShadow = true;
      scene.add(m); return m;
    };
    const box = (w, h, d, mat, x, y, z, id = null) => {
      const m = mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
      if (id) { m.userData.poiId = id; clickables.push(m); }
      return m;
    };
    const cyl = (rt, rb, h, seg, mat, x, y, z, id = null) => {
      const m = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
      if (id) { m.userData.poiId = id; clickables.push(m); }
      return m;
    };
    const dome = (r, mat, x, y, z) =>
      mesh(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat, x, y, z);

    // ══════════════════════════════════════════════════════════════
    // ГЕОМЕТРИЯ — единый прямоугольный контур здания, без щелей.
    // Все зоны (запад / пештак / двор) лежат СТРОГО внутри контура
    // OUTER_W × OUTER_D. Крыша = 4 строго стыкующиеся плиты вокруг
    // открытого двора COURT_W × COURT_D. Минареты — снаружи углов.
    // ══════════════════════════════════════════════════════════════
    const OUTER_W = 30;   // ширина (восток-запад) — длинная сторона
    const OUTER_D = 19;   // глубина (север-юг) — короткая сторона
    const WH = 7.2;       // высота стен
    const WT = 1.6;       // толщина внешних стен
    const RT = 0.55;      // толщина крыши

    const COURT_W = 13;   // ширина открытого двора
    const COURT_D = 11;   // глубина открытого двора

    // ширина "рамки" крыши/корпуса по сторонам от двора
    const SIDE_W = (OUTER_W - COURT_W) / 2; // запад+восток крылья
    const SIDE_D = (OUTER_D - COURT_D) / 2; // север+юг крылья

    // x-координаты левого (запад) / правого (восток) крыла (их центров)
    const WEST_CX  = -OUTER_W / 2 + SIDE_W / 2;
    const EAST_CX  =  OUTER_W / 2 - SIDE_W / 2;
    const NORTH_CZ = -OUTER_D / 2 + SIDE_D / 2;
    const SOUTH_CZ =  OUTER_D / 2 - SIDE_D / 2;

    // ── ЗЕМЛЯ ───────────────────────────────────────────────────
    mesh(new THREE.PlaneGeometry(130, 130), mGround, 0, 0, 0, -Math.PI / 2);
    mesh(new THREE.PlaneGeometry(OUTER_W + 16, OUTER_D + 14), mPave, 0, 0.02, 0, -Math.PI / 2);

    // декоративные плиты вокруг
    for (let xi = -3; xi <= 3; xi++) for (let zi = -2; zi <= 2; zi++) {
      if (Math.abs(xi) <= 2 && Math.abs(zi) <= 1) continue;
      mesh(new THREE.PlaneGeometry(3.6, 3.6), mSD, xi * 4.2, 0.03, zi * 4.2, -Math.PI / 2);
    }

    // ── ВНЕШНИЕ СТЕНЫ (полный замкнутый контур OUTER_W×OUTER_D) ──
    box(OUTER_W, WH, WT, mStone, 0, WH / 2, -OUTER_D / 2 + WT / 2);          // север
    box(OUTER_W, WH, WT, mStone, 0, WH / 2,  OUTER_D / 2 - WT / 2);          // юг
    box(WT, WH, OUTER_D, matWestWall, -OUTER_W / 2 + WT / 2, WH / 2, 0, 'west_side'); // запад
    box(WT, WH, OUTER_D, mStone,  OUTER_W / 2 - WT / 2, WH / 2, 0);          // восток (фон под пештаком)

    // ── ОТКРЫТЫЙ ДВОР (Clickable, в самом центре) ────────────────
    box(COURT_W, 0.15, COURT_D, matCourtyard, 0, 0.08, 0, 'courtyard');
    // бассейн
    box(3.4, 0.3, 3.4, mWin, 0, 0.2, 0);
    const poolMat = new THREE.MeshPhongMaterial({ color: '#173a5c', shininess: 220, specular: '#a8d8ff' });
    mesh(new THREE.PlaneGeometry(3.1, 3.1), poolMat, 0, 0.36, 0, -Math.PI / 2);

    // ── КРЫША: 4 плиты, ИДЕАЛЬНО стыкующиеся вокруг двора ────────
    // Север (вся ширина)
    box(OUTER_W - WT, RT, SIDE_D, mSL, 0, WH + RT / 2, NORTH_CZ);
    // Юг (вся ширина)
    box(OUTER_W - WT, RT, SIDE_D, mSL, 0, WH + RT / 2, SOUTH_CZ);
    // Запад (между север/юг плитами, по глубине двора)
    box(SIDE_W - WT/2, RT, COURT_D, mSL, WEST_CX + WT/4, WH + RT / 2, 0, 'west_side');
    // Восток (под пештаком — он "прорастает" сквозь эту плиту)
    box(SIDE_W - WT/2, RT, COURT_D, mSL, EAST_CX - WT/4, WH + RT / 2, 0);

    // Золотой контур по периметру крыши (карниз)
    const trimY = WH + RT + 0.05;
    box(OUTER_W, 0.18, 0.18, mGold, 0, trimY, NORTH_CZ - SIDE_D/2 + 0.09);
    box(OUTER_W, 0.18, 0.18, mGold, 0, trimY, SOUTH_CZ + SIDE_D/2 - 0.09);
    box(0.18, 0.18, OUTER_D, mGold, -OUTER_W/2 + 0.09, trimY, 0);
    box(0.18, 0.18, OUTER_D, mGold,  OUTER_W/2 - 0.09, trimY, 0);

    // ── ЗАПАДНЫЙ ФАСАД: окна худжр (Clickable, материал зоны) ────
    for (const zo of [-7, -3.5, 0, 3.5, 7]) {
      box(0.25, 2.0, 1.3, mWin, -OUTER_W/2 + 0.1, WH * 0.5, zo);
    }
    // декоративные ниши-арки на западной стене
    for (const zo of [-7, -3.5, 0, 3.5, 7]) {
      box(0.18, 2.6, 1.6, mSL, -OUTER_W/2 - 0.05, WH * 0.5, zo);
    }

    // ── ИВАНИ (айваны по периметру двора) ─────────────────────────
    // Северный
    box(7.5, WH * 0.92, WT + 0.5, mSL, 0, WH * 0.46, -OUTER_D/2 + WT/2);
    box(4.3, WH * 0.62, WT + 1.1, mWin, 0, WH * 0.32, -OUTER_D/2 + WT/2);
    box(0.3, WH*0.92, 0.5, mGoldD, -2.1, WH*0.46, -OUTER_D/2 + WT/2 + 0.3);
    box(0.3, WH*0.92, 0.5, mGoldD,  2.1, WH*0.46, -OUTER_D/2 + WT/2 + 0.3);
    // Южный
    box(7.5, WH * 0.92, WT + 0.5, mSL, 0, WH * 0.46,  OUTER_D/2 - WT/2);
    box(4.3, WH * 0.62, WT + 1.1, mWin, 0, WH * 0.32,  OUTER_D/2 - WT/2);
    // Западный (внутрь от стены худжр)
    box(WT + 0.5, WH * 0.88, 6.5, mSL, WEST_CX + SIDE_W/2 - 0.3, WH * 0.44, 0);
    box(WT + 1.0, WH * 0.6,  3.6, mWin, WEST_CX + SIDE_W/2 - 0.2, WH * 0.32, 0);

    // ── ПЕШТАК (восточная сторона, Clickable, возвышается над крышей) ──
    const PH = WH + 7.5;
    const PW = 6.4;
    const PX = EAST_CX + 0.4;

    box(WT + 1.2, PH, PW, matPortal, PX, PH / 2, 0, 'portal');
    // боковые пилоны
    box(0.9, PH - 0.6, 1.1, mSL, PX - 0.15, (PH-0.6)/2,  PW/2 - 0.55);
    box(0.9, PH - 0.6, 1.1, mSL, PX - 0.15, (PH-0.6)/2, -PW/2 + 0.55);
    // входная арка
    box(WT + 2.0, 5.0, 3.1, mWin, PX + 0.2, 2.5, 0);
    box(WT + 2.2, 5.4, 0.25, mGoldD, PX + 0.25, 2.7, 1.6);
    box(WT + 2.2, 5.4, 0.25, mGoldD, PX + 0.25, 2.7, -1.6);
    // золотой карниз
    box(WT + 1.6, 0.5, PW + 0.6, mGold, PX, PH + 0.25, 0);
    box(WT + 1.3, 0.28, PW + 0.3, mGold, PX, PH + 0.65, 0);
    // мозаичные плиты пештака
    box(0.12, PH - 1.5, PW - 0.6, mTile, PX + 0.75, (PH - 1.5)/2 + 0.5, 0);
    // вертикальные золотые полосы по краям мозаики
    box(0.16, PH - 1.5, 0.15, mGold, PX + 0.78, (PH-1.5)/2 + 0.5, PW/2 - 0.55);
    box(0.16, PH - 1.5, 0.15, mGold, PX + 0.78, (PH-1.5)/2 + 0.5, -PW/2 + 0.55);

    // ── КУПОЛА на айванах (тканевый ребристый паттерн) ────────────
    dome(2.1, mDome, 0, WH + RT + 0.05, SOUTH_CZ);
    cyl(0.16, 0.32, 1.0, 8, mGold, 0, WH + RT + 2.75, SOUTH_CZ);
    dome(2.1, mDomeD, 0, WH + RT + 0.05, NORTH_CZ);
    cyl(0.16, 0.32, 1.0, 8, mGold, 0, WH + RT + 2.75, NORTH_CZ);

    // ── 4 МИНАРЕТА (Clickable) — снаружи углов, повыше и стройнее ──
    const MH = WH + 13.5;
    const corners = [
      [-OUTER_W/2 - 1.5, -OUTER_D/2 - 1.5],
      [ OUTER_W/2 - 1.5 + SIDE_W*0 + 3.0, -OUTER_D/2 - 1.5], // правый угол чуть смещён под пештак
      [-OUTER_W/2 - 1.5,  OUTER_D/2 + 1.5],
      [ OUTER_W/2 - 1.5 + 3.0,  OUTER_D/2 + 1.5],
    ];
    corners.forEach(([mx, mz]) => {
      box(3.0, 1.7, 3.0, mSD, mx, 0.85, mz);
      cyl(0.92, 1.12, 1.9, 8, mStone, mx, 2.65, mz);
      cyl(0.74, 0.92, MH - 5.3, 18, matMinaret, mx, (MH - 5.3) / 2 + 3.6, mz, 'minarets');
      cyl(1.28, 1.18, 0.4, 18, mGold, mx, MH - 4.1, mz);
      cyl(0.6, 0.74, 2.9, 14, mSL, mx, MH - 2.45, mz);
      cyl(1.06, 0.95, 0.32, 14, mGold, mx, MH - 1.05, mz);
      dome(0.7, mDomeD, mx, MH - 0.75 + 0.75, mz);
      cyl(0, 0.1, 1.3, 6, mGold, mx, MH + 0.65, mz);
    });

    // окна на сев/юж стенах
    for (const xo of [-10, -5, 0, 5, 10]) {
      if (Math.abs(xo) < 4) continue;
      box(1.3, 2.4, 0.3, mWin, xo, WH * 0.56, -OUTER_D/2 + 0.1);
      box(1.3, 2.4, 0.3, mWin, xo, WH * 0.56,  OUTER_D/2 - 0.1);
    }

    // ── КАМЕРА: орбита ────────────────────────────────────────────
    const orb = { theta: 0.4, phi: 0.95, r: 58, ty: 3 };
    const applyCamera = () => {
      camera.position.set(
        orb.r * Math.sin(orb.phi) * Math.sin(orb.theta),
        orb.r * Math.cos(orb.phi) + orb.ty,
        orb.r * Math.sin(orb.phi) * Math.cos(orb.theta)
      );
      camera.lookAt(0, orb.ty, 0);
    };
    applyCamera();

    // ── УПРАВЛЕНИЕ МЫШЬЮ ────────────────────────────────────────
    let dragging = false, moved = false;
    let prev = { x: 0, y: 0 };

    const onDown = (cx, cy) => { dragging = true; moved = false; prev = { x: cx, y: cy }; };
    const onMove = (cx, cy) => {
      if (!dragging) return;
      const dx = cx - prev.x, dy = cy - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      orb.theta -= dx * 0.006;
      // ФИХ: тянешь вниз → камера поднимается (видно крышу/верх), тянешь вверх → камера опускается
      orb.phi = Math.max(0.18, Math.min(1.4, orb.phi - dy * 0.006));
      prev = { x: cx, y: cy };
      applyCamera();
    };

    const onMouseDown = e => { mount.style.cursor = 'grabbing'; onDown(e.clientX, e.clientY); };
    const onMouseMove = e => {
      if (!dragging) {
        const rect = mount.getBoundingClientRect();
        const rc = new THREE.Raycaster();
        rc.setFromCamera(new THREE.Vector2(((e.clientX - rect.left)/rect.width)*2-1, -((e.clientY-rect.top)/rect.height)*2+1), camera);
        mount.style.cursor = rc.intersectObjects(clickables).length > 0 ? 'pointer' : 'grab';
      }
      onMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => { mount.style.cursor = 'grab'; dragging = false; };

    const onTouchStart = e => { if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchMove  = e => { if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchEnd   = () => { dragging = false; };

    const onWheel = e => {
      e.preventDefault();
      orb.r = Math.max(24, Math.min(95, orb.r + e.deltaY * 0.06));
      applyCamera();
    };

    const onClick = e => {
      if (moved) return;
      const rect = mount.getBoundingClientRect();
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1, -((e.clientY-rect.top)/rect.height)*2+1), camera);
      const hits = rc.intersectObjects(clickables);
      if (hits.length > 0) onSelectZone(hits[0].object.userData.poiId);
    };

    mount.addEventListener('mousedown', onMouseDown);
    mount.addEventListener('mousemove', onMouseMove);
    mount.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('click', onClick);
    mount.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    mount.addEventListener('touchmove', onTouchMove, { passive: true });
    mount.addEventListener('touchend', onTouchEnd);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let raf;
    const animate = () => { raf = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    threeRef.current = { ZM, BASE, C };

    return () => {
      cancelAnimationFrame(raf);
      mount.removeEventListener('mousedown', onMouseDown);
      mount.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('click', onClick);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('touchstart', onTouchStart);
      mount.removeEventListener('touchmove', onTouchMove);
      mount.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      threeRef.current = null;
    };
  }, [highContrast]);

  // Подсветка выбранной зоны
  useEffect(() => {
    if (!threeRef.current) return;
    const { ZM, BASE, C } = threeRef.current;
    Object.entries(ZM).forEach(([id, mat]) => {
      BASE[id]();
      if (id === selectedPoiId) {
        mat.color.set(C.active);
        mat.emissive.set(C.active);
        mat.emissiveIntensity = 0.2;
      }
    });
  }, [selectedPoiId]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />;
}