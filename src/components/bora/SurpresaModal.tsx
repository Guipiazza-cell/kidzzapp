import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Clock, Leaf } from "lucide-react";
import type { IaActivity } from "@/hooks/useSurpresaIA";

type Props = {
  open: boolean;
  loading: boolean;
  activity: IaActivity | null;
  error: string | null;
  childName?: string;
  onClose: () => void;
  onRetry: () => void;
};

export const SurpresaModal = ({ open, loading, activity, error, childName, onClose, onRetry }: Props) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{
            background: "rgba(20, 35, 18, 0.6)",
            backdropFilter: "blur(8px)",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 140px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto overflow-x-hidden"
            style={{
              background: "linear-gradient(180deg, #FFFDF6 0%, #FFF3D9 100%)",
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 30px 80px -20px rgba(40,70,30,0.45)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(47,94,31,0.08)", color: "#2F5E1F" }}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#E8772A" }}>
              <Sparkles size={14} /> Surpresa da IA
              {childName ? <span className="text-[11px] font-semibold" style={{ color: "#8A9580" }}>pra {childName}</span> : null}
            </div>

            {loading && (
              <div className="py-10 flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full border-4"
                  style={{ borderColor: "#E8DFC2", borderTopColor: "#E8772A" }}
                />
                <p className="font-bora-body text-sm" style={{ color: "#5A6B53" }}>
                  Inventando uma brincadeira só pra vocês...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="py-8">
                <p className="font-bora-body text-base" style={{ color: "#7A2F2F" }}>{error}</p>
                <button
                  onClick={onRetry}
                  className="mt-4 rounded-full px-5 py-3 font-bold text-white"
                  style={{ background: "linear-gradient(180deg, #FF9A4D 0%, #E8772A 100%)" }}
                >
                  Tentar de novo
                </button>
              </div>
            )}

            {!loading && !error && activity && (
              <div className="mt-2">
                <div className="text-5xl">{activity.emoji}</div>
                <h2 className="font-bora-display mt-1" style={{ fontSize: 28, color: "#2F5E1F", lineHeight: 1.1 }}>
                  {activity.titulo}
                </h2>
                <p className="font-bora-body mt-2" style={{ fontSize: 15.5, color: "#5A6B53", lineHeight: 1.4 }}>
                  {activity.gancho}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold" style={{ color: "#3F5535" }}>
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: "#fff", border: "1.5px solid #E8DFC2" }}>
                    <Clock size={12} /> {activity.tempo}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: "#fff", border: "1.5px solid #E8DFC2" }}>
                    <Leaf size={12} /> {activity.tela_min} min sem tela
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: "#fff", border: "1.5px solid #E8DFC2" }}>
                    {activity.contexto}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8A9580" }}>Materiais</div>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {activity.materiais.map((m, i) => (
                      <li key={i} className="rounded-full px-2.5 py-1 text-sm" style={{ background: "#F6EFD7", color: "#3F5535" }}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8A9580" }}>Passo a passo</div>
                  <ol className="mt-2 space-y-2">
                    {activity.passos.map((p, i) => (
                      <li key={i} className="flex gap-2.5 font-bora-body" style={{ fontSize: 15, color: "#3F5535" }}>
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#2F5E1F", color: "#fff" }}>{i + 1}</span>
                        <span className="flex-1 leading-snug">{p}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {activity.curiosidade && (
                  <div className="mt-5 rounded-2xl p-3.5" style={{ background: "#FFF3D9", border: "1.5px dashed #E8B96A" }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#A86B14" }}>Curiosidade</div>
                    <p className="font-bora-body" style={{ fontSize: 14, color: "#5A4422", lineHeight: 1.4 }}>{activity.curiosidade}</p>
                  </div>
                )}

                <button
                  onClick={onRetry}
                  className="mt-5 w-full rounded-full py-3 font-bold text-white text-base"
                  style={{ background: "linear-gradient(180deg, #FF9A4D 0%, #E8772A 100%)", boxShadow: "0 12px 28px -10px rgba(232,119,42,0.6)" }}
                >
                  <Sparkles size={16} className="inline mr-1" /> Outra surpresa
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
