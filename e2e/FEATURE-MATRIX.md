# Matriz de cobertura E2E — Kidzz

| Feature | Rota / aba | Spec | Status |
|---------|------------|------|--------|
| App shell / dock | `/` | S-001, S-002 | AUTOMATED |
| Perguntas hero + input | `chat` | S-010…S-015 | AUTOMATED |
| Descobrir temas | `discover` | S-020, S-021 | AUTOMATED |
| KALM home / pilares / SOS | `wellness` | S-030…S-033 | AUTOMATED |
| Sonhos | `dreams` | S-040 | AUTOMATED |
| Histórias | `explore` | S-041 | AUTOMATED |
| Brincar | `play` | S-050 | AUTOMATED |
| Bora | `bora` | S-051 | AUTOMATED |
| Rotina | `routine` | S-052 | AUTOMATED |
| Momentos | `moments` | S-060 | AUTOMATED |
| Cinema | `cinema` | S-061 | AUTOMATED |
| Música | `music` | S-062 | AUTOMATED (se no dock) |
| Memórias | `memories` | S-063 | AUTOMATED |
| Auth UI | `/auth` | S-071 | AUTOMATED |
| Privacy | `/privacy` | S-072 | AUTOMATED |
| Landing quiz | `/lp` | S-073 | AUTOMATED |
| 404 | `/*` | S-074 | AUTOMATED |
| Paywall CTA free | home | S-080 | AUTOMATED |
| Pergunta com IA (backend) | chat → API | — | MANUAL / staging |
| Stripe checkout | paywall | — | MANUAL / staging |
| Reset senha e-mail real | `/reset` | — | MANUAL / staging |
| OAuth Google/Apple | `/auth` | — | MANUAL |
| Parental gate PIN real | pais | — | MANUAL / expand |

Legenda: AUTOMATED = coberto por Playwright guest · MANUAL = precisa staging/secrets.
