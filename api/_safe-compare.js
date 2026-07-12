// Compara strings em tempo constante, pra não vazar pelo tempo de resposta
// quanto do PIN bateu certo (timing attack). Usado por todas as rotas que
// conferem o UPLOAD_PIN.
const crypto = require('crypto');

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // ainda faz uma comparação de tempo constante (contra si mesmo) pra não
    // retornar mais rápido só porque o tamanho já é diferente.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { safeCompare };
