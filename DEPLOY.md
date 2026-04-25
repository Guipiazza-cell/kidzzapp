# 🚀 DEPLOY KIDZZAPP — Web, App Store & Google Play

Este guia leva o KIDZZAPP de PWA (web) para um app nativo publicado nas lojas usando **Capacitor**.

> ⚠️ **Importante**: o Capacitor precisa rodar **na sua máquina local** (não dentro do editor Lovable). Você precisa do projeto exportado para o GitHub e clonado localmente.

---

## 📦 PRÉ-REQUISITOS

| Plataforma | Requisitos |
|------------|------------|
| **iOS**    | Mac com macOS 13+ • Xcode 15+ • Conta Apple Developer ($99/ano) • CocoaPods (`sudo gem install cocoapods`) |
| **Android**| Android Studio (qualquer SO) • JDK 17+ • Conta Google Play Console ($25 único) |
| **Comum**  | Node 18+ • Bun ou npm • Git |

---

## 🛠️ PASSO 1 — PREPARAR O PROJETO LOCAL

```bash
# 1. Exporte o projeto para GitHub pelo botão "Export to GitHub" no Lovable.
# 2. Clone localmente:
git clone https://github.com/SEU_USUARIO/kidzzapp.git
cd kidzzapp

# 3. Instale dependências:
bun install   # (ou npm install)
```

---

## 🛠️ PASSO 2 — INSTALAR CAPACITOR

```bash
bun add @capacitor/core @capacitor/ios @capacitor/android
bun add -d @capacitor/cli

# Plugins recomendados:
bun add @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard \
        @capacitor/haptics @capacitor/app @capacitor/preferences
```

O arquivo `capacitor.config.ts` já está incluso na raiz — não precisa rodar `npx cap init`.

---

## 🛠️ PASSO 3 — ADICIONAR PLATAFORMAS NATIVAS

```bash
bun run build           # Gera /dist
npx cap add ios         # Cria pasta /ios (só Mac)
npx cap add android     # Cria pasta /android
npx cap sync            # Copia /dist + plugins para nativo
```

> 💡 Toda vez que mudar código web: `bun run build && npx cap sync`

---

## 🛠️ PASSO 4 — ÍCONES & SPLASH

```bash
bun add -d @capacitor/assets

# Coloque um icon.png (1024x1024) e splash.png (2732x2732) em /resources
npx capacitor-assets generate
```

---

## 🍎 PASSO 5 — BUILD iOS (App Store)

```bash
npx cap open ios   # Abre Xcode
```

No Xcode:
1. Selecione o target **App** → tab **Signing & Capabilities**
2. Marque **Automatically manage signing**
3. Escolha seu **Team** (Apple Developer)
4. **Bundle Identifier**: `com.kidzzapp.app` (já configurado)
5. Configure **Display Name**, **Version**, **Build**
6. Adicione capabilities: **Push Notifications** (se for usar), **In-App Purchase** (para assinatura)

### Submeter para App Store
1. Em Xcode: **Product → Archive**
2. Quando terminar, clique **Distribute App → App Store Connect → Upload**
3. Em [App Store Connect](https://appstoreconnect.apple.com): crie o app, preencha metadados, screenshots (6.7" iPhone obrigatório), descrição, política de privacidade
4. **Review** leva 24-48h. Comum recusarem por: política de privacidade fraca, conteúdo infantil sem COPPA compliance, paywall confuso

### ✅ Checklist iOS
- [ ] Ícones gerados (`@capacitor/assets`)
- [ ] Splash screen testado em iPhone real
- [ ] Política de privacidade publicada (já existe em `/privacy`)
- [ ] App categorizado como **Education** + faixa **4+**
- [ ] Screenshots 6.7" + 6.5" + 5.5"
- [ ] Description em pt-BR + en-US
- [ ] Keywords (kids, education, learning, IA, criança)
- [ ] Support URL e Marketing URL configurados
- [ ] **Kids Category Disclosure**: declarar coleta de dados de menores (sim, com consentimento dos pais)
- [ ] Testado com TestFlight antes de submeter

---

## 🤖 PASSO 6 — BUILD ANDROID (Google Play)

```bash
npx cap open android   # Abre Android Studio
```

No Android Studio:
1. **Build → Generate Signed Bundle/APK → Android App Bundle (AAB)**
2. Crie um **keystore novo** (guarde a senha — sem ela você nunca mais publica updates!)
3. Build em modo **release**
4. AAB gerado em: `android/app/release/app-release.aab`

### Submeter para Google Play
1. Acesse [Play Console](https://play.google.com/console)
2. **Create app** → KIDZZAPP → Game/App: App, Free, com IAP
3. Preencha: ficha da loja, classificação etária (Designed for Families), política de privacidade, contato
4. Upload do `.aab` em **Production → Create new release**
5. Review: 1-7 dias. Comum recusarem por: ausência de Data Safety completo, declaração de público infantil sem **Families Policy** compliance

### ✅ Checklist Android
- [ ] AAB assinado com keystore (NUNCA perca o keystore!)
- [ ] `versionCode` e `versionName` em `android/app/build.gradle`
- [ ] Ícone adaptativo (foreground + background)
- [ ] Screenshots Phone + Tablet (mín 2 cada)
- [ ] Feature graphic 1024x500
- [ ] **Designed for Families** opt-in
- [ ] Data Safety form preenchido (declarar IA, dados de uso, sem dados pessoais sensíveis)
- [ ] Política de privacidade pública e linkada
- [ ] Testado em **Internal Testing** antes de Production

---

## 🔄 WORKFLOW DIA A DIA

```bash
# Mudou código web no Lovable / no seu editor:
bun run build
npx cap sync

# Rodar em emulador / dispositivo:
npx cap run ios
npx cap run android

# Live reload (mudanças aparecem sem rebuild) — útil em dev:
npx cap run ios --livereload --external
```

---

## ⚖️ COMPLIANCE — APPS PARA CRIANÇAS

KIDZZAPP é direcionado a crianças de 3-10 anos. **Atenção redobrada**:

- **Apple**: Kids Category exige privacidade reforçada — sem analytics third-party, sem ads behaviorais, link para política dentro do app
- **Google Play Families Policy**: mesmo conjunto de regras + Designed for Families opt-in
- **COPPA (EUA)**: consentimento parental verificável para menores de 13
- **LGPD (Brasil)**: consentimento explícito do responsável

Tudo isso já é parcialmente coberto pelo **Controle Parental** com PIN do app — mas revise antes de publicar.

---

## 🆘 PROBLEMAS COMUNS

| Erro | Solução |
|------|---------|
| `Pod install failed` | `cd ios/App && pod repo update && pod install` |
| `Gradle build failed` | Atualize Android Studio + JDK 17, `cd android && ./gradlew clean` |
| `App branco no abrir` | Verifique `webDir: "dist"` e que rodou `bun run build` antes do `cap sync` |
| Hot reload não funciona | Confirme que `server.url` no `capacitor.config.ts` está acessível e o celular está na mesma rede Wi-Fi |
| Crash no startup iOS | Limpe DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/*` |

---

## 📚 DOCS OFICIAIS

- [Capacitor Docs](https://capacitorjs.com/docs)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335)

---

**Boa publicação! 🚀** Qualquer dúvida, abra issue no repo ou contate kidzz.ia@icloud.com.
