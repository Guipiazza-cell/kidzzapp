/**
 * PersonalizationPanel — painel voltado ao ADULTO (atrás do Portão dos Pais).
 * Camada 1: palavras-chave (chips) sobre o mundo do filho.
 * Camada 2: intenção do dia (acalmar / ensinar / coragem / divertir).
 * Camada 3: voz — ritmo da narração (normal / mais devagar para dormir).
 *
 * Reusa o gerador existente: emite onGenerate(age, interests, keywords, intent, voiceRate).
 * Não recria paywall — só leva ao upgrade quando bloqueado.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, X, Plus, Crown, Lock, Moon, Heart, Shield, Smile } from "lucide-react";
import { haptic } from "@/lib/haptics";

export type StoryIntent = "acalmar" | "ensinar" | "coragem" | "divertir";
export type EnsinarSub = "dividir" | "paciencia" | "escovar" | "raiva" | "verdade" | "compartilhar";
export type VoiceRate = "normal" | "lenta";

interface Props {
  childName: string;
  childAge: number; // inferred default; user can adjust
  onGenerate: (params: {
    age: number;
    interests: string;
    keywords: string[];
    intent: StoryIntent;
    ensinarSub?: EnsinarSub;
    voiceRate: VoiceRate;
  }) => void;
  isLoading: boolean;
  storiesRemaining: number;
  isPremium: boolean;
  onUpgrade?: () => void;
}

const INTENTS: { key: StoryIntent; emoji: string; icon: any; title: string; desc: string; tint: string; ring: string }[] = [
  { key: "acalmar", emoji: "🌙", icon: Moon, title: "Acalmar antes de dormir", desc: "Ritmo lento, final tranquilo", tint: "#7C6AC7", ring: "rgba(124,106,199,0.16)" },
  { key: "ensinar", emoji: "💛", icon: Heart, title: "Ensinar algo", desc: "Um valor sem sermão", tint: "#E8821A", ring: "rgba(232,130,26,0.14)" },
  { key: "coragem", emoji: "🦁", icon: Shield, title: "Dar coragem", desc: "Vencer um medo gentilmente", tint: "#2F7D5B", ring: "rgba(47,125,91,0.16)" },
  { key: "divertir", emoji: "😄", icon: Smile, title: "Divertir e imaginar", desc: "Aventura leve, humor bobo", tint: "#F59E0B", ring: "rgba(245,158,11,0.18)" },
];

const ENSINAR_OPTIONS: { key: EnsinarSub; label: string }[] = [
  { key: "dividir", label: "dividir" },
  { key: "paciencia", label: "ter paciência" },
  { key: "escovar", label: "escovar os dentes" },
  { key: "raiva", label: "lidar com a raiva" },
  { key: "verdade", label: "dizer a verdade" },
  { key: "compartilhar", label: "compartilhar" },
];

const KEYWORD_SUGGESTIONS = ["dinossauros", "o cachorro Thor", "vó Maria", "futebol", "foguetes", "praia", "unicórnios"];

const storageKey = (name: string) => `kidzz_story_keywords_${name.toLowerCase().trim() || "amigo"}`;

const PersonalizationPanel = ({
  childName,
  childAge,
  onGenerate,
  isLoading,
  storiesRemaining,
  isPremium,
  onUpgrade,
}: Props) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [age, setAge] = useState<number>(childAge || 5);
  const [intent, setIntent] = useState<StoryIntent>("divertir");
  const [ensinarSub, setEnsinarSub] = useState<EnsinarSub>("dividir");
  const [voiceRate, setVoiceRate] = useState<VoiceRate>("normal");

  // Pré-preenche palavras-chave salvas do filho
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(childName));
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setKeywords(arr.slice(0, 12));
      }
    } catch {}
  }, [childName]);

  // Quando "acalmar", sugere voz lenta automaticamente (editável)
  useEffect(() => {
    if (intent === "acalmar") setVoiceRate("lenta");
  }, [intent]);

  const addKeyword = (raw: string) => {
    const k = raw.trim().replace(/[,;]+$/, "").slice(0, 40);
    if (!k) return;
    if (keywords.some((x) => x.toLowerCase() === k.toLowerCase())) return;
    if (keywords.length >= 12) return;
    setKeywords((prev) => [...prev, k]);
    setInput("");
    haptic("light");
  };

  const removeKeyword = (i: number) => {
    setKeywords((prev) => prev.filter((_, idx) => idx !== i));
    haptic("light");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," ) {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === "Backspace" && !input && keywords.length) {
      removeKeyword(keywords.length - 1);
    }
  };

  const interestsString = useMemo(() => keywords.join(", "), [keywords]);
  const canGenerate = keywords.length > 0 && age >= 1 && age <= 12;

  const handleSubmit = () => {
    if (!canGenerate || isLoading) return;
    try { localStorage.setItem(storageKey(childName), JSON.stringify(keywords)); } catch {}
    haptic("medium");
    onGenerate({
      age,
      interests: interestsString,
      keywords,
      intent,
      ensinarSub: intent === "ensinar" ? ensinarSub : undefined,
      voiceRate,
    });
  };

  const blocked = !isPremium && storiesRemaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-4"
    >
      {/* Cabeçalho — fala com o adulto */}
      <div className="text-center">
        <span className="inline-block text-[10.5px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: "#E8821A" }}>
          Painel dos Pais
        </span>
        <h2 className="font-display text-[24px] leading-[1.05] font-semibold tracking-tight" style={{ color: "#2A2520", fontFamily: "'Fraunces', Georgia, serif" }}>
          Vamos criar uma história só do(a) {childName}
        </h2>
        <p className="text-[13px] mt-1.5 leading-snug" style={{ color: "rgba(42,37,32,0.66)" }}>
          Você escolhe o mundo dele e o que essa história precisa entregar hoje.
        </p>
      </div>

      {/* Idade — compacto */}
      <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(42,37,32,0.06)", boxShadow: "0 6px 18px -12px rgba(42,37,32,0.18)" }}>
        <label className="text-[12px] font-extrabold tracking-wider uppercase" style={{ color: "rgba(42,37,32,0.55)" }}>
          Idade do(a) {childName}
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {[3,4,5,6,7,8,9,10].map((n) => (
            <button
              key={n}
              onClick={() => { setAge(n); haptic("light"); }}
              className="min-w-[44px] h-11 px-3 rounded-full text-[13.5px] font-extrabold"
              style={{
                background: age === n ? "#E8821A" : "rgba(232,130,26,0.10)",
                color: age === n ? "#fff" : "#A35E10",
                border: age === n ? "none" : "1px solid rgba(232,130,26,0.22)",
              }}
            >
              {n} anos
            </button>
          ))}
        </div>
      </div>

      {/* CAMADA 1 — palavras-chave */}
      <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(42,37,32,0.06)", boxShadow: "0 6px 18px -12px rgba(42,37,32,0.18)" }}>
        <h3 className="font-display text-[17px] font-semibold leading-tight" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
          O que faz os olhos do(a) {childName} brilharem?
        </h3>
        <p className="text-[12.5px] mt-1 leading-snug" style={{ color: "rgba(42,37,32,0.6)" }}>
          Coloque nomes, paixões, pessoas queridas. Eles vão virar a história.
        </p>

        {/* Chips */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {keywords.map((k, i) => (
              <motion.span
                key={`${k}-${i}`}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-[12.5px] font-bold"
                style={{ background: "rgba(232,130,26,0.12)", color: "#7A4A0F" }}
              >
                {k}
                <button
                  onClick={() => removeKeyword(i)}
                  aria-label={`Remover ${k}`}
                  className="ml-0.5 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "#FAF6EC", border: "1px solid rgba(42,37,32,0.08)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex.: dinossauros, vó Maria..."
            maxLength={40}
            aria-label="Adicionar palavra-chave"
            className="flex-1 bg-transparent outline-none text-[14px] font-semibold placeholder:font-medium placeholder:text-black/35"
            style={{ color: "#2A2520" }}
          />
          <button
            onClick={() => addKeyword(input)}
            disabled={!input.trim()}
            aria-label="Adicionar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40"
            style={{ background: "#E8821A" }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Sugestões */}
        {keywords.length < 3 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KEYWORD_SUGGESTIONS.filter((s) => !keywords.some((k) => k.toLowerCase() === s.toLowerCase())).slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => addKeyword(s)}
                className="text-[11.5px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(47,125,91,0.10)", color: "#2F7D5B", border: "1px dashed rgba(47,125,91,0.28)" }}
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CAMADA 2 — intenção */}
      <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(42,37,32,0.06)", boxShadow: "0 6px 18px -12px rgba(42,37,32,0.18)" }}>
        <h3 className="font-display text-[17px] font-semibold leading-tight" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
          Qual o presente de hoje?
        </h3>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {INTENTS.map((it) => {
            const Icon = it.icon;
            const active = intent === it.key;
            return (
              <button
                key={it.key}
                onClick={() => { setIntent(it.key); haptic("light"); }}
                className="text-left rounded-2xl p-3 transition-all"
                style={{
                  background: active ? it.ring : "#FAF6EC",
                  border: active ? `1.5px solid ${it.tint}` : "1px solid rgba(42,37,32,0.06)",
                  minHeight: 92,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[16px]" style={{ background: "#fff", color: it.tint }}>
                    {it.emoji}
                  </span>
                  <Icon size={14} style={{ color: it.tint }} />
                </div>
                <p className="mt-2 text-[12.5px] font-extrabold leading-tight" style={{ color: "#2A2520" }}>{it.title}</p>
                <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "rgba(42,37,32,0.6)" }}>{it.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Sub-opções para "ensinar" */}
        {intent === "ensinar" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <p className="text-[11.5px] font-bold mt-3 mb-1.5" style={{ color: "rgba(42,37,32,0.6)" }}>
              Ensinar a…
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ENSINAR_OPTIONS.map((o) => {
                const active = ensinarSub === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => { setEnsinarSub(o.key); haptic("light"); }}
                    className="text-[12px] font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: active ? "#E8821A" : "rgba(232,130,26,0.10)",
                      color: active ? "#fff" : "#A35E10",
                      border: active ? "none" : "1px solid rgba(232,130,26,0.22)",
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* CAMADA 3 — voz */}
      <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid rgba(42,37,32,0.06)", boxShadow: "0 6px 18px -12px rgba(42,37,32,0.18)" }}>
        <h3 className="font-display text-[17px] font-semibold leading-tight" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
          Voz da narração
        </h3>
        <p className="text-[12px] mt-0.5 leading-snug" style={{ color: "rgba(42,37,32,0.6)" }}>
          Voz feminina suave em português. Escolha o ritmo.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {([
            { key: "normal", label: "Normal", desc: "Para qualquer hora" },
            { key: "lenta",  label: "Mais devagar", desc: "Para dormir" },
          ] as const).map((v) => {
            const active = voiceRate === v.key;
            return (
              <button
                key={v.key}
                onClick={() => { setVoiceRate(v.key); haptic("light"); }}
                className="text-left rounded-2xl p-3"
                style={{
                  background: active ? "rgba(124,106,199,0.14)" : "#FAF6EC",
                  border: active ? "1.5px solid #7C6AC7" : "1px solid rgba(42,37,32,0.06)",
                }}
              >
                <p className="text-[13px] font-extrabold" style={{ color: "#2A2520" }}>{v.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(42,37,32,0.6)" }}>{v.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aviso de quota */}
      {!isPremium && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: blocked ? "rgba(244,63,94,0.08)" : "rgba(245,158,11,0.10)",
            border: `1px solid ${blocked ? "rgba(244,63,94,0.28)" : "rgba(245,158,11,0.28)"}`,
          }}
        >
          {blocked ? <Lock size={18} className="text-rose-600 flex-shrink-0" /> : <Sparkles size={18} className="text-amber-600 flex-shrink-0" />}
          <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: blocked ? "#9F1239" : "#92400E" }}>
            {blocked
              ? `A primeira foi por nossa conta. 💛 Assine para criar histórias ilimitadas, só do(a) ${childName}.`
              : `A primeira história personalizada do(a) ${childName} é por nossa conta. ✨`}
          </p>
        </div>
      )}

      {/* CTA */}
      {blocked ? (
        <motion.button
          onClick={onUpgrade}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-white font-extrabold text-[15px] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#7C6AC7,#E8821A)", boxShadow: "0 12px 24px -10px rgba(124,106,199,0.55)" }}
        >
          <Crown size={18} />
          Assinar e criar histórias ilimitadas
        </motion.button>
      ) : (
        <motion.button
          onClick={handleSubmit}
          disabled={!canGenerate || isLoading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-white font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg,#F19A3E,#E8821A)",
            boxShadow: "0 12px 24px -10px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
            fontFamily: "'Mulish', system-ui, sans-serif",
            letterSpacing: "0.03em",
          }}
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Tecendo a história…</>
          ) : (
            <><Sparkles size={18} /> CRIAR A HISTÓRIA DO(A) {childName.toUpperCase()}</>
          )}
        </motion.button>
      )}

      {!canGenerate && !isLoading && !blocked && (
        <p className="text-center text-[11.5px] font-bold" style={{ color: "rgba(42,37,32,0.55)" }}>
          Adicione pelo menos uma palavra-chave para começar.
        </p>
      )}
    </motion.div>
  );
};

export default PersonalizationPanel;
