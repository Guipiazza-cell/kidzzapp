import { useCallback, type CSSProperties } from "react";
import { useMemories, type Memory } from "@/hooks/useMemories";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * MemoriesAlbum — Tela "Memórias" (redesign v3).
 *
 * Porta fiel do mockup public/exemplos/Memórias Home v3.dc.html (estilos inline
 * 1:1) ligado aos dados reais do app:
 *  - Momentos guardados  → memórias reais (useMemories, filtro por tipo)
 *  - Conquistas          → memórias tipo "achievement"
 *  - Pontos              → profile.points
 * A barra de navegação inferior é a BottomNav global (não duplicada aqui).
 */

interface MemoriesAlbumProps {
  onBack: () => void;
  onNavigateToChat?: () => void;
  onNavigateToStories?: () => void;
}

/* ── Paletas do design ── */
const TINT: Record<string, [number, number, number]> = {
  rosa: [233, 140, 180], azul: [120, 180, 240], verde: [140, 205, 120],
  roxo: [175, 140, 235], ambar: [230, 185, 95],
};
const GLOSSY: Record<string, [string, string, string]> = {
  rosa: ["#FFB9D2", "#F0679B", "#C93A72"], azul: ["#A8D4FF", "#4E9BE8", "#2568B8"],
  verde: ["#C0EDA0", "#6FBE4F", "#3F8A32"], roxo: ["#D8C2FF", "#9A6CF0", "#6A3EC0"],
  ambar: ["#FFE49A", "#F2B23B", "#C77E12"],
};
// Acento padrão "coral" (props.acento do design).
const ACCENT = { tint: TINT.rosa, solid: "#F2A9C4" };
// Ciclo de cores da prateleira de conquistas (decorativo, igual ao design).
const CONQ_COLORS = ["rosa", "azul", "verde", "roxo", "ambar"] as const;

/* ── SVG paths do design ── */
const D = {
  chat: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3.1-.4-4.4-1.2L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5Z",
  book: "M12 6.8C10.5 5.3 8.3 4.5 6 4.5c-.7 0-1.4.1-2 .2v13c.6-.1 1.3-.2 2-.2 2.3 0 4.5.8 6 2.3 1.5-1.5 3.7-2.3 6-2.3.7 0 1.4.1 2 .2v-13c-.6-.1-1.3-.2-2-.2-2.3 0-4.5.8-6 2.3Zm0 0v13",
  target: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-4.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-3.3a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z",
  heart: "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  photo: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Zm0 8.5 4.2-4.2a1.5 1.5 0 0 1 2.1 0L16 16.5m-2-3 1.7-1.7a1.5 1.5 0 0 1 2.1 0L20 14M9.2 8.7a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0Z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.7-5.3 2.7 1-5.8L3.5 9.7l5.9-.9Z",
  grid: "M4.5 4.5h6v6h-6Zm9 0h6v6h-6Zm-9 9h6v6h-6Zm9 0h6v6h-6Z",
  trophy: "M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5",
};

