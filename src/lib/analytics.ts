// Módulo central de eventos (PostHog).
// Regra de privacidade: NENHUMA propriedade pode conter texto escrito por
// criança ou pais (nomes, diários, sonhos, respostas, mensagens, fotos).
// Somente IDs, contagens, nomes de aba e durações.
import posthog from "posthog-js";
import { supabase } from "@/integrations/supabase/client";

export type TabName =
  | "perguntas"
  | "kalm"
  | "sonhos"
  | "historias"
  | "brincar"
  | "rotina"
  | "momentos"
  | "cinema"
  | "musica"
  | "memorias";

const ready = (): boolean => {
  try {
    return Boolean(import.meta.env.VITE_PUBLIC_POSTHOG_KEY) && Boolean(posthog.__loaded);
  } catch {
    return false;
  }
};

const capture = (event: string, props?: Record<string, unknown>): void => {
  if (!ready()) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* analytics nunca quebra o app */
  }
};

export const analytics = {
  identify(userId: string, props?: { email?: string; created_at?: string }): void {
    if (!ready() || !userId) return;
    try {
      posthog.identify(userId, props);
    } catch {
      /* noop */
    }
  },

  reset(): void {
    if (!ready()) return;
    try {
      posthog.reset();
    } catch {
      /* noop */
    }
  },

  signupCompleted(props: { method: "email" | "google" }): void {
    capture("signup_completed", props);
  },

  onboardingDone(props: { child_count: number; seconds_to_complete: number }): void {
    capture("onboarding_done", props);
  },

  activityStarted(props: { tab: TabName; activity_id: string }): void {
    capture("activity_started", props);
  },

  /**
   * Conclusão de atividade com duração real.
   * O banco (public.conclusoes) é a fonte de verdade; o PostHog é o complemento.
   */
  activityCompleted(props: {
    tab: TabName;
    activity_id: string;
    duration_seconds: number;
    /** Rótulo curto da atividade (nunca texto escrito por pais/criança). */
    title?: string;
  }): void {
    const { title, ...eventProps } = props;
    capture("activity_completed", eventProps);
    void persistConclusao(props);
  },

  /** Marcar/desmarcar tarefa da Rotina (não é atividade com início e fim). */
  routineTaskChecked(props: { task_id: string; period: string }): void {
    capture("routine_task_checked", props);
  },


  shareClicked(props: { surface: string; content_type: string }): void {
    capture("share_clicked", props);
  },

  paywallViewed(props: { trigger: string }): void {
    capture("paywall_viewed", props);
  },

  checkoutStarted(props: { plan: string }): void {
    capture("checkout_started", props);
  },
};

/** Marca o início do onboarding para calcular seconds_to_complete. */
const ONBOARDING_START_KEY = "kidzz_onboarding_started_at";

export const markOnboardingStart = (): void => {
  try {
    if (!localStorage.getItem(ONBOARDING_START_KEY)) {
      localStorage.setItem(ONBOARDING_START_KEY, String(Date.now()));
    }
  } catch {
    /* noop */
  }
};

export const consumeOnboardingSeconds = (): number => {
  try {
    const raw = localStorage.getItem(ONBOARDING_START_KEY);
    localStorage.removeItem(ONBOARDING_START_KEY);
    if (!raw) return 0;
    return Math.max(0, Math.round((Date.now() - Number(raw)) / 1000));
  } catch {
    return 0;
  }
};
