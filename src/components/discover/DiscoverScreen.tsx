import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, Share2, Sparkles, Clock, Baby, Boxes, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { haptic } from "@/lib/haptics";
import { DISCOVER_THEMES, DISCOVER_IMAGES, type Theme, type Activity } from "./discoverData";

// ============================================================
// DiscoverScreen, aba "Descobrir" (referência: arte enviada pelo usuário)
// LIQUID GLASS apenas no chrome (header). Cards de conteúdo: creme sólido.
// ============================================================

interface Props {
  onBack?: () => void;
}

const INK = "#2A2520";
const CREAM = "#FFFCF8";
const CREAM_DEEP = "#FBF7EF";
const AMBER = "#E8821A";
const GOLD = "#C9A227";
const SAGE = "#7FB069";
const SAGE_DEEP = "#46703A";

// ------------------------------------------------------------
// Imagem com fallback elegante (gradiente + emoji)
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
// Header glass (apenas chrome)
// ------------------------------------------------------------
function GlassHeader({ onBack, onSearch }: { onBack?: () => void; onSearch?: () => void }) {
  return (
    <div
      className="sticky top-0 z-30"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
        paddingLeft: 14,
        paddingRight: 14,
        paddingBottom: 10,
        background: "rgba(255,252,248,0.55)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderBottom: "1px solid rgba(42,37,32,0.06)",
        boxShadow: "0 8px 32px rgba(42,37,32,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => { haptic("light"); onBack?.(); }}
          aria-label="Voltar"
          className="active:scale-95"
          style={{
            width: 44, height: 44, borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(42,37,32,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(42,37,32,0.08)",
          }}
        >
          <ArrowLeft size={20} color={INK} strokeWidth={2.2} />
        </button>
        <div className="flex flex-col items-center leading-tight">
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "0.04em",
              color: SAGE_DEEP,
            }}
          >
            KIDZZ
          </span>
          <span
            style={{
              fontFamily: "'Mulish', system-ui, sans-serif",
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#7d6e5b",
              marginTop: -2,
            }}
          >
            Menos tela. Mais memórias.
          </span>
        </div>
        <button
          type="button"
          onClick={() => { haptic("light"); onSearch?.(); }}
          aria-label="Buscar"
          className="active:scale-95"
          style={{
            width: 44, height: 44, borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(42,37,32,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(42,37,32,0.08)",
          }}
        >
          <Search size={20} color={INK} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Card grande de tema (estilo da referência)
// ------------------------------------------------------------
function ThemeCard({ theme, onOpen }: { theme: Theme; onOpen: () => void }) {
  const count = theme.activities.length;
  return (
    <button
      type="button"
      onClick={() => { haptic("light"); onOpen(); }}
      className="block w-full text-left active:scale-[0.99]"
      style={{
        position: "relative",
        background: theme.bg,
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 8px 26px rgba(60,60,40,0.09)",
        minHeight: 168,
        border: "1px solid rgba(42,37,32,0.04)",
        transition: "transform .2s ease",
      }}
      aria-label={`Abrir tema ${theme.title}`}
    >
      {/* Imagem ocupa ~50% à direita */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          left: "52%",
        }}
      >
        <SmartImage
          src={theme.image}
          alt={`Cena do tema ${theme.title}`}
          fallbackBg={theme.bg}
          fallbackEmoji={theme.emoji}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {/* Veil garantindo legibilidade do título */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: theme.veil,
        }}
      />
      {/* Conteúdo */}
      <div
        style={{
          position: "relative",
          padding: "16px 14px 14px 16px",
          width: "56%",
          minHeight: 168,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(18px, 5.2vw, 22px)",
              lineHeight: 1.1,
              fontWeight: 600,
              color: theme.ink,
              letterSpacing: "-0.01em",
              margin: 0,
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {theme.title}{" "}
            <span aria-hidden style={{ fontSize: "0.75em" }}>{theme.emoji}</span>
          </h3>
          <p
            style={{
              fontFamily: "'Mulish', system-ui, sans-serif",
              fontSize: 12.5,
              lineHeight: 1.35,
              color: theme.body,
              marginTop: 6,
              marginBottom: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {theme.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "'Mulish', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: theme.ink,
              opacity: 0.85,
              background: "rgba(255,255,255,0.45)",
              padding: "4px 9px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            ✦ {count} descobertas
          </span>
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 40, height: 40, borderRadius: 999,
              background: theme.cta,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            }}
          >
            <ArrowRight size={18} color={theme.ctaInk} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </button>
  );
}


// ------------------------------------------------------------
// Tela de detalhe do tema
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
      style={{ background: CREAM_DEEP, zIndex: 10 }}
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
        {/* Botão voltar glass */}
        <button
          type="button"
          onClick={() => { haptic("light"); onBack(); }}
          aria-label="Voltar"
          className="absolute active:scale-95"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + 12px)",
            left: 14,
            width: 44, height: 44, borderRadius: 999,
            background: "rgba(255,252,248,0.55)",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(42,37,32,0.10)",
          }}
        >
          <ArrowLeft size={20} color={INK} strokeWidth={2.2} />
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
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(26px, 8vw, 34px)",
              lineHeight: 1.05,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.01em",
              textShadow: "0 2px 14px rgba(0,0,0,0.4)",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {theme.title} <span aria-hidden>{theme.emoji}</span>
          </h1>
          <p
            style={{
              fontFamily: "'Mulish', sans-serif",
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
        className="flex-1 overflow-y-auto"
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
                fontFamily: "'Mulish', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                boxShadow: "0 10px 24px -6px rgba(232,130,26,0.55)",
                border: "none",
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
// Card de atividade premium (4 camadas)
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
        background: CREAM,
        borderRadius: 22,
        boxShadow: "0 8px 26px rgba(60,60,40,0.09)",
        border: "1px solid rgba(42,37,32,0.05)",
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
                fontFamily: "'Fraunces', serif",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.25,
                color: INK,
                margin: 0,
                letterSpacing: "-0.01em",
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
                      fontFamily: "'Mulish', sans-serif",
                      fontWeight: 800,
                      fontSize: 14.5,
                      border: "none",
                      boxShadow: "0 8px 18px -4px rgba(232,130,26,0.55)",
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
                              fontFamily: "'Mulish', sans-serif",
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
                        fontFamily: "'Mulish', sans-serif",
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
                        fontFamily: "'Fraunces', serif",
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
                        fontFamily: "'Mulish', sans-serif",
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
                      color: accentInk === INK ? CREAM : accentInk,
                      fontFamily: "'Mulish', sans-serif",
                      fontWeight: 800,
                      fontSize: 14.5,
                      border: "none",
                      boxShadow: `0 8px 18px -4px ${accent}88`,
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
  fontFamily: "'Mulish', system-ui, sans-serif",
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
        background: CREAM_DEEP,
        border: "1px solid rgba(42,37,32,0.08)",
        fontFamily: "'Mulish', sans-serif",
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
        border: "1px solid rgba(42,37,32,0.05)",
      }}
    >
      <div
        style={{
          fontFamily: "'Mulish', sans-serif",
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
    ctx.font = "bold 28px 'Mulish', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ SELO DA DESCOBERTA", W / 2, 200);
    ctx.font = "600 56px 'Fraunces', serif";
    wrapText(ctx, text, W / 2, 500, W - 200, 70);
    ctx.font = "500 24px 'Mulish', sans-serif";
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
// HERO
// ------------------------------------------------------------
function DiscoverHero() {
  return (
    <section
      style={{
        position: "relative",
        margin: "12px 0 18px",
        padding: "18px 18px 14px",
        borderRadius: 22,
        background: CREAM,
        overflow: "hidden",
        boxShadow: "0 8px 26px rgba(60,60,40,0.06)",
        border: "1px solid rgba(42,37,32,0.04)",
        minHeight: 200,
      }}
    >
      {/* Imagem do hero (lado direito) */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0, right: 0,
          width: "58%",
        }}
      >
        <SmartImage
          src={DISCOVER_IMAGES.hero}
          alt="Pai e criança explorando juntos"
          fallbackBg="linear-gradient(135deg, #F4ECD6, #E8E0C5)"
          fallbackEmoji="🔍"
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,252,248,1) 0%, rgba(255,252,248,0.85) 30%, rgba(255,252,248,0) 65%)",
          }}
        />
      </div>
      <div style={{ position: "relative", maxWidth: "62%" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'Mulish', sans-serif",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: SAGE_DEEP,
            marginBottom: 4,
          }}
        >
          <span aria-hidden>🌱</span> DESCOBRIR
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 34,
            lineHeight: 1,
            fontWeight: 600,
            color: INK,
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          Descobrir
        </h1>
        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: "italic",
            fontSize: 19,
            lineHeight: 1.15,
            color: AMBER,
            marginTop: 10,
            marginBottom: 0,
            position: "relative",
            display: "inline-block",
          }}
        >
          Vamos explorar o mundo juntos?
          <span
            aria-hidden
            style={{
              display: "block",
              height: 4,
              width: 60,
              background: GOLD,
              borderRadius: 4,
              marginTop: 4,
              opacity: 0.7,
            }}
          />
        </p>
        <p
          style={{
            fontFamily: "'Mulish', sans-serif",
            fontSize: 13.5,
            lineHeight: 1.4,
            color: "#5a4d3d",
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          Escolha um tema e mergulhem em descobertas que despertam a curiosidade e viram memórias.
        </p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Tela principal
// ------------------------------------------------------------
const DiscoverScreen = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name ?? "";
  const isPremium = !!profile?.is_premium;
  const [openTheme, setOpenTheme] = useState<Theme | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Volta scroll ao topo ao abrir um tema
  useEffect(() => {
    if (openTheme) {
      try { scrollRef.current?.scrollTo({ top: 0 }); } catch {}
    }
  }, [openTheme]);

  const handleShareBadge = useCallback((activity: Activity) => {
    shareBadge(activity, childName);
  }, [childName]);

  return (
    <div className="flex-1 flex flex-col relative" style={{ background: CREAM_DEEP, minHeight: 0 }}>
      <GlassHeader onBack={onBack} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: "0 14px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 220px)",
        }}
      >
        <DiscoverHero />
        <div className="flex flex-col gap-3.5">
          {DISCOVER_THEMES.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onOpen={() => setOpenTheme(theme)} />
          ))}
        </div>
      </div>

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
