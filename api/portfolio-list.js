// Busca as fotos/vídeos marcados com a tag "portfolio" direto na Cloudinary,
// autenticado com CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET (Vercel > Settings >
// Environment Variables). Existe porque a listagem pública (/list/tag.json) fica
// bloqueada por padrão em contas novas da Cloudinary — então o navegador não pode
// buscar direto, precisa passar por aqui.
const CLOUD_NAME = 'xzsc2g3k';
const TAG = 'portfolio';

const fetchByType = async (resourceType, auth) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/${resourceType}/tags/${TAG}?max_results=500`;
  const r = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.resources || []).map((item) => ({
    resourceType,
    public_id: item.public_id,
    format: item.format,
    created_at: item.created_at,
  }));
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    res.status(500).json({ error: 'Cloudinary não configurado no servidor.' });
    return;
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const [images, videos] = await Promise.all([
      fetchByType('image', auth),
      fetchByType('video', auth),
    ]);

    const items = [...images, ...videos].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar portfólio.' });
  }
};
