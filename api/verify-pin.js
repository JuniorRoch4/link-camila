// Verifica o PIN da página de upload no servidor, longe do código-fonte
// que qualquer visitante pode ler. O valor real fica só na variável de
// ambiente UPLOAD_PIN (Vercel > Settings > Environment Variables).
module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  const expected = process.env.UPLOAD_PIN;
  if (!expected) {
    res.status(500).json({ ok: false, error: 'PIN não configurado no servidor.' });
    return;
  }

  const { pin } = req.body || {};
  res.status(200).json({ ok: typeof pin === 'string' && pin === expected });
};
