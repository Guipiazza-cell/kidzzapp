import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Award, Quote, Calendar, Plus, ChevronRight, X, Sparkles, Share2 } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import ShareMomentCard from "./ShareMomentCard";
import { trackConnection } from "@/lib/connection";

/**
 * Álbum afetivo da família — coração emocional da aba Momentos.
 * 4 abas: Especiais · Conquistas · Frases · Timeline.
 * Persistência local (kidzz_album_*) — leve e instantâneo.
 */

type Tab = "specials" | "wins" | "phrases" | "timeline";

interface SpecialEntry { id: string; emoji: string; title: string; note: string; date: string; }
interface WinEntry     { id: string; emoji: string; title: string; date: string; }
interface PhraseEntry  { id: string; text: string; who: string; date: string; }

const STORAGE = {
  specials: "kidzz_album_specials",
  wins:     "kidzz_album_wins",
  phrases:  "kidzz_album_phrases",
} as const;

const readLS = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const writeLS = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const SEED_SPECIALS: SpecialEntry[] = [
  { id: "s1", emoji: "🌅", title: "Primeira manhã sem briga", note: "Café da manhã calmo, ele riu da minha cara.", date: "hoje" },
];
const SEED_WINS: WinEntry[] = [
  { id: "w1", emoji: "💛", title: "Respiramos juntos depois da birra", date: "hoje" },
];
const SEED_PHRASES: PhraseEntry[] = [
  { id: "p1", text: "Mãe, o sol tá com sono também?", who: "criança · 4 anos", date: "ontem" },
];

const fmtToday = () => new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const MomentsAlbum = () => {
  const [tab, setTab] = useState<Tab>("specials");
  const [specials, setSpecials] = useState<SpecialEntry[]>(() => readLS(STORAGE.specials, SEED_SPECIALS));
  const [wins, setWins]         = useState<WinEntry[]>(() => readLS(STORAGE.wins, SEED_WINS));
  const [phrases, setPhrases]   = useState<PhraseEntry[]>(() => readLS(STORAGE.phrases, SEED_PHRASES));
  const [adding, setAdding] = useState(false);
  const [share, setShare] = useState<null | { text: string; attribution?: string; emoji: string; variant: "morning" | "evening" | "night" | "joy" }>(null);

  useEffect(() => writeLS(STORAGE.specials, specials), [specials]);
  useEffect(() => writeLS(STORAGE.wins, wins), [wins]);
  useEffect(() => writeLS(STORAGE.phrases, phrases), [phrases]);

  const TABS: { id: Tab; label: string; icon: typeof Heart; tint: string }[] = [
    { id: "specials", label: "Especiais",  icon: Heart,    tint: "hsl(0 65% 60%)" },
    { id: "wins",     label: "Conquistas", icon: Award,    tint: "hsl(40 80% 55%)" },
    { id: "phrases",  label: "Frases",     icon: Quote,    tint: "hsl(265 50% 60%)" },
    { id: "timeline", label: "Timeline",   icon: Calendar, tint: "hsl(150 40% 50%)" },
  ];

  const handleAdd = (data: { type: Tab; title: string; note?: string; who?: string }) => {
    const date = fmtToday();
    if (data.type === "specials") {
      setSpecials([{ id: `s${Date.now()}`, emoji: "🤍", title: data.title, note: data.note || "", date }, ...specials]);
    } else if (data.type === "wins") {
      setWins([{ id: `w${Date.now()}`, emoji: "💛", title: data.title, date }, ...wins]);
    } else if (data.type === "phrases") {
      setPhrases([{ id: `p${Date.now()}`, text: data.title, who: data.who || "família", date }, ...phrases]);
    }
    haptic("light"); sfx("click");
    setAdding(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 22 }}
      className="mt-3 p-4 rounded-[28px] relative overflow-hidden"
      style={{
        background: "hsl(0 0% 100% / 0.75)",
        backdropFilter: "blur(14px) saturate(1.05)",
        WebkitBackdropFilter: "blur(14px) saturate(1.05)",
        border: "1px solid hsl(0 0% 100% / 0.7)",
        boxShadow: "0 12px 32px -18px hsl(100 15% 18% / 0.18), 0 0 40px hsl(0 60% 70% / 0.05)",
      }}
    >
      <span
        aria-hidden
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(0 60% 80% / 0.18), transparent 70%)", filter: "blur(16px)" }}
      />

      <header className="flex items-center justify-between mb-3 relative">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "hsl(0 65% 55%)" }}>
            Álbum afetivo
          </p>
          <h2 className="text-[17px] font-black leading-tight tracking-tight" style={{ color: "hsl(var(--premium-ink))" }}>
            O coração da família
          </h2>
        </div>
        <button
          type="button"
          onClick={() => { haptic("medium"); setAdding(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 100%), hsl(0 60% 96%))",
            border: "1px solid hsl(0 60% 90%)",
            boxShadow: "0 6px 16px -10px hsl(0 60% 50% / 0.35)",
          }}
          aria-label="Adicionar momento"
        >
          <Plus size={13} style={{ color: "hsl(0 65% 55%)" }} />
          <span className="text-[11px] font-black tracking-tight" style={{ color: "hsl(0 65% 45%)" }}>
            Guardar
          </span>
        </button>
      </header>

      <div className="flex gap-1.5 mb-3 overflow-x-auto -mx-1 px-1 pb-0.5">
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { haptic("light"); setTab(t.id); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
              style={{
                background: active ? t.tint : "hsl(0 0% 100% / 0.65)",
                color: active ? "white" : "hsl(var(--premium-ink-soft))",
                border: `1px solid ${active ? t.tint : "hsl(0 0% 92%)"}`,
                boxShadow: active ? `0 6px 14px -8px ${t.tint.replace(")", " / 0.5)")}` : "none",
              }}
            >
              <Icon size={11} />
              <span className="text-[11px] font-black tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="space-y-2"
        >
          {tab === "specials" && (
            specials.length === 0 ? (
              <EmptyState text="Nenhum especial ainda. Guarde a primeira lembrança boa de hoje." tint="hsl(0 65% 60%)" />
            ) : specials.map((s) => (
              <AlbumCard
                key={s.id} emoji={s.emoji} title={s.title} subtitle={s.note} date={s.date} tint="hsl(0 65% 60%)"
                onShare={() => setShare({ text: s.title, attribution: s.note || "um momento especial", emoji: s.emoji, variant: "joy" })}
              />
            ))
          )}
          {tab === "wins" && (
            wins.length === 0 ? (
              <EmptyState text="Sem conquistas hoje? Respirar com seu filho já é uma." tint="hsl(40 80% 55%)" />
            ) : wins.map((w) => (
              <AlbumCard
                key={w.id} emoji={w.emoji} title={w.title} date={w.date} tint="hsl(40 80% 55%)"
                onShare={() => setShare({ text: w.title, attribution: "uma conquista nossa", emoji: w.emoji, variant: "morning" })}
              />
            ))
          )}
          {tab === "phrases" && (
            phrases.length === 0 ? (
              <EmptyState text="Anote a próxima frase que vier dele. Vira ouro depois." tint="hsl(265 50% 60%)" />
            ) : phrases.map((p) => (
              <AlbumCard
                key={p.id} emoji={"💬"} title={`“${p.text}”`} subtitle={p.who} date={p.date} tint="hsl(265 50% 60%)"
                onShare={() => setShare({ text: p.text, attribution: p.who, emoji: "💬", variant: "evening" })}
              />
            ))
          )}
          {tab === "timeline" && (
            <Timeline specials={specials} wins={wins} phrases={phrases} />
          )}
        </motion.div>
      </AnimatePresence>

      <AddSheet open={adding} initialTab={tab} onClose={() => setAdding(false)} onSubmit={handleAdd} />

      <ShareMomentCard
        open={!!share}
        onClose={() => setShare(null)}
        text={share?.text || ""}
        attribution={share?.attribution}
        emoji={share?.emoji}
        variant={share?.variant}
      />
    </motion.section>
  );
};

