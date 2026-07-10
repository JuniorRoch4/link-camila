// ===================================================
// ESFERA 3D ANIMADA — elemento de assinatura do hero
// A logo (.hero__orb-stage, que contém foto + nome) se move
// em sincronia com a esfera via CSS custom properties.
// ===================================================
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('orb-canvas');
const stage = document.querySelector('.hero__orb-stage');

if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 4.6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Geometria: icosaedro suavizado, para leveza (sem MeshTransmission pesado)
  const geometry = new THREE.IcosahedronGeometry(1.5, 6);

  // Material perolado: simula vidro/cromado tingido no gradiente violeta/rosa da marca
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xC9A6FF,
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

  const orb = new THREE.Mesh(geometry, material);
  orb.position.set(0, 0.05, 0);
  scene.add(orb);

  // Luzes no tom da marca (rosa + violeta) para dar volume ao vidro
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

  function animate() {
    const t = clock.getElapsedTime();

    orb.rotation.y = t * 0.15 + mouseX * 0.3;
    orb.rotation.x = Math.sin(t * 0.2) * 0.15 + mouseY * 0.15;
    orb.position.y = 0.05 + Math.sin(t * 0.6) * 0.12;

    // sincroniza a foto + nome (filhos de .hero__orb-stage) com o movimento da esfera
    if (stage) {
      stage.style.setProperty('--orb-x', `${mouseX * 14}px`);
      stage.style.setProperty('--orb-y', `${Math.sin(t * 0.6) * 10 + mouseY * 8}px`);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
