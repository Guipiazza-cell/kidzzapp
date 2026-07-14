import { useState, useCallback, useRef, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Sparkles, Clock, Baby, Boxes, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { haptic } from "@/lib/haptics";
import { DISCOVER_THEMES, type Theme, type Activity } from "./discoverData";

// ============================================================
// DiscoverScreen, aba "Descobrir"
// Porta fiel do mockup public/exemplos/Descobrir.dc.html (estilos inline 1:1)
// ligada aos dados reais do app:
//  - Temas / descrições / nº de descobertas  → DISCOVER_THEMES
//  - Pontos                                    → profile.points
//  - Abrir tema                                → openTheme (ThemeDetail)
//  - Voltar                                    → onBack
// A barra de navegação inferior é a BottomNav global (não duplicada aqui).
// O detalhe do tema (ThemeDetail/ActivityCard) não faz parte deste mockup e
// foi preservado 1:1 (toda a lógica de premium, selo e compartilhamento).
// ============================================================

interface Props {
  onBack?: () => void;
}

const INK = "#2A2520";
const CREAM = "#FFFCF8";
const CREAM_DEEP = "#FBF7EF";
const AMBER = "#E8821A";
const GOLD = "#C9A227";
const SAGE_DEEP = "#46703A";

// ------------------------------------------------------------
// Keyframes locais (prefixo disc- para evitar colisão global)
// ------------------------------------------------------------
const KEYFRAMES = `
@keyframes disc-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes disc-lensfloat{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-10px) rotate(4deg)}}
@keyframes disc-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes disc-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-16px) scale(1.15)}}
@keyframes disc-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,26px) scale(1.18)}}
@keyframes disc-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,-22px) scale(1.12)}}
@keyframes disc-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes disc-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes disc-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes disc-leafdrift{0%{transform:translate(0,-30px) rotate(0deg);opacity:0}12%{opacity:.7}88%{opacity:.6}100%{transform:translate(-46px,105vh) rotate(300deg);opacity:0}}
`;

// ------------------------------------------------------------
// SVG paths (idênticos ao design)
// ------------------------------------------------------------
const PATHS = {
  paw: "M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-9 3a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 6 14Zm12 0a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 18 14Zm-6 1.5c-2.5 0-4.5 1.7-4.5 3.5S9.5 21 12 21s4.5-.2 4.5-2-2-3.5-4.5-3.5Z",
  planet: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm8.5-11c2 1 3 2.3 2.6 3.5-.6 1.8-5 2-9.8.4S4.4 9 5 7.2C5.4 6 7.1 5.8 9.3 6.3",
  leaf: "M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11",
  gear: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-11v2m0 11v2m7.5-7.5h-2m-11 0h-2m12.3-5.3-1.4 1.4M7.6 16.4l-1.4 1.4m12.2 0-1.4-1.4M7.6 7.6 6.2 6.2",
} as const;

// ------------------------------------------------------------
// Estilo visual por tema (valores exatos do mockup)
// ------------------------------------------------------------
type ThemeVisual = {
  panel: string;
  titleColor: string;
  subColor: string;
  chip: [string, string, string];
  arrow: [string, string, string];
  pillDark: boolean;
  fade: string;
  novo: boolean;
  d: string;
};

const THEME_VISUAL: Record<Theme["id"], ThemeVisual> = {
  animais: {
    panel: "linear-gradient(150deg,rgba(255,255,255,.7),rgba(232,224,196,.6))",
    titleColor: "#2E7A2E", subColor: "#5F6B44",
    chip: ["#C0EDA0", "#6FBE4F", "#3F8A32"], arrow: ["#C0EDA0", "#6FBE4F", "#3F8A32"],
    pillDark: false, fade: "rgba(232,224,196,.9)", novo: false, d: PATHS.paw,
  },
  espaco: {
    panel: "linear-gradient(150deg,rgba(60,80,120,.5),rgba(20,32,58,.92))",
    titleColor: "#EAF0FA", subColor: "rgba(210,222,240,.82)",
    chip: ["#C2CBFF", "#6E7FE8", "#4152B8"], arrow: ["#FFFFFF", "#E8ECF4", "#B8C2D2"],
    pillDark: true, fade: "rgba(20,32,58,.92)", novo: false, d: PATHS.planet,
  },
  natureza: {
    panel: "linear-gradient(150deg,rgba(255,255,255,.72),rgba(206,232,196,.66))",
    titleColor: "#2E7A4E", subColor: "#4E6B4A",
    chip: ["#C0EDC8", "#5CB57A", "#2F7A4E"], arrow: ["#C0EDC8", "#5CB57A", "#2F7A4E"],
    pillDark: false, fade: "rgba(206,232,196,.9)", novo: false, d: PATHS.leaf,
  },
  coisas: {
    panel: "linear-gradient(150deg,rgba(255,255,255,.7),rgba(238,224,186,.66))",
    titleColor: "#9A6E1E", subColor: "#6E5A32",
    chip: ["#FFE49A", "#F2B23B", "#C77E12"], arrow: ["#FFE49A", "#F2B23B", "#C77E12"],
    pillDark: false, fade: "rgba(238,224,186,.9)", novo: true, d: PATHS.gear,
  },
};

// Helpers de estilo (idênticos ao design)
const glossChip = (l: string, m: string, d: string): CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 22, height: 22, borderRadius: 8,
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${l} 18%, ${m} 58%, ${d} 100%)`,
  boxShadow: "0 3px 7px rgba(0,0,0,.25), inset 0 1px 1px rgba(255,255,255,.6)",
});
const arrowStyle = (l: string, m: string, d: string): CSSProperties => ({
  width: 40, height: 40, borderRadius: 999,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${l} 18%, ${m} 58%, ${d} 100%)`,
  boxShadow: "0 5px 12px rgba(0,0,0,.28), inset 0 1.5px 2px rgba(255,255,255,.6), inset 0 -4px 8px rgba(0,0,0,.22)",
});

