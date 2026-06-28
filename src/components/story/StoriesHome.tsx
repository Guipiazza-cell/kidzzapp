/**
 * Histórias — HOME premium.
 * Hero "Uma história só sua" + 4 chips de categoria + Continue lendo (com progresso real) + Coleções especiais.
 * Mantém a Fábrica de Histórias atrás do CTA principal.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Bookmark, Star, Leaf, Moon, Smile, X } from "lucide-react";
import { useMemories } from "@/hooks/useMemories";
import { useAuth } from "@/contexts/AuthContext";
import { getAllProgress } from "@/lib/storyProgress";
import { haptic } from "@/lib/haptics";
import StoryFactory from "./StoryFactory";
import ReadingMode from "./ReadingMode";

import heroImg from "@/assets/stories-hero.jpg";
import aventuraImg from "@/assets/stories-aventura.jpg";
import amizadeImg from "@/assets/stories-amizade.jpg";
import naturezaImg from "@/assets/stories-natureza.jpg";
import familiaImg from "@/assets/stories-familia.jpg";

type ChipKey = "favoritas" | "novidades" | "dormir" | "divertidas";

const CHIPS: { key: ChipKey; label: string; sub: string; icon: any; tint: string; ring: string }[] = [
  { key: "favoritas",  label: "Favoritas",  sub: "Suas histórias preferidas", icon: Star,  tint: "#FBBF24", ring: "rgba(251,191,36,0.18)" },
  { key: "novidades",  label: "Novidades",  sub: "Histórias novas para hoje", icon: Leaf,  tint: "#2F7D5B", ring: "rgba(47,125,91,0.16)" },
  { key: "dormir",     label: "Para dormir",sub: "Histórias calmas e relaxantes", icon: Moon, tint: "#7C6AC7", ring: "rgba(124,106,199,0.18)" },
  { key: "divertidas", label: "Divertidas", sub: "Aventuras para rir e imaginar", icon: Smile, tint: "#F59E0B", ring: "rgba(245,158,11,0.18)" },
];

const COLLECTIONS = [
  { key: "aventura", label: "Aventuras", desc: "Histórias de coragem e descoberta", img: aventuraImg, tag: "aventura" },
  { key: "amizade",  label: "Amizade",   desc: "Histórias sobre cuidar e compartilhar", img: amizadeImg, tag: "amizade" },
  { key: "natureza", label: "Natureza",  desc: "Histórias que conectam com o mundo natural", img: naturezaImg, tag: "natureza" },
  { key: "familia",  label: "Família",   desc: "Histórias que fortalecem os laços", img: familiaImg, tag: "familia" },
];

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
  const stories = useMemo(() => allMemories.filter((m) => m.type === "story"), [allMemories]);
  const progress = getAllProgress();

  const continueReading = useMemo(() => {
    return stories
      .filter((s) => progress[s.id] && progress[s.id].pct < 100)
      .sort((a, b) => (progress[b.id].updatedAt - progress[a.id].updatedAt))
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

  if (mode === "factory") {
    return <StoryFactory onBack={() => setMode("home")} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0" style={{ background: "linear-gradient(180deg,#FDF8EE 0%, #F2EFE6 100%)" }}>
      {/* Header island */}
      <header
        className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}
      >
        <motion.button
          onClick={onBack}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-700"
          whileTap={{ scale: 0.9 }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="glass-island flex-1 min-w-0 flex items-center gap-2 px-3.5 py-2 rounded-full font-ui">
          <BookOpen size={16} className="text-[#2F4A2E] shrink-0" />
          <h1 className="font-display text-[17px] font-semibold truncate" style={{ color: "#2A2520" }}>Histórias</h1>
        </div>
      </header>

      <div
        className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 78px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
        }}
      >
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[28px] overflow-hidden mb-5"
          style={{
            background: "linear-gradient(180deg,#FFFBF1 0%, #F6EFE0 100%)",
            boxShadow: "0 10px 30px -16px rgba(42,37,32,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div className="relative">
            <img
              src={heroImg}
              alt="Criança lendo uma história mágica"
              width={1280}
              height={896}
              className="w-full h-[180px] object-cover"
              style={{ maskImage: "linear-gradient(180deg, #000 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 70%, transparent 100%)" }}
            />
          </div>
          <div className="px-5 pt-1 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-[#E8821A]" />
              <span className="text-[10.5px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "#E8821A" }}>
                Fábrica de Histórias
              </span>
            </div>
            <h2
              className="font-display font-semibold leading-[1.02] tracking-tight"
              style={{
                color: "#1F3A2A",
                fontSize: "clamp(28px, 8.6vw, 38px)",
                fontFamily: "'Fraunces', Georgia, serif",
              }}
            >
              Uma história só sua
            </h2>
            <p className="text-[13.5px] mt-2 leading-snug" style={{ color: "rgba(42,37,32,0.72)" }}>
              Criada com a criança dentro da história, do jeitinho que só ela merece.
            </p>

            <motion.button
              onClick={() => { haptic("medium"); setMode("factory"); }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full max-w-[320px] py-3.5 rounded-full text-white font-bold text-[14.5px] flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(180deg,#F19A3E,#E8821A)",
                boxShadow: "0 10px 22px -8px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
                fontFamily: "'Mulish', system-ui, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              <Sparkles size={16} />
              CRIAR MINHA HISTÓRIA
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.section>

        {/* CHIPS */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          {CHIPS.map((c) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => { haptic("light"); setChip(c.key); setChipOpen(true); }}
                className="text-left rounded-2xl p-3 relative"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 6px 18px -12px rgba(42,37,32,0.25), inset 0 1px 0 rgba(255,255,255,0.7)",
                  border: "1px solid rgba(42,37,32,0.06)",
                  minHeight: 110,
                }}
                aria-label={c.label}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{ background: c.ring, color: c.tint }}
                >
                  <Icon size={20} />
                </div>
                <p className="text-[14px] font-extrabold leading-tight" style={{ color: "#2A2520" }}>
                  {c.label}
                </p>
                <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: "rgba(42,37,32,0.6)" }}>
                  {c.sub}
                </p>
                <ArrowRight size={14} className="absolute bottom-3 right-3 text-[#2A2520]/40" />
              </motion.button>
            );
          })}
        </section>

        {/* CONTINUE LENDO */}
        {continueReading.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-[20px] font-semibold" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
                Continue lendo
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
              {continueReading.map((s) => {
                const p = progress[s.id];
                return (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { haptic("light"); setSelected(s); }}
                    className="snap-start shrink-0 w-[150px] text-left"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-[#EEE6D5]" style={{ aspectRatio: "3/4", boxShadow: "0 8px 22px -14px rgba(0,0,0,0.45)" }}>
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                      <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-extrabold text-white"
                        style={{ background: "rgba(15,15,15,0.55)", backdropFilter: "blur(8px)" }}>
                        <Sparkles size={10} className="text-amber-300" />
                        {p.pct}%
                        <span className="opacity-60 ml-0.5">—</span>
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSpecial(s.id, s.is_special); haptic("light"); }}
                        className="absolute right-1.5 bottom-1.5 w-7 h-7 rounded-full bg-white/85 flex items-center justify-center"
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

        {/* COLEÇÕES */}
        <section className="mb-4">
          <h3 className="font-display text-[20px] font-semibold mb-3" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
            Coleções especiais
          </h3>
          <div className="grid grid-cols-2 gap-3">
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
                  className="flex gap-3 items-center text-left rounded-2xl p-3"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 6px 18px -12px rgba(42,37,32,0.25)",
                    border: "1px solid rgba(42,37,32,0.06)",
                  }}
                >
                  <img src={col.img} alt="" loading="lazy" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-extrabold leading-tight" style={{ color: "#2A2520" }}>{col.label}</p>
                    <p className="text-[10.5px] mt-0.5 leading-snug line-clamp-2" style={{ color: "rgba(42,37,32,0.6)" }}>
                      {col.desc}
                    </p>
                    <p className="text-[10.5px] font-bold mt-1" style={{ color: "#E8821A" }}>
                      {count} {count === 1 ? "história" : "histórias"}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Chip drawer — lista filtrada */}
      <AnimatePresence>
        {chipOpen && chip && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={() => setChipOpen(false)} />
            <motion.div
              className="relative mt-auto bg-[#FDF8EE] rounded-t-3xl max-h-[80vh] flex flex-col"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="font-display text-[20px] font-semibold" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
                  {CHIPS.find((c) => c.key === chip)?.label}
                </h3>
                <button onClick={() => setChipOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80" aria-label="Fechar">
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
                      onClick={() => { setChipOpen(false); setMode("factory"); }}
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
                        className="text-left rounded-2xl bg-white p-2.5"
                        style={{ border: "1px solid rgba(42,37,32,0.06)" }}
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

      {/* Collection drawer */}
      <AnimatePresence>
        {collection && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={() => setCollection(null)} />
            <motion.div
              className="relative mt-auto bg-[#FDF8EE] rounded-t-3xl max-h-[85vh] flex flex-col"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <img src={collection.img} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[19px] font-semibold leading-tight" style={{ color: "#1F3A2A", fontFamily: "'Fraunces', Georgia, serif" }}>
                    {collection.label}
                  </h3>
                  <p className="text-[11.5px] leading-snug line-clamp-1" style={{ color: "rgba(42,37,32,0.6)" }}>
                    {collection.desc}
                  </p>
                </div>
                <button onClick={() => setCollection(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 shrink-0" aria-label="Fechar">
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
                      onClick={() => { setCollection(null); setMode("factory"); }}
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
                        className="text-left rounded-2xl bg-white p-2.5"
                        style={{ border: "1px solid rgba(42,37,32,0.06)" }}
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



      {/* Detail / reading */}
      <AnimatePresence>
        {selected && !reading && (
          <motion.div
            className="fixed inset-0 z-[65] flex flex-col bg-[#FDF8EE]"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          >
            <div className="flex items-center gap-3 px-5 pb-3" style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}>
              <button onClick={() => setSelected(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-700" aria-label="Fechar">
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
                className="w-full py-3.5 px-5 rounded-2xl font-extrabold text-white text-[14px] shadow-lg flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(180deg,#F19A3E,#E8821A)" }}
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