const AlbumCard = ({ emoji, title, subtitle, date, tint, onShare }: { emoji: string; title: string; subtitle?: string; date: string; tint: string; onShare?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start gap-3 p-3 rounded-2xl"
    style={{
      background: "hsl(0 0% 100% / 0.85)",
      border: `1px solid ${tint.replace(")", " / 0.18)")}`,
      boxShadow: `0 4px 14px -10px ${tint.replace(")", " / 0.3)")}`,
    }}
  >
    <div
      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[18px]"
      style={{ background: tint.replace(")", " / 0.1)") }}
    >
      {emoji}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-black leading-snug" style={{ color: "hsl(var(--premium-ink))" }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[11px] font-medium leading-snug mt-0.5" style={{ color: "hsl(var(--premium-ink-soft))" }}>
          {subtitle}
        </p>
      )}
    </div>
    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: tint }}>
        {date}
      </span>
      {onShare && (
        <button
          onClick={() => { haptic("light"); onShare(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: tint.replace(")", " / 0.1)") }}
          aria-label="Compartilhar"
        >
          <Share2 size={11} style={{ color: tint }} />
        </button>
      )}
    </div>
  </motion.div>
);

const EmptyState = ({ text, tint }: { text: string; tint: string }) => (
  <div
    className="p-4 rounded-2xl flex items-start gap-2.5"
    style={{
      background: `linear-gradient(135deg, ${tint.replace(")", " / 0.08)")}, hsl(0 0% 100% / 0.6))`,
      border: `1px dashed ${tint.replace(")", " / 0.3)")}`,
    }}
  >
    <Sparkles size={14} style={{ color: tint, marginTop: 2 }} />
    <p className="text-[12px] font-medium leading-snug" style={{ color: "hsl(var(--premium-ink-soft))" }}>
      {text}
    </p>
  </div>
);

