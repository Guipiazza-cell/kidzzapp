---
name: KIDZZ Chameleon System
description: Sistema unificado do mascote KIDZZ — 1 personagem com 4 estados visuais (cosmic/moon/explorer/music) usado como HERO em todas as telas principais (~40% da tela). Pixel/Ane/ChameleonMascot foram aposentados.
type: feature
---

# KIDZZ Chameleon System

## Conceito Central
**É UM PERSONAGEM SÓ.** Os 4 visuais são estados/cores do mesmo camaleão. Sempre **morph crossfade 600-700ms**. KIDZZ é o protagonista único — não usar mais Pixel, Ane ou ChameleonMascot em telas novas.

## Mapa de Estados por Aba/Tela
- **cosmic** (azul) — Perguntas, Home Hero, Memórias empty state, Onboarding "Nome"
- **explorer** (verde-dourado) — Histórias (StoryFactory intro), Play hero, Onboarding "Idade", Travel
- **moon** (roxo) — Sonhos
- **music** (amarelo headphones) — Música (hero hero-size dominante), Onboarding "Interesses"

## Escala (regra global)
- HERO em todas as telas principais: size `xl` ou `hero` (35-50% da tela)
- Tab bar mini icons: 28px (transformação do ícone Lucide quando ativo)
- NUNCA usar como ícone pequeno fora da tab bar

## Tab Bar (5 abas, sem Conquistas)
Perguntas | Histórias | Música | Sonhos | Memórias.
**Conquistas** virou subaba dentro de Memórias (toggle "💛 Conteúdos" / "🏆 Conquistas").

## Onboarding (3 telas)
Nome → Idade → Interesses. Cada tela tem:
- `OnboardingProgress` no topo (●○○ → ●●○ → ●●●)
- KIDZZ HERO size `xl`/`lg` com mood específico (cosmic/curious, explorer/curious, music/happy)
- Background floresta clara com leve variação de luz
- Botão Continuar grande (min-h 56px) sempre visível

## Componentes
- `src/components/kidzz/KidzzChameleon.tsx` — Core (4 estados, mood, morph, eye-follow, ripple, particles)
- `src/components/kidzz/KidzzHero.tsx` — Wrapper Home com greeting contextual
- `src/components/onboarding/OnboardingProgress.tsx` — Indicador ●○○ animado
- `src/components/kidzz/kidzzMemory.ts` — Memória contextual

## Música — HERO amarelo dominante
KIDZZ music size `hero` central. CTA principal "🎤 Cantar junto" (gradient amarelo grande). 4 pilares secundários abaixo. Cards renomeados: "Karaokê do Dia" / "Dance com Kidzz" (Pixel/Ane removidos do nome).

## Regras
- NUNCA usar Pixel, Ane ou ChameleonMascot em telas novas
- NUNCA trocar visual sem AnimatePresence morph
- Heart glow é parte da identidade — mantido em todos os estados
