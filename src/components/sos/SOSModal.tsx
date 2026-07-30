import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Heart, Shield, Zap, Lock } from "lucide-react";
import { SOS_SITUATIONS, type SosSituation } from "./situations";
import { SOS_CARD_VISUAL, SOS_PICKER_ICONS } from "./SOSPickerIcons";
import SOSCrisisFlow from "./SOSCrisisFlow";
import TabErrorBoundary from "@/components/TabErrorBoundary";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * SOS picker premium - grid colorido sem emojis, estilo “Estamos com você”.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  onGoWellness?: () => void;
}

const SOSModal = ({ open, onClose, onGoWellness }: Props) => {
  const [selected, setSelected] = useState<SosSituation | null>(null);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSelected(null), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

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
            className="fixed inset-0 z-[100]"
            style={{
              background: "hsl(0 0% 0% / 0.28)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
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
            className="fixed inset-x-0 bottom-0 z-[100] flex flex-col overflow-hidden"
            style={{
              maxHeight: "94vh",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              background:
                "linear-gradient(180deg, #FFF8E8 0%, #FFF3D6 38%, #F7EBC8 100%)",
              boxShadow: "0 -24px 60px rgba(80,50,10,0.22)",
              paddingBottom: "max(env(safe-area-inset-bottom, 12px), 12px)",
            }}
            initial={{ y: "100%", opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="SOS Kidzz"
          >
            <div className="flex justify-center pt-2 pb-0">
              <span className="block h-1 w-10 rounded-full bg-black/15" />
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pt-2"
              style={{
                maxHeight: "90vh",
                WebkitOverflowScrolling: "touch",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
              }}
            >
              {!selected ? (
                <>
                  {/* Header */}
                  <header className="relative mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 25%, #FFE0E4, #FF6B7A 55%, #E23B4E)",
                          boxShadow: "0 6px 14px rgba(226,59,78,0.28)",
                        }}
                      >
                        <Heart size={18} fill="#fff" color="#fff" />
                      </div>
                      <span className="text-[11px] font-black tracking-wide text-[#C42B45]">
                        SOS
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      aria-label="Fechar"
                    >
                      <X size={18} className="text-[#3A3A3A]" />
                    </button>
                  </header>

                  <h2
                    className="mb-1 pr-2 text-[28px] font-black leading-[1.05] tracking-tight"
                    style={{ color: "#2A3A18", fontFamily: "'Lora', Georgia, serif" }}
                  >
                    Estamos
                    <br />
                    <span style={{ color: "#4A8A2E" }}>com você</span>
                  </h2>
                  <p className="mb-3 max-w-[92%] text-[13px] font-semibold leading-snug text-[#5A5A48]">
                    Escolha o momento que mais se parece com o que vocês estão vivendo.
                  </p>

                  <div
                    className="mb-4 flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 6px 16px rgba(80,50,10,0.06)",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(145deg, #FFB4C0, #E85D6A)",
                      }}
                    >
                      <Heart size={14} fill="#fff" color="#fff" />
                    </div>
                    <p className="text-[12px] font-bold leading-snug text-[#3A3A32]">
                      Você não precisa acertar sozinho.
                      <br />
                      Vamos encontrar um caminho juntos.
                    </p>
                  </div>

                  {/* Grid de situações */}
                  <div className="grid grid-cols-2 gap-2.5 pb-3">
                    {SOS_SITUATIONS.map((s, i) => {
                      const v = SOS_CARD_VISUAL[s.id];
                      const Icon = SOS_PICKER_ICONS[s.id];
                      if (!v) return null;
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          onClick={() => pick(s)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.28 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative flex flex-col overflow-hidden rounded-[22px] p-3 text-left min-h-[148px]"
                          style={{
                            background: v.gradient,
                            boxShadow:
                              "0 10px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.35)",
                          }}
                        >
                          <span
                            className="mb-2 inline-flex self-start rounded-full px-2 py-0.5 text-[9px] font-black tracking-wide"
                            style={{
                              background: "rgba(255,255,255,0.28)",
                              color: "#fff",
                              border: "1px solid rgba(255,255,255,0.35)",
                            }}
                          >
                            {v.badge}
                          </span>

                          <div className="mb-1.5">{Icon ? <Icon /> : null}</div>

                          <p
                            className="text-[15px] font-black leading-tight"
                            style={{ color: v.titleColor }}
                          >
                            {s.label}
                          </p>
                          <p
                            className="mt-0.5 text-[11px] font-semibold leading-snug"
                            style={{ color: v.subColor }}
                          >
                            {v.subtitle}
                          </p>

                          <span
                            className="mt-auto inline-flex items-center justify-between gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-extrabold"
                            style={{
                              background: v.ctaBg,
                              color: v.ctaColor,
                              marginTop: 10,
                            }}
                          >
                            {v.cta}
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-full"
                              style={{ background: v.ctaColor }}
                            >
                              <ChevronRight size={12} color="#fff" strokeWidth={2.6} />
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div
                    className="mt-1 flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.65)",
                      border: "1px solid rgba(255,255,255,0.85)",
                    }}
                  >
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A5A3A]">
                      <Shield size={12} className="text-[#3E9A52]" /> Sigiloso
                    </span>
                    <span className="text-[#C0C0B0]">|</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A5A3A]">
                      <Heart size={12} className="text-[#E85D6A]" /> Acolhedor
                    </span>
                    <span className="text-[#C0C0B0]">|</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A5A3A]">
                      <Zap size={12} className="text-[#E8A020]" /> Imediato
                    </span>
                  </div>
                  <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] font-semibold text-[#8A8A78]">
                    <Lock size={10} /> Seu espaço seguro para pedir ajuda.
                  </p>
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