const Timeline = ({ specials, wins, phrases }: { specials: SpecialEntry[]; wins: WinEntry[]; phrases: PhraseEntry[] }) => {
  const items = [
    ...specials.map((x) => ({ id: x.id, emoji: x.emoji, title: x.title, date: x.date, tint: "hsl(0 65% 60%)" })),
    ...wins.map((x) =>     ({ id: x.id, emoji: x.emoji, title: x.title, date: x.date, tint: "hsl(40 80% 55%)" })),
    ...phrases.map((x) =>  ({ id: x.id, emoji: "💬",     title: `“${x.text}”`, date: x.date, tint: "hsl(265 50% 60%)" })),
  ];
  if (items.length === 0) return <EmptyState text="Sua linha do tempo aparece aqui conforme você guarda momentos." tint="hsl(150 40% 50%)" />;
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-2xl" style={{ background: "hsl(0 0% 100% / 0.7)", border: "1px solid hsl(0 0% 100% / 0.7)" }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[15px] flex-shrink-0" style={{ background: it.tint.replace(")", " / 0.12)") }}>
            {it.emoji}
          </span>
          <p className="flex-1 min-w-0 text-[12px] font-bold truncate" style={{ color: "hsl(var(--premium-ink))" }}>
            {it.title}
          </p>
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: it.tint }}>{it.date}</span>
        </div>
      ))}
    </div>
  );
};

const AddSheet = ({
  open, initialTab, onClose, onSubmit,
}: {
  open: boolean;
  initialTab: Tab;
  onClose: () => void;
  onSubmit: (d: { type: Tab; title: string; note?: string; who?: string }) => void;
}) => {
  const [type, setType] = useState<Tab>(initialTab === "timeline" ? "specials" : initialTab);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [who, setWho] = useState("");

  useEffect(() => {
    if (open) {
      setType(initialTab === "timeline" ? "specials" : initialTab);
      setTitle(""); setNote(""); setWho("");
    }
  }, [open, initialTab]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[110]"
            style={{ background: "hsl(0 0% 0% / 0.3)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[120] p-5"
            style={{
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              background: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 99%) 100%)",
              paddingBottom: "max(env(safe-area-inset-bottom, 16px), 20px)",
              boxShadow: "0 -20px 60px -20px hsl(0 0% 0% / 0.25)",
            }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog" aria-modal="true"
          >
            <div className="flex justify-center pb-3">
              <span className="block w-10 h-1 rounded-full" style={{ background: "hsl(0 0% 80%)" }} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-black tracking-tight" style={{ color: "hsl(var(--premium-ink))" }}>
                Guardar momento
              </h3>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "hsl(0 0% 96%)" }}>
                <X size={14} />
              </button>
            </div>

            <div className="flex gap-1.5 mb-4">
              {(["specials", "wins", "phrases"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-2 rounded-xl text-[11px] font-black tracking-tight transition-all"
                  style={{
                    background: type === t ? "hsl(var(--premium-ink))" : "hsl(0 0% 96%)",
                    color: type === t ? "white" : "hsl(var(--premium-ink-soft))",
                  }}
                >
                  {t === "specials" ? "Especial" : t === "wins" ? "Conquista" : "Frase"}
                </button>
              ))}
            </div>

            <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "hsl(var(--premium-ink-soft))" }}>
              {type === "phrases" ? "Frase" : "Título"}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "phrases" ? "“Mãe, o sol tá com sono também?”" : "Em uma frase, o que ficou hoje?"}
              className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium mb-3 outline-none"
              style={{ background: "hsl(0 0% 97%)", border: "1px solid hsl(0 0% 90%)", color: "hsl(var(--premium-ink))" }}
            />

            {type === "specials" && (
              <>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                  Pequeno detalhe (opcional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="O que tornou esse momento especial?"
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl text-[13px] font-medium mb-3 outline-none resize-none"
                  style={{ background: "hsl(0 0% 97%)", border: "1px solid hsl(0 0% 90%)", color: "hsl(var(--premium-ink))" }}
                />
              </>
            )}
            {type === "phrases" && (
              <>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                  Quem disse
                </label>
                <input
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  placeholder="criança · 4 anos"
                  className="w-full px-4 py-3 rounded-2xl text-[13px] font-medium mb-3 outline-none"
                  style={{ background: "hsl(0 0% 97%)", border: "1px solid hsl(0 0% 90%)", color: "hsl(var(--premium-ink))" }}
                />
              </>
            )}

            <button
              type="button"
              disabled={!title.trim()}
              onClick={() => onSubmit({ type, title: title.trim(), note: note.trim(), who: who.trim() })}
              className="w-full py-3.5 rounded-2xl text-white text-[14px] font-black tracking-tight flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, hsl(0 65% 60%), hsl(0 75% 55%))",
                boxShadow: "0 8px 22px -8px hsl(0 65% 45% / 0.45)",
              }}
            >
              Guardar com carinho <ChevronRight size={14} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MomentsAlbum;
