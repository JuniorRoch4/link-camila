// ===================================================
// ESFERAS 3D ANIMADAS — cluster de vidro para dar profundidade ao hero.
// Uma das esferas ("logoOrb") carrega o nome dela fixo: a cada frame,
// projetamos sua posição 3D para coordenadas de tela e movemos o
// elemento .hero__logo para lá, então o texto "gruda" na esfera.
// ===================================================
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('orb-canvas');
const logoEl = document.querySelector('.hero__logo');

if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 4.8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const TINTS = [0xC9A6FF, 0xFF8FB3, 0xFFCB80];

  function makeMaterial(colorHex) {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 0.15,
      roughness: 0.12,
      transmission: 0.85,
      thickness: 1.2,
      iridescence: 1,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 400],
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.4,
    });
  }

  // cluster de esferas: a primeira (maior, mais à frente) carrega a logo
  const ORB_CONFIGS = [
    { radius: 0.85, pos: [1.05, 0.15, 0.4],  tint: 0, speed: 1,    isLogo: true },
    { radius: 0.5,  pos: [-1.6, 0.55, -0.6], tint: 1, speed: 0.7 },
    { radius: 0.32, pos: [-0.75, -0.9, 0.5], tint: 2, speed: 1.3 },
    { radius: 0.42, pos: [1.85, -0.75, -0.9],tint: 1, speed: 0.85 },
    { radius: 0.26, pos: [0.15, 1.3, -1.1],  tint: 0, speed: 1.1 },
  ];

  const orbs = ORB_CONFIGS.map((cfg) => {
    const geometry = new THREE.IcosahedronGeometry(cfg.radius, 5);
    const mesh = new THREE.Mesh(geometry, makeMaterial(TINTS[cfg.tint]));
    mesh.position.set(...cfg.pos);
    scene.add(mesh);
    return { mesh, cfg };
  });

  const logoOrb = orbs.find((o) => o.cfg.isLogo) || orbs[0];

  const keyLight = new THREE.PointLight(0xFF3D77, 8, 20);
  keyLight.position.set(3, 3, 3);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7C3AED, 5, 20);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // Interação sutil com o mouse (parallax)
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
  const projected = new THREE.Vector3();

  function animate() {
    const t = clock.getElapsedTime();

    orbs.forEach(({ mesh, cfg }, i) => {
      const phase = t * cfg.speed + i * 1.7;
      mesh.rotation.y = phase * 0.15 + mouseX * 0.25;
      mesh.rotation.x = Math.sin(phase * 0.2) * 0.15 + mouseY * 0.12;
      mesh.position.y = cfg.pos[1] + Math.sin(phase * 0.6) * 0.14;
      mesh.position.x = cfg.pos[0] + mouseX * 0.08;
    });

    // gruda o nome na esfera "logo": projeta a posição 3D dela para pixels de tela
    if (logoEl) {
      logoOrb.mesh.updateWorldMatrix(true, false);
      projected.setFromMatrixPosition(logoOrb.mesh.matrixWorld).project(camera);
      const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
      logoEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
