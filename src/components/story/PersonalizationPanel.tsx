/**
 * PersonalizationPanel - passo 2 da Fábrica de Histórias (painel dos pais).
 * Liquid glass do dock + fundo premium (mesmo padrão do avatar / resposta).
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, X, Plus, Crown, Lock, Moon, Heart, Shield, Smile } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { FONT, SERIF, R } from "@/lib/premiumUi";

export type StoryIntent = "acalmar" | "ensinar" | "coragem" | "divertir";
export type EnsinarSub = "dividir" | "paciencia" | "escovar" | "raiva" | "verdade" | "compartilhar";
export type VoiceRate = "normal" | "lenta";

interface Props {
  childName: string;
  childAge: number;
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

const BG = "/exemplos/assets/cena-historias.png";

const dockGlass: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.48) 0%, rgba(255,255,255,.26) 50%, rgba(255,255,255,.18) 100%)",
  border: "0.5px solid rgba(255,255,255,.62)",
  boxShadow:
    "0 14px 40px rgba(20,16,30,.14), 0 2px 8px rgba(20,16,30,.05), inset 0 1px 0 rgba(255,255,255,.78), inset 0 -1px 0 rgba(255,255,255,.1)",
  backdropFilter: "blur(36px) saturate(200%)",
  WebkitBackdropFilter: "blur(36px) saturate(200%)",
};

const dockCard: CSSProperties = {
  ...dockGlass,
  borderRadius: 28,
};

const INTENTS: { key: StoryIntent; icon: typeof Moon; title: string; desc: string; tint: string; soft: string }[] = [
  { key: "acalmar", icon: Moon, title: "Acalmar antes de dormir", desc: "Ritmo lento, final tranquilo", tint: "#7C6AC7", soft: "rgba(124,106,199,0.14)" },
  { key: "ensinar", icon: Heart, title: "Ensinar algo", desc: "Um valor sem sermão", tint: "#E8821A", soft: "rgba(232,130,26,0.12)" },
  { key: "coragem", icon: Shield, title: "Dar coragem", desc: "Vencer um medo gentilmente", tint: "#2F7D5B", soft: "rgba(47,125,91,0.12)" },
  { key: "divertir", icon: Smile, title: "Divertir e imaginar", desc: "Aventura leve, humor bobo", tint: "#D97706", soft: "rgba(245,158,11,0.12)" },
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(childName));
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setKeywords(arr.slice(0, 12));
      }
    } catch {
      /* noop */
    }
  }, [childName]);

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
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === "Backspace" && !input && keywords.length) {
      removeKeyword(keywords.length - 1);
    }
  };

  const interestsString = useMemo(() => keywords.join(", "), [keywords]);
  const canGenerate = keywords.length > 0 && age >= 1 && age <= 12;
  const blocked = !isPremium && storiesRemaining <= 0;

  const handleSubmit = () => {
    if (!canGenerate || isLoading) return;
    try {
      localStorage.setItem(storageKey(childName), JSON.stringify(keywords));
    } catch {
      /* noop */
    }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        fontFamily: FONT,
        position: "relative",
        margin: "0 -16px -8px",
        padding: "0 16px 110px",
      }}
    >
      {/* Fundo cênico */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -80,
          bottom: -40,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <img
          src={BG}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "40% 38%",
            filter: "saturate(1.05) brightness(1.06)",
            transform: "scale(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255,240,200,.45) 0%, transparent 58%)," +
              "linear-gradient(180deg, rgba(255,252,248,.42) 0%, rgba(250,245,232,.68) 40%, rgba(248,244,230,.9) 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Progresso 2/2 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, paddingTop: 4 }}>
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: "linear-gradient(90deg, #F0A24C, #E8821A)",
              boxShadow: "0 1px 6px rgba(232,130,26,.35)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: "linear-gradient(90deg, #F0A24C, #E8821A)",
              boxShadow: "0 1px 6px rgba(232,130,26,.35)",
            }}
          />
        </div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 14 }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 10.5,
              fontWeight: 900,
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "#D97A1E",
            }}
          >
            Passo 2 de 2
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 24,
              lineHeight: 1.15,
              color: "#1A2818",
              letterSpacing: "-0.35px",
              textShadow: "0 1px 14px rgba(255,255,255,.5)",
            }}
          >
            Vamos criar a história do {childName}
          </h2>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(40,55,35,.58)",
              lineHeight: 1.4,
              maxWidth: 320,
            }}
          >
            Escolha o mundo e o que a história precisa entregar hoje.
          </p>
        </motion.div>

        {/* Idade */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ ...dockCard, padding: "14px 14px 12px", marginBottom: 12 }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12.5,
              fontWeight: 900,
              color: "#1A2818",
            }}
          >
            Idade do {childName}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const on = age === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setAge(n);
                    haptic("light");
                  }}
                  className="active:scale-95"
                  style={{
                    minWidth: 44,
                    height: 42,
                    padding: "0 12px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    background: on
                      ? "linear-gradient(180deg, #F0A24C, #E8821A)"
                      : "rgba(255,255,255,.35)",
                    color: on ? "#fff" : "#A35E10",
                    border: on ? "0.5px solid rgba(255,220,140,.6)" : "0.5px solid rgba(255,255,255,.55)",
                    boxShadow: on
                      ? "0 6px 14px rgba(232,130,26,.3)"
                      : "inset 0 1px 0 rgba(255,255,255,.4)",
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Palavras-chave */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ ...dockCard, padding: "16px 14px", marginBottom: 12 }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 17,
              color: "#1A2818",
              lineHeight: 1.2,
            }}
          >
            O que faz os olhos do {childName} brilharem?
          </h3>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12.5,
              fontWeight: 700,
              color: "rgba(40,55,35,.55)",
              lineHeight: 1.35,
            }}
          >
            Nomes, paixões e pessoas queridas. Vão entrar na história.
          </p>

          {keywords.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {keywords.map((k, i) => (
                <motion.span
                  key={`${k}-${i}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 6px 6px 12px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 800,
                    background: "rgba(232,130,26,.14)",
                    color: "#7A4A0F",
                    border: "0.5px solid rgba(232,130,26,.22)",
                  }}
                >
                  {k}
                  <button
                    type="button"
                    onClick={() => removeKeyword(i)}
                    aria-label={`Remover ${k}`}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,.4)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={12} />
                  </button>
                </motion.span>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 18,
              background: "rgba(255,255,255,.4)",
              border: "0.5px solid rgba(255,255,255,.65)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex.: dinossauros, vó Maria"
              maxLength={40}
              aria-label="Adicionar palavra-chave"
              style={{
                flex: 1,
                background: "transparent",
                outline: "none",
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                color: "#1A2818",
                fontFamily: FONT,
                minWidth: 0,
              }}
            />
            <button
              type="button"
              onClick={() => addKeyword(input)}
              disabled={!input.trim()}
              aria-label="Adicionar"
              className="active:scale-95"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                opacity: input.trim() ? 1 : 0.4,
                background: "linear-gradient(180deg, #F0A24C, #E8821A)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(232,130,26,.3)",
              }}
            >
              <Plus size={17} strokeWidth={2.5} />
            </button>
          </div>

          {keywords.length < 3 && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KEYWORD_SUGGESTIONS.filter(
                (s) => !keywords.some((k) => k.toLowerCase() === s.toLowerCase()),
              )
                .slice(0, 5)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addKeyword(s)}
                    className="active:scale-95"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: "6px 11px",
                      borderRadius: 999,
                      background: "rgba(47,125,91,.1)",
                      color: "#2F7D5B",
                      border: "0.5px dashed rgba(47,125,91,.35)",
                      cursor: "pointer",
                    }}
                  >
                    + {s}
                  </button>
                ))}
            </div>
          )}
        </motion.div>

        {/* Intenção */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          style={{ ...dockCard, padding: "16px 14px", marginBottom: 12 }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 17,
              color: "#1A2818",
            }}
          >
            Qual o presente de hoje?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 12,
            }}
          >
            {INTENTS.map((it) => {
              const Icon = it.icon;
              const active = intent === it.key;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => {
                    setIntent(it.key);
                    haptic("light");
                  }}
                  className="active:scale-[0.98]"
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 18,
                    minHeight: 96,
                    cursor: "pointer",
                    background: active
                      ? `linear-gradient(160deg, ${it.soft}, rgba(255,255,255,.4))`
                      : "rgba(255,255,255,.32)",
                    border: active ? `1.5px solid ${it.tint}` : "0.5px solid rgba(255,255,255,.55)",
                    boxShadow: active
                      ? `0 8px 18px ${it.soft}`
                      : "inset 0 1px 0 rgba(255,255,255,.4)",
                    transition: "all .18s",
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(145deg, ${it.tint}cc, ${it.tint})`,
                      boxShadow: `0 4px 10px ${it.soft}`,
                    }}
                  >
                    <Icon size={16} color="#fff" strokeWidth={2.2} />
                  </span>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12.5,
                      fontWeight: 900,
                      lineHeight: 1.2,
                      color: "#1A2818",
                    }}
                  >
                    {it.title}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 10.5,
                      fontWeight: 700,
                      lineHeight: 1.25,
                      color: "rgba(40,55,35,.55)",
                    }}
                  >
                    {it.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {intent === "ensinar" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ overflow: "hidden" }}
            >
              <p
                style={{
                  margin: "14px 0 8px",
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "rgba(40,55,35,.55)",
                }}
              >
                Ensinar a…
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ENSINAR_OPTIONS.map((o) => {
                  const active = ensinarSub === o.key;
                  return (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => {
                        setEnsinarSub(o.key);
                        haptic("light");
                      }}
                      className="active:scale-95"
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: "7px 12px",
                        borderRadius: 999,
                        cursor: "pointer",
                        background: active
                          ? "linear-gradient(180deg, #F0A24C, #E8821A)"
                          : "rgba(255,255,255,.35)",
                        color: active ? "#fff" : "#A35E10",
                        border: active
                          ? "0.5px solid rgba(255,220,140,.5)"
                          : "0.5px solid rgba(255,255,255,.5)",
                      }}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Voz */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{ ...dockCard, padding: "16px 14px", marginBottom: 12 }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 17,
              color: "#1A2818",
            }}
          >
            Voz da narração
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(40,55,35,.55)",
            }}
          >
            Voz feminina suave em português. Escolha o ritmo.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {(
              [
                { key: "normal" as const, label: "Normal", desc: "Para qualquer hora" },
                { key: "lenta" as const, label: "Mais devagar", desc: "Para dormir" },
              ] as const
            ).map((v) => {
              const active = voiceRate === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => {
                    setVoiceRate(v.key);
                    haptic("light");
                  }}
                  className="active:scale-[0.98]"
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 18,
                    cursor: "pointer",
                    background: active ? "rgba(124,106,199,.16)" : "rgba(255,255,255,.32)",
                    border: active ? "1.5px solid #7C6AC7" : "0.5px solid rgba(255,255,255,.55)",
                    boxShadow: active
                      ? "0 6px 14px rgba(124,106,199,.15)"
                      : "inset 0 1px 0 rgba(255,255,255,.4)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#1A2818" }}>
                    {v.label}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(40,55,35,.55)",
                    }}
                  >
                    {v.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Quota */}
        {!isPremium && (
          <div
            style={{
              ...dockCard,
              padding: "12px 14px",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: blocked
                ? "linear-gradient(165deg, rgba(255,220,230,.55), rgba(255,255,255,.2))"
                : dockGlass.background,
              border: blocked
                ? "0.5px solid rgba(244,63,94,.28)"
                : dockGlass.border,
            }}
          >
            {blocked ? (
              <Lock size={18} color="#9F1239" style={{ flexShrink: 0 }} />
            ) : (
              <Sparkles size={18} color="#D97706" style={{ flexShrink: 0 }} />
            )}
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                fontWeight: 800,
                lineHeight: 1.3,
                color: blocked ? "#9F1239" : "#92400E",
              }}
            >
              {blocked
                ? `A primeira foi por nossa conta. Assine para criar histórias ilimitadas do ${childName}.`
                : `A primeira história personalizada do ${childName} é por nossa conta.`}
            </p>
          </div>
        )}

        {!canGenerate && !isLoading && !blocked && (
          <p
            style={{
              textAlign: "center",
              fontSize: 11.5,
              fontWeight: 800,
              color: "rgba(40,55,35,.5)",
              margin: "8px 0 0",
            }}
          >
            Adicione pelo menos uma palavra-chave para começar.
          </p>
        )}
      </div>

      {/* CTA sticky */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 88px)",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(248,244,230,.75) 28%, rgba(248,244,230,.95) 100%)",
          pointerEvents: "none",
        }}
      >
        {blocked ? (
          <motion.button
            type="button"
            onClick={onUpgrade}
            whileTap={{ scale: 0.97 }}
            className="active:scale-[0.98]"
            style={{
              pointerEvents: "auto",
              width: "100%",
              minHeight: 52,
              borderRadius: R.btn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontWeight: 900,
              fontSize: 14.5,
              color: "#fff",
              border: "0.5px solid rgba(255,255,255,.4)",
              background: "linear-gradient(135deg, #7C6AC7, #E8821A)",
              boxShadow: "0 12px 28px rgba(124,106,199,.4)",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <Crown size={17} />
            Assinar e criar histórias ilimitadas
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!canGenerate || isLoading}
            whileTap={{ scale: 0.97 }}
            className="active:scale-[0.98]"
            style={{
              pointerEvents: "auto",
              width: "100%",
              minHeight: 52,
              borderRadius: R.btn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontWeight: 900,
              fontSize: 14.5,
              color: "#2A1608",
              opacity: !canGenerate || isLoading ? 0.5 : 1,
              cursor: !canGenerate || isLoading ? "default" : "pointer",
              border: "0.5px solid rgba(255,235,190,.7)",
              background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
              boxShadow:
                "0 10px 28px rgba(180,100,20,.38), 0 1px 0 rgba(255,250,230,.9) inset, 0 -3px 8px rgba(100,50,0,.16) inset",
              fontFamily: FONT,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Tecendo a história…
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Criar a história do {childName}
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PersonalizationPanel;
