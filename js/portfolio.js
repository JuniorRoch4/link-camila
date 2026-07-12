// ===================================================
// PORTFÓLIO DINÂMICO — busca fotos/vídeos marcados com a
// tag "portfolio" na Cloudinary e monta o grid sozinho.
// Basta ela subir um arquivo pela página upload.html que
// ele aparece aqui, sem precisar mexer no código.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('portfolioGrid');
  const emptyMsg = document.getElementById('portfolioEmpty');
  const config = window.CLOUDINARY_CONFIG;

  if (!grid || !config) return;

  const { cloudName, tag } = config;
  const isConfigured = cloudName && !cloudName.startsWith('COLOQUE');

  if (!isConfigured) {
    if (emptyMsg) emptyMsg.hidden = false;
    return;
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxClose = document.getElementById('lightboxClose');

  const openLightbox = (item) => {
    if (!lightbox || !lightboxContent) return;
    lightboxContent.innerHTML = '';

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.url;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      lightboxContent.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
      lightboxContent.appendChild(img);
    }

    lightbox.hidden = false;
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxContent) return;
    lightbox.hidden = true;
    lightboxContent.innerHTML = '';
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  fetch('/api/portfolio-list')
    .then((res) => (res.ok ? res.json() : { items: [] }))
    .then(({ items }) => {
      if (!items || !items.length) {
        if (emptyMsg) emptyMsg.hidden = false;
        return;
      }

      grid.innerHTML = '';

      const limit = grid.dataset.limit ? parseInt(grid.dataset.limit, 10) : null;
      const visibleItems = limit ? items.slice(0, limit) : items;

      const playableVideos = [];

      visibleItems.forEach((item, i) => {
        const isVideo = item.resourceType === 'video';
        const url = `https://res.cloudinary.com/${cloudName}/${item.resourceType}/upload/${item.public_id}.${item.format}`;
        const thumb = isVideo
          ? `https://res.cloudinary.com/${cloudName}/video/upload/so_1.0/${item.public_id}.jpg`
          : url;

        const card = document.createElement('div');
        card.className = `portfolio__card reveal${i % 2 === 0 ? ' reveal--right' : ''}`;
        card.dataset.type = isVideo ? 'video' : 'image';

        if (isVideo) {
          const video = document.createElement('video');
          video.className = 'portfolio__media';
          video.src = url;
          video.poster = thumb;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.preload = 'metadata';
          card.appendChild(video);
          playableVideos.push(video);

          const mute = document.createElement('span');
          mute.className = 'portfolio__mute';
          mute.setAttribute('aria-hidden', 'true');
          mute.textContent = '🔇';
          card.appendChild(mute);
        } else {
          const img = document.createElement('img');
          img.className = 'portfolio__media';
          img.src = thumb;
          img.alt = '';
          img.loading = 'lazy';
          card.appendChild(img);
        }

        card.addEventListener('click', () => openLightbox({ type: isVideo ? 'video' : 'image', url }));
        grid.appendChild(card);
      });

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), (idx % 6) * 90);
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      grid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

      if (playableVideos.length) {
        const playObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.play().catch(() => {});
            } else {
              entry.target.pause();
            }
          });
        }, { threshold: 0.6 });

        playableVideos.forEach((video) => playObserver.observe(video));
      }
    });
});
