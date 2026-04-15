---
name: Viral Growth Engine
description: 7-Day Challenge, Referral Program upgrade, and Monthly Retrospective for organic growth
type: feature
---
## 7-Day Challenge
- DB table: challenges (challenger_id, challenged_id, challenge_code, status, progress arrays)
- Hook: useChallenges.ts — create, join, markDayComplete, shouldShowInvite (streak >= 3)
- Component: SevenDayChallenge.tsx — bottom sheet with invite/progress/complete views
- Share via WhatsApp with pre-formatted message and challenge code link

## Referral Program (upgraded)
- DB table: referral_rewards (user_id, months_earned, months_used, referred_count)
- Component: ReferralProgram.tsx — full screen with stats, share buttons (WhatsApp, copy, email)
- Gift icon in header for quick access
- Max 12 months accumulable
- Uses existing useAffiliate hook for code generation

## Monthly Retrospective
- Component: MonthlyRetrospective.tsx — visual card with gradient, stats grid, top question
- Share via WhatsApp/copy text
- Stats: streak, questions, stories, achievements
- Premium design card (purple/indigo/blue gradient)

## Entry Points
- Gift icon (🎁) in HomeScreen header → Referral Program
- onOpenChallenge prop → SevenDayChallenge bottom sheet
- MonthlyRetrospective triggered from memories/manually