/* ── Helpers de estilo (idênticos ao design) ── */
const glass = (r: number, g: number, b: number, aTop = 0.55, aBot = 0.18): CSSProperties => {
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  return {
    background: `linear-gradient(155deg, rgba(255,255,255,.30) 0%, ${rgba(aTop)} 22%, ${rgba((aTop + aBot) / 2)} 55%, ${rgba(aBot)} 82%, rgba(255,255,255,.06) 100%)`,
    backdropFilter: "blur(20px) saturate(170%)", WebkitBackdropFilter: "blur(20px) saturate(170%)",
    border: "1px solid rgba(255,255,255,.42)",
    boxShadow: `0 14px 32px rgba(0,0,0,.38), 0 0 26px ${rgba(0.22)}, inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -10px 20px rgba(0,0,0,.12), inset 0 10px 24px ${rgba(0.18)}`,
  };
};
const gloss = (light: string, mid: string, deep: string, size = 42, radius = 999): CSSProperties => ({
  flex: "none", width: size, height: size, borderRadius: radius,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 16%, ${mid} 55%, ${deep} 100%)`,
  boxShadow: "0 6px 14px rgba(0,0,0,.35), inset 0 2px 3px rgba(255,255,255,.7), inset 0 -5px 10px rgba(0,0,0,.28)",
});
const actionCard = (k: string): CSSProperties => ({
  position: "relative", overflow: "hidden", borderRadius: 24, padding: "13px 11px 11px", textAlign: "left", cursor: "pointer",
  ...glass(...TINT[k], 0.58, 0.2),
  display: "flex", flexDirection: "column", gap: 7, transition: "transform .2s", fontFamily: "'Nunito',sans-serif",
});
const arrow = (k: string): CSSProperties => ({
  alignSelf: "flex-end", width: 25, height: 25, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${GLOSSY[k][0]} 20%, ${GLOSSY[k][1]} 60%, ${GLOSSY[k][2]} 100%)`,
  boxShadow: "0 4px 10px rgba(0,0,0,.35), inset 0 1px 2px rgba(255,255,255,.6)",
});

