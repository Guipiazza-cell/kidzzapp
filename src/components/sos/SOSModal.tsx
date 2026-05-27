import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { SOS_SITUATIONS, type SosSituation } from "./situations";
import SOSCrisisFlow from "./SOSCrisisFlow";
import TabErrorBoundary from "@/components/TabErrorBoundary";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * Bottom sheet do SOS — abertura cinemática client-side, sem reload.
 * Grid 2 colunas (mobile) de situações + fluxo profundo parametrizado.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  onGoWellness?: () => void;
}

const SOSModal = ({ open, onClose, onGoWellness }: Props) => {
  const [selected, setSelected] = useState<SosSituation | null>(null);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSelected(null), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pick = (s: SosSituation) => {
    haptic("medium");
    sfx("click");
    setSelected(s);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sos-backdrop"
            className="fixed inset-0 z-[90]"
            style={{
              background: "hsl(0 0% 0% / 0.15)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            key="sos-sheet"
            className="fixed inset-x-0 bottom-0 z-[100] flex flex-col"
            style={{
              maxHeight: "92vh",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              background: "linear-gradient(180deg, hsl(60 30% 99% / 0.96) 0%, hsl(70 25% 97% / 0.96) 100%)",
              backdropFilter: "blur(20px) saturate(1.1)",
              WebkitBackdropFilter: "blur(20px) saturate(1.1)",
              border: "1px solid hsl(0 0% 100% / 0.7)",
              boxShadow: "0 -20px 60px -20px hsl(0 50% 30% / 0.2)",
              paddingBottom: "max(env(safe-area-inset-bottom, 16px), 16px)",
            }}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="SOS Kidzz"
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="block w-10 h-1 rounded-full" style={{ background: "hsl(0 0% 70%)" }} />
            </div>

            <div className="flex-1 min-h-0 px-5 pt-2">
              {!selected ? (
                <>
                  <header className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <p
                        className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                        style={{ color: "hsl(var(--sos-to))" }}
                      >
                        SOS Kidzz
                      </p>
                      <h2
                        className="text-[22px] font-black leading-tight tracking-tight"
                        style={{ color: "hsl(var(--premium-ink))" }}
                      >
                        Apoio rápido para momentos difíceis
                      </h2>
                      <p className="text-[12px] font-medium mt-1" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                        Você não precisa passar por isso sozinho(a).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                      style={{
                        background: "hsl(0 0% 100% / 0.75)",
                        border: "1px solid hsl(0 0% 100% / 0.7)",
                      }}
                      aria-label="Fechar"
                    >
                      <X size={16} style={{ color: "hsl(var(--premium-ink))" }} />
                    </button>
                  </header>

                  <div className="grid grid-cols-2 gap-2.5 pb-6 overflow-y-auto" style={{ maxHeight: "60vh" }}>
                    {SOS_SITUATIONS.map((s, i) => (
                      <motion.button
                        key={s.id}
                        type="button"
                        onClick={() => pick(s)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative text-left p-3.5 rounded-3xl overflow-hidden"
                        style={{
                          background: "hsl(0 0% 100% / 0.82)",
                          backdropFilter: "blur(10px)",
                          border: `1px solid ${s.tint.replace(")", " / 0.3)")}`,
                          boxShadow: `0 6px 18px -10px ${s.tint.replace(")", " / 0.4)")}`,
                          minHeight: 100,
                        }}
                      >
                        <span
                          aria-hidden
                          className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${s.tint.replace(")", " / 0.22)")}, transparent 70%)`,
                            filter: "blur(8px)",
                          }}
                        />
                        <span className="text-[26px] block mb-1.5" aria-hidden>{s.emoji}</span>
                        <p
                          className="text-[13px] font-black leading-tight tracking-tight"
                          style={{ color: "hsl(var(--premium-ink))" }}
                        >
                          {s.label}
                        </p>
                        <span
                          className="inline-flex items-center gap-0.5 mt-1.5 text-[10px] font-black"
                          style={{ color: s.tint }}
                        >
                          Começar <ChevronRight size={10} />
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <TabErrorBoundary
                  resetKey={selected.id}
                  label={`sos:${selected.id}`}
                  onBack={() => setSelected(null)}
                >
                  <SOSCrisisFlow
                    situation={selected}
                    onBack={() => setSelected(null)}
                    onClose={onClose}
                    onGoWellness={onGoWellness}
                  />
                </TabErrorBoundary>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SOSModal;
