---
name: Kidzz Pré-sono
description: Modo de respiração guiada (4-2-6) com canção lenta sintetizada via Web Audio dentro do Mundo dos Sonhos, gratuito e sem horário restrito
type: feature
---

`PreSleep` (em `src/components/dreams/PreSleep.tsx`) é um modo passivo de pré-sono dentro do Mundo dos Sonhos.

**Acesso**: botão dedicado "Pré-sono guiado · respire e relaxe" no topo do `DreamWorld` (acima do CTA "Iniciar noite tranquila"). Sem paywall, sem restrição de horário.

**Mecânica**:
- Orbe central de respiração com 3 fases em loop:
  - Inspire (4s, scale 1.35)
  - Segure (2.5s, scale 1.35)
  - Solte (6s, scale 0.85)
- Canção lenta de embalo: pentatônica em A3-G4, beat 2.6s, fade in 2s, oscilador `sine` via Web Audio API. Toggle on/off no header.
- Sem narração, sem texto longo. Foco em respiração + som ambiente.

**Estética**: gradiente roxo/azul noturno consistente com `DreamWorld`. Texto da fase troca via `AnimatePresence` mode "wait".

**Saída**: botão voltar fecha e para a música com fade-out 1.2s. Estado `view === "presleep"` no `DreamWorld`.
