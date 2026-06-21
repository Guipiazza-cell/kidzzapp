import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, X } from "lucide-react";

type Props = {
  open: boolean;
  minutes: number;
  childName?: string;
  onDone: () => void;
  onCancel: () => void;
};

/**
 * Tela verde de intermissão entre "Bora fazer!" e "Como foi?".
 * Mostra um cronômetro discreto, mensagem acolhedora e dois botões:
 * - "Já voltei" (encerra antes do tempo)
 * - "Pronto, deu!" (aparece quando passa o tempo planejado)
 */
export const GuardaCelularScreen = ({ open, minutes, childName = "", onDone, onCancel }: Props) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  const target = Math.max(1, minutes) * 60;
  const progress = Math.min(1, elapsed / target);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const finished = elapsed >= target;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[210] flex flex-col items-center justify-center px-6"
          style={{
            background: "linear-gradient(180deg, #2F5E1F 0%, #1B3F12 100%)",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <X size={18} />
          </button>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex flex-col items-center text-center"
            style={{ maxWidth: 340 }}
          >
            <div
              className="rounded-full flex items-center justify-center mb-6"
              style={{
                width: 96, height: 96,
                background: "linear-gradient(160deg, #9FD37A 0%, #4F8B66 100%)",
                boxShadow: "0 20px 50px -10px rgba(0,0,0,.45), inset 0 2px 4px rgba(255,255,255,.4)",
              }}
            >
              <Leaf size={42} strokeWidth={2.2} style={{ color: "#fff" }} />
            </div>

            <h1
              className="font-bora-display"
              style={{ fontSize: 32, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              Guarda o celular.
            </h1>
            <p
              className="font-bora-body mt-3"
              style={{ fontSize: 15, color: "rgba(255,255,255,.85)", lineHeight: 1.5 }}
            >
              {childName
                ? `Agora é com ${childName}. A gente espera aqui — sem pressa.`
                : "Agora é com vocês. A gente espera aqui — sem pressa."}
            </p>

            {/* Cronômetro */}
            <div
              className="mt-8 rounded-3xl px-6 py-5"
              style={{
                background: "rgba(255,255,255,.10)",
                border: "1px solid rgba(255,255,255,.20)",
                minWidth: 220,
              }}
            >
              <div className="font-bora-display" style={{ fontSize: 44, color: "#fff", letterSpacing: "0.02em", lineHeight: 1 }}>
                {mm}:{ss}
              </div>
              <div
                className="font-bora-body mt-1"
                style={{ fontSize: 11, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                tempo sem tela
              </div>
              <div
                className="mt-3 rounded-full overflow-hidden"
                style={{ height: 6, background: "rgba(255,255,255,.15)" }}
              >
                <div
                  style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #C8E0A5, #FFFFFF)",
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Ações fixas embaixo */}
          <div className="absolute left-0 right-0 px-6" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)" }}>
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-full py-4 font-bold active:scale-[.98] transition-transform"
              style={{
                background: finished
                  ? "linear-gradient(135deg, #F4A659, #E8821A)"
                  : "rgba(255,255,255,.95)",
                color: finished ? "#fff" : "#2F5E1F",
                fontSize: 16,
                boxShadow: finished
                  ? "0 14px 32px -10px rgba(232,130,26,.6)"
                  : "0 12px 28px -10px rgba(0,0,0,.4)",
              }}
            >
              {finished ? "Pronto, deu! 🌿" : "Já voltei"}
            </button>
            <p
              className="text-center font-bora-body mt-3"
              style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)" }}
            >
              Sem pressão. Volta quando fizer sentido.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