/* ── Mapeamento tipo de memória → cor/ícone/label ── */
const TYPE_META: Record<Memory["type"], { k: string; d: string; tag: string; tagColor: [string, string] }> = {
  question:    { k: "rosa",  d: D.chat,   tag: "Pergunta", tagColor: ["rgba(244,168,200,.92)", "#4A1F35"] },
  story:       { k: "azul",  d: D.book,   tag: "História", tagColor: ["rgba(150,200,245,.92)", "#133A5E"] },
  mission:     { k: "verde", d: D.target, tag: "Missão",   tagColor: ["rgba(170,218,140,.92)", "#23431A"] },
  achievement: { k: "ambar", d: D.trophy, tag: "Conquista", tagColor: ["rgba(242,178,59,.92)", "#4A3210"] },
};

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/* ── Icone SVG genérico ── */
const Icon = ({ d, stroke = "#fff", size = 20, sw = 1.8 }: { d: string; stroke?: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MemoriesAlbum = ({ onBack, onNavigateToChat, onNavigateToStories }: MemoriesAlbumProps) => {
  const { profile, handleCheckout } = useAuth();
  const {
    memories, loading, filter, setFilter, toggleSpecial,
    totalCount, lockedCount, isPremium,
  } = useMemories();

  const childName = profile?.child_name || "amigo";
  const pontos = (profile as { points?: number } | null)?.points ?? 0;
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  const handleShare = useCallback(async (m: Memory) => {
    const shareText = `${m.title}\n\n${m.content || ""}\n\n💛 Criado com KIDZZ — kidzzapp.lovable.app`;
    if (navigator.share) {
      try { await navigator.share({ title: `Memória de ${childName}`, text: shareText }); } catch { /* cancelado */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Memória copiada! 💛");
    }
  }, [childName]);

  const momentos = memories.filter((m) => m.type !== "achievement");
  const conquistas = memories.filter((m) => m.type === "achievement");
  const showMomentos = momentos.length > 0;
  const showConquistas = conquistas.length > 0;

  /* Ações rápidas (cards de vidro) */
  const acoes = [
    { key: "a1", title: "Nova Pergunta", sub: "Crie perguntas para " + childName, d: D.chat, k: "rosa", onClick: () => onNavigateToChat?.() },
    { key: "a2", title: "Nova História", sub: "Escreva uma história juntos", d: D.book, k: "azul", onClick: () => onNavigateToStories?.() },
    { key: "a3", title: "Nova Missão", sub: "Desafios para criar memórias", d: D.target, k: "verde", onClick: () => toast("Missões em breve ✨") },
  ];

  /* Chips de filtro → useMemories.filter */
  const chips: { id: typeof filter; label: string; d: string }[] = [
    { id: "all", label: "Todas", d: D.grid },
    { id: "question", label: "Perguntas", d: D.chat },
    { id: "story", label: "Histórias", d: D.book },
    { id: "mission", label: "Missões", d: D.target },
    { id: "achievement", label: "Conquistas", d: D.trophy },
  ];

  const [ar, ag, ab] = ACCENT.tint;
  const chipBase: CSSProperties = { flex: "none", display: "flex", alignItems: "center", gap: 6, padding: "10px 15px", borderRadius: 999, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all .25s", outline: "none" };
  const verTodasStyle: CSSProperties = { background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 12.5, color: ACCENT.solid, padding: 0 };

  return (
    <div style={{ height: "100%", position: "relative", fontFamily: "'Nunito',system-ui,sans-serif", background: "linear-gradient(180deg,#26341F 0%,#1E2A19 38%,#161F12 72%,#121A0F 100%)" }}>
      {/* orbes de luz que flutuam */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(45% 30% at 80% 30%,rgba(255,214,140,.10),transparent 70%),radial-gradient(40% 26% at 12% 55%,rgba(160,220,255,.06),transparent 70%),radial-gradient(50% 30% at 55% 88%,rgba(233,140,180,.07),transparent 70%)" }} />
      <div style={{ position: "absolute", top: -60, left: -80, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,214,140,.18),transparent 65%)", filter: "blur(28px)", animation: "memv3-drift1 13s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "38%", left: -90, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(120,180,240,.13),transparent 65%)", filter: "blur(30px)", animation: "memv3-drift2 17s ease-in-out 2s infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 90, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(233,140,180,.15),transparent 65%)", filter: "blur(32px)", animation: "memv3-drift1 19s ease-in-out 4s infinite", pointerEvents: "none" }} />

      <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)", scrollbarWidth: "none", position: "relative" }}>

        {/* ── HERO ── */}
        <div style={{ position: "relative", height: 352 }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 316, overflow: "hidden" }}>
            <img
              src="/exemplos/assets/cena-memorias.png"
              alt="Gui, o camaleão, escrevendo memórias no diário"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 32%", animation: "memv3-floaty 6s ease-in-out infinite", WebkitMaskImage: "radial-gradient(130% 96% at 50% 24%,#000 52%,rgba(0,0,0,.4) 76%,transparent 100%)", maskImage: "radial-gradient(130% 96% at 50% 24%,#000 52%,rgba(0,0,0,.4) 76%,transparent 100%)", filter: "saturate(1.08) contrast(1.02)" }}
            />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, width: "44%", height: 316, pointerEvents: "none", background: "linear-gradient(180deg,rgba(255,226,160,.22) 0%,rgba(255,226,160,.06) 45%,transparent 75%)", filter: "blur(6px)", animation: "memv3-raysway 7s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 316, background: "linear-gradient(180deg,rgba(18,24,14,.4) 0%,rgba(18,24,14,0) 20%,rgba(38,52,31,0) 42%,rgba(38,52,31,.4) 70%,rgba(38,52,31,.16) 90%,transparent 100%)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 316, background: "linear-gradient(97deg,rgba(20,28,16,.82) 0%,rgba(20,28,16,.4) 30%,rgba(20,28,16,0) 58%)" }} />
          {/* sparkles */}
          <div style={{ position: "absolute", top: 38, left: "52%", width: 6, height: 6, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 10px 3px rgba(255,225,150,.7)", animation: "memv3-twinkle 3.2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 96, left: "44%", width: 4, height: 4, borderRadius: 99, background: "#FFF3CC", boxShadow: "0 0 8px 2px rgba(255,235,170,.6)", animation: "memv3-twinkle 4.1s ease-in-out 1.1s infinite" }} />
          <div style={{ position: "absolute", top: 210, left: "38%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 9px 3px rgba(255,225,150,.6)", animation: "memv3-twinkle 3.6s ease-in-out .5s infinite" }} />
          <div style={{ position: "absolute", top: 150, left: "92%", width: 5, height: 5, borderRadius: 99, background: "#FFF3CC", boxShadow: "0 0 9px 3px rgba(255,235,170,.6)", animation: "memv3-sparklefloat 4.6s ease-in-out .8s infinite" }} />
          <div style={{ position: "absolute", top: 262, left: "60%", width: 4, height: 4, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 8px 2px rgba(255,225,150,.55)", animation: "memv3-sparklefloat 5.2s ease-in-out 1.6s infinite" }} />

          <button onClick={onBack} className="active:scale-90" style={{ position: "absolute", top: 62, left: 16, width: 42, height: 42, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.14)", backdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,.32)", boxShadow: "0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m6-6-6 6 6 6" stroke="#F4EFE2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,.14)", backdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,.3)", boxShadow: "0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.35)", fontWeight: 900, fontSize: 13, color: "#F4EFE2" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d={D.trophy} stroke="#F2C55C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {pontos}
            </div>
          </div>
          <div style={{ position: "absolute", left: 20, bottom: 8, width: 252, animation: "memv3-rise .6s both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px 9px", borderRadius: 16, background: "linear-gradient(160deg,rgba(255,255,255,.3),rgba(206,255,184,.12))", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(255,255,255,.6)", boxShadow: "0 10px 24px rgba(16,44,20,.4),inset 0 1.5px 1px rgba(255,255,255,.75),inset 0 -7px 13px rgba(120,200,110,.2)", marginBottom: 12 }}>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: "2.5px", lineHeight: 1, background: "linear-gradient(180deg,#FBFFF4 0%,#C6F49A 46%,#7FD64E 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 1px 1px rgba(255,255,255,.5)) drop-shadow(0 0 8px rgba(140,230,110,.55))" }}>KIDZZ</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,.13)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)", fontWeight: 800, fontSize: 12, color: "rgba(244,239,226,.9)", marginBottom: 11 }}>
              {saudacao}, família!
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#8FE3CD" style={{ verticalAlign: -2 }}><path d="M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z" /></svg>
            </div>
            <h1 style={{ margin: "0 0 9px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 30, lineHeight: 1.14, color: "#F4EDDC", letterSpacing: "-.2px", textShadow: "0 2px 14px rgba(0,0,0,.45)" }}>
              Aqui guardamos <span style={{ color: "#F2A9C4" }}>memórias</span> que viram histórias.
            </h1>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.45, color: "rgba(238,233,222,.78)", maxWidth: 225, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
              Cada momento juntos merece ser lembrado para sempre.
            </p>
          </div>
        </div>

        {/* ── AÇÕES RÁPIDAS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "10px 16px 0", position: "relative", zIndex: 5, animation: "memv3-rise .6s .1s both" }}>
          {acoes.map((a) => (
            <button key={a.key} onClick={a.onClick} className="active:scale-95" style={actionCard(a.k)}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.22) 50%,transparent 100%)", animation: "memv3-shine 5.5s ease-in-out infinite" }} />
              <div style={gloss(...GLOSSY[a.k], 40, 999)}><Icon d={a.d} /></div>
              <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14, color: "#F6F1E4", lineHeight: 1.15 }}>{a.title}</div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(240,235,225,.68)", lineHeight: 1.35 }}>{a.sub}</div>
              <div style={arrow(a.k)}><Icon d="M5 12h14m-6-6 6 6-6 6" size={13} sw={2.4} /></div>
            </button>
          ))}
        </div>

        {/* ── luz ambiente: sparkles flutuantes entre seções ── */}
        <div style={{ position: "relative", height: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 70, left: "8%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 9px 3px rgba(255,225,150,.5)", animation: "memv3-sparklefloat 5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 300, left: "88%", width: 4, height: 4, borderRadius: 99, background: "#FFD9EA", boxShadow: "0 0 8px 2px rgba(244,168,200,.55)", animation: "memv3-sparklefloat 5.8s ease-in-out 1.2s infinite" }} />
          <div style={{ position: "absolute", top: 520, left: "14%", width: 5, height: 5, borderRadius: 99, background: "#FFF3CC", boxShadow: "0 0 9px 3px rgba(255,235,170,.5)", animation: "memv3-sparklefloat 4.4s ease-in-out 2s infinite" }} />
          <div style={{ position: "absolute", top: 760, left: "80%", width: 4, height: 4, borderRadius: 99, background: "#CFE6FF", boxShadow: "0 0 8px 2px rgba(150,200,245,.55)", animation: "memv3-sparklefloat 6s ease-in-out .6s infinite" }} />
        </div>

        {/* ── FILTROS ── */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "18px 16px 4px", scrollbarWidth: "none" }}>
          {chips.map((chip) => {
            const on = chip.id === filter;
            const style: CSSProperties = on
              ? { ...chipBase, ...glass(ar, ag, ab, 0.68, 0.32), color: "#fff", boxShadow: `0 8px 20px rgba(0,0,0,.35), 0 0 22px rgba(${ar},${ag},${ab},.45), inset 0 1.5px 0 rgba(255,255,255,.65)` }
              : { ...chipBase, background: "linear-gradient(155deg, rgba(255,255,255,.20), rgba(255,255,255,.08))", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", color: "rgba(240,235,225,.88)", border: "1px solid rgba(255,255,255,.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 4px 12px rgba(0,0,0,.25)" };
            return (
              <button key={chip.id} onClick={() => setFilter(chip.id)} className="active:scale-95" style={style}>
                <Icon d={chip.d} stroke={on ? "#fff" : "rgba(240,235,225,.8)"} size={15} sw={2} />
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* ── ESTADOS: loading / vazio ── */}
        {loading ? (
          <div style={{ padding: "48px 16px", textAlign: "center", color: "rgba(240,235,225,.7)", fontWeight: 800, fontSize: 14 }}>Carregando memórias…</div>
        ) : totalCount === 0 ? (
          <div style={{ padding: "40px 28px", textAlign: "center" }}>
            <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#F4EDDC", lineHeight: 1.3, margin: "0 0 8px" }}>
              Aqui vão ficar as memórias mais preciosas de {childName} 💛
            </h3>
            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(238,233,222,.7)", lineHeight: 1.5, margin: "0 0 20px" }}>
              Cada pergunta respondida, cada história criada, cada missão em família — tudo guardado para sempre.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
              <button onClick={() => onNavigateToChat?.()} className="active:scale-95" style={{ width: "100%", padding: 14, borderRadius: 16, cursor: "pointer", border: "none", ...glass(...TINT.rosa, 0.6, 0.24), color: "#fff", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon d={D.chat} size={16} /> Fazer primeira pergunta →
              </button>
              <button onClick={() => onNavigateToStories?.()} className="active:scale-95" style={{ width: "100%", padding: 12, borderRadius: 16, cursor: "pointer", background: "linear-gradient(155deg, rgba(255,255,255,.2), rgba(255,255,255,.08))", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.3)", color: "rgba(240,235,225,.9)", fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon d={D.book} size={14} stroke="rgba(240,235,225,.9)" /> Criar primeira história →
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── MOMENTOS GUARDADOS ── */}
            {showMomentos && (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 20px 10px" }}>
                  <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#F4EDDC" }}>Momentos guardados</h2>
                  {filter !== "all" && <button onClick={() => setFilter("all")} style={verTodasStyle}>Ver todas →</button>}
                </div>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 10px", scrollbarWidth: "none" }}>
                  {momentos.map((m) => {
                    const meta = TYPE_META[m.type];
                    return (
                      <div key={m.id} style={{ flex: "none", width: 158, borderRadius: 22, position: "relative", overflow: "hidden", boxShadow: "0 14px 30px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.3)", border: "1px solid rgba(255,255,255,.28)", animation: "memv3-rise .45s both", background: "rgba(255,255,255,.06)" }}>
                        <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                          <div
                            role="img"
                            aria-label={m.title}
                            style={{
                              position: "absolute", inset: 0, backgroundSize: "cover", backgroundPosition: "center",
                              backgroundImage: m.image_url
                                ? `url("${m.image_url}")`
                                : `radial-gradient(120% 120% at 30% 20%, rgba(${TINT[meta.k][0]},${TINT[meta.k][1]},${TINT[meta.k][2]},.55), rgba(20,28,16,.9))`,
                            }}
                          />
                          <div style={{ position: "absolute", top: 8, left: 8, padding: "4px 11px", borderRadius: 999, background: meta.tagColor[0], backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.55)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(0,0,0,.25)", color: meta.tagColor[1], fontSize: 10, fontWeight: 900, letterSpacing: ".2px" }}>{meta.tag}</div>
                          <button onClick={() => handleShare(m)} className="active:scale-90" style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 999, cursor: "pointer", background: "rgba(20,26,16,.45)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8.7 11l6.6-3.5M8.7 13l6.6 3.5" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                        </div>
                        <div style={{ padding: "9px 12px 10px", background: "linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.04))", backdropFilter: "blur(14px)", borderTop: "1px solid rgba(255,255,255,.18)", display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 13, color: "#F6F1E4", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(240,235,225,.62)" }}>{formatShortDate(m.created_at)}</div>
                            <button onClick={() => toggleSpecial(m.id, m.is_special)} className="active:scale-90" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, color: m.is_special ? "#F2C55C" : "rgba(240,235,225,.55)", fontSize: 11, fontWeight: 900 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill={m.is_special ? "#F2C55C" : "none"}><path d={D.star} stroke={m.is_special ? "#F2C55C" : "rgba(240,235,225,.6)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CONQUISTAS DA FAMÍLIA ── */}
            {showConquistas && (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 20px 10px" }}>
                  <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#F4EDDC" }}>Conquistas da família</h2>
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 16px 10px", scrollbarWidth: "none" }}>
                  {conquistas.map((c, i) => {
                    const ck = CONQ_COLORS[i % CONQ_COLORS.length];
                    return (
                    <div key={c.id} style={{ ...glass(...TINT[ck], 0.5, 0.14), flex: "none", width: 122, borderRadius: 22, padding: "14px 10px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", animation: "memv3-rise .45s both" }}>
                      <div style={gloss(...GLOSSY[ck], 50, 18)}><Icon d={D.trophy} size={24} sw={1.7} /></div>
                      <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 12.5, color: "#F6F1E4", lineHeight: 1.2 }}>{c.title}</div>
                      {c.content && <div style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(240,235,225,.62)", lineHeight: 1.35 }}>{c.content}</div>}
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── PAYWALL memórias bloqueadas (free) ── */}
            {lockedCount > 0 && (
              <div style={{ margin: "14px 16px 0", borderRadius: 22, padding: "18px 16px", textAlign: "center", ...glass(...TINT.roxo, 0.5, 0.16) }}>
                <p style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#F6F1E4" }}>+{lockedCount} memórias guardadas com carinho 💛</p>
                <p style={{ margin: "4px 0 12px", fontSize: 12, fontWeight: 700, color: "rgba(240,235,225,.7)" }}>Desbloqueie todas com Premium ✨</p>
                <button onClick={() => handleCheckout("premium")} className="active:scale-95" style={{ width: "100%", padding: 13, borderRadius: 16, cursor: "pointer", border: "none", background: "linear-gradient(160deg,#9A6CF0,#6A3EC0)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 14, boxShadow: "0 10px 24px rgba(90,50,150,.4),inset 0 1px 0 rgba(255,255,255,.3)" }}>
                  🔓 Desbloquear todas as memórias
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoriesAlbum;
