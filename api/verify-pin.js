// Verifica o PIN da página de upload no servidor, longe do código-fonte
// que qualquer visitante pode ler. O valor real fica só na variável de
// ambiente UPLOAD_PIN (Vercel > Settings > Environment Variables).
const { safeCompare } = require('./_safe-compare');
const { isRateLimited } = require('./_rate-limit');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  if (isRateLimited(req)) {
    res.status(429).json({ ok: false, error: 'Muitas tentativas. Tenta de novo mais tarde.' });
    return;
  }

  const expected = process.env.UPLOAD_PIN;
  if (!expected) {
    res.status(500).json({ ok: false, error: 'PIN não configurado no servidor.' });
    return;
  }

  const { pin } = req.body || {};
  res.status(200).json({ ok: safeCompare(pin, expected) });
};
