// ===================================================
// PÁGINA DE UPLOAD — PIN de acesso + widget da Cloudinary.
// O PIN é conferido no servidor (api/verify-pin.js) contra a
// variável de ambiente UPLOAD_PIN, então nunca aparece no
// código que o navegador baixa. Ainda não é segurança de
// verdade (é só um filtro contra visitante casual), mas o
// valor em si fica fora do alcance de quem olhar o código.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  const pinGate = document.getElementById('pinGate');
  const uploadArea = document.getElementById('uploadArea');
  const pinInput = document.getElementById('pinInput');
  const pinSubmit = document.getElementById('pinSubmit');
  const pinError = document.getElementById('pinError');
  const pinToggle = document.getElementById('pinToggle');

  const eyeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  const eyeOffIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

  pinToggle?.addEventListener('click', () => {
    const showing = pinInput.type === 'text';
    pinInput.type = showing ? 'password' : 'text';
    pinToggle.innerHTML = showing ? eyeIcon : eyeOffIcon;
    pinToggle.setAttribute('aria-label', showing ? 'Mostrar PIN' : 'Ocultar PIN');
    pinToggle.setAttribute('aria-pressed', showing ? 'false' : 'true');
    pinInput.focus();
  });

  const unlock = () => {
    pinGate.hidden = true;
    uploadArea.hidden = false;
    loadManageGrid();
  };

  const tryUnlock = async () => {
    if (!pinInput.value) return;
    pinSubmit.disabled = true;
    pinError.hidden = true;

    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.value }),
      });
      const data = await res.json();

      if (data.ok) {
        unlock();
      } else {
        pinError.hidden = false;
        pinInput.value = '';
        pinInput.focus();
      }
    } catch (e) {
      pinError.hidden = false;
    } finally {
      pinSubmit.disabled = false;
    }
  };

  pinSubmit.addEventListener('click', tryUnlock);
  pinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });

  const config = window.CLOUDINARY_CONFIG;
  const openWidgetBtn = document.getElementById('openWidget');
  const uploadList = document.getElementById('uploadList');
  const manageGrid = document.getElementById('manageGrid');
  const manageEmpty = document.getElementById('manageEmpty');

  const loadManageGrid = async () => {
    if (!manageGrid) return;
    manageGrid.innerHTML = '';
    if (manageEmpty) manageEmpty.hidden = true;

    try {
      const res = await fetch('/api/portfolio-list');
      const { items } = await res.json();

      if (!items || !items.length) {
        if (manageEmpty) manageEmpty.hidden = false;
        return;
      }

      items.forEach((item) => {
        const isVideo = item.resourceType === 'video';
        const thumb = isVideo
          ? `https://res.cloudinary.com/${config.cloudName}/video/upload/so_1.0/${item.public_id}.jpg`
          : `https://res.cloudinary.com/${config.cloudName}/image/upload/${item.public_id}.${item.format}`;

        const card = document.createElement('div');
        card.className = 'upload__manage-card';

        const img = document.createElement('img');
        img.className = 'upload__manage-media';
        img.src = thumb;
        img.alt = '';
        img.loading = 'lazy';
        card.appendChild(img);

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'upload__manage-delete';
        del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        del.setAttribute('aria-label', 'Apagar');
        del.addEventListener('click', () => deleteItem(item, card));
        card.appendChild(del);

        manageGrid.appendChild(card);
      });
    } catch (e) {
      if (manageEmpty) {
        manageEmpty.hidden = false;
        manageEmpty.textContent = 'Não deu pra carregar o conteúdo publicado.';
      }
    }
  };

  const deleteItem = async (item, card) => {
    if (!confirm('Apagar esse conteúdo do site? Não dá pra desfazer.')) return;

    card.classList.add('is-deleting');

    try {
      const res = await fetch('/api/portfolio-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput.value,
          resourceType: item.resourceType,
          publicId: item.public_id,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        card.remove();
        if (manageGrid && !manageGrid.children.length && manageEmpty) {
          manageEmpty.hidden = false;
        }
      } else {
        card.classList.remove('is-deleting');
        alert('Não deu pra apagar. Tenta de novo.');
      }
    } catch (e) {
      card.classList.remove('is-deleting');
      alert('Não deu pra apagar. Tenta de novo.');
    }
  };

  openWidgetBtn.addEventListener('click', () => {
    const isConfigured = config && config.cloudName && !config.cloudName.startsWith('COLOQUE');

    if (!isConfigured) {
      alert('A conta da Cloudinary ainda não foi configurada em js/cloudinary-config.js.');
      return;
    }

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: config.cloudName,
        apiKey: config.apiKey,
        uploadSignature: (callback, paramsToSign) => {
          fetch('/api/sign-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: pinInput.value, paramsToSign }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.ok) callback(data.signature);
            });
        },
        tags: [config.tag],
        sources: ['local', 'camera'],
        multiple: true,
        resourceType: 'auto',
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          const item = document.createElement('li');
          item.textContent = `✔ Enviado: ${result.info.original_filename}`;
          uploadList.prepend(item);
          loadManageGrid();
        }
      }
    );

    widget.open();
  });
});
