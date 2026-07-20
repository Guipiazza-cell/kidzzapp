/**
 * FamilyCinema — redesign premium
 * Craft: Bora (camadas, sticky glass, coloredGlass, sheen, cascade)
 * Layout: print public/telas/cinema/
 * Dados reais: movies.ts + featuredRotation
 * Assets: cinema-v2 Hermes full-frame (nunca recorte)
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Trophy,
  Clapperboard,
  Heart,
  Rocket,
  Moon,
  Briefcase,
  Play,
  Bookmark,
  Share2,
  Star,
  Clock,
  X,
} from "lucide-react";
import {
  EDITORIAL_SECTIONS,
  getMoviesBySection,
  type Movie,
} from "@/data/movies";
import { getWeeklyMovie, getDailyHighlights } from "@/lib/featuredRotation";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";
import {
  FONT,
  SERIF,
  R,
  PAD,
  GAP,
  glassLight as glass,
  glassLightSoft as glassSoft,
  pillGlassLight as pillGlass,
  coloredGlass,
  goldBtn,
  sectionWrap,
} from "@/lib/premiumUi";

const AS = "/exemplos/assets/cinema-v2";
const AV = "v1";
const asset = (n: string) => `${AS}/${n}?${AV}`;

/* Capas Hermes (id do filme → arquivo). Fallback: glow + emoji. */
const COVER: Record<string, string> = {
  "wall-e": asset("cover-walle.png"),
  up: asset("cover-up.png"),
  "polar-express": asset("cover-polar.png"),
  red: asset("cover-red.png"),
  luca: asset("cover-luca.png"),
  coco: asset("cover-coco.png"),
};

interface Props {
  onBack: () => void;
}

const INK = "#12263F";
const INK2 = "#4E6B8C";
const ACCENT = "#2E7ACC";
const GOLD = "#E0A62B";

const KEYFRAMES = `
@keyframes cine2-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine2-cascade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine2-heroIn{from{opacity:0;transform:translateY(-8px) scale(1.03)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes cine2-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cine2-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(24px,14px) scale(1.1)}}
@keyframes cine2-shine{0%{transform:translateX(-130%) skewX(-16deg)}60%,100%{transform:translateX(240%) skewX(-16deg)}}
@keyframes cine2-twinkle{0%,100%{opacity:.18;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes cine2-sheetin{from{opacity:0;transform:translateY(48px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine2-fadein{from{opacity:0}to{opacity:1}}
.cine2-screen::-webkit-scrollbar,.cine2-hscroll::-webkit-scrollbar{display:none}
[data-tab="cinema"] button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){
  [data-tab="cinema"] *{animation:none!important;transition-duration:.01ms!important}
}
`;

const hexA = (hex: string, al: number) => {
  const n = parseInt(hex.slice(1), 16);
  if (Number.isNaN(n)) return `rgba(80,120,180,${al})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${al})`;
};

const Shine = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "55%",
      height: "100%",
      pointerEvents: "none",
      background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.26) 50%,transparent 100%)",
      animation: "cine2-shine 6.5s ease-in-out infinite",
      borderRadius: "inherit",
    }}
  />
);

const Gloss = ({
  colors,
  children,
  size = 38,
}: {
  colors: [string, string, string];
  children: ReactNode;
  size?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 13,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(130% 130% at 30% 22%, #fff 0%, ${colors[0]} 16%, ${colors[1]} 55%, ${colors[2]} 100%)`,
      boxShadow:
        "0 6px 14px rgba(40,60,100,.28), inset 0 2px 3px rgba(255,255,255,.72), inset 0 -5px 10px rgba(0,0,0,.18)",
    }}
  >
    {children}
  </div>
);

const idadeLabel = (m: Movie) =>
  m.faixaEtaria === "familia" ? "Família" : `${m.faixaEtaria.replace("-", "–")} anos`;

