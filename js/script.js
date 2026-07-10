// ===================================================
// SCROLL REVEAL — cards do portfólio aparecem ao rolar
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.portfolio__card');

  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((card) => observer.observe(card));
});
