/**
 * Histórias — HOME premium v2
 * Ref: public/telas/historia/*
 * Assets: public/exemplos/assets/historias-v2/* (Hermes/Codex gpt-image)
 * Pessoas/família — sem lagarto. Lógica real: fábrica, coleções, continue lendo, chips.
 */
import { useMemo, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, Sparkles, Bookmark, Star, Leaf, Moon, Smile, X, Gift,
} from "lucide-react";
import { useMemories } from "@/hooks/useMemories";
import { useAuth } from "@/contexts/AuthContext";
import { getAllProgress } from "@/lib/storyProgress";
import { haptic } from "@/lib/haptics";
import StoryFactory from "./StoryFactory";
import ReadingMode from "./ReadingMode";
import { LIBRARY_STORIES } from "./storyLibrary";
import { FONT, SERIF, R, PAD, glassLight, glassLightSoft, pillGlassLight, goldBtn } from "@/lib/premiumUi";
import PremiumSeal from "@/components/common/PremiumSeal";
import Icon3D from "@/components/common/Icon3D";
import { STORY_BENEFIT_ICONS } from "@/lib/kidzzIcons";

const HI = "/exemplos/assets/historias-v2";

type ChipKey = "favoritas" | "novidades" | "dormir" | "divertidas";

const CHIPS: { key: ChipKey; label: string; sub: string; icon: typeof Star; tint: string; ring: string }[] = [
  { key: "favoritas", label: "Favoritas", sub: "Suas histórias preferidas", icon: Star, tint: "#FBBF24", ring: "rgba(251,191,36,0.18)" },
  { key: "novidades", label: "Novidades", sub: "Histórias novas para hoje", icon: Leaf, tint: "#2F7D5B", ring: "rgba(47,125,91,0.16)" },
  { key: "dormir", label: "Para dormir", sub: "Histórias calmas e relaxantes", icon: Moon, tint: "#7C6AC7", ring: "rgba(124,106,199,0.18)" },
  { key: "divertidas", label: "Divertidas", sub: "Aventuras para rir e imaginar", icon: Smile, tint: "#F59E0B", ring: "rgba(245,158,11,0.18)" },
];

const FEATURE_TILES = [
  { key: "temas", label: "Temas e mundos", sub: "Explore centenas de aventuras.", cover: `${HI}/tile-temas.png`, tint: [160, 120, 230] as const },
  { key: "personagens", label: "Personagens", sub: "Crie heróis únicos.", cover: `${HI}/tile-personagens.png`, tint: [100, 180, 120] as const },
  { key: "ilustracoes", label: "Ilustrações", sub: "Cada página ganha vida.", cover: `${HI}/tile-ilustracoes.png`, tint: [110, 160, 230] as const },
  { key: "narradores", label: "Narradores", sub: "Escolha a voz da história.", cover: `${HI}/tile-narradores.png`, tint: [240, 160, 70] as const },
];

const COLLECTIONS = [
  { key: "aventura", label: "Aventuras", desc: "Coragem e descoberta", img: `${HI}/tile-temas.png`, tag: "aventura" },
  { key: "amizade", label: "Amizade", desc: "Cuidar e compartilhar", img: `${HI}/tile-personagens.png`, tag: "amizade" },
  { key: "natureza", label: "Natureza", desc: "Conectar com o mundo", img: `${HI}/tile-ilustracoes.png`, tag: "natureza" },
  { key: "familia", label: "Família", desc: "Fortalece os laços", img: `${HI}/feat-familia.png`, tag: "familia" },
];

const BENEFITS = STORY_BENEFIT_ICONS;

const tileGlass = (r: number, g: number, b: number): CSSProperties => ({
  background: `linear-gradient(165deg, rgba(255,255,255,.92) 0%, rgba(${r},${g},${b},.38) 50%, rgba(${r},${g},${b},.22) 100%)`,
  border: "0.5px solid rgba(255,255,255,.96)",
  borderRadius: 24,
  boxShadow: `0 14px 36px rgba(40,30,15,.12), 0 0 24px rgba(${r},${g},${b},.18), 0 1.5px 0 rgba(255,255,255,1) inset`,
  backdropFilter: "blur(36px) saturate(190%)",
  WebkitBackdropFilter: "blur(36px) saturate(190%)",
});

interface Props {
  onBack: () => void;
}

