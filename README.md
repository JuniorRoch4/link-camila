# Link in Bio — Criadora de Conteúdo (Beleza & Moda)

## Estrutura
```
site-criadora/
├── index.html          → estrutura da página (uma página só)
├── css/style.css        → todos os tokens de design (cores, fontes, espaçamentos)
├── js/script.js          → reveal de scroll, botão flutuante, tilt 3D da foto
└── assets/               → colocar fotos/vídeos reais aqui
```

## O que precisa trocar antes de publicar
1. **Nome dela** — em `index.html`, trocar "Nome / Sobrenome" (aparece 3x: título da página, hero, footer)
2. **Foto/vídeo do hero** — trocar `.hero__photo-placeholder` por uma tag `<img>` ou `<video>` real
3. **Portfólio** — trocar os 4 `.portfolio__media--placeholder` pelos reels/fotos reais dela
4. **WhatsApp** — trocar `55SEUNUMEROAQUI` no botão CTA pelo número real (formato: 5522999999999)
5. **Instagram** — trocar `SEUUSERNAME` pelo @ real
6. **Sobre / Serviços** — ajustar os textos de exemplo pela voz real dela

## Rodar localmente
Não precisa de build. Só abrir `index.html` no navegador, ou rodar um servidor local simples:
```bash
npx serve .
```

## Deploy (gratuito)
**Opção recomendada: Vercel**
1. Subir a pasta pro GitHub (repositório novo)
2. Conectar o repositório em vercel.com → Import Project
3. Deploy automático, domínio `.vercel.app` gerado na hora
4. Domínio próprio (ex: nomedela.com.br): comprar em registro.br (~R$40/ano) e apontar no painel da Vercel

**Alternativa:** Netlify (mesmo processo, drag-and-drop da pasta também funciona)

## Notas técnicas
- Grid do portfólio é responsivo (auto-fit), funciona de mobile a desktop sem breakpoints extras
- Tudo vanilla HTML/CSS/JS — mesmo padrão do projeto Zionn, fácil de manter
