// ===================================================
// ESFERAS 3D LÍQUIDAS METALIZADAS — cluster de profundidade no hero.
// O .hero__stage (nome + foto + texto) flutua em sincronia com o
// cluster via CSS custom properties, atualizadas a cada frame.
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

  // mapa de ambiente gerado (gradiente da marca + realce), sem depender de HDRI externo —
  // é o que dá o reflexo colorido "líquido metalizado" nas esferas
  function createEnvTexture() {
    const w = 128, h = 64;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2a1a40');
    grad.addColorStop(0.35, '#7C3AED');
    grad.addColorStop(0.6, '#FF3D77');
    grad.addColorStop(0.82, '#FFB84D');
    grad.addColorStop(1, '#160f1f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.22, w * 0.1, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  scene.environment = createEnvTexture();

  const TINTS = [0xE4D4FF, 0xFFC2D6, 0xFFE1B3];

  function makeMaterial(colorHex) {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 1,
      roughness: 0.22,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
      iridescence: 0.4,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 400],
      envMapIntensity: 1.6,
    });
  }

  // cluster de esferas líquidas para dar profundidade ao redor do nome/foto
  const ORB_CONFIGS = [
    { radius: 0.95, pos: [1.5, 0.5, -0.6],  tint: 0, speed: 1 },
    { radius: 0.6,  pos: [-1.7, -0.6, -0.3], tint: 1, speed: 0.75 },
    { radius: 0.4,  pos: [-1.2, 1.0, 0.2],  tint: 2, speed: 1.25 },
    { radius: 0.5,  pos: [1.9, -0.9, -0.5], tint: 1, speed: 0.9 },
    { radius: 0.3,  pos: [0.1, 1.6, -0.8],  tint: 2, speed: 1.1 },
  ];

  const orbs = ORB_CONFIGS.map((cfg) => {
    const geometry = new THREE.IcosahedronGeometry(cfg.radius, 4);
    const mesh = new THREE.Mesh(geometry, makeMaterial(TINTS[cfg.tint]));
    mesh.position.set(...cfg.pos);
    scene.add(mesh);
    return { mesh, cfg };
  });

  const keyLight = new THREE.PointLight(0xFF3D77, 8, 20);
  keyLight.position.set(3, 3, 3);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7C3AED, 5, 20);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  // Interação sutil com o mouse (parallax) — sem efeito em touch, o que é ok
  let mouseX = 0, mouseY = 0;
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    orbs.forEach(({ mesh, cfg }, i) => {
      const phase = t * cfg.speed + i * 1.7;
      mesh.rotation.y = phase * 0.2 + mouseX * 0.25;
      mesh.rotation.x = Math.sin(phase * 0.25) * 0.2 + mouseY * 0.12;
      mesh.position.y = cfg.pos[1] + Math.sin(phase * 0.6) * 0.16;
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
