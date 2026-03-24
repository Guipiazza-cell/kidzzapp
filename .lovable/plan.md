

## Diagnosis

The root cause of the "invalid credentials" error is clear: **email confirmation is required but not enabled as auto-confirm**. The database shows:

- User `guipiazza@icloud.com` exists with `email_confirmed_at: NULL` and `last_sign_in_at: NULL`
- Supabase blocks `signInWithPassword` for unconfirmed emails, returning "Invalid login credentials"

This is not a code bug — it's a configuration issue.

## Plan

### 1. Enable auto-confirm for email signups
Use `configure_auth` to disable email confirmation requirement. Since you chose "acesso imediato", users will be able to login immediately after signup. This single change fixes the core auth issue.

### 2. Auto-login after signup
Update `Auth.tsx` so that after successful signup, the user is automatically logged in (Supabase does this natively when auto-confirm is on — the `onAuthStateChange` listener will pick up the session). Add a success toast and let the auth state change handle navigation.

### 3. Better error logging
Add `console.error` with the actual Supabase error message in both `signUp` and `signIn` handlers, so errors are visible in the browser console for debugging. Show the real error to the user instead of the generic "Email ou senha incorretos".

### 4. Fix existing unconfirmed user
The existing user `guipiazza@icloud.com` will start working once auto-confirm is enabled, as Supabase will no longer check for email confirmation.

### 5. Remove chameleon emoji from Auth page title
Remove the `ChameleonMascot` component rendering and the 🦎 emoji from the "Bem-vindo de volta!" heading on the Auth page. Instead, use the actual chameleon image (`chameleon-main.jpeg`) integrated naturally into the jungle background — positioned behind/within the forest scene rather than as a floating circular avatar.

### 6. Integrate chameleons into the jungle scene
Refactor `ChameleonMascot` or the Auth/ChatScreen pages to position the chameleon image more organically within the jungle background — larger, with transparency/blending, no circular crop, and positioned as if it's sitting on a branch or peeking from foliage. Apply subtle parallax or breathing animation.

---

### Technical Details

**Files to modify:**
- `supabase/config.toml` — no change needed (auth config is separate)
- `cloud--configure_auth` — enable auto-confirm
- `src/pages/Auth.tsx` — improve error handling, remove standalone ChameleonMascot, integrate chameleon into jungle scene
- `src/components/ChameleonMascot.tsx` — remove circular crop (`rounded-full`), add organic positioning variant
- `src/components/ChatScreen.tsx` — same chameleon integration improvement
- `src/components/NameOnboarding.tsx` — same treatment

**No changes to:**
- Paywall/questions system
- Parental controls
- Stripe integration
- TTS system
- Database schema or RLS policies

