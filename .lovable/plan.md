# KALM by Kidzz — Plano de Implementação

Vou implementar **sem reconstruir** o SOS nem o Wellness existente. Tudo é **aditivo** (novos componentes, novo arquivo de dados, hooks de mapeamento). Identidade visual atual do Wellness é preservada como base — só recebe a marca "KALM by Kidzz" + as novas seções.

## 1. Identidade KALM
- `src/components/kalm/kalmBrand.ts` — tokens (verde sálvia → esmeralda, gradientes, ícone folha), texto: **KALM by Kidzz** / "Seu espaço de calma para toda a família."
- Renomear visualmente o topo do `WellnessHub` (sem trocar rota, sem renomear arquivos).
- Label da aba na `BottomNav` muda de "Wellness" → "KALM" (mesma cor verde do Wellness atual). Ícone passa para `Leaf` com gradiente verde.

## 2. Catálogo único de experiências
- `src/components/kalm/experiences.ts` — define 4 grupos × cards (Quick Relief, Parent Reset, Connection, Soundscapes) + Journeys, cada experiência com `id`, `title`, `desc`, `duration`, `tier` (`free` | `premium`), `tint`, `icon`.
- `src/components/kalm/sosMap.ts` — mapeia `situation.id` → `experienceId` inicial (crying→emotional-recovery, tantrum→post-tantrum, sleep→sleep-ritual, fear→building-courage, exhausted→parent-pause, overwhelm→reduce-noise; fallback para outras).

## 3. Renderer de experiências
- `src/components/kalm/ExperiencePlayer.tsx` — sheet/modal que abre uma experiência específica (timer/respiração/soundscape/journey day). Reusa `AmbientSoundEngine` para soundscapes; usa lógica de respiração existente.
- `src/components/kalm/SectionRow.tsx` + `ExperienceCard.tsx` — visual premium (sálvia/esmeralda, glass), com `Lock` para premium quando free.

## 4. Seções no Hub
Em `WellnessHub.tsx`, na view `home`, adicionar (abaixo do Hero, antes do `WellnessGrowth`):
1. **Quick Relief** (4 cards)
2. **Parent Reset** (4 cards, visual mais sóbrio — fundo mais escuro/aveludado)
3. **Connection** (4 cards família)
4. **Soundscapes** (5 cards com player)
5. **Journeys** (4 jornadas, todas premium exceto preview do dia 1)

Cada seção: header com kicker + título + scroll horizontal de cards.

## 5. Ponte SOS → KALM
Em `SOSCrisisFlow.tsx`, na etapa `fechamento`, **adicionar nova micro-etapa antes do recap**:
- Frase: "Você conseguiu desacelerar este momento." → pausa 1.2s → "Agora podemos cuidar do restante."
- Card premium **🌿 Continuar no Kalm** com botão **✨ Abrir Kalm**.
- Ao clicar: dispara `window.dispatchEvent(new CustomEvent("kidzz:open-kalm", { detail: { experienceId } }))` usando `sosMap[situation.id]`.

Em `Index.tsx`: listener `kidzz:open-kalm` → `switchTab("wellness")` + `setKalmInitialExperience(id)` → passado como prop para `WellnessHub` → abre direto o `ExperiencePlayer` daquela experiência (não abre home).

## 6. Botão fixo KALM no menu
- O slot já existe no `BottomNav` (`wellness`). Atualizo `id: "wellness"`, `label: "KALM"`, `icon: Leaf`, `tint: hsl(150 45% 42%)` (esmeralda).

## 7. Freemium
Helper `canUseKalm(experience, profile)` em `kalm/access.ts`:
- **Free:** preview de qualquer experiência (mostra descrição), **1 experiência curta/dia** + **1 soundscape/dia** + **1 parent reset/dia** (localStorage por dia: `kidzz_kalm_usage_YYYY-MM-DD`).
- **Premium:** tudo liberado + histórico emocional + continuidade.
- Quando bloqueado: dispara paywall existente `kidzz:open-paywall` com contexto `kalm`.

## Arquivos criados
- `src/components/kalm/kalmBrand.ts`
- `src/components/kalm/experiences.ts`
- `src/components/kalm/sosMap.ts`
- `src/components/kalm/access.ts`
- `src/components/kalm/ExperienceCard.tsx`
- `src/components/kalm/SectionRow.tsx`
- `src/components/kalm/ExperiencePlayer.tsx`
- `src/components/kalm/KalmSections.tsx` (compõe as 5 seções)

## Arquivos editados (pontuais, mínimos)
- `src/components/wellness/WellnessHub.tsx` — header com brand KALM + `<KalmSections />` + suporte a `initialExperience`.
- `src/components/sos/SOSCrisisFlow.tsx` — adicionar bloco "Continuar no Kalm" na etapa `fechamento`.
- `src/components/flow/BottomNav.tsx` — label/ícone da aba para KALM.
- `src/pages/Index.tsx` — listener `kidzz:open-kalm` + prop `initialExperience` para `WellnessHub`.

## Não muda
- Rotas, schema do banco, design existente do Wellness (apenas aditivo), fluxo SOS atual (só ganha etapa final), conteúdo das `SOS_SITUATIONS`.

Posso prosseguir?