const StoriesHome = ({ onBack }: Props) => {
  const { allMemories, toggleSpecial } = useMemories();
  const { profile } = useAuth();
  const [mode, setMode] = useState<"home" | "factory">("home");
  const [chip, setChip] = useState<ChipKey | null>(null);
  const [chipOpen, setChipOpen] = useState(false);
  const [collection, setCollection] = useState<typeof COLLECTIONS[number] | null>(null);
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

  const filteredByChip = useMemo(() => {
    if (!chip) return [] as typeof stories;
    if (chip === "favoritas") return stories.filter((s) => s.is_special);
    if (chip === "novidades") {
      const sinceTs = Date.now() - 7 * 86400e3;
      return stories.filter((s) => new Date(s.created_at).getTime() >= sinceTs);
    }
    const needle = chip === "dormir" ? /dorm|sonh|calm|noite/i : /divert|engra|aventur|rir/i;
    return stories.filter((s) => {
      const meta = (s.metadata as any)?.interests || "";
      return needle.test(s.title) || needle.test(String(meta));
    });
  }, [chip, stories]);

  const collectionStories = useMemo(() => {
    if (!collection) return [] as typeof stories;
    const rx = new RegExp(collection.tag, "i");
    return stories.filter((s) => {
      const meta = (s.metadata as any)?.interests || "";
      return rx.test(String(meta)) || rx.test(s.title);
    });
  }, [collection, stories]);

  const openFactory = () => {
    haptic("medium");
    setMode("factory");
  };

  if (mode === "factory") {
    return <StoryFactory onBack={() => setMode("home")} />;
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

        {/* ── 4 TILES ── */}
        <section style={{ padding: `18px ${PAD}px 0` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {FEATURE_TILES.map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.97 }}
                onClick={openFactory}
                className="text-left relative overflow-hidden"
                style={{ padding: 12, minHeight: 150, ...tileGlass(t.tint[0], t.tint[1], t.tint[2]) }}
              >
                <img
                  src={t.cover}
                  alt=""
                  style={{
                    width: "100%",
                    height: 88,
                    objectFit: "cover",
                    borderRadius: 18,
                    marginBottom: 10,
                    boxShadow: "0 8px 18px rgba(40,30,15,.14)",
                    border: "0.5px solid rgba(255,255,255,.8)",
                  }}
                />
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: "#1F2A22", lineHeight: 1.15 }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(42,37,32,0.58)", marginTop: 3, lineHeight: 1.3 }}>
                  {t.sub}
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    bottom: 10,
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,.9)",
                    boxShadow: "0 4px 10px rgba(40,30,15,.12)",
                  }}
                >
                  <ArrowRight size={13} color="#2A2520" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── BENEFÍCIOS ── */}
        <section style={{ padding: `18px ${PAD}px 0` }}>
          <h2 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 600, fontSize: 18, color: "#F6F1E8", textAlign: "center" }}>
            Histórias que moldam o futuro
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                style={{
                  padding: "14px 12px",
                  textAlign: "center",
                  borderRadius: 20,
                  background: "linear-gradient(160deg, rgba(255,255,255,.1), rgba(255,255,255,.04))",
                  border: "0.5px solid rgba(255,255,255,.16)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <Icon3D src={b.src} fallback={b.fb} size={48} radius={16} alt={b.title} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#F6F1E8" }}>{b.title}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(246,241,232,0.55)", marginTop: 2 }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COLEÇÕES ── */}
        <section style={{ padding: `20px ${PAD}px 0` }}>
          <h2 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#F6F1E8" }}>
            Coleções especiais
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {COLLECTIONS.map((col) => {
              const count = stories.filter((s) => {
                const meta = (s.metadata as any)?.interests || "";
                return new RegExp(col.tag, "i").test(String(meta)) || new RegExp(col.tag, "i").test(s.title);
              }).length;
              return (
                <motion.button
                  key={col.key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { haptic("light"); setCollection(col); }}
                  className="text-left overflow-hidden"
                  style={{ ...glassLight, borderRadius: 22, padding: 0 }}
                >
                  <img src={col.img} alt="" loading="lazy" style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "10px 12px 12px" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#2A2520" }}>{col.label}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: "rgba(42,37,32,0.55)", lineHeight: 1.3 }}>{col.desc}</p>
                    <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: 900, color: "#E8821A" }}>
                      {count} {count === 1 ? "história" : "histórias"}
                    </p>
                  </div>
                </motion.button>
              );
            })}
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

        {/* ── CHIPS ── */}
        <section style={{ padding: `18px ${PAD}px 8px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CHIPS.map((c) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => { haptic("light"); setChip(c.key); setChipOpen(true); }}
                className="text-left relative"
                style={{ padding: 14, minHeight: 118, ...glassLight, borderRadius: 22 }}
                aria-label={c.label}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-2"
                  style={{ background: c.ring, color: c.tint }}
                >
                  <Icon size={20} />
                </div>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "#2A2520" }}>{c.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11.5, fontWeight: 700, color: "rgba(42,37,32,0.55)", lineHeight: 1.3 }}>
                  {c.sub}
                </p>
                <ArrowRight size={14} className="absolute bottom-3 right-3" style={{ color: "rgba(42,37,32,0.35)" }} />
              </motion.button>
            );
          })}
        </section>

        {/* trust strip */}
        <section
          style={{
            margin: `12px ${PAD}px 8px`,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            ...glassLightSoft,
            borderRadius: 22,
          }}
        >
          <img
            src={`${HI}/feat-familia.png`}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover", flexShrink: 0 }}
          />
          <div className="min-w-0">
            <div style={{ fontSize: 13.5, fontWeight: 900, color: "#2A2520" }}>Para toda a família</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(42,37,32,0.55)", lineHeight: 1.35 }}>
              Momentos que aproximam e ficam guardados para sempre.
            </div>
          </div>
        </section>
      </div>

      {/* ── Chip drawer ── */}
      <AnimatePresence>
        {chipOpen && chip && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={() => setChipOpen(false)} />
            <motion.div
              className="relative mt-auto rounded-t-3xl max-h-[80vh] flex flex-col"
              style={{ background: "linear-gradient(180deg,#FFF9F0,#F5EFE3)" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: "#1F2A22" }}>
                  {CHIPS.find((c) => c.key === chip)?.label}
                </h3>
                <button onClick={() => setChipOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full" style={pillGlassLight} aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-8">
                {filteredByChip.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[14px] font-bold" style={{ color: "#2A2520" }}>Ainda não há histórias aqui</p>
                    <p className="text-[12px] mt-1" style={{ color: "rgba(42,37,32,0.6)" }}>
                      Crie uma nova com {childName} como protagonista.
                    </p>
                    <motion.button
                      onClick={() => { setChipOpen(false); openFactory(); }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-4 px-5 py-2.5 rounded-full text-white text-[13px] font-extrabold"
                      style={{ background: "#E8821A" }}
                    >
                      Criar agora
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredByChip.map((s) => (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setChipOpen(false); setSelected(s); }}
                        className="text-left rounded-2xl p-2.5"
                        style={{ ...glassLight, borderRadius: 18 }}
                      >
                        {s.image_url ? (
                          <img src={s.image_url} alt="" className="w-full aspect-square object-cover rounded-xl mb-2" loading="lazy" />
                        ) : (
                          <div className="w-full aspect-square rounded-xl mb-2 bg-amber-100 flex items-center justify-center text-3xl">📖</div>
                        )}
                        <p className="text-[12px] font-extrabold line-clamp-2" style={{ color: "#2A2520" }}>{s.title}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collection drawer ── */}
      <AnimatePresence>
        {collection && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={() => setCollection(null)} />
            <motion.div
              className="relative mt-auto rounded-t-3xl max-h-[85vh] flex flex-col"
              style={{ background: "linear-gradient(180deg,#FFF9F0,#F5EFE3)" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <img src={collection.img} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: "#1F2A22" }}>
                    {collection.label}
                  </h3>
                  <p className="text-[11.5px] leading-snug line-clamp-1" style={{ color: "rgba(42,37,32,0.6)" }}>
                    {collection.desc}
                  </p>
                </div>
                <button onClick={() => setCollection(null)} className="w-10 h-10 flex items-center justify-center rounded-full shrink-0" style={pillGlassLight} aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-8">
                {collectionStories.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[14px] font-bold" style={{ color: "#2A2520" }}>Ainda não há histórias nesta coleção</p>
                    <p className="text-[12px] mt-1" style={{ color: "rgba(42,37,32,0.6)" }}>
                      Crie uma nova com {childName} como protagonista.
                    </p>
                    <motion.button
                      onClick={() => { setCollection(null); openFactory(); }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-4 px-5 py-2.5 rounded-full text-white text-[13px] font-extrabold"
                      style={{ background: "#E8821A" }}
                    >
                      Criar agora
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {collectionStories.map((s) => (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setCollection(null); setSelected(s); }}
                        className="text-left rounded-2xl p-2.5"
                        style={{ ...glassLight, borderRadius: 18 }}
                      >
                        {s.image_url ? (
                          <img src={s.image_url} alt="" className="w-full aspect-square object-cover rounded-xl mb-2" loading="lazy" />
                        ) : (
                          <div className="w-full aspect-square rounded-xl mb-2 bg-amber-100 flex items-center justify-center text-3xl">📖</div>
                        )}
                        <p className="text-[12px] font-extrabold line-clamp-2" style={{ color: "#2A2520" }}>{s.title}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