const SectionLabel = ({
  children,
  right,
  kicker,
}: {
  children: ReactNode;
  right?: ReactNode;
  kicker?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
      padding: "0 2px",
    }}
  >
    <div>
      {kicker && (
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 900,
            letterSpacing: "1.2px",
            color: ACCENT,
            marginBottom: 3,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
      )}
      <h2
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 18,
          color: INK,
          letterSpacing: "-0.3px",
        }}
      >
        {children}
      </h2>
    </div>
    {right}
  </div>
);

/* ── Card de filme (print: poster + idade + título + desc) ── */
const MovieCard = ({ m, onOpen }: { m: Movie; onOpen: (m: Movie) => void }) => {
  const cover = COVER[m.id];
  return (
    <button
      type="button"
      onClick={() => onOpen(m)}
      className="active:scale-[0.97]"
      style={{
        position: "relative",
        overflow: "hidden",
        flex: "none",
        width: 148,
        borderRadius: R.card,
        ...glass,
        padding: 0,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: FONT,
        transition: "transform .28s cubic-bezier(.34,1.4,.64,1)",
        boxShadow: "0 12px 28px rgba(40,60,100,.14), 0 1px 0 rgba(255,255,255,.9) inset",
      }}
    >
      <div
        style={{
          height: 112,
          position: "relative",
          background: cover
            ? `url("${cover}") center/cover no-repeat`
            : `linear-gradient(160deg, ${hexA(m.glowColor, 0.55)}, ${hexA(m.glowColor, 0.2)} 50%, #1a2030)`,
        }}
      >
        {!cover && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 42,
            }}
          >
            {m.emoji}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(255,255,255,.88)",
            fontSize: 9.5,
            fontWeight: 900,
            color: INK,
            boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          }}
        >
          {idadeLabel(m)}
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 999,
            ...pillGlass,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Bookmark size={13} color={INK2} />
        </div>
      </div>
      <div style={{ padding: "10px 11px 12px" }}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 14,
            color: INK,
            lineHeight: 1.2,
            marginBottom: 3,
          }}
        >
          {m.titulo}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: INK2,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          {m.descricao}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 800, color: INK2 }}>
            <Clock size={11} /> {m.duracao}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 10.5, fontWeight: 900, color: GOLD }}>
            <Star size={11} fill={GOLD} color={GOLD} /> {m.ratingKidzz.toFixed(1)}
          </span>
        </div>
      </div>
    </button>
  );
};

