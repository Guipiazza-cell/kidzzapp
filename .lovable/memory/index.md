# Memory: index.md
Updated: now

# Project Memory

## Core
- **Design:** Glassmorphism UI (0.55-0.65 opacity) on `forest-bg-light.jpg`. Min 16px text, 44x44px touch targets. Top padding uses safe-area-inset.
- **Animation:** Disney/Pixar style with spring physics. **Framer Motion components must use `React.forwardRef`.**
- **Voice:** Web Speech API only (no external APIs). Narration uses rate 0.88, pitch 1.10. Dream world uses 0.82x.
- **AI Responses:** Gemini 3.1 Flash. Format: Simple -> Metaphor -> Curiosity -> Challenge. Adapted by age (0-3, 3-7, 7-10).
- **Quotas:** 3 free lifetime. Kidzz plan: 10 daily Qs. Premium: 10 Qs, 3 stories. Validated in backend Edge Function `kidzz-chat`.
- **UX Rules:** 30s timeout for generation (AbortController). 2s timeout for auth. Optimistic local persistence (`kidzz_guest_profile`, `kidzz_last_age_range`).
- **Payment:** Stripe checkout via `window.location.href` (same tab). Requires authentication first.
- **Música ≠ Sonhos:** Floresta Musical = ATIVO (canta/dança/cria). Mundo dos Sonhos = PASSIVO (escuta/relaxa). NUNCA fundir.
- **KIDZZ é UM personagem só:** 4 estados visuais (cosmic/moon/explorer/music) que metamorfoseiam via crossfade. Nunca trocar imagem bruscamente. Nunca usar emoji 🦎 ou cartoon genérico.

## Memories
- [KIDZZ Chameleon System](mem://features/kidzz-chameleon-system) — Personagem único com 4 estados, morph crossfade, eye-follow, memória contextual, tab bar viva
- [Floresta Musical](mem://features/music-forest) — Tab Música ATIVA com parallax pseudo-3D, mascotes reativos, 4 pilares, XP musical separado
- [Parental Control](mem://features/parental-control) — PIN 1234, plan comparisons, child profile management
- [Monetization Model](mem://business/monetization-model) — Stripe price IDs, product IDs, live mode only
- [Story Factory](mem://features/story-factory) — Gemini 3.1 Flash (8192 tokens), 4 scenes, asymptotic progress bar
- [Affiliate System](mem://features/affiliate-system) — ?ref=nome, 10% commission, tracked via Stripe metadata
- [Loading Screen Timeout](mem://auth/loading-screen-timeout) — 2s ProtectedRoute and 1.5s AuthContext safety timeouts
- [Support Contact](mem://business/support-contact) — kidzz.ia@icloud.com
- [Usage Quotas](mem://business/usage-quotas) — Validation logic in backend to prevent bypass, last_usage_date reset
- [Checkout Redirection](mem://ux/checkout-redirection) — Same tab redirect, mandatory auth before payment
- [User Profile Persistence](mem://auth/user-profile-persistence) — AuthContext isReady state, upsert with optimistic UI updates
- [Onboarding Flow](mem://ux/onboarding-flow) — home -> age -> generating -> answer, emotional generating screen
- [Landing Page Strategy](mem://ux/landing-page-strategy) — Emotional triggers, pain & relief narrative, mobile-first design
- [PWA Support](mem://project/pwa-support) — Standalone manifest, #e88a2a theme color, custom InstallPrompt
- [Safety Guidelines](mem://ai/safety-guidelines) — Strict filtering and age-based personalization logic
- [Voice Interface](mem://features/voice-interface) — Web Speech API params (0.88 speed, 1.10 pitch), 200ms pauses
- [Magical Experience](mem://style/magical-experience) — Disney/Pixar inspiration, spring physics, fireflies and glowing effects
- [Framer Motion Integration](mem://tech/framer-motion-integration) — Mandatory React.forwardRef to prevent white screens during transitions
- [Optimistic Persistence](mem://tech/mobile-stability-optimistic-persistence) — LocalStorage kidzz_last_age_range for instant UI advance
- [Chat Response Presentation](mem://ux/chat-response-presentation) — 3 modalities (Direct, Story, Narration), 3s delay for CTA
- [Emotional UX Copy](mem://style/emotional-ux-copy) — Empathic copy to connect with parents
- [Generation Timeout](mem://tech/generation-timeout-resilience) — 30s AbortController limit for Story Factory and chat generations
- [Response Structure](mem://ai/response-structure) — Simple Explanation -> Fun Metaphor -> Extra Curiosity -> Challenge
- [Analytics Tracking](mem://project/analytics-tracking) — Key events for funnels (pergunta_feita, clique_paywall, etc.)
- [Management Panel](mem://admin/management-panel) — /admin route, manual premium overrides, is_admin flag
- [Design Aesthetic](mem://style/design-aesthetic) — Magic forest theme, glassmorphism, purple-pink gradient for premium CTAs
- [Home Suggested Questions](mem://content/home-suggested-questions) — 5 categories, rotates every 20s
- [Gamification Progression](mem://features/gamification/progression-system) — +1 pt per question, streaks, 4 levels
- [Mascot Visual Identity](mem://features/mascot/visual-identity) — Pixel (dark, blue glow) and Ane (pink), breathing animations
- [Typography Content Standards](mem://style/typography-content-standards) — gray-800/700 on glass, min 16px body, 20-24px titles
- [Guest Mode](mem://auth/guest-mode) — kidzz_guest_profile in localStorage for testing without login
- [Layout Safe Areas](mem://style/layout-safe-areas) — safe-area-inset calculations for notches, min 44x44 touch targets
- [Subscription Management](mem://business/subscription-management) — Supabase + Stripe webhooks, 5min cache, premium_source
- [Moments Factory](mem://features/moments-factory) — Connection missions, blurred locked content for free users
- [Global Background Continuity](mem://style/global-background-continuity) — forest-bg-light.jpg, animated SVG fireflies/dragonflies
- [Achievements](mem://features/achievements) — Stats, current level card, and 10 collectable badges
- [Home Screen Layout](mem://ux/home-screen-layout) — VoiceInput, mascots w-24, exactly 6 suggestion cards grid
- [Tab Bar Final](mem://features/kidzz-tab-bar-final) — 5 tabs: Explorar, Brincar⭐, Histórias, Música, Sonhos. Memórias removida da nav.
- [Conversion Flow](mem://ux/conversion-flow) — Contextual paywall triggers across premium features
- [Dream World](mem://features/dream-world) — Local MP3s (/public/audio/), Web Speech API narration at 0.82x
- [Kidzz Lab](mem://features/kidzz-lab) — 🧪 dynamic layered SVG avatar customization via Framer Motion
- [Kidzz Play](mem://features/kidzz-play) — 🎮 mini-games (word search, memory, hangman) to earn avatar energy
- [Avatar Evolution System](mem://features/avatar-evolution-system) — character_profiles table tracks evolution_points and dominant_trait
- [Kidzz Pré-sono](mem://features/kidzz-pre-sleep) — Respiração 4-2-6 + canção lenta sintetizada Web Audio dentro do Mundo dos Sonhos
- [Daily Mission Loop](mem://features/daily-mission-loop) — 3 daily goals + XP toast + confetti reward + parent conversion nudge after 2-3 actions
