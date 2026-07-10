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
});
