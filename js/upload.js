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

  pinToggle?.addEventListener('click', () => {
    const showing = pinInput.type === 'text';
    pinInput.type = showing ? 'password' : 'text';
    pinToggle.textContent = showing ? '👁️' : '🙈';
    pinToggle.setAttribute('aria-label', showing ? 'Mostrar PIN' : 'Ocultar PIN');
    pinToggle.setAttribute('aria-pressed', showing ? 'false' : 'true');
    pinInput.focus();
  });

  const unlock = () => {
    pinGate.hidden = true;
    uploadArea.hidden = false;
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

  openWidgetBtn.addEventListener('click', () => {
    const isConfigured = config && config.cloudName && !config.cloudName.startsWith('COLOQUE');

    if (!isConfigured) {
      alert('A conta da Cloudinary ainda não foi configurada em js/cloudinary-config.js.');
      return;
    }

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: config.cloudName,
        uploadPreset: config.uploadPreset,
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
        }
      }
    );

    widget.open();
  });
});
