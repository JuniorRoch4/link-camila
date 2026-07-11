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

  const fetchList = (resourceType) =>
    fetch(`https://res.cloudinary.com/${cloudName}/${resourceType}/list/${tag}.json`)
      .then((res) => (res.ok ? res.json() : { resources: [] }))
      .then((data) => (data.resources || []).map((r) => ({ ...r, resourceType })))
      .catch(() => []);

  Promise.all([fetchList('video'), fetchList('image')]).then(([videos, images]) => {
    const items = [...videos, ...images].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (!items.length) {
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }

    grid.innerHTML = '';

    items.forEach((res, i) => {
      const isVideo = res.resourceType === 'video';
      const url = `https://res.cloudinary.com/${cloudName}/${res.resourceType}/upload/${res.public_id}.${res.format}`;
      const thumb = isVideo
        ? `https://res.cloudinary.com/${cloudName}/video/upload/so_1.0/${res.public_id}.jpg`
        : url;

      const card = document.createElement('div');
      card.className = `portfolio__card reveal${i % 2 === 0 ? ' reveal--right' : ''}`;
      card.dataset.type = isVideo ? 'video' : 'image';

      const img = document.createElement('img');
      img.className = 'portfolio__media';
      img.src = thumb;
      img.alt = '';
      img.loading = 'lazy';
      card.appendChild(img);

      if (isVideo) {
        const play = document.createElement('span');
        play.className = 'portfolio__play';
        play.setAttribute('aria-hidden', 'true');
        card.appendChild(play);
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
  });
});
