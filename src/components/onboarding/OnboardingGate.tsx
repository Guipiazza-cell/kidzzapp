import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import NameOnboarding from "@/components/NameOnboarding";
import AgeSelection from "@/components/AgeSelection";
import InterestsOnboarding from "@/components/InterestsOnboarding";
import { parseIdade } from "@/components/onboarding/AccountSetup";

/**
 * Sincroniza a tabela `criancas` de forma centralizada e idempotente.
 * Roda para QUALQUER caminho que tenha populado nome + idade + interesses,
 * não só o AccountSetup.
 */
const useCriancaSync = () => {
  const { user, profile } = useAuth();
  const doneRef = useRef<string | null>(null);

  const childName = profile?.child_name ?? "";
  const ageRange = profile?.age_range ?? null;
  const interests = profile?.child_interests ?? [];

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    if (!childName || !ageRange || interests.length === 0) return;
    if (doneRef.current === userId) return;
    doneRef.current = userId;

    let cancelled = false;
    (async () => {
      try {
        const { data: existing } = await supabase
          .from("criancas")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();
        if (cancelled || existing) return;

        const { error } = await (supabase as any).rpc("complete_onboarding_v2", {
          p_child_name: childName,
          p_idade: parseIdade(ageRange),
          p_interests: interests,
          p_materiais: [],
        });
        if (error) {
          doneRef.current = null; // deixa tentar de novo depois
          console.warn("[OnboardingGate] complete_onboarding_v2 failed", error);
        }
      } catch (err) {
        doneRef.current = null;
        console.warn("[OnboardingGate] crianca sync failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, childName, ageRange, interests.length]);
};

/**
 * Guard central: nenhum caminho de autenticação (/auth, checkout, OAuth,
 * magic link, etc.) pode deixar a pessoa dentro do app com o perfil da
 * criança vazio. Envolve TODAS as rotas protegidas.
 */
const OnboardingGate = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading } = useAuth();
  useCriancaSync();

  if (!user) return <>{children}</>;
  if (loading && !profile) return null;

  if (!profile?.child_name) return <NameOnboarding key="gate-nome" />;
  if (!profile?.age_range) return <AgeSelection key="gate-idade" />;

  const interests = profile?.child_interests ?? [];
  if (interests.length === 0 && profile?.onboarding_done !== true) {
    return <InterestsOnboarding key="gate-interesses" />;
  }

  return <>{children}</>;
};

export default OnboardingGate;
