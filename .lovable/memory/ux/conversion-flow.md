---
name: Conversion Flow
description: Gates premium emocionais por área (Histórias, SOS, Momentos, Wellness) e contextos de paywall
type: feature
---

## Filosofia
- FREE encanta. PREMIUM transforma a rotina.
- Paywalls aparecem APÓS momentos emocionais positivos, nunca de forma fria.
- Copy de continuidade: "Amanhã a aventura continua ✨", "Continue a jornada", "Vocês estão criando algo lindo 💚".

## Paywall contexts (src/lib/contextualPaywall.ts)
- `story_limit` — fim de quota de histórias
- `story_continuation` — após exibir história FREE, oferece capítulos contínuos
- `sos_journey` — após acolhimento+respiração+1ª dica do SOS para free users
- `wellness_journey` — gates em jornadas Wellness completas
- `sleep_story` / `sleep_sound` — Mundo dos Sonhos
- `moments` — missões Fábrica de Momentos (FREE_MISSIONS=1)
- `memories_old` / `lab_outfit` / `achievement` / `travel` / `question_limit` / `premium_feature`

## Gates por área

### Histórias (src/components/story/StoryDisplay.tsx)
- StoryDisplay recebe `isPremium` de StoryFactory (via `tier !== "free"`).
- Ao fim da história, card emocional de continuidade:
  - FREE: "Amanhã a aventura continua ✨" + botão "📖 Continuar essa história" → paywall `story_continuation`.
  - PREMIUM: "🌙 O universo de {nome} continua amanhã" (sem CTA, ainda).

### SOS (src/components/sos/SOSCrisisFlow.tsx)
- Lê `useAuth().profile.is_premium`.
- Fluxo FREE: acolhimento + respiração + **1ª dica prática** + card emocional "Continue a jornada calmante" → paywall `sos_journey`.
- Fluxo PREMIUM: todas as dicas + step "apoio" (playlist Wellness + bilhete pros pais).

### Momentos (src/components/moments/MomentsFactory.tsx)
- `FREE_MISSIONS = 1` (1ª missão liberada).
- Overlay de gate substituiu ícone Lock por copy emocional: "Continue criando memórias 💛 / Toque para desbloquear" (glassmorphism claro, sem ícone de cadeado).
- Tap → `ContextualPaywallModal` com context `moments`.

### Wellness (src/components/wellness/WellnessHub.tsx)
- Sounds: 4 grátis + 4 premium (lareira, trem, espaço, rio).
- Sleep: items com `premium: true` disparam paywall.
- Journey: FREE vê o gráfico de humor + streak, mas a lista de atividades vem com `blur(6px)` e overlay glass emocional "Transforme isso em ritual para {nome} ✨" → paywall `wellness_journey`. PREMIUM vê tudo.

### Perguntas (src/components/ChatScreen.tsx)
- **Memória contextual premium**: ao montar empty state, busca a última pergunta de dia(s) anterior(es) em `kidzz_questions_log` (janela 7d, exclui hoje). Mostra chip glass "Ontem {nome} perguntou — {pergunta}" acima das sugestões. Tap repõe a pergunta. Disponível apenas se `is_premium=true`.
- FREE não tem memória contextual — apenas as sugestões fixas por idade.


## Regras visuais dos paywalls
- Glassmorphism premium, blur cinematográfico, glow verde-sálvia ou roxo-rosa.
- NUNCA usar "conteúdo bloqueado". Usar copy de ritual e continuidade.
- Disparar `haptic("medium")` ao tocar gates emocionais.
