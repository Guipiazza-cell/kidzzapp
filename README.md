# 🦎 KIDZZAPP — Aprender nunca foi tão divertido

App de aprendizado mágico para crianças de 3 a 10 anos, com IA educativa, Fábrica de Histórias, Mundo dos Sonhos, jogos e gamificação.

---

## 🌐 Web (Lovable)

O projeto roda nativamente no editor do Lovable. Para testar localmente:

```bash
bun install     # ou npm install
bun run dev     # http://localhost:8080
```

## 📦 Build de produção

```bash
bun run build
bun run preview
```

## 📱 PWA (instalável direto do navegador)

O app já vem configurado como **Progressive Web App**:

- `public/manifest.json` com nome, ícones, cores e atalhos
- Meta tags Apple para "Adicionar à Tela de Início" no iOS
- Service Worker (apenas em produção) com cache estratégico:
  - **Cache-first**: imagens, fontes, ícones
  - **Network-first**: chamadas Supabase / API
- Indicador de offline elegante (`OfflineIndicator`)
- Banner de instalação custom (`InstallPrompt`)

> ⚠️ O Service Worker é desligado dentro do iframe do editor Lovable para não atrapalhar o hot reload. Você só verá ele em ação no app publicado (`https://kidzzapp.lovable.app`) ou em build local.

## 📲 App nativo (App Store / Google Play)

Veja **[DEPLOY.md](./DEPLOY.md)** para o passo-a-passo completo com Capacitor — inclui checklist de submissão para iOS e Android, compliance COPPA/LGPD e troubleshooting.

Resumo rápido:

```bash
bun add @capacitor/core @capacitor/ios @capacitor/android
bun add -d @capacitor/cli
bun run build
npx cap add ios && npx cap add android
npx cap sync
npx cap open ios     # ou: npx cap open android
```

O arquivo `capacitor.config.ts` já está configurado (appId `com.kidzzapp.app`, splash, status bar laranja, hot reload do sandbox).

## 🧪 Testes

```bash
bun run test
```

## 🛠️ Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion
- Lovable Cloud (Supabase) para backend, auth e storage
- Lovable AI para geração de respostas, histórias e narração
- vite-plugin-pwa + Workbox

## 📞 Suporte

kidzz.ia@icloud.com
