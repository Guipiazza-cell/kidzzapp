/**
 * FamilyCinema - redesign premium
 * Craft: Bora (camadas, sticky glass, coloredGlass, sheen, cascade)
 * Layout: print public/telas/cinema/
 * Dados reais: movies.ts + featuredRotation
 * Assets: cinema-v2 Hermes full-frame (nunca recorte)
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Trophy,
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
import { getWeeklyMovie } from "@/lib/featuredRotation";
import { cinemaCoverCdn, cinemaCoverUrl } from "@/lib/cinemaCovers";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import {
  FONT,
  SERIF,
  R,
  PAD,
  GAP,
  glassLight as glass,
  glassLightSoft as glassSoft,
  pillGlassLight as pillGlass,
  goldBtn,
  sectionWrap,
} from "@/lib/premiumUi";
import heroBgUrl from "@/assets/cinema/hero-bg.png";

const AS = "/exemplos/assets/cinema-v2";
const AV = "v14";
const asset = (n: string) => `${AS}/${n}?${AV}`;

/** Fundo full-bleed — Gui grande e alto à direita, ao lado do texto do hero. */
const CinemaBackdrop = ({ src }: { src: string }) => (
  <div
    className="absolute inset-0 pointer-events-none overflow-hidden"
    aria-hidden
  >
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        /* Gui bem no topo, ao lado do título */
        objectPosition: "88% 0%",
        filter: "saturate(1.1) brightness(0.96)",
        transform: "scale(1.85) translateY(-32%)",
        transformOrigin: "88% 0%",
      }}
    />
    {/* Escurece só a esquerda p/ texto; direita limpa p/ Gui; creme bem mais baixo */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(44% 32% at 86% 8%, rgba(255,210,120,.2) 0%, transparent 62%)," +
          "linear-gradient(100deg, rgba(10,16,28,.55) 0%, rgba(10,16,28,.22) 36%, rgba(10,16,28,.04) 52%, transparent 64%)," +
          "linear-gradient(180deg, rgba(16,22,34,.1) 0%, transparent 32%, rgba(234,243,251,.12) 58%, rgba(234,243,251,.72) 76%, #EAF3FB 88%, #E4EEF8 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -8,
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,220,140,.32), transparent 70%)",
        filter: "blur(10px)",
        animation: "cine2-drift 14s ease-in-out infinite",
      }}
    />
  </div>
);

/**
 * Capa do filme — URL do bundle Vite (src/assets/cinema-covers).
 * Não depende de public/ no deploy (kidzz.app 404 em public novo).
 */
const coverOf = (id: string) => cinemaCoverUrl(id);