// ------------------------------------------------------------
// Imagem com fallback elegante (gradiente + emoji) — usado no detalhe
// ------------------------------------------------------------
function SmartImage({
  src, alt, fallbackBg, fallbackEmoji, className, style,
}: {
  src: string;
  alt: string;
  fallbackBg: string;
  fallbackEmoji: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: fallbackBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
        }}
        aria-label={alt}
        role="img"
      >
        <span aria-hidden>{fallbackEmoji}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
      style={{ objectFit: "cover", ...style }}
    />
  );
}

// ------------------------------------------------------------
// Card grande de tema (mockup Descobrir.dc.html)
// ------------------------------------------------------------
function ThemeCard({ theme, onOpen }: { theme: Theme; onOpen: () => void }) {
  const v = THEME_VISUAL[theme.id];
  const count = theme.activities.length;

  const cardStyle: CSSProperties = {
    position: "relative", overflow: "hidden", display: "flex", minHeight: 150,
    borderRadius: 24, cursor: "pointer", textAlign: "left", width: "100%", padding: 0,
    border: "1px solid rgba(255,255,255,.7)",
    transition: "transform .3s cubic-bezier(.34,1.4,.64,1)",
    fontFamily: "'Nunito',sans-serif",
    background: v.panel,
    backdropFilter: "blur(16px) saturate(150%)",
    WebkitBackdropFilter: "blur(16px) saturate(150%)",
    boxShadow: "0 14px 30px rgba(70,80,40,.16), inset 0 1.5px 0 rgba(255,255,255,.7)",
    animation: "disc-cascade .55s cubic-bezier(.22,1,.36,1) both",
  };
  const pillStyle: CSSProperties = {
    padding: "6px 13px", borderRadius: 999, fontSize: 11, fontWeight: 900,
    background: v.pillDark ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.7)",
    color: v.pillDark ? "#EAF0FA" : "#4E5A34",
    border: v.pillDark ? "1px solid rgba(255,255,255,.3)" : "1px solid rgba(255,255,255,.9)",
    backdropFilter: "blur(6px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)",
  };

  return (
    <button
      type="button"
      onClick={() => { haptic("light"); onOpen(); }}
      className="active:scale-[0.975]"
      style={cardStyle}
      aria-label={`Abrir tema ${theme.title}`}
    >
      <div style={{ flex: 1, minWidth: 0, padding: "15px 15px 14px", display: "flex", flexDirection: "column", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 20, color: v.titleColor, lineHeight: 1.12, marginBottom: 5, display: "flex", alignItems: "center", gap: 7 }}>
          {theme.title}
          <span style={glossChip(...v.chip)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d={v.d} stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: v.subColor, marginBottom: "auto", maxWidth: 170 }}>
          {theme.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <div style={pillStyle}>+ {count} descobertas</div>
          <div style={arrowStyle(...v.arrow)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", width: "44%", flex: "none", overflow: "hidden" }}>
        <div
          role="img"
          aria-label={theme.title}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: `url("/exemplos/assets/de-${theme.id}.png")`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", background: `linear-gradient(90deg, ${v.fade} 0%, transparent 85%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%)", animation: "disc-shine 6s ease-in-out infinite" }} />
      </div>
      {v.novo && (
        <div style={{ position: "absolute", top: 11, right: 11, zIndex: 3, padding: "3px 9px", borderRadius: 999, background: "radial-gradient(130% 130% at 30% 22%,#FFF3C4 0%,#F2C55C 45%,#C98F1E 100%)", color: "#4A3300", fontSize: 9, fontWeight: 900, letterSpacing: ".4px", boxShadow: "0 3px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.7)" }}>NOVO</div>
      )}
    </button>
  );
}

