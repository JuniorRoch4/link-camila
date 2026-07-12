// Config compartilhada entre a página de upload (upload.html) e o portfólio (index.html).
// apiKey aqui é a chave pública da Cloudinary (não é segredo, só identifica a conta).
// O upload é assinado no servidor (api/sign-upload.js) — sem isso ninguém sobe nada.
window.CLOUDINARY_CONFIG = {
  cloudName: 'xzsc2g3k',
  apiKey: '284114235818344',
  tag: 'portfolio',
};