/** Poster do filme — path público /exemplos/.../cover-{id}.png (funciona no localhost). */
const MoviePoster = ({
  id,
  glow,
  title = "",
  alt = "",
  style,
  children,
}: {
  id: string;
  glow: string;
  title?: string;
  alt?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => {
  const local = coverOf(id);
  const cdn = cinemaCoverCdn(id);
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        flex: "none",
        width: "100%",
        height: 176,
        backgroundColor: glow || "#2a3548",
        backgroundImage: `url("${local}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    >
      <img
        src={local}
        alt={alt || title || id}
        width={320}
        height={176}
        loading="eager"
        decoding="async"
        draggable={false}
        onError={(e) => {
          const el = e.currentTarget;
          if (!el.dataset.cdn) {
            el.dataset.cdn = "1";
            el.src = cdn;
            // também atualiza o background do pai
            const parent = el.parentElement;
            if (parent) parent.style.backgroundImage = `url("${cdn}")`;
          }
        }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
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

const idadeLabel = (m: Movie) =>
  m.faixaEtaria === "familia" ? "Família" : `${m.faixaEtaria.replace("-", "-")} anos`;

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
      <MoviePoster id={m.id} glow={m.glowColor} title={m.titulo} alt={m.titulo}>
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(255,255,255,.9)",
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
            zIndex: 2,
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
      </MoviePoster>
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
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
            wordBreak: "break-word" as const,
            marginBottom: 8,
            minHeight: 28,
          }}
        >
          {m.descricao}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 800, color: INK2 }}>
            <Clock size={11} /> {m.duracao}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".2px",
              color: "#5A4208",
              padding: "3px 7px",
              borderRadius: 999,
              background: "radial-gradient(130% 130% at 30% 22%, #FFF3C4, #F2C55C 55%, #C98F1E)",
              boxShadow: "0 2px 6px rgba(150,100,20,.28)",
              whiteSpace: "nowrap",
            }}
          >
            Escolha Kidzz
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
          <MoviePoster
            id={movie.id}
            glow={movie.glowColor}
            title={movie.titulo}
            alt={movie.titulo}
            style={{ width: "42%", flex: "none", minHeight: 150 }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 2,
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
          </MoviePoster>
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

const FamilyCinema = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const { addMemory } = useMemories();
  const [active, setActive] = useState<Movie | null>(null);
  const [toast, setToast] = useState("");
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loggedOpen = useRef<Set<string>>(new Set());

  const weekly = useMemo(() => getWeeklyMovie(), []);
  const childName = profile?.child_name || "a família";
  const pontos = profile?.points ?? 0;
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  const open = useCallback(
    (m: Movie) => {
      haptic("light");
      sfx("click");
      setActive(m);
      // Registra abertura (1x por filme na sessão)
      if (!loggedOpen.current.has(m.id)) {
        loggedOpen.current.add(m.id);
        void addMemory({
          type: "cinema",
          title: `Cinema: ${m.titulo}`,
          content: `${childName} explorou "${m.titulo}" — ${m.descricao}`,
          is_special: false,
          image_url: null,
          metadata: { area: "cinema", movie_id: m.id, age: m.faixaEtaria },
        });
      }
    },
    [addMemory, childName],
  );

  const showToast = useCallback((msg: string) => {
    if (toastT.current) clearTimeout(toastT.current);
    setToast(msg);
    toastT.current = setTimeout(() => setToast(""), 1900);
  }, []);

  const marcar = useCallback(() => {
    haptic("light");
    const movie = active;
    setActive(null);
    showToast("Sessão marcada para a família 🎬");
    if (movie) {
      void addMemory({
        type: "cinema",
        title: `Sessão marcada: ${movie.titulo}`,
        content: `${childName} marcou "${movie.titulo}" para assistir em família`,
        is_special: true,
        image_url: null,
        metadata: { area: "cinema", movie_id: movie.id, action: "schedule" },
      });
    }
  }, [active, addMemory, childName, showToast]);

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

      {/* Fundo imagem full-bleed (padrão Música) — Gui óculos 3D + sala cinema */}
      <CinemaBackdrop src={heroBgUrl} />

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
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
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
          <button
            type="button"
            onClick={() => {
              haptic("light");
              sfx("click");
              window.dispatchEvent(new CustomEvent("kidzz:open-parents"));
            }}
            aria-label="Área dos pais"
            className="active:scale-90"
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
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <Shield size={14} color={ACCENT} /> Pais
          </button>
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

        {/* Hero: texto à esquerda; Gui do fundo ocupa o espaço à direita */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            padding: `4px ${PAD}px 28px`,
            minHeight: 280,
            animation: "cine2-cascade .6s cubic-bezier(.22,1,.36,1) .05s both",
          }}
        >
          <div style={{ maxWidth: "52%", minWidth: 0, paddingTop: 6 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: "rgba(255,250,240,.92)",
                marginBottom: 8,
                textShadow: "0 1px 10px rgba(0,0,0,.35)",
              }}
            >
              {saudacao}, família!
            </div>
            <h1
              style={{
                margin: "0 0 10px",
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1.12,
                color: "#FFFDF6",
                letterSpacing: "-0.4px",
                textShadow: "0 2px 16px rgba(0,0,0,.4)",
              }}
            >
              Cinema é mais
              <br />
              que diversão,
              <br />
              é <span style={{ color: "#9FE8B0" }}>conexão</span>.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.45,
                color: "rgba(255,248,230,.88)",
                maxWidth: 200,
                textShadow: "0 1px 10px rgba(0,0,0,.35)",
              }}
            >
              Um filme por semana para inspirar conversas, emoções e memórias que ficam.
            </p>
          </div>
        </div>

        {/* Filme da semana - card featured */}
        <div style={{ ...sectionWrap, position: "relative", zIndex: 4 }}>
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
              <MoviePoster
                id={weekly.id}
                glow={weekly.glowColor}
                title={weekly.titulo}
                alt={weekly.titulo}
                style={{
                  width: "40%",
                  flex: "none",
                  margin: 6,
                  marginLeft: 0,
                  borderRadius: R.panel,
                  minHeight: 128,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
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
              </MoviePoster>
            </div>
          </button>
        </div>

        {/* Seções editoriais */}
        {EDITORIAL_SECTIONS.map((sec, i) => {
          const movies = getMoviesBySection(sec).slice(0, 8);
          if (!movies.length) return null;
          return (
            <div key={sec.id} style={{ marginBottom: GAP, position: "relative", zIndex: 4 }}>
              <div style={{ padding: `0 ${PAD}px` }}>
                <SectionLabel
                  right={
                    <span style={{ fontSize: 11, fontWeight: 800, color: INK2 }}>
                      {movies.length} filmes
                    </span>
                  }
                >
                  {sec.title}
                </SectionLabel>
              </div>
              <div
                className="cine2-hscroll"
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  padding: `0 ${PAD}px 6px`,
                  scrollbarWidth: "none",
                  animation: `cine2-cascade .5s cubic-bezier(.22,1,.36,1) ${0.18 + i * 0.05}s both`,
                }}
              >
                {movies.map((m) => (
                  <MovieCard key={m.id} m={m} onOpen={open} />
                ))}
              </div>
            </div>
          );
        })}

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
