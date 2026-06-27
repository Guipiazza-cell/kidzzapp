# KALM Premium Master v2 — Plano de implementação

Reescrever a aba KALM como hub enxuto que abre sub-telas dedicadas. Nenhuma outra aba será tocada.

## Arquitetura de arquivos (novo)

```
src/components/kalm/v2/
  KalmHome.tsx              ← home enxuta (substitui KalmSections como conteúdo da aba)
  KalmHeader.tsx            ← header vidro + chip dias de calma
  KalmHero.tsx              ← saudação por horário + título Fraunces + slot camaleão
  PathsGrid.tsx             ← 4 caminhos + card extra "Vínculo em família"
  MoodThermometer.tsx       ← 5 camaleões coloridos, salva humor por perfil
  GratitudeJar.tsx          ← jarro + estrelinhas acumulando
  SmallWins.tsx             ← 6 toggles do dia
  KidzzWhisper.tsx          ← sugestão contextual + play som floresta
  WeekSummary.tsx           ← card sálvia compartilhável (Web Share)
  ParentSubscribeBar.tsx    ← faixa vidro acima do dock (corrige bug)
  
  subscreens/
    RelaxarAgora.tsx        ← "Alívio em minutos": 15 atividades crianças + 9 adultos
    RitualRapido.tsx        ← respirar com camaleão + pequenos rituais
    SosEmocional.tsx        ← 4 passos seguros + bloco "falar com responsável"
    VinculoFamilia.tsx      ← 9 experiências + jornadas + "como estamos hoje"
  
  player/
    GuidedPlayer.tsx        ← tela cheia de execução (respiração, zumbido, glitter, batimento)
    BreathingCircle.tsx     ← círculo expande/contrai sincronizado
    GlitterJar.tsx          ← animação glitter assentando
    PlayerEnd.tsx           ← "como você está agora" + guardar momento
  
  data/
    activities.ts           ← catálogo das 24 atividades (textos reais)
    motors.ts               ← 6 motores (cores/tints por motor)
    journeys.ts             ← 3 jornadas
  
  state/
    useKalmState.ts         ← humor, jarro, vitórias, selos, streak (localStorage por perfil)
    useGuidedSession.ts     ← controla passos/timer/reduced-motion
```

## Pontos críticos

1. **Barra Pais/Assinar**: componente `ParentSubscribeBar` renderizado pelo `Index.tsx` quando aba ativa = kalm, posicionado `fixed` acima do `BottomNav` com `backdrop-blur` e `z-index` entre dock e conteúdo. "Assinar" dispara `kidzz:open-plans`; "Pais" abre `ParentalGate`. Remover qualquer CTA flutuante atual da aba.

2. **Selos coloridos**: `SmallWins`/coleção usa estados `earned` (gradiente vivo + glow) vs `pending` (silhueta âmbar suave 30% opacidade, nunca cinza).

3. **Execução guiada**: TODA atividade abre `GuidedPlayer` em tela cheia. Inspira 4s / segura 2s / solta 6s (exalação maior). `prefers-reduced-motion` → fallback texto+timer.

4. **SOS**: 4 passos exatos do brief, sem técnicas de dor, bloco de segurança sempre visível com botão "Falar com um responsável" → abre ParentalGate.

5. **Slots nomeados**: criar `src/components/kalm/v2/slots.ts` exportando paths placeholder vazios (`imgChamMeditando`, `imgAtiv_<id>`, áudios). Fallback elegante (gradiente do motor + emoji) se arquivo não existir.

6. **Persistência por perfil**: chaves `kidzz_kalm_v2_<criancaId>_<bucket>` para humor, jarro, vitórias, selos. Multi-filhos isolados.

7. **"Em breve"**: faixa única "Lugares para viver — Em breve" sem links.

8. **Reuso**: paywall via `kidzz:open-plans`, `useEntitlement`, `useAuth`, `useCriancas` já existentes. KALM antigo (`KalmSections`) substituído pelo novo `KalmHome` no Index.

## Integração

- `src/pages/Index.tsx`: trocar render do KALM tab para `<KalmHome />`. Acrescentar `<ParentSubscribeBar />` quando tab = kalm.
- Reaproveitar `ExperiencePlayer` antigo? **Não** — substituir por `GuidedPlayer` novo (animações específicas por motor).
- Manter `sosMap.ts` apontando ids para novas atividades da v2.

## Conteúdo

Todos os textos exatos do brief vão em `data/activities.ts` (24 atividades + passos guiados). Sem parafrasear.

## Escopo NÃO incluído

- Reservas/checkout de "Experiências que marcam" (só teaser).
- Áudios reais (apenas slots).
- Mudanças em outras abas, auth, schemas, edge functions.

Após aprovação, implemento em parallel batches: data + state primeiro, depois componentes home, depois sub-telas, por último player e integração no Index.
