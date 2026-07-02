import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCriancas } from "@/hooks/useCriancas";

const INTERESSES = [
  { id: "dinossauros", label: "Dinossauros", emoji: "🦖" },
  { id: "princesas", label: "Princesas", emoji: "👑" },
  { id: "espaco", label: "Espaço", emoji: "🚀" },
  { id: "animais", label: "Animais", emoji: "🐾" },
  { id: "carros", label: "Carros", emoji: "🚗" },
  { id: "arte", label: "Arte", emoji: "🎨" },
  { id: "musica", label: "Música", emoji: "🎵" },
  { id: "natureza", label: "Natureza", emoji: "🌿" },
  { id: "cozinha", label: "Cozinha", emoji: "🍳" },
  { id: "esportes", label: "Esportes", emoji: "⚽" },
];

type Props = { open: boolean; onClose: () => void };

export const CriancaOnboarding = ({ open, onClose }: Props) => {
  const { addCrianca } = useCriancas();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number | "">("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setInteresses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  };

  const canSave = nome.trim().length > 0 && interesses.length >= 1;

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addCrianca({
        nome: nome.trim(),
        idade: idade === "" ? null : Number(idade),
        interesses,
      });
      onClose();
    } catch (e) {
      console.error("addCrianca failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(20, 35, 18, 0.55)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, #FFFDF6 0%, #FFF3D9 100%)",
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 30px 80px -20px rgba(40,70,30,0.45)",
            }}
          >
            <div className="text-3xl mb-1">👋</div>
            <h2 className="font-bora-display" style={{ fontSize: 26, color: "#2F5E1F", lineHeight: 1.1 }}>
              Quem vai brincar?
            </h2>
            <p className="font-bora-body mt-1" style={{ fontSize: 15, color: "#5A6B53" }}>
              Conta rapidinho pra gente personalizar as ideias.
            </p>

            <div className="mt-5">
              <label className="text-sm font-semibold" style={{ color: "#3F5535" }}>
                Nome do filho(a)
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Lia"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-base outline-none"
                style={{ background: "#fff", border: "2px solid #E8DFC2" }}
                maxLength={40}
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold" style={{ color: "#3F5535" }}>
                Idade
              </label>
              <input
                type="number"
                min={0}
                max={18}
                value={idade}
                onChange={(e) => setIdade(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ex: 6"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-base outline-none"
                style={{ background: "#fff", border: "2px solid #E8DFC2" }}
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold" style={{ color: "#3F5535" }}>
                Do que mais gosta? <span style={{ color: "#8A9580", fontWeight: 400 }}>(até 3)</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {INTERESSES.map((opt) => {
                  const active = interesses.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(opt.id)}
                      className="rounded-full px-3 py-2 text-sm font-semibold transition"
                      style={{
                        background: active ? "#2F5E1F" : "#fff",
                        color: active ? "#fff" : "#3F5535",
                        border: active ? "2px solid #2F5E1F" : "2px solid #E8DFC2",
                      }}
                    >
                      <span className="mr-1">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={!canSave || saving}
              onClick={save}
              className="mt-6 w-full rounded-full py-3.5 text-base font-bold transition"
              style={{
                background: canSave
                  ? "linear-gradient(180deg, #FF9A4D 0%, #E8772A 100%)"
                  : "#D8D2BE",
                color: "#fff",
                opacity: canSave ? 1 : 0.7,
                boxShadow: canSave ? "0 12px 28px -10px rgba(232,119,42,0.6)" : "none",
              }}
            >
              {saving ? "Salvando..." : "Bora começar!"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
