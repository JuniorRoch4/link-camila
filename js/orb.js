// ===================================================
// ESFERAS LÍQUIDAS METALIZADAS (cinza/prata) — cluster de profundidade no hero.
// Sem cor: reflexo em tons de cinza. "Líquidas" via wobble de escala
// (squash/stretch orgânico) em vez de geometria rígida.
// Reagem ao mouse/toque (parallax) e ao scroll (impulso de rotação).
// ===================================================
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('orb-canvas');
const stage = document.querySelector('.hero__stage');

if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 4.8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // mapa de ambiente em tons de cinza (sem cor) para reflexo tipo metal líquido/mercúrio
  function createEnvTexture() {
    const w = 128, h = 64;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#3a3a40');
    grad.addColorStop(0.35, '#9a9aa2');
    grad.addColorStop(0.55, '#e8e8ec');
    grad.addColorStop(0.8, '#6a6a72');
    grad.addColorStop(1, '#141416');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.2, w * 0.11, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  scene.environment = createEnvTexture();

  // tons neutros de cinza/prata — sem matiz colorido
  const TINTS = [0xC9C9CE, 0xB3B3B9, 0xE2E2E6];

  function makeMaterial(colorHex) {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.7,
    });
  }

  // cluster de esferas lisas (mais "líquidas" que um icosaedro facetado)
  const ORB_CONFIGS = [
    { radius: 0.95, pos: [1.5, 0.5, -0.6],   tint: 0, speed: 1 },
    { radius: 0.6,  pos: [-1.7, -0.6, -0.3], tint: 1, speed: 0.75 },
    { radius: 0.4,  pos: [-1.2, 1.0, 0.2],   tint: 2, speed: 1.25 },
    { radius: 0.5,  pos: [1.9, -0.9, -0.5],  tint: 1, speed: 0.9 },
    { radius: 0.3,  pos: [0.1, 1.6, -0.8],   tint: 2, speed: 1.1 },
  ];

  const orbs = ORB_CONFIGS.map((cfg) => {
    const geometry = new THREE.SphereGeometry(cfg.radius, 40, 40);
    const mesh = new THREE.Mesh(geometry, makeMaterial(TINTS[cfg.tint]));
    mesh.position.set(...cfg.pos);
    scene.add(mesh);
    return { mesh, cfg };
  });

  const keyLight = new THREE.PointLight(0xffffff, 7, 20);
  keyLight.position.set(3, 3, 3);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xcfd4e0, 4, 20);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  // parallax com mouse/toque (Pointer Events cobre os dois)
  let mouseX = 0, mouseY = 0;
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // impulso ao rolar a tela — dá a sensação de "líquido" reagindo ao movimento
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    scrollVelocity += (y - lastScrollY) * 0.015;
    lastScrollY = y;
  }, { passive: true });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    scrollVelocity *= 0.9; // decaimento do impulso de scroll

    orbs.forEach(({ mesh, cfg }, i) => {
      const phase = t * cfg.speed + i * 1.7;

      mesh.rotation.y = phase * 0.2 + mouseX * 0.3 + scrollVelocity * 0.4;
      mesh.rotation.x = Math.sin(phase * 0.25) * 0.2 + mouseY * 0.15;
      mesh.position.y = cfg.pos[1] + Math.sin(phase * 0.6) * 0.16 + scrollVelocity * 0.08;
      mesh.position.x = cfg.pos[0] + mouseX * 0.12;

      // wobble orgânico (squash/stretch) — dá a leitura de "líquido", sem custo de vértice
      const wobble = 0.08 + Math.min(Math.abs(scrollVelocity), 0.6) * 0.1;
      mesh.scale.set(
        1 + Math.sin(phase * 0.9) * wobble,
        1 + Math.sin(phase * 0.9 + 2.1) * wobble,
        1 + Math.sin(phase * 0.9 + 4.2) * wobble
      );
    });

    // flutuação compartilhada e discreta do bloco nome+foto, em sincronia com o cluster
    if (stage) {
      stage.style.setProperty('--orb-x', `${mouseX * 10}px`);
      stage.style.setProperty('--orb-y', `${Math.sin(t * 0.5) * 8 + mouseY * 6}px`);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
