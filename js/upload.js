// ===================================================
// PÁGINA DE UPLOAD — PIN simples de acesso + widget da
// Cloudinary. O PIN só barra visitantes casuais (fica
// visível no código-fonte pra quem procurar); não é
// segurança de verdade, só um filtro rápido.
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
  const PIN = '2026camila'; // <- troque aqui pra mudar o PIN de acesso

  const pinGate = document.getElementById('pinGate');
  const uploadArea = document.getElementById('uploadArea');
  const pinInput = document.getElementById('pinInput');
  const pinSubmit = document.getElementById('pinSubmit');
  const pinError = document.getElementById('pinError');

  const unlock = () => {
    pinGate.hidden = true;
    uploadArea.hidden = false;
    sessionStorage.setItem('portfolioUploadUnlocked', '1');
  };

  if (sessionStorage.getItem('portfolioUploadUnlocked') === '1') {
    unlock();
  }

  const tryUnlock = () => {
    if (pinInput.value === PIN) {
      unlock();
    } else {
      pinError.hidden = false;
      pinInput.value = '';
      pinInput.focus();
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
