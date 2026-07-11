// ===================================================
// SCROLL REVEAL — cards/seções aparecem ao rolar
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), (i % 6) * 90);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ===================================================
  // HEADER — fica transparente assim que a página rola
  // ===================================================
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    const toggleHeader = () => {
      siteHeader.classList.toggle('site-header--scrolled', window.scrollY > 10);
    };
    toggleHeader();
    window.addEventListener('scroll', toggleHeader, { passive: true });
  }

  // ===================================================
  // BOTÃO FLUTUANTE — aparece depois que o hero sai de vista
  // ===================================================
  const floatingCta = document.querySelector('.floating-cta');
  const hero = document.getElementById('hero');

  if (floatingCta && hero) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      floatingCta.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0 });

    heroObserver.observe(hero);
  }

  // ===================================================
  // CARD DA FOTO — tilt 3D sutil ao passar mouse/dedo por cima
  // ===================================================
  const photoCard = document.querySelector('.hero__photo-box');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (photoCard && !reduceMotion) {
    const base = { x: 6, y: -10 };

    photoCard.addEventListener('pointermove', (e) => {
      const rect = photoCard.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = base.x - py * 16;
      const ry = base.y + px * 16;
      photoCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    const resetTilt = () => {
      photoCard.style.transform = `rotateX(${base.x}deg) rotateY(${base.y}deg)`;
    };
    photoCard.addEventListener('pointerleave', resetTilt);
    photoCard.addEventListener('pointerup', resetTilt);
  }

  // ===================================================
  // VÍDEO DO MEDIA KIT — reforça autoplay em todo aparelho
  // (alguns navegadores mobile ignoram o autoplay do HTML
  // sozinho, principalmente em conexão de dados/economia de bateria)
  // ===================================================
  const statsVideo = document.querySelector('.stats__video-el');

  if (statsVideo) {
    statsVideo.muted = true;
    statsVideo.playsInline = true;

    const tryPlay = () => statsVideo.play().catch(() => {});

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) tryPlay();
        else statsVideo.pause();
      });
    }, { threshold: 0.25 });
    videoObserver.observe(statsVideo);

    tryPlay();
    ['touchstart', 'click', 'scroll'].forEach((evt) => {
      document.addEventListener(evt, tryPlay, { once: true, passive: true });
    });
  }
});