// ------------------------------------------------------------
// Tela de detalhe do tema (preservada 1:1 — fora do mockup)
// ------------------------------------------------------------
function ThemeDetail({
  theme, childName, isPremium, onBack, onShareBadge,
}: {
  theme: Theme;
  childName: string;
  isPremium: boolean;
  onBack: () => void;
  onShareBadge: (activity: Activity) => void;
}) {
  const [openActivityId, setOpenActivityId] = useState<string | null>(null);

  const openPaywall = useCallback(() => {
    window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 flex flex-col"
      style={{ background: "linear-gradient(180deg,#F4F0DE 0%,#EDE7D0 40%,#E4DCC0 75%,#DAD0AE 100%)", zIndex: 40 }}
    >
      {/* Cabeçalho imersivo */}
      <div
        style={{
          position: "relative",
          height: 260,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <SmartImage
          src={theme.image}
          alt={`${theme.title}: cena de capa`}
          fallbackBg={theme.bg}
          fallbackEmoji={theme.emoji}
          className="w-full h-full"
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* blend sandy: funde o header na cor do corpo (premium) */}
        <div
          aria-hidden
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, height: 60, pointerEvents: "none",
            background: "linear-gradient(180deg, rgba(244,240,222,0) 0%, rgba(244,240,222,.35) 70%, rgba(244,240,222,.75) 100%)",
          }}
        />
        {/* Botão voltar glass */}
        <button
          type="button"
          onClick={() => { haptic("light"); onBack(); }}
          aria-label="Voltar"
          className="absolute active:scale-90"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + 12px)",
            left: 14,
            width: 44, height: 44, borderRadius: 999,
            background: "rgba(255,255,255,.62)",
            backdropFilter: "blur(16px) saturate(150%)",
            WebkitBackdropFilter: "blur(16px) saturate(150%)",
            border: "1px solid rgba(255,255,255,1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(80,90,40,.18), inset 0 1px 0 rgba(255,255,255,1)",
            transition: "transform .2s",
          }}
        >
          <ArrowLeft size={20} color="#2E3A1E" strokeWidth={2.2} />
        </button>
        {/* Título grande */}
        <div
          style={{
            position: "absolute",
            left: 20, right: 20, bottom: 18,
            color: CREAM,
          }}
        >
          <h1
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(26px, 8vw, 34px)",
              lineHeight: 1.08,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.3px",
              textShadow: "0 2px 14px rgba(0,0,0,0.4)",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {theme.title} <span aria-hidden>{theme.emoji}</span>
          </h1>
          <p
            style={{
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: 13.5,
              lineHeight: 1.4,
              marginTop: 6,
              opacity: 0.95,
              textShadow: "0 1px 6px rgba(0,0,0,0.45)",
            }}
          >
            {theme.description}
          </p>

        </div>
      </div>

      {/* Lista de atividades */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          padding: "16px 14px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 220px)",
        }}
      >
        <div className="flex flex-col gap-14" />
        <div className="flex flex-col gap-3.5">
          {theme.activities.map((act, idx) => {
            const locked = !isPremium && idx > 0;
            const isOpen = openActivityId === act.id;
            return (
              <ActivityCard
                key={act.id}
                activity={act}
                accent={theme.cta === CREAM ? AMBER : theme.cta}
                accentInk={theme.ink === CREAM ? INK : theme.ink}
                childName={childName}
                locked={locked}
                open={isOpen}
                onToggle={() => {
                  haptic("light");
                  setOpenActivityId(isOpen ? null : act.id);
                }}
                onUpgrade={openPaywall}
                onShare={() => onShareBadge(act)}
              />
            );
          })}

          {/* CTA Premium se houver bloqueio */}
          {!isPremium && theme.activities.length > 1 && (
            <button
              type="button"
              onClick={() => { haptic("medium"); openPaywall(); }}
              className="w-full active:scale-[0.99]"
              style={{
                marginTop: 8,
                padding: "16px 18px",
                borderRadius: 22,
                background: `linear-gradient(135deg, ${AMBER}, #D26A0A)`,
                color: CREAM,
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 15,
                boxShadow: "0 12px 26px -6px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,.4)",
                border: "1px solid rgba(255,255,255,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Sparkles size={18} />
              Desbloquear todas as descobertas com o Premium
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ------------------------------------------------------------
// Card de atividade premium (4 camadas) — preservado 1:1
// ------------------------------------------------------------
function ActivityCard({
  activity, accent, accentInk, childName, locked, open, onToggle, onUpgrade, onShare,
}: {
  activity: Activity;
  accent: string;
  accentInk: string;
  childName: string;
  locked: boolean;
  open: boolean;
  onToggle: () => void;
  onUpgrade: () => void;
  onShare: () => void;
}) {
  const nome = childName?.trim() || "seu filho";
  const badgeText = activity.badge.replace(/\{nome\}/g, nome);

  return (
    <div
      style={{
        background: "linear-gradient(160deg,#FFFDFA 0%,#FBF7EF 100%)",
        borderRadius: 22,
        boxShadow: "0 14px 30px rgba(70,80,40,.14), 0 2px 6px rgba(70,80,40,.08), inset 0 1.5px 0 rgba(255,255,255,.9)",
        border: "1px solid rgba(255,255,255,.7)",
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left active:scale-[0.995]"
        style={{
          padding: "16px 16px 14px 16px",
          background: "transparent",
          border: "none",
          display: "block",
        }}
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "clamp(15px, 4.4vw, 18px)",
                fontWeight: 600,
                lineHeight: 1.22,
                color: "#20260F",
                margin: 0,
                letterSpacing: "-0.2px",
                wordBreak: "break-word",
                hyphens: "auto",
              }}
            >
              {activity.title}
            </h3>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <Chip icon={<Clock size={11} />} label={activity.duration} />
              <Chip icon={<Baby size={11} />} label={activity.ageRange} />
              <Chip icon={<Boxes size={11} />} label={activity.material} />
            </div>
          </div>
          {locked && (
            <span
              aria-label="Premium"
              style={{
                width: 32, height: 32, borderRadius: 999,
                background: "rgba(232,130,26,0.12)",
                border: "1px solid rgba(232,130,26,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Lock size={14} color={AMBER} strokeWidth={2.4} />
            </span>
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 16px 16px" }}>
              {/* ✨ A descoberta */}
              <Layer
                emoji="✨"
                title="A descoberta"
                tint="rgba(232,130,26,0.06)"
                titleColor={AMBER}
              >
                <p style={bodyStyle}>{activity.discovery}</p>
              </Layer>

              {locked ? (
                <>
                  <div
                    style={{
                      marginTop: 12,
                      padding: "14px 14px",
                      borderRadius: 16,
                      background: "rgba(232,130,26,0.08)",
                      border: "1px dashed rgba(232,130,26,0.35)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Lock size={18} color={AMBER} strokeWidth={2.2} />
                    <span style={{ ...bodyStyle, margin: 0, fontWeight: 700 }}>
                      O resto da descoberta é Premium.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { haptic("medium"); onUpgrade(); }}
                    className="w-full active:scale-[0.99]"
                    style={{
                      marginTop: 10,
                      padding: "14px 18px",
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${AMBER}, #D26A0A)`,
                      color: CREAM,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                      fontWeight: 800,
                      fontSize: 14.5,
                      border: "1px solid rgba(255,255,255,.25)",
                      boxShadow: "0 8px 18px -4px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} />
                    Desbloquear esta descoberta
                  </button>
                </>
              ) : (
                <>
                  {/* 🤲 Mãos à obra */}
                  <Layer
                    emoji="🤲"
                    title="Mãos à obra"
                    tint="rgba(127,176,105,0.10)"
                    titleColor={SAGE_DEEP}
                  >
                    {activity.safetyNote && (
                      <p
                        style={{
                          ...bodyStyle,
                          background: "rgba(232,130,26,0.10)",
                          color: "#7A4A0E",
                          padding: "8px 10px",
                          borderRadius: 10,
                          fontSize: 13,
                          marginBottom: 8,
                        }}
                      >
                        ⚠️ {activity.safetyNote}
                      </p>
                    )}
                    <ol
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {activity.steps.map((s, i) => (
                        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span
                            aria-hidden
                            style={{
                              flexShrink: 0,
                              width: 22, height: 22, borderRadius: 999,
                              background: SAGE_DEEP,
                              color: CREAM,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: "'Nunito', system-ui, sans-serif",
                              fontWeight: 800,
                              fontSize: 12,
                              marginTop: 1,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ ...bodyStyle, flex: 1 }}>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </Layer>

                  {/* 💜 Momento com o pai/mãe */}
                  <Layer
                    emoji="💜"
                    title="Momento com o pai/mãe"
                    tint="rgba(155,124,219,0.10)"
                    titleColor="#6E59B5"
                  >
                    <p style={{ ...bodyStyle, fontStyle: "italic" }}>
                      “{activity.parentMoment}”
                    </p>
                  </Layer>

                  {/* ✦ Selo da Descoberta */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: "18px 16px",
                      borderRadius: 18,
                      background: `linear-gradient(135deg, #F6E2A3 0%, ${GOLD} 100%)`,
                      color: "#3A2C0A",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 18px rgba(201,162,39,0.25)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Nunito', system-ui, sans-serif",
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        opacity: 0.7,
                      }}
                    >
                      ✦ Selo da descoberta
                    </div>
                    <p
                      style={{
                        fontFamily: "'Nunito', system-ui, sans-serif",
                        fontSize: 18,
                        lineHeight: 1.25,
                        margin: "6px 0 12px",
                        fontWeight: 600,
                      }}
                    >
                      {badgeText}
                    </p>
                    <button
                      type="button"
                      onClick={() => { haptic("light"); onShare(); }}
                      className="active:scale-95"
                      style={{
                        background: "#3A2C0A",
                        color: "#F6E2A3",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: 999,
                        fontFamily: "'Nunito', system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: 13,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Share2 size={14} />
                      Compartilhar selo
                    </button>
                  </div>

                  {/* CTA começar */}
                  <button
                    type="button"
                    onClick={onToggle}
                    className="w-full active:scale-[0.99]"
                    style={{
                      marginTop: 14,
                      padding: "14px 18px",
                      borderRadius: 16,
                      background: accent,
                      color: CREAM,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                      fontWeight: 800,
                      fontSize: 14.5,
                      border: "1px solid rgba(255,255,255,.25)",
                      boxShadow: `0 8px 18px -4px ${accent}88, inset 0 1px 0 rgba(255,255,255,.35)`,
                    }}
                  >
                    Começar a descoberta
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const bodyStyle: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
  fontSize: 14.5,
  lineHeight: 1.5,
  color: "#3a3328",
  margin: 0,
};

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 9px",
        borderRadius: 999,
        background: "linear-gradient(160deg,#FFFFFF,#F4EFE3)",
        border: "1px solid rgba(255,255,255,.9)",
        boxShadow: "0 1px 3px rgba(70,80,40,.08), inset 0 1px 0 rgba(255,255,255,.8)",
        fontFamily: "'Nunito', system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 700,
        color: "#5a4d3d",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function Layer({
  emoji, title, tint, titleColor, children,
}: {
  emoji: string;
  title: string;
  tint: string;
  titleColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "14px 14px",
        borderRadius: 16,
        background: tint,
        border: "1px solid rgba(255,255,255,.6)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 1px 4px rgba(70,80,40,.05)",
      }}
    >
      <div
        style={{
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontSize: 11.5,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: titleColor,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span aria-hidden style={{ fontSize: 14 }}>{emoji}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// Compartilhamento do selo (Web Share API + fallback canvas)
// ------------------------------------------------------------
async function shareBadge(activity: Activity, childName: string) {
  const nome = childName?.trim() || "seu filho";
  const text = activity.badge.replace(/\{nome\}/g, nome);
  const shareData: ShareData = {
    title: "Selo da Descoberta Kidzz",
    text: `${text}\n\nDescoberto no Kidzz. Menos tela, mais memórias.`,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch {/* user canceled */}
  // Fallback: gera imagem do selo num canvas e dispara download
  try {
    const canvas = document.createElement("canvas");
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#F6E2A3");
    grad.addColorStop(1, "#C9A227");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#3A2C0A";
    ctx.font = "bold 28px 'Nunito', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ SELO DA DESCOBERTA", W / 2, 200);
    ctx.font = "600 56px 'Nunito', system-ui, sans-serif";
    wrapText(ctx, text, W / 2, 500, W - 200, 70);
    ctx.font = "500 24px 'Nunito', system-ui, sans-serif";
    ctx.fillText("Kidzz. Menos tela, mais memórias", W / 2, H - 100);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `selo-${activity.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  } catch {/* noop */}
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}

// ------------------------------------------------------------
// Tela principal (mockup Descobrir.dc.html)
// ------------------------------------------------------------
const DiscoverScreen = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name ?? "";
  const isPremium = !!profile?.is_premium;
  const pontos = (profile as { points?: number } | null)?.points ?? 0;

  const [openTheme, setOpenTheme] = useState<Theme | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Volta scroll ao topo ao abrir um tema
  useEffect(() => {
    if (openTheme) {
      try { scrollRef.current?.scrollTo({ top: 0 }); } catch {}
    }
  }, [openTheme]);

  // Parallax do hero conforme o scroll (idêntico ao mockup)
  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const sc = scrollRef.current, hero = heroWrapRef.current;
      if (!sc || !hero) return;
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.42}px) scale(${1 + y * 0.0004})`;
      hero.style.opacity = String(Math.max(0, 1 - y / 236));
    });
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const handleShareBadge = useCallback((activity: Activity) => {
    shareBadge(activity, childName);
  }, [childName]);

  return (
    <div style={{ height: "100%", position: "relative", fontFamily: "'Nunito',system-ui,sans-serif", background: "linear-gradient(180deg,#F4F0DE 0%,#EDE7D0 40%,#E4DCC0 75%,#DAD0AE 100%)" }}>
      <style>{KEYFRAMES}</style>

      {/* atmosfera: brilhos e orbes que flutuam */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", background: "radial-gradient(45% 30% at 78% 26%,rgba(120,190,90,.14),transparent 70%),radial-gradient(42% 28% at 10% 55%,rgba(255,210,120,.14),transparent 70%),radial-gradient(50% 30% at 55% 90%,rgba(90,150,90,.12),transparent 70%)" }} />
      <div style={{ position: "absolute", top: -60, left: -80, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(150,200,110,.28),transparent 65%)", filter: "blur(28px)", animation: "disc-drift1 13s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "38%", left: -90, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,215,120,.24),transparent 65%)", filter: "blur(30px)", animation: "disc-drift2 17s ease-in-out 2s infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 90, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(110,175,100,.22),transparent 65%)", filter: "blur(32px)", animation: "disc-drift1 19s ease-in-out 4s infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: "24%", pointerEvents: "none", animation: "disc-leafdrift 17s linear 1s infinite" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11" stroke="#7FB86A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>

      {/* conteúdo rolável */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{ height: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)", scrollbarWidth: "none", position: "relative", WebkitOverflowScrolling: "touch" }}
      >
        {/* ── HERO ── */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 414, backgroundImage: "url('/exemplos/assets/cena-descobrir.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(46px) saturate(1.45)", opacity: 0.5, transform: "scale(1.22)", pointerEvents: "none" }} />
          <div
            ref={heroWrapRef}
            style={{ position: "relative", width: "100%", height: 414, willChange: "transform", WebkitMaskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", maskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", animation: "disc-heroIn .7s cubic-bezier(.22,1,.36,1) both" }}
          >
            <img
              src="/exemplos/assets/cena-descobrir.png"
              alt="Gui, o camaleão, explorando o mundo"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 34%", animation: "disc-floaty 6s ease-in-out infinite", filter: "saturate(1.08) contrast(1.02)" }}
            />
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg,rgba(244,240,222,.2) 0%,rgba(244,240,222,0) 20%,rgba(244,240,222,.22) 48%,rgba(244,240,222,.6) 72%,rgba(244,240,222,.34) 84%,rgba(244,240,222,.12) 94%,transparent 100%)" }} />
          </div>

          {/* lupa flutuante */}
          <div style={{ position: "absolute", top: 36, left: "20%", animation: "disc-lensfloat 5s ease-in-out infinite", zIndex: 5 }}>
            <svg width="58" height="58" viewBox="0 0 64 64" fill="none">
              <circle cx="26" cy="26" r="18" fill="rgba(210,235,245,.5)" stroke="#C9D2D8" strokeWidth="3" />
              <circle cx="26" cy="26" r="18" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.5" />
              <ellipse cx="20" cy="20" rx="5" ry="7" fill="rgba(255,255,255,.55)" transform="rotate(-30 20 20)" />
              <rect x="38" y="38" width="20" height="8" rx="4" fill="#8A6A3A" transform="rotate(45 44 42)" />
              <rect x="38" y="38" width="20" height="8" rx="4" fill="url(#disc-lens-grad)" transform="rotate(45 44 42)" />
              <defs><linearGradient id="disc-lens-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C89A5A" /><stop offset="1" stopColor="#7A5424" /></linearGradient></defs>
            </svg>
          </div>
          <div style={{ position: "absolute", top: 70, left: "56%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 10px 3px rgba(255,205,110,.8)", animation: "disc-twinkle 3.2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 150, left: "66%", width: 4, height: 4, borderRadius: 99, background: "#D6F0B8", boxShadow: "0 0 8px 2px rgba(150,210,120,.75)", animation: "disc-sparklefloat 4.4s ease-in-out 1s infinite" }} />

          {/* voltar */}
          <button
            type="button"
            onClick={() => { haptic("light"); onBack?.(); }}
            aria-label="Voltar"
            className="active:scale-90"
            style={{ position: "absolute", top: 62, left: 16, width: 42, height: 42, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.62)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(80,90,40,.18),inset 0 1px 0 rgba(255,255,255,1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", zIndex: 6 }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m6-6-6 6 6 6" stroke="#2E3A1E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          {/* chip pontos (Pais fica só no dock global, sem duplicar) */}
          <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8, zIndex: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,.62)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(80,90,40,.18),inset 0 1px 0 rgba(255,255,255,1)", fontWeight: 900, fontSize: 13, color: "#2E3A1E" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5" stroke="#E0A62B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {pontos}
            </div>
          </div>

          {/* título */}
          <div style={{ padding: "14px 20px 2px", animation: "disc-cascade .6s cubic-bezier(.22,1,.36,1) .06s both", zIndex: 4, position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11" stroke="#4E9A3E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.8px", color: "#5E7A3E" }}>DESCOBRIR</span>
            </div>
            <h1 style={{ margin: "0 0 7px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 29, lineHeight: 1.13, color: "#20260F", letterSpacing: "-.3px" }}>
              Vamos explorar o <span style={{ color: "#C7841A" }}>mundo</span> juntos?
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, color: "#5F6B44", maxWidth: 290 }}>
              Escolha um tema e mergulhem em descobertas que despertam a curiosidade e viram memórias.
            </p>
          </div>
        </div>

        {/* ── CARDS DE TEMA ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13, padding: "16px 16px 6px" }}>
          {DISCOVER_THEMES.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onOpen={() => setOpenTheme(theme)} />
          ))}
        </div>

        <div style={{ padding: "6px 20px 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#9A9160" }}>
          Novos temas toda semana · Curadoria KIDZZ
        </div>
      </div>

      {/* detalhe do tema (overlay) */}
      <AnimatePresence>
        {openTheme && (
          <ThemeDetail
            theme={openTheme}
            childName={childName}
            isPremium={isPremium}
            onBack={() => setOpenTheme(null)}
            onShareBadge={handleShareBadge}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoverScreen;
