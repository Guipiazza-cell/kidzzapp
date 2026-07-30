/**
 * Histórias — HOME premium v2
 * Ref: public/telas/historia/*
 * Assets: public/exemplos/assets/historias-v2/* (Hermes/Codex gpt-image)
 * Pessoas/família — sem lagarto. Lógica real: fábrica, coleções, continue lendo, chips.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, Sparkles, Bookmark, Star, X, Gift,
  UserRound, Tags, Target, AudioLines,
} from "lucide-react";
import { useMemories } from "@/hooks/useMemories";
import { useAuth } from "@/contexts/AuthContext";
import { getAllProgress } from "@/lib/storyProgress";
import { haptic } from "@/lib/haptics";
import StoryFactory from "./StoryFactory";
import ReadingMode from "./ReadingMode";
import { LIBRARY_STORIES } from "./storyLibrary";
import { FONT, SERIF, R, PAD, glassLight, pillGlassLight, goldBtn } from "@/lib/premiumUi";
import PremiumSeal from "@/components/common/PremiumSeal";

const HI = "/exemplos/assets/historias-v2";

/** Coleções especiais — cards “Em breve” (ainda não liberadas). */
const COLLECTIONS = [
  { key: "aventura", label: "Aventuras", desc: "Coragem e descoberta", img: `${HI}/tile-temas.png` },
  { key: "amizade", label: "Amizade", desc: "Cuidar e compartilhar", img: `${HI}/tile-personagens.png` },
  { key: "natureza", label: "Natureza", desc: "Conectar com o mundo", img: `${HI}/tile-ilustracoes.png` },
  { key: "familia", label: "Família", desc: "Fortalece os laços", img: `${HI}/feat-familia.png` },
];

/** Passos da fábrica — na home (antes de “Criar minha história”). */
const HOW_IT_WORKS: {
  title: string;
  sub: string;
  Icon: typeof UserRound;
  glow: [string, string, string];
}[] = [
  { title: "Monte o avatar", sub: "O rosto e o jeitinho do seu filho", Icon: UserRound, glow: ["#FFD9A8", "#F0A24C", "#C77E1E"] },
  { title: "Escolha palavras-chave", sub: "O mundo e os interesses dele", Icon: Tags, glow: ["#FFE9A8", "#F2C24C", "#C98F1E"] },
  { title: "Diga o objetivo", sub: "O que a história precisa entregar", Icon: Target, glow: ["#C0EDC8", "#5CB57A", "#2F7A4E"] },
  { title: "Narração suave", sub: "Voz feminina que embala e acalma", Icon: AudioLines, glow: ["#D2CCF0", "#8A7AD8", "#5E4EA8"] },
];

interface Props {
  onBack: () => void;
}

