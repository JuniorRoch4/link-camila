// Assina o upload da Cloudinary no servidor, só depois de conferir o PIN.
// Sem essa assinatura o widget não consegue subir nada — fecha o buraco que
// existia com o preset "unsigned" (que qualquer um podia usar direto, sem PIN).
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  const expectedPin = process.env.UPLOAD_PIN;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!expectedPin || !apiSecret) {
    res.status(500).json({ ok: false, error: 'Servidor não configurado.' });
    return;
  }

  const { pin, paramsToSign } = req.body || {};

  if (typeof pin !== 'string' || pin !== expectedPin) {
    res.status(401).json({ ok: false, error: 'PIN inválido.' });
    return;
  }

  if (!paramsToSign || typeof paramsToSign !== 'object' || Array.isArray(paramsToSign)) {
    res.status(400).json({ ok: false, error: 'Parâmetros inválidos.' });
    return;
  }

  const toSign = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');

  res.status(200).json({ ok: true, signature });
};
