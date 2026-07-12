// Apaga uma foto/vídeo do portfólio direto na Cloudinary. Protegido pelo mesmo
// PIN da página de upload (variável UPLOAD_PIN) e autenticado com
// CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET — nada disso fica no código.
const { safeCompare } = require('./_safe-compare');
const { isRateLimited } = require('./_rate-limit');

const CLOUD_NAME = 'xzsc2g3k';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  if (isRateLimited(req)) {
    res.status(429).json({ ok: false, error: 'Muitas tentativas. Tenta de novo mais tarde.' });
    return;
  }

  const expectedPin = process.env.UPLOAD_PIN;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!expectedPin || !apiKey || !apiSecret) {
    res.status(500).json({ ok: false, error: 'Servidor não configurado.' });
    return;
  }

  const { pin, resourceType, publicId } = req.body || {};

  if (!safeCompare(pin, expectedPin)) {
    res.status(401).json({ ok: false, error: 'PIN inválido.' });
    return;
  }

  if (
    typeof publicId !== 'string' ||
    !publicId ||
    !['image', 'video'].includes(resourceType)
  ) {
    res.status(400).json({ ok: false, error: 'Parâmetros inválidos.' });
    return;
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/${resourceType}/upload?public_ids[]=${encodeURIComponent(publicId)}`;

  try {
    const r = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await r.json();
    const deleted = data.deleted && data.deleted[publicId] === 'deleted';
    res.status(200).json({ ok: Boolean(deleted) });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Falha ao apagar.' });
  }
};