const StoriesHome = ({ onBack }: Props) => {
  const { allMemories, toggleSpecial } = useMemories();
  const { profile } = useAuth();
  const [mode, setMode] = useState<"home" | "factory">("home");
  const [selected, setSelected] = useState<any | null>(null);
  const [reading, setReading] = useState(false);

  const childName = profile?.child_name || "amigo";
  const stories = useMemo(() => {
    const userStories = allMemories.filter((m) => m.type === "story");
    return [...LIBRARY_STORIES, ...userStories];
  }, [allMemories]);
  const progress = getAllProgress();

  const continueReading = useMemo(() => {
    return stories
      .filter((s) => progress[s.id] && progress[s.id].pct < 100)
      .sort((a, b) => progress[b.id].updatedAt - progress[a.id].updatedAt)
      .slice(0, 8);
  }, [stories, progress]);

  const openFactory = () => {
    haptic("medium");
    setMode("factory");
  };

  if (mode === "factory") {
    // Pula o intro da fábrica (já está na home com “Como funciona”).
    return <StoryFactory onBack={() => setMode("home")} skipIntro />;
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      style={{
        fontFamily: FONT,
        /* Base escura + acento dourado (relatório rodada 2) */
        background: "linear-gradient(180deg,#1A1410 0%,#241C16 42%,#2A2218 100%)",
        color: "#F6F1E8",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,180,80,.22),transparent 68%)", filter: "blur(20px)" }} />
        <div style={{ position: "absolute", top: 220, left: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(120,90,40,.18),transparent 68%)", filter: "blur(24px)" }} />
      </div>

      <div
        className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
        }}
      >
        {/* ── TOP BAR ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
            paddingLeft: PAD,
            paddingRight: PAD,
            paddingBottom: 10,
            background: "linear-gradient(180deg, rgba(26,20,16,.92) 0%, rgba(26,20,16,.55) 70%, transparent 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { haptic("light"); onBack(); }}
              className="active:scale-95"
              style={{
                width: 44, height: 44, borderRadius: R.btn, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)",
                backdropFilter: "blur(12px)",
              }}
              aria-label="Voltar"
            >
              <ArrowRight size={18} style={{ transform: "rotate(180deg)", color: "#F6F1E8" }} />
            </button>
            <div
              className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3"
              style={{
                minHeight: 44, borderRadius: R.btn,
                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <BookOpen size={15} color="#F0C25A" />
              <span style={{ fontWeight: 800, fontSize: 13.5, color: "#F6F1E8" }}>Histórias</span>
              <PremiumSeal />
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <section style={{ padding: `8px ${PAD}px 0`, position: "relative" }}>
          <div style={{ position: "relative", minHeight: 280 }}>
            <div style={{ position: "relative", zIndex: 2, maxWidth: "58%", paddingTop: 8 }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 30,
                  lineHeight: 1.12,
                  color: "#F6F1E8",
                  letterSpacing: "-0.4px",
                  textShadow: "0 2px 16px rgba(0,0,0,.45)",
                }}
              >
                Histórias que{" "}
                <span style={{ color: "#F0C25A" }}>criam memórias</span>.
              </h1>
              <p style={{ margin: "10px 0 14px", fontSize: 13.5, fontWeight: 700, lineHeight: 1.45, color: "rgba(246,241,232,0.72)" }}>
                Criamos histórias únicas com o nome, o rosto e o mundo do seu filho.
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-2"
                style={{
                  borderRadius: 16,
                  background: "linear-gradient(160deg, rgba(255,255,255,.9), rgba(255,240,220,.75))",
                  border: "0.5px solid rgba(255,255,255,.95)",
                  boxShadow: "0 6px 18px rgba(40,30,15,.08)",
                }}
              >
                <Gift size={16} color="#E8821A" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#2A2520" }}>1 história gratuita hoje</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(42,37,32,0.55)" }}>Sem compromisso. Experimente!</div>
                </div>
              </div>
            </div>

            <img
              src={`${HI}/hero-kids.png`}
              alt="Crianças lendo história mágica"
              style={{
                position: "absolute",
                top: -10,
                right: -20,
                width: "56%",
                height: 300,
                objectFit: "cover",
                objectPosition: "center 20%",
                borderRadius: "40% 0 0 50%",
                maskImage: "radial-gradient(70% 70% at 55% 45%, #000 40%, transparent 78%)",
                WebkitMaskImage: "radial-gradient(70% 70% at 55% 45%, #000 40%, transparent 78%)",
                filter: "saturate(1.08)",
                pointerEvents: "none",
              }}
            />
          </div>

          <motion.button
            onClick={openFactory}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2"
            style={{
              ...goldBtn,
              marginTop: 8,
              width: "100%",
              minHeight: 52,
              fontSize: 15,
              background: "linear-gradient(180deg,#F5A84A 0%,#E8821A 52%,#D06A10 100%)",
              color: "#fff",
              border: "0.5px solid rgba(255,220,160,.55)",
              boxShadow: "0 12px 32px rgba(200,100,20,.35), 0 1px 0 rgba(255,255,255,.4) inset",
            }}
          >
            <Sparkles size={16} />
            Criar minha história
            <ArrowRight size={16} />
          </motion.button>
        </section>

        {/* ── COMO FUNCIONA (antes na fábrica; agora na home) ── */}
        <section style={{ padding: `22px ${PAD}px 0` }}>
          <h2 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#F6F1E8" }}>
            Como funciona
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {HOW_IT_WORKS.map((s) => {
              const [l, m, d] = s.glow;
              const StepIcon = s.Icon;
              return (
                <div
                  key={s.title}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    borderRadius: 20,
                    padding: "11px 12px",
                    background: "linear-gradient(155deg,rgba(255,253,247,.92),rgba(250,240,222,.72))",
                    border: "1px solid rgba(255,255,255,1)",
                    boxShadow: "0 10px 22px rgba(20,12,8,.22), inset 0 1.5px 0 rgba(255,255,255,1)",
                  }}
                >
                  <div
                    style={{
                      flex: "none",
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${l} 18%, ${m} 58%, ${d} 100%)`,
                      boxShadow: "0 6px 14px rgba(150,95,20,.25), inset 0 1.5px 2px rgba(255,255,255,.7), inset 0 -4px 8px rgba(0,0,0,.16)",
                    }}
                  >
                    <StepIcon size={18} color="#fff" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14.5, color: "#3A2410", lineHeight: 1.15 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A6E42", lineHeight: 1.3, marginTop: 2 }}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                maxWidth: 340,
                padding: "9px 15px",
                borderRadius: 999,
                background: "linear-gradient(160deg,rgba(255,252,244,.88),rgba(245,232,210,.55))",
                border: "1px solid rgba(255,255,255,.55)",
                boxShadow: "0 8px 20px rgba(0,0,0,.18)",
                fontSize: 11,
                fontWeight: 800,
                color: "#8A6E42",
                lineHeight: 1.4,
              }}
            >
              <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>🔒</span>
              <span>A personalização é feita pelos pais. A criança recebe só a história pronta.</span>
            </div>
          </div>
        </section>

        {/* ── COLEÇÕES (Em breve) ── */}
        <section style={{ padding: `20px ${PAD}px 0` }}>
          <h2 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#F6F1E8" }}>
            Coleções especiais
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {COLLECTIONS.map((col) => (
              <div
                key={col.key}
                className="text-left overflow-hidden relative"
                style={{
                  ...glassLight,
                  borderRadius: 22,
                  padding: 0,
                  opacity: 0.88,
                }}
                aria-label={`${col.label} — em breve`}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={col.img}
                    alt=""
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: 96,
                      objectFit: "cover",
                      display: "block",
                      filter: "saturate(0.85) brightness(0.92)",
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(20,16,12,.12) 0%, rgba(20,16,12,.35) 100%)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      padding: "4px 9px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#2A1808",
                      background: "linear-gradient(180deg,#F5D08A 0%,#E8B85A 100%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,.22)",
                      border: "0.5px solid rgba(255,255,255,.55)",
                    }}
                  >
                    Em breve
                  </span>
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#2A2520" }}>{col.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: "rgba(42,37,32,0.55)", lineHeight: 1.3 }}>
                    {col.desc}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: 900, color: "rgba(42,37,32,0.42)" }}>
                    Em breve
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTINUE LENDO ── */}
        {continueReading.length > 0 && (
          <section style={{ padding: `20px 0 0` }}>
            <h2 style={{ margin: `0 ${PAD}px 12px`, fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#1F2A22" }}>
              Continue lendo
            </h2>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
              {continueReading.map((s) => {
                const p = progress[s.id];
                return (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { haptic("light"); setSelected(s); }}
                    className="snap-start shrink-0 w-[150px] text-left"
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        aspectRatio: "3/4",
                        borderRadius: 22,
                        background: "#EEE6D5",
                        boxShadow: "0 12px 28px -12px rgba(0,0,0,0.35)",
                        border: "0.5px solid rgba(255,255,255,.7)",
                      }}
                    >
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                      <span
                        className="absolute left-2 bottom-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-extrabold text-white"
                        style={{ background: "rgba(15,15,15,0.55)", backdropFilter: "blur(8px)" }}
                      >
                        <Sparkles size={10} className="text-amber-300" />
                        {p.pct}%
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSpecial(s.id, s.is_special); haptic("light"); }}
                        className="absolute right-1.5 bottom-1.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                        aria-label={s.is_special ? "Remover dos favoritos" : "Salvar nos favoritos"}
                      >
                        <Bookmark size={13} className={s.is_special ? "fill-amber-500 text-amber-500" : "text-gray-600"} />
                      </button>
                    </div>
                    <p className="mt-2 text-[12.5px] font-extrabold leading-tight line-clamp-2" style={{ color: "#2A2520" }}>
                      {s.title}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Favoritas (Em breve) — card único horizontal ── */}
        <section style={{ padding: `18px ${PAD}px 8px` }}>
          <div
            className="relative overflow-hidden"
            style={{
              ...glassLight,
              borderRadius: 22,
              padding: "16px 16px",
              minHeight: 88,
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: 0.92,
            }}
            aria-label="Favoritas — em breve"
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(251,191,36,0.18)",
                color: "#E8A010",
              }}
            >
              <Star size={24} fill="currentColor" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#2A2520" }}>Favoritas</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: "rgba(42,37,32,0.55)", lineHeight: 1.35 }}>
                Suas histórias preferidas, num só lugar.
              </p>
            </div>
            <span
              style={{
                flex: "none",
                padding: "5px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#2A1808",
                background: "linear-gradient(180deg,#F5D08A 0%,#E8B85A 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,.14)",
                border: "0.5px solid rgba(255,255,255,.55)",
              }}
            >
              Em breve
            </span>
          </div>
        </section>
      </div>

      {/* ── Detail / reading ── */}
      <AnimatePresence>
        {selected && !reading && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: "linear-gradient(180deg,#FFF9F0,#F5EFE3)" }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          >
            <div className="flex items-center gap-3 px-5 pb-3" style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}>
              <button onClick={() => setSelected(null)} className="w-11 h-11 flex items-center justify-center rounded-full" style={pillGlassLight} aria-label="Fechar">
                <X size={20} />
              </button>
              <h3 className="text-[15px] font-extrabold line-clamp-1 flex-1" style={{ color: "#2A2520" }}>{selected.title}</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
              {selected.image_url && (
                <img src={selected.image_url} alt="" className="w-full rounded-2xl shadow-md" />
              )}
              <motion.button
                onClick={() => { haptic("medium"); setReading(true); }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 px-5 rounded-full font-extrabold text-white text-[14px] flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(180deg,#F5A84A,#E8821A)",
                  boxShadow: "0 12px 28px rgba(200,100,20,.3)",
                }}
              >
                <BookOpen size={18} />
                Abrir modo leitura
              </motion.button>
              {selected.content && (
                <div className="prose prose-sm max-w-none">
                  {String(selected.content).split("\n").filter((p: string) => p.trim()).map((p: string, i: number) => (
                    <p key={i} className="text-[14px] leading-relaxed mb-3" style={{ color: "rgba(42,37,32,0.85)" }}>{p}</p>
                  ))}
                </div>
              )}
            </div>
            <AnimatePresence>
              {reading && (
                <ReadingMode
                  storyId={selected.id}
                  title={selected.title}
                  childName={childName}
                  story={selected.content || ""}
                  images={selected.image_url ? [selected.image_url] : []}
                  onClose={() => setReading(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesHome;
