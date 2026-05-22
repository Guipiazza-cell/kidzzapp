import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { haptic } from "@/lib/haptics";

/**
 * Sistema de Nudges Contextuais — sussurros no Home na hora certa.
 *
 * Regras (todas baseadas em hora + localStorage, zero backend):
 *  - 06–10h  · Se ritual da manhã ainda não feito hoje  → "Bom dia. 3 minutos pra começar bem."
 *  - 16–20h  · Se nenhum decompressão hoje              → "Antes de entrar em casa, respire."
 *  - 20–23h  · Se ritual da noite ainda não feito        → "Hora de desacelerar juntos."
 *  - Qualquer hora · Se SOS usado hoje + sem momento     → "Guarde o que aconteceu antes que vire poeira."
 *
 * O usuário pode dispensar; volta no próximo gatilho relevante.
 */

type Action = "ritual" | "decompress" | "moment-add";

interface NudgeDef {
  id: string;
  text: string;
  cta: string;
  action: Action;
  accent: string;
  emoji: string;
}

interface Props {
  onAction: (a: Action) => void;
}

const DISMISS_KEY = "kidzz_nudges_dismissed_v1";
const today = () => new Date().toISOString().slice(0, 10);

const wasDoneToday = (action: Action): boolean => {
  try {
    const raw = localStorage.getItem("kidzz_connection_v1");
    if (!raw) return false;
    const s = JSON.parse(raw) as { lastEvents?: Array<{ type: string; at: number }> };
    const t = today();
    return !!s.lastEvents?.some((e) => {
      const date = new Date(e.at).toISOString().slice(0, 10);
      if (date !== t) return false;
      if (action === "ritual") return e.type === "ritual_completed";
      if (action === "decompress") return e.type === "decompression_done";
      if (action === "moment-add") return e.type === "moment_added";
      return false;
    });
  } catch { return false; }
};

const sosUsedToday = (): boolean => {
  try {
    const raw = localStorage.getItem("kidzz_connection_v1");
    if (!raw) return false;
    const s = JSON.parse(raw) as { lastEvents?: Array<{ type: string; at: number }> };
    return !!s.lastEvents?.some(
      (e) => e.type === "sos_used" && new Date(e.at).toISOString().slice(0, 10) === today()
    );
  } catch { return false; }
};

const readDismissed = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "{}"); } catch { return {}; }
};
const writeDismissed = (m: Record<string, string>) => {
  try { localStorage.setItem(DISMISS_KEY, JSON.stringify(m)); } catch {}
};

const pickNudge = (): NudgeDef | null => {
  const h = new Date().getHours();
  const dismissed = readDismissed();
  const t = today();

  // 1) Manhã sem ritual
  if (h >= 6 && h < 11 && !wasDoneToday("ritual") && dismissed["morning"] !== t) {
    return {
      id: "morning",
      emoji: "🌅",
      text: "Bom dia. 3 minutos antes da correria começar.",
      cta: "Começar ritual",
      action: "ritual",
      accent: "hsl(35 90% 60%)",
    };
  }

  // 2) SOS usado + nada guardado
  if (sosUsedToday() && !wasDoneToday("moment-add") && dismissed["after-sos"] !== t) {
    return {
      id: "after-sos",
      emoji: "🤍",
      text: "Aconteceu algo intenso hoje. Quer guardar antes de esquecer?",
      cta: "Guardar momento",
      action: "moment-add",
      accent: "hsl(0 65% 60%)",
    };
  }

  // 3) Tarde / pós-trabalho
  if (h >= 16 && h < 20 && !wasDoneToday("decompress") && dismissed["decompress"] !== t) {
    return {
      id: "decompress",
      emoji: "🌆",
      text: "Antes de virar pai/mãe de novo, um minuto pra você.",
      cta: "Decompressão 60s",
      action: "decompress",
      accent: "hsl(260 60% 55%)",
    };
  }

  // 4) Noite — ritual de sono
  if (h >= 20 && h < 23 && !wasDoneToday("ritual") && dismissed["night"] !== t) {
    return {
      id: "night",
      emoji: "🌙",
      text: "Hora de desacelerar juntos. 4 minutos só.",
      cta: "Ritual do sono",
      action: "ritual",
      accent: "hsl(240 55% 60%)",
    };
  }

  return null;
};

const ContextualNudge = ({ onAction }: Props) => {
  const [nudge, setNudge] = useState<NudgeDef | null>(() => pickNudge());

  // Reavalia quando o termômetro de conexão muda
  useEffect(() => {
    const refresh = () => setNudge(pickNudge());
    window.addEventListener("kidzz:connection-updated", refresh);
    const iv = setInterval(refresh, 5 * 60_000);
    return () => {
      window.removeEventListener("kidzz:connection-updated", refresh);
      clearInterval(iv);
    };
  }, []);

  const dismiss = () => {
    if (!nudge) return;
    haptic("light");
    const m = readDismissed();
    m[nudge.id] = today();
    writeDismissed(m);
    setNudge(null);
  };

  const act = () => {
    if (!nudge) return;
    haptic("medium");
    onAction(nudge.action);
    // Não dispensa permanentemente — a ação em si vai marcar como concluída
    setNudge(null);
  };

  return (
    <AnimatePresence>
      {nudge && (
        <motion.div
          key={nudge.id}
          className="w-full max-w-sm relative rounded-[22px] overflow-hidden flex items-center gap-3 pl-4 pr-2 py-3"
          style={{
            background:
              "linear-gradient(135deg, hsl(0 0% 100% / 0.92) 0%, hsl(0 0% 100% / 0.85) 100%)",
            border: `1px solid ${nudge.accent.replace(")", " / 0.3)")}`,
            backdropFilter: "blur(20px)",
            boxShadow: `0 14px 32px -20px ${nudge.accent.replace(")", " / 0.5)")}`,
          }}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0, marginTop: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          {/* Living dot */}
          <motion.div
            aria-hidden
            className="absolute -top-3 -left-3 w-12 h-12 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${nudge.accent.replace(")", " / 0.5)")}, transparent 70%)`, filter: "blur(4px)" }}
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="relative text-2xl flex-shrink-0">{nudge.emoji}</span>

          <p
            className="relative flex-1 text-[12.5px] font-bold leading-snug"
            style={{ color: "hsl(var(--premium-ink))" }}
          >
            {nudge.text}
          </p>

          <button
            onClick={act}
            className="relative flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-black text-white active:scale-[0.95] transition-transform"
            style={{
              background: nudge.accent,
              boxShadow: `0 6px 14px -6px ${nudge.accent.replace(")", " / 0.6)")}`,
            }}
          >
            {nudge.cta}
            <ArrowRight size={11} />
          </button>

          <button
            onClick={dismiss}
            className="relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
            style={{ color: "hsl(var(--premium-ink-soft))" }}
            aria-label="Dispensar"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualNudge;
