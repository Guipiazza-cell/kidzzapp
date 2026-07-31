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
 * Única tela de contagem do fluxo Bora (não há outra fora dela).
 * Cronômetro premium: anel circular + glass + dígitos serif.
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
  const remain = Math.max(0, target - elapsed);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const remainMm = String(Math.floor(remain / 60)).padStart(2, "0");
  const remainSs = String(remain % 60).padStart(2, "0");
  const finished = elapsed >= target;

  // Anel SVG
  const size = 236;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * progress;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[210] flex flex-col items-center justify-center px-6"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, #3A7228 0%, #2F5E1F 42%, #16320E 100%)",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Ambient glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: finished
                ? "radial-gradient(circle, rgba(240,176,80,.28), transparent 68%)"
                : "radial-gradient(circle, rgba(200,224,165,.18), transparent 68%)",
              filter: "blur(8px)",
              pointerEvents: "none",
              transition: "background .6s",
            }}
          />

          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.08) 100%)",
              color: "#fff",
              border: "0.5px solid rgba(255,255,255,.28)",
              boxShadow: "0 8px 20px rgba(0,0,0,.2), 0 1px 0 rgba(255,255,255,.25) inset",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              top: "calc(env(safe-area-inset-top, 0px) + 14px)",
              right: 16,
            }}
          >
            <X size={18} strokeWidth={2.2} />
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex flex-col items-center text-center relative z-[1]"
            style={{ maxWidth: 360 }}
          >
            {/* Leaf badge */}
            <div
              className="rounded-full flex items-center justify-center mb-5"
              style={{
                width: 72,
                height: 72,
                background: "linear-gradient(155deg, #C8E8A0 0%, #6FA87A 48%, #3F7A4E 100%)",
                boxShadow:
                  "0 16px 36px -8px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.45) inset, 0 -6px 14px rgba(0,0,0,.12) inset",
                border: "0.5px solid rgba(255,255,255,.35)",
              }}
            >
              <Leaf size={32} strokeWidth={2.1} style={{ color: "#fff" }} />
            </div>

            <h1
              className="font-bora-display"
              style={{
                fontSize: 30,
                color: "#FFFDF6",
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                textShadow: "0 2px 16px rgba(0,0,0,.25)",
              }}
            >
              Guarda o celular.
            </h1>
            <p
              className="font-bora-body mt-2.5"
              style={{ fontSize: 14.5, color: "rgba(255,248,230,.82)", lineHeight: 1.5, maxWidth: 280 }}
            >
              {childName
                ? `Agora é com ${childName}. A gente espera aqui — sem pressa.`
                : "Agora é com vocês. A gente espera aqui — sem pressa."}
            </p>

            {/* ── Cronômetro premium (anel) ── */}
            <div className="mt-8 relative" style={{ width: size, height: size }}>
              {/* Glass disc behind ring */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 18,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(165deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,.05) 50%, rgba(0,0,0,.12) 100%)",
                  border: "0.5px solid rgba(255,255,255,.22)",
                  boxShadow:
                    "0 20px 48px rgba(0,0,0,.28), 0 1px 0 rgba(255,255,255,.28) inset, 0 -10px 24px rgba(0,0,0,.12) inset",
                  backdropFilter: "blur(36px) saturate(170%)",
                  WebkitBackdropFilter: "blur(36px) saturate(170%)",
                }}
              />

              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
                aria-hidden
              >
                {/* Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,.12)"
                  strokeWidth={stroke}
                />
                {/* Progress */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={finished ? "url(#guardaGold)" : "url(#guardaCream)"}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${c}`}
                  style={{
                    transition: "stroke-dasharray 1s linear",
                    filter: finished
                      ? "drop-shadow(0 0 10px rgba(240,176,80,.55))"
                      : "drop-shadow(0 0 8px rgba(200,224,165,.4))",
                  }}
                />
                <defs>
                  <linearGradient id="guardaCream" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F5F0D8" />
                    <stop offset="45%" stopColor="#C8E0A5" />
                    <stop offset="100%" stopColor="#9FD37A" />
                  </linearGradient>
                  <linearGradient id="guardaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE8B0" />
                    <stop offset="50%" stopColor="#F0B050" />
                    <stop offset="100%" stopColor="#E8821A" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ padding: 36 }}
              >
                <div
                  className="font-bora-display"
                  style={{
                    fontSize: 48,
                    fontWeight: 600,
                    color: "#FFFDF6",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    textShadow: "0 2px 18px rgba(0,0,0,.28)",
                  }}
                >
                  {mm}
                  <span style={{ opacity: 0.55, margin: "0 1px" }}>:</span>
                  {ss}
                </div>
                <div
                  className="font-bora-body mt-2"
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: finished ? "rgba(255,220,150,.95)" : "rgba(255,248,230,.62)",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  {finished ? "meta batida" : "tempo sem tela"}
                </div>
                <div
                  className="mt-2.5 rounded-full px-3 py-1"
                  style={{
                    background: "rgba(255,255,255,.1)",
                    border: "0.5px solid rgba(255,255,255,.18)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,248,230,.78)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {finished ? `+${minutes} min 🌿` : `meta ${minutes} min · falta ${remainMm}:${remainSs}`}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ações fixas embaixo */}
          <div
            className="absolute left-0 right-0 px-6"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)" }}
          >
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-full py-4 font-bold active:scale-[.98] transition-transform"
              style={{
                background: finished
                  ? "linear-gradient(135deg, #F4A659, #E8821A)"
                  : "linear-gradient(165deg, rgba(255,255,255,.96) 0%, rgba(255,252,245,.9) 100%)",
                color: finished ? "#fff" : "#2F5E1F",
                fontSize: 16,
                border: finished ? "none" : "0.5px solid rgba(255,255,255,.9)",
                boxShadow: finished
                  ? "0 14px 32px -10px rgba(232,130,26,.55), 0 1px 0 rgba(255,255,255,.35) inset"
                  : "0 12px 28px -10px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,1) inset",
              }}
            >
              {finished ? "Pronto, deu! 🌿" : "Já voltei"}
            </button>
            <p
              className="text-center font-bora-body mt-3"
              style={{ fontSize: 11.5, color: "rgba(255,248,230,.5)" }}
            >
              Sem pressão. Volta quando fizer sentido.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