/* ── Detalhe (sheet) ── */
const DetailSheet = ({
  movie,
  onClose,
  onMarcar,
}: {
  movie: Movie;
  onClose: () => void;
  onMarcar: () => void;
}) => {
  const cover = COVER[movie.id];
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 60,
          background: "rgba(12,24,40,.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "cine2-fadein .25s both",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: 61,
          borderRadius: 28,
          overflow: "hidden",
          animation: "cine2-sheetin .35s cubic-bezier(.22,1,.36,1) both",
          boxShadow: "0 -20px 60px rgba(0,0,0,.4)",
          border: "0.5px solid rgba(255,255,255,.5)",
          maxHeight: "86%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(165deg,#2a1e16 0%,#1a1410 100%)",
        }}
      >
        <div style={{ display: "flex", minHeight: 150, position: "relative" }}>
          <div
            style={{
              width: "42%",
              flex: "none",
              position: "relative",
              background: cover
                ? `url("${cover}") center/cover`
                : `linear-gradient(160deg, ${hexA(movie.glowColor, 0.6)}, #1a1520)`,
            }}
          >
            {!cover && (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 56 }}>
                {movie.emoji}
              </div>
            )}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                width: 48,
                height: 48,
                borderRadius: 999,
                background: "rgba(255,255,255,.92)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,.35)",
              }}
            >
              <Play size={20} fill="#1a1410" color="#1a1410" />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: "16px 14px 12px", position: "relative" }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="active:scale-90"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: 999,
                ...pillGlass,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,.14)",
                border: "0.5px solid rgba(255,255,255,.25)",
              }}
            >
              <X size={14} color="#fff" />
            </button>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.2px", color: "#F0C060", marginBottom: 4 }}>
              ✦ FILME DA SEMANA
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 18,
                color: "#FFF6EA",
                lineHeight: 1.15,
                marginBottom: 6,
                paddingRight: 28,
              }}
            >
              {movie.titulo}
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 12,
                color: "rgba(255,240,220,.78)",
                lineHeight: 1.4,
              }}
            >
              “{movie.descricao}”
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {[
                movie.duracao,
                idadeLabel(movie),
                movie.estudio,
                movie.categoria,
              ]
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={String(t)}
                    style={{
                      padding: "4px 9px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.1)",
                      border: "0.5px solid rgba(255,255,255,.2)",
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: "rgba(255,245,230,.88)",
                    }}
                  >
                    {t}
                  </span>
                ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(255,255,255,.06)",
              border: "0.5px solid rgba(255,255,255,.12)",
            }}
          >
            <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "1.1px", color: "#9FC5F2", marginBottom: 4 }}>
              POR QUE RECOMENDAMOS
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(245,248,252,.9)", lineHeight: 1.45 }}>
              {movie.motivoRecomendacao}
            </div>
          </div>
          {movie.streaming && movie.streaming.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {movie.streaming.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.1)",
                    border: "0.5px solid rgba(255,255,255,.2)",
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: "#F2F7FC",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              className="active:scale-[0.97]"
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: R.btn,
                border: "0.5px solid rgba(255,255,255,.35)",
                background: "rgba(255,255,255,.12)",
                color: "#FFF6EA",
                fontWeight: 900,
                fontSize: 13,
                fontFamily: FONT,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Bookmark size={14} /> Salvar
            </button>
            <button
              type="button"
              onClick={onMarcar}
              className="active:scale-[0.97]"
              style={{
                ...goldBtn,
                flex: 1.2,
                minHeight: 44,
                fontSize: 13,
              }}
            >
              <Share2 size={14} /> Indicar p/ família
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

type ChipId = "alta" | "emocionar" | "aventura" | "acalmar" | "viagem";

const CHIPS: {
  id: ChipId;
  title: string;
  sub: string;
  Icon: typeof Heart;
  tint: [number, number, number];
  g: [string, string, string];
}[] = [
  { id: "alta", title: "Em alta hoje", sub: "Os mais amados", Icon: Clapperboard, tint: [230, 185, 90], g: ["#FFE9A8", "#F2B23B", "#C77E12"] },
  { id: "emocionar", title: "Para emocionar", sub: "Toca o coração", Icon: Heart, tint: [140, 200, 140], g: ["#C0EDA0", "#6FBE4F", "#3F8A32"] },
  { id: "aventura", title: "Aventura", sub: "Sonhar e explorar", Icon: Rocket, tint: [160, 140, 220], g: ["#D8C2FF", "#9A6CF0", "#6A3EC0"] },
  { id: "acalmar", title: "Para acalmar", sub: "Relaxar juntos", Icon: Moon, tint: [120, 160, 220], g: ["#A8D4FF", "#4E9BE8", "#2568B8"] },
  { id: "viagem", title: "Modo Viagem", sub: "Qualquer lugar", Icon: Briefcase, tint: [100, 180, 200], g: ["#A8E8F0", "#3DBFCE", "#1B7A88"] },
];

const FamilyCinema = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const [active, setActive] = useState<Movie | null>(null);
  const [chip, setChip] = useState<ChipId>("alta");
  const [toast, setToast] = useState("");
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);

  const weekly = useMemo(() => getWeeklyMovie(), []);
  const daily = useMemo(() => getDailyHighlights(6), []);
  const pontos = profile?.points ?? 0;
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  const sectionMovies = useMemo(() => {
    if (chip === "alta") return daily;
    const map: Record<Exclude<ChipId, "alta">, string> = {
      emocionar: "vinculo",
      aventura: "imaginacao",
      acalmar: "calmar",
      viagem: "divertidos",
    };
    const sec = EDITORIAL_SECTIONS.find((s) => s.id === map[chip]);
    return sec ? getMoviesBySection(sec).slice(0, 10) : daily;
  }, [chip, daily]);

  const sectionTitle =
    chip === "alta"
      ? "Em alta hoje"
      : CHIPS.find((c) => c.id === chip)?.title ?? "Curadoria";

  useEffect(() => {
    const sc = scrollRef.current;
    const hero = heroArtRef.current;
    if (!sc || !hero) return;
    const onScroll = () => {
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.22}px) scale(${1 + y * 0.00025})`;
      hero.style.opacity = String(Math.max(0.4, 1 - y / 300));
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);

  const open = useCallback((m: Movie) => {
    haptic("light");
    sfx("click");
    setActive(m);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastT.current) clearTimeout(toastT.current);
    setToast(msg);
    toastT.current = setTimeout(() => setToast(""), 1900);
  }, []);

  const marcar = useCallback(() => {
    haptic("light");
    setActive(null);
    showToast("Sessão marcada para a família 🎬");
  }, [showToast]);

  return (
    <div
      data-tab="cinema"
      style={{
        height: "100%",
        position: "relative",
        fontFamily: FONT,
        background: "#C5D8EC",
        color: INK,
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Camadas de fundo — craft Bora */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${asset("hero-gui.png")})`,
          backgroundSize: "cover",
          backgroundPosition: "70% 30%",
          filter: "brightness(.9) saturate(1.1) blur(1px)",
          transform: "scale(1.08)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(234,243,251,.5) 0%, rgba(220,236,248,.68) 28%, rgba(200,220,240,.88) 55%, rgba(190,210,230,.96) 78%, #B8CCE0 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(50% 32% at 78% 12%, rgba(255,220,120,.28), transparent 70%), radial-gradient(40% 28% at 12% 40%, rgba(140,180,240,.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -70,
          right: -40,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,210,120,.32), transparent 65%)",
          filter: "blur(30px)",
          animation: "cine2-drift 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {[
        { t: 90, l: "18%", d: "0s" },
        { t: 160, l: "70%", d: "1.1s" },
        { t: 240, l: "42%", d: "2s" },
        { t: 320, l: "82%", d: ".5s" },
      ].map((p, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            top: p.t,
            left: p.l,
            width: 4,
            height: 4,
            borderRadius: 99,
            background: "#FFE9A8",
            boxShadow: "0 0 10px 3px rgba(255,200,100,.7)",
            animation: `cine2-twinkle ${3 + i * 0.4}s ease-in-out ${p.d} infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <div
        ref={scrollRef}
        className="cine2-screen"
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 132px)",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header sticky */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
            paddingLeft: PAD,
            paddingRight: PAD,
            paddingBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              "linear-gradient(180deg, rgba(220,236,248,.85) 0%, rgba(220,236,248,.4) 70%, transparent 100%)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              haptic("light");
              onBack();
            }}
            aria-label="Voltar"
            className="active:scale-90"
            style={{
              width: 44,
              height: 44,
              flex: "none",
              borderRadius: R.btn,
              ...pillGlass,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={19} color={INK} strokeWidth={2.1} />
          </button>
          <div style={{ flex: 1 }} />
          <div
            style={{
              height: 40,
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "0 12px",
              fontWeight: 800,
              fontSize: 12.5,
              color: INK,
            }}
          >
            <Shield size={14} color={ACCENT} /> Pais
          </div>
          <div
            style={{
              height: 40,
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "0 12px",
              fontWeight: 800,
              fontSize: 12.5,
              color: INK,
            }}
          >
            <Trophy size={14} color={GOLD} /> {pontos}
          </div>
        </div>

        {/* Hero Bora-style */}
        <div style={{ position: "relative", padding: `4px ${PAD}px 12px`, minHeight: 236 }}>
          <div
            ref={heroArtRef}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "58%",
              height: 210,
              willChange: "transform",
              animation: "cine2-heroIn .75s cubic-bezier(.22,1,.36,1) both",
              pointerEvents: "none",
              borderRadius: `0 ${R.card}px ${R.card}px 0`,
              overflow: "hidden",
            }}
          >
            <img
              src={asset("hero-gui.png")}
              alt="Gui pronto para o cinema"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "55% 25%",
                maskImage:
                  "linear-gradient(100deg, transparent 0%, #000 24%, #000 82%, transparent 100%), linear-gradient(180deg, #000 55%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(100deg, transparent 0%, #000 24%, #000 82%, transparent 100%), linear-gradient(180deg, #000 55%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
                filter: "saturate(1.08) contrast(1.02)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/exemplos/assets/cena-cinema.png";
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: "18%",
                bottom: 28,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,210,120,.4), transparent 70%)",
                filter: "blur(8px)",
                animation: "cine2-floaty 6s ease-in-out infinite",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 3,
              maxWidth: "54%",
              paddingTop: 8,
              animation: "cine2-cascade .6s cubic-bezier(.22,1,.36,1) .05s both",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12.5,
                fontWeight: 800,
                color: INK2,
                marginBottom: 8,
              }}
            >
              {saudacao}, família!
            </div>
            <h1
              style={{
                margin: "0 0 8px",
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 26,
                lineHeight: 1.12,
                color: INK,
                letterSpacing: "-0.4px",
                textShadow: "0 1px 12px rgba(255,255,255,.45)",
              }}
            >
              Cinema é mais
              <br />
              que diversão,
              <br />
              é <span style={{ color: "#3E9A5E" }}>conexão</span>.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: 1.4,
                color: INK2,
                maxWidth: 200,
              }}
            >
              Um filme por semana para inspirar conversas, emoções e memórias que ficam.
            </p>
          </div>
        </div>

        {/* Chips de categoria — horizontal scroll premium */}
        <div style={{ marginBottom: GAP + 2 }}>
          <div
            className="cine2-hscroll"
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              padding: `2px ${PAD}px 4px`,
              scrollbarWidth: "none",
              animation: "cine2-cascade .55s cubic-bezier(.22,1,.36,1) .1s both",
            }}
          >
            {CHIPS.map((c) => {
              const Icon = c.Icon;
              const on = chip === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    haptic("light");
                    setChip(c.id);
                  }}
                  className="active:scale-95"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    flex: "none",
                    width: 118,
                    minHeight: 108,
                    padding: "12px 10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: FONT,
                    ...coloredGlass(c.tint[0], c.tint[1], c.tint[2], on ? 0.52 : 0.34, on ? 0.2 : 0.12),
                    outline: on ? `2px solid rgba(${c.tint[0]},${c.tint[1]},${c.tint[2]},.55)` : "none",
                    outlineOffset: 1,
                    boxShadow: on
                      ? "0 12px 28px rgba(40,60,100,.2), 0 1px 0 rgba(255,255,255,.95) inset"
                      : undefined,
                  }}
                >
                  <Shine />
                  <Gloss colors={c.g} size={36}>
                    <Icon size={16} color="#fff" strokeWidth={2} />
                  </Gloss>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13, color: INK, lineHeight: 1.15 }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: INK2, lineHeight: 1.25 }}>{c.sub}</div>
                  <div style={{ marginTop: "auto", alignSelf: "flex-end" }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        ...pillGlass,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ArrowRight size={12} color={INK} strokeWidth={2.4} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filme da semana — card featured */}
        <div style={sectionWrap}>
          <button
            type="button"
            onClick={() => open(weekly)}
            className="active:scale-[0.985]"
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: R.card,
              padding: 0,
              ...glass,
              animation: "cine2-cascade .55s cubic-bezier(.22,1,.36,1) .14s both",
              border: "0.5px solid rgba(255,255,255,.9)",
              boxShadow: `0 16px 36px ${hexA(weekly.glowColor, 0.28)}, 0 1px 0 rgba(255,255,255,.9) inset`,
            }}
          >
            <Shine />
            <div style={{ display: "flex", minHeight: 140, position: "relative", zIndex: 2 }}>
              <div style={{ flex: 1, minWidth: 0, padding: "14px 10px 12px 14px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={12} color={GOLD} fill={GOLD} />
                  <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.2px", color: GOLD }}>
                    FILME DA SEMANA
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 18,
                    color: INK,
                    lineHeight: 1.15,
                    marginTop: 6,
                  }}
                >
                  {weekly.titulo}
                </div>
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: INK2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {weekly.descricao}
                </p>
                <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      ...pillGlass,
                      height: 28,
                      borderRadius: R.btn,
                      padding: "0 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: INK,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={11} /> {weekly.duracao}
                  </span>
                  <span
                    style={{
                      ...pillGlass,
                      height: 28,
                      borderRadius: R.btn,
                      padding: "0 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: INK,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {idadeLabel(weekly)}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: "40%",
                  flex: "none",
                  margin: 6,
                  marginLeft: 0,
                  borderRadius: R.panel,
                  overflow: "hidden",
                  position: "relative",
                  background: COVER[weekly.id]
                    ? `url("${COVER[weekly.id]}") center/cover`
                    : `linear-gradient(160deg, ${hexA(weekly.glowColor, 0.7)}, #1a2030)`,
                }}
              >
                {!COVER[weekly.id] && (
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 48 }}>
                    {weekly.emoji}
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 34,
                    height: 34,
                    borderRadius: R.btn,
                    ...pillGlass,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ArrowRight size={15} color={INK} strokeWidth={2.3} />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Carrossel da categoria ativa */}
        <div style={{ marginBottom: GAP }}>
          <div style={{ padding: `0 ${PAD}px` }}>
            <SectionLabel
              kicker="Curadoria"
              right={
                <span style={{ fontSize: 11, fontWeight: 800, color: INK2 }}>
                  {sectionMovies.length} filmes
                </span>
              }
            >
              {sectionTitle}
            </SectionLabel>
          </div>
          <div
            className="cine2-hscroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: `2px ${PAD}px 8px`,
              scrollbarWidth: "none",
              animation: "cine2-cascade .5s cubic-bezier(.22,1,.36,1) .18s both",
            }}
          >
            {sectionMovies.map((m) => (
              <MovieCard key={m.id} m={m} onOpen={open} />
            ))}
          </div>
        </div>

        {/* Seções editoriais extras (quando chip = alta) */}
        {chip === "alta" &&
          EDITORIAL_SECTIONS.map((sec, i) => {
            const movies = getMoviesBySection(sec).slice(0, 8);
            if (!movies.length) return null;
            return (
              <div key={sec.id} style={{ marginBottom: GAP }}>
                <div style={{ padding: `0 ${PAD}px` }}>
                  <SectionLabel kicker="Curadoria KIDZZ">{sec.title}</SectionLabel>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK2, marginTop: -6, marginBottom: 10 }}>
                    {sec.subtitle}
                  </div>
                </div>
                <div
                  className="cine2-hscroll"
                  style={{
                    display: "flex",
                    gap: 12,
                    overflowX: "auto",
                    padding: `0 ${PAD}px 6px`,
                    scrollbarWidth: "none",
                    animation: `cine2-cascade .5s cubic-bezier(.22,1,.36,1) ${0.2 + i * 0.05}s both`,
                  }}
                >
                  {movies.map((m) => (
                    <MovieCard key={m.id} m={m} onOpen={open} />
                  ))}
                </div>
              </div>
            );
          })}

        <div
          style={{
            padding: `8px ${PAD}px 20px`,
            textAlign: "center",
            fontSize: 11.5,
            fontWeight: 800,
            color: "rgba(50,80,120,.45)",
          }}
        >
          Curadoria KIDZZ · Selecionada para sua família
        </div>
      </div>

      {active && <DetailSheet movie={active} onClose={() => setActive(null)} onMarcar={marcar} />}

      {toast && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 118px)",
            display: "flex",
            justifyContent: "center",
            zIndex: 70,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(18,38,63,.94)",
              color: "#EAF3FB",
              fontSize: 12.5,
              fontWeight: 800,
              boxShadow: "0 10px 24px rgba(18,38,63,.4)",
              animation: "cine2-rise .3s both",
            }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyCinema;
