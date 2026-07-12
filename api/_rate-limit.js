// Freio simples contra força bruta no PIN: no máximo MAX_ATTEMPTS tentativas
// por IP a cada WINDOW_MS. Fica em memória (por instância da função), então
// não é perfeito em escala, mas já dificulta bastante um ataque automatizado
// contra um site pequeno como esse.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

module.exports = { isRateLimited };
