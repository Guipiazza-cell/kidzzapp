# Kidzz E2E (Playwright)

Suite de testes **end-to-end reais** no browser, cobrindo o produto Kidzz.

## O que cobre

| Área | Spec | IDs |
|------|------|-----|
| Smoke shell + todas as abas | `00-smoke` | S-001, S-002 |
| Perguntas | `01-perguntas` | S-010…S-015 |
| Descobrir | `02-descobrir` | S-020, S-021 |
| KALM | `03-kalm` | S-030…S-033 |
| Sonhos + Histórias | `04-sonhos-historias` | S-040, S-041 |
| Brincar + Bora + Rotina | `05-brincar-bora-rotina` | S-050…S-052 |
| Momentos + Cinema + Música + Memórias | `06-…` | S-060…S-063 |
| Landing / Auth / Privacy / 404 | `07-landing-auth-routes` | S-070…S-074 |
| Paywall CTAs free | `08-paywall-gates` | S-080 |

## Como rodar

```bash
# instala browsers (1x)
npx playwright install chromium

# sobe o app + roda tudo
npm run test:e2e

# só smoke
npm run test:e2e -- e2e/specs/00-smoke.spec.ts

# UI mode
npm run test:e2e:ui

# relatório HTML
npx playwright show-report e2e-report
```

## Guest bootstrap

Não usa produção nem credenciais reais.

O setup (`e2e/auth.setup.ts`) grava um **perfil guest** em `localStorage`
(`kidzz_guest_profile` + flags de onboarding/splash) e salva em
`e2e/.auth/guest.json`.

## Limitações honestas (100% absoluto)

- **Pergunta com IA real / Stripe / e-mail de reset** exigem backend e secrets de **staging**.
  Os specs cobrem UI, navegação, CTAs e gates free; chamadas pagas ficam como
  `MANUAL_PROOF` / staging.
- **Login OAuth real** não é automatizado aqui (conta proibida / produção).
- Amplie com `E2E_BASE_URL` apontando para staging autenticado se quiser fluxos pagos.

## Estrutura

```
e2e/
  auth.setup.ts
  helpers/guest.ts
  helpers/nav.ts
  specs/*.spec.ts
  .auth/guest.json   (gerado)
e2e-report/          (gerado)
e2e-results/         (gerado)
playwright.config.ts
```
