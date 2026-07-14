import { useMemo, useRef, useState, useCallback, type CSSProperties } from "react";
import {
  EDITORIAL_SECTIONS,
  getMoviesBySection,
  type Movie,
} from "@/data/movies";
import { getWeeklyMovie, getDailyHighlights } from "@/lib/featuredRotation";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";

/**
 * FamilyCinema — Tela "Cinema em família" (redesign).
 *
 * Porta fiel do mockup public/exemplos/Cinema.dc.html (estilos inline 1:1)
 * ligada aos dados reais que a tela já usava:
 *  - Filme da semana   → getWeeklyMovie()
 *  - Em alta hoje      → getDailyHighlights(3)
 *  - Seções editoriais → EDITORIAL_SECTIONS + getMoviesBySection()
 *  - Detalhe do filme  → dados reais do Movie (descrição, motivo, streaming, rating…)
 *  - Pontos / saudação → useAuth (profile.points)
 * A barra de navegação inferior do mockup NÃO é reproduzida (existe a BottomNav global).
 */

interface Props {
  onBack: () => void;
}

/* ── Helpers de cor ── */
const hexA = (hex: string, al: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${al})`;
};
const darken = (hex: string, f: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`;
};

/* ── Paletas cinematográficas + assets (copiadas 1:1 do design, re-chaveadas p/ ids reais) ── */
type Art = { g: [string, string, string]; c: [string, string, string]; asset: string };
const ART: Record<string, Art> = {
  coco: { g: ["#B0447E", "#7E2458", "#4A1034"], c: ["#F0A0C8", "#C4498A", "#801F55"], asset: "cin-viva.png" },
  "familia-futuro": { g: ["#2E8A6A", "#1B5F47", "#0D3628"], c: ["#9FE8C8", "#3DBF92", "#1B7A58"], asset: "cin-futuro.png" },
  narnia: { g: ["#3A6B9E", "#8A6420", "#4A3410"], c: ["#FFE49A", "#E0A62B", "#9E6E10"], asset: "cin-narnia.png" },
  luca: { g: ["#3E85B8", "#255E88", "#12344E"], c: ["#A8D8F0", "#4E9BD8", "#2568A0"], asset: "cin-luca.png" },
  "wall-e": { g: ["#9E7838", "#6E4E1E", "#3E2A0E"], c: ["#F0CC90", "#C09040", "#8A5E1A"], asset: "cin-walle.png" },
  "polar-express": { g: ["#34558E", "#1F3560", "#101E3A"], c: ["#A8BEF0", "#5E7CC8", "#324890"], asset: "cin-expresso.png" },
  sing: { g: ["#8E3E9E", "#5E2470", "#340F42"], c: ["#E0A8F0", "#A855C8", "#702490"], asset: "cin-sing.png" },
  madagascar: { g: ["#4E8E3E", "#8A8A20", "#3E4A10"], c: ["#C8E890", "#84B84C", "#4E7A24"], asset: "cin-mada.png" },
  minions: { g: ["#B89428", "#8A6A14", "#4E3A08"], c: ["#FFE87A", "#E8BE2E", "#A88410"], asset: "cin-minions.png" },
  up: { g: ["#C46E30", "#964E20", "#693416"], c: ["#FFCF9A", "#E08838", "#A85A14"], asset: "cin-up.png" },
};
const ASSET = (f: string) => `/exemplos/assets/${f}`;

/** Fundo cinematográfico do card: usa o pôster real (asset) quando existe, senão gradiente do glowColor. */
const cardArt = (m: Movie): string => {
  const a = ART[m.id];
  if (a) {
    return `linear-gradient(165deg,${hexA(a.g[0], 0.12)} 0%,${hexA(a.g[1], 0.32)} 45%,${hexA(a.g[2], 0.82)} 100%), url("${ASSET(a.asset)}") center/cover no-repeat`;
  }
  return `linear-gradient(165deg,${hexA(m.glowColor, 0.18)} 0%,${hexA(m.glowColor, 0.42)} 45%,${darken(m.glowColor, 0.3)} 100%)`;
};
/** Gloss do chip (radial branco → cor → sombra). */
const glossChip = (m: Movie, size: number): CSSProperties => {
  const a = ART[m.id];
  const bg = a
    ? `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${a.c[0]} 16%, ${a.c[1]} 55%, ${a.c[2]} 100%)`
    : `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${m.glowColor} 22%, ${darken(m.glowColor, 0.42)} 100%)`;
  return {
    flex: "none", width: size, height: size, borderRadius: Math.round(size * 0.34),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: Math.round(size * 0.5), lineHeight: 1,
    background: bg,
    boxShadow: "0 8px 16px rgba(0,0,0,.4), inset 0 2px 3px rgba(255,255,255,.75), inset 0 -5px 10px rgba(0,0,0,.3)",
    textShadow: "0 1px 1.5px rgba(0,0,0,.3)",
  };
};

/* ── Rótulos ── */
const idadeLabel = (m: Movie) => (m.faixaEtaria === "familia" ? "Família" : `${m.faixaEtaria.replace("-", "–")} anos`);
const idadeUpper = (m: Movie) => (m.faixaEtaria === "familia" ? "FAMÍLIA" : `${m.faixaEtaria.replace("-", "–")} ANOS`);
const categoryLabel = (c: Movie["categoria"]) =>
  ({ acolhimento: "Acolhimento", aventura: "Aventura", emocional: "Emocional", divertido: "Divertido", criativo: "Criativo" }[c]);

/* ── Gradientes glossy dos "dots" das seções ── */
const SECTION_DOT: Record<string, string> = {
  alta: "radial-gradient(130% 130% at 30% 22%,#FFE9A8,#F2B23B 55%,#C77E12)",
  calmar: "radial-gradient(130% 130% at 30% 22%,#C2CBFF,#6E7FE8 55%,#4152B8)",
  vinculo: "radial-gradient(130% 130% at 30% 22%,#FFB9D2,#F0679B 55%,#C93A72)",
  imaginacao: "radial-gradient(130% 130% at 30% 22%,#D8C2FF,#9A6CF0 55%,#6A3EC0)",
  divertidos: "radial-gradient(130% 130% at 30% 22%,#B8F0D0,#3DBF92 55%,#1B7A58)",
};
const dotStyle = (bg: string): CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 26, height: 26, borderRadius: 9, fontSize: 14, lineHeight: 1,
  background: bg, boxShadow: "0 4px 10px rgba(20,40,70,.3), inset 0 1px 1px rgba(255,255,255,.6)",
  textShadow: "0 1px 1px rgba(20,40,70,.35)",
});

/* ── Card de filme (carrossel) ── */
const MovieCard = ({ m, onOpen }: { m: Movie; onOpen: (m: Movie) => void }) => (
  <button
    onClick={() => onOpen(m)}
    className="active:scale-[.96]"
    style={{
      position: "relative", overflow: "hidden", flex: "none", width: 134, height: 192,
      borderRadius: 22, padding: 12, textAlign: "left", cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 8,
      transition: "transform .34s cubic-bezier(.34,1.56,.64,1)", fontFamily: "'Nunito',sans-serif",
      background: cardArt(m), border: "1px solid rgba(255,255,255,.4)",
      boxShadow: "0 14px 30px rgba(20,40,70,.35), inset 0 1.5px 0 rgba(255,255,255,.4)",
      animation: "cine-rise .45s both",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", background: "radial-gradient(120% 90% at 50% -20%,rgba(255,255,255,.28),transparent 55%),radial-gradient(140% 100% at 50% 120%,rgba(0,0,0,.5),transparent 60%)" }} />
    <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.16) 50%,transparent 100%)", animation: "cine-shine 6.5s ease-in-out infinite" }} />
    {m.novo && (
      <div style={{ position: "absolute", top: 9, right: 9, padding: "3px 9px", borderRadius: 999, background: "radial-gradient(130% 130% at 30% 22%,#FFF3C4 0%,#F2C55C 45%,#C98F1E 100%)", color: "#4A3300", fontSize: 8.5, fontWeight: 900, letterSpacing: ".4px", boxShadow: "0 3px 8px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.7)" }}>NOVO</div>
    )}
    <div style={glossChip(m, 44)}>{m.emoji}</div>
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 3, position: "relative" }}>
      <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14, color: "#FFFDF6", lineHeight: 1.22, textShadow: "0 1px 6px rgba(0,0,0,.4)" }}>{m.titulo}</div>
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: ".8px", color: "rgba(255,253,246,.72)" }}>{idadeUpper(m)}</div>
    </div>
  </button>
);

/* ── Seção com carrossel horizontal ── */
const Section = ({
  title, subtitle, emoji, dot, movies, onOpen, delay,
}: {
  title: string; subtitle: string; emoji: string; dot: string;
  movies: Movie[]; onOpen: (m: Movie) => void; delay: number;
}) => (
  <div style={{ animation: `cine-cascade .6s cubic-bezier(.22,1,.36,1) ${delay.toFixed(2)}s both` }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 20px 2px" }}>
      <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#12263F" }}>
        <span style={dotStyle(dot)}>{emoji}</span>
        {title}
      </h2>
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.2px", color: "#7A93B0" }}>CURADORIA</div>
    </div>
    <div style={{ padding: "0 20px 8px", fontSize: 11.5, fontWeight: 700, color: "#5E7A99" }}>{subtitle}</div>
    <div className="cine-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden", padding: "2px 16px 12px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
      {movies.map((m) => (
        <MovieCard key={m.id} m={m} onOpen={onOpen} />
      ))}
    </div>
  </div>
);

/* ── Info card do detalhe ── */
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div style={{ borderRadius: 14, padding: "9px 12px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)" }}>
    <div style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: "1.2px", color: "rgba(190,210,235,.6)", marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#F2F7FC" }}>{value}</div>
  </div>
);

/* ── Bottom sheet de detalhe ── */
const DetailSheet = ({ movie, onClose, onMarcar }: { movie: Movie; onClose: () => void; onMarcar: () => void }) => (
  <>
    <div onClick={onClose} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 60, background: "rgba(12,24,40,.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: "cine-fadein .25s both" }} />
    <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, zIndex: 61, borderRadius: 28, overflow: "hidden", animation: "cine-sheetin .35s cubic-bezier(.22,1,.36,1) both", boxShadow: "0 -20px 60px rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.35)", maxHeight: "88%", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", padding: "22px 16px 18px", background: cardArt(movie), flex: "none" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", background: "radial-gradient(120% 90% at 50% -20%,rgba(255,255,255,.3),transparent 55%)" }} />
        <button onClick={onClose} className="active:scale-90" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.2)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.45)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s" }} aria-label="Fechar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={glossChip(movie, 52)}>{movie.emoji}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 21, color: "#FFFDF6", lineHeight: 1.2, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>{movie.titulo}</div>
            {movie.tituloOriginal && movie.tituloOriginal !== movie.titulo && (
              <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 12, color: "rgba(255,253,246,.8)", marginTop: 2 }}>{movie.tituloOriginal}</div>
            )}
          </div>
        </div>
      </div>
      <div className="cine-scroll" style={{ background: "linear-gradient(180deg,rgba(20,32,50,.97),rgba(14,24,40,.98))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 13.5, color: "rgba(235,242,250,.9)", lineHeight: 1.55 }}>“{movie.descricao}”</div>
        <div style={{ border: "1px solid rgba(160,200,255,.3)", borderRadius: 16, padding: "11px 13px", background: "rgba(120,170,235,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z" stroke="#9FC5F2" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "1.4px", color: "#9FC5F2" }}>POR QUE RECOMENDAMOS</div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(235,242,250,.92)", lineHeight: 1.5 }}>{movie.motivoRecomendacao}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <InfoCard label="FAIXA ETÁRIA" value={idadeLabel(movie)} />
          <InfoCard label="DURAÇÃO" value={movie.duracao} />
          {movie.estudio && <InfoCard label="ESTÚDIO" value={movie.estudio} />}
          <InfoCard label="CATEGORIA" value={categoryLabel(movie.categoria)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {movie.streaming && movie.streaming.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: "1.2px", color: "rgba(190,210,235,.6)" }}>ONDE ASSISTIR</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {movie.streaming.map((s) => (
                  <div key={s} style={{ padding: "6px 13px", borderRadius: 999, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.22)", fontSize: 11.5, fontWeight: 800, color: "#F2F7FC" }}>{s}</div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, marginLeft: "auto" }}>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < movie.ratingKidzz ? "#F2C55C" : "none"}>
                  <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.7-5.3 2.7 1-5.8L3.5 9.7l5.9-.9Z" stroke={i < movie.ratingKidzz ? "#F2C55C" : "rgba(190,210,235,.4)"} strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              ))}
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(190,210,235,.7)" }}>Curadoria KIDZZ</div>
          </div>
        </div>
        <button onClick={onMarcar} className="active:scale-[.97]" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 999, cursor: "pointer", background: "radial-gradient(130% 130% at 30% 22%,#FFE9A8 0%,#F2B23B 55%,#C77E12 100%)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 8px 20px rgba(0,0,0,.4),inset 0 1.5px 1px rgba(255,255,255,.75),inset 0 -5px 10px rgba(140,80,0,.35)", fontFamily: "'Nunito',sans-serif", fontSize: 13.5, fontWeight: 900, color: "#4A3300", transition: "transform .2s" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 3v3m10-3v3M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18V7.5Zm0 3.2h16" stroke="#4A3300" strokeWidth="1.9" strokeLinecap="round" /></svg>
          Marcar sessão em família
        </button>
      </div>
    </div>
  </>
);

/* ── Keyframes locais (prefixados cine-) ── */
const CINE_KEYFRAMES = `
@keyframes cine-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine-toastin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine-sheetin{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine-fadein{from{opacity:0}to{opacity:1}}
@keyframes cine-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes cine-balloonfloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-9px) rotate(3deg)}}
@keyframes cine-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes cine-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,26px) scale(1.18)}}
@keyframes cine-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,-22px) scale(1.12)}}
@keyframes cine-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-16px) scale(1.15)}}
@keyframes cine-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes cine-raysway{0%,100%{opacity:.5;transform:translateX(0)}50%{opacity:1;transform:translateX(12px)}}
@keyframes cine-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes cine-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
.cine-scroll::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion:reduce){.cine-root *{animation-duration:.001ms!important;animation-iteration-count:1!important;animation-delay:0ms!important}}
`;

/* ============================================================ */
/*  Tela principal                                              */
/* ============================================================ */
const FamilyCinema = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const [active, setActive] = useState<Movie | null>(null);
  const [toast, setToast] = useState("");
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const weekly = useMemo(() => getWeeklyMovie(), []);
  const daily = useMemo(() => getDailyHighlights(3), []);

  const pontos = (profile as { points?: number } | null)?.points ?? 0;
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

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

  const marcarSessao = useCallback(() => {
    haptic("light");
    setActive(null);
    showToast("Sessão marcada para sábado à noite");
  }, [showToast]);

  const onScroll = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const sc = scrollRef.current, hero = heroWrapRef.current;
      if (!sc || !hero) return;
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.42}px) scale(${1 + y * 0.0004})`;
      hero.style.opacity = String(Math.max(0, 1 - y / 240));
    });
  }, []);

  const weeklyArt = ART[weekly.id];
  const featuredBg = weeklyArt
    ? `linear-gradient(150deg,rgba(255,255,255,.35) 0%,${hexA(weeklyArt.g[0], 0.55)} 22%,${hexA(weeklyArt.g[1], 0.6)} 58%,${hexA(weeklyArt.g[2], 0.85)} 100%), url("${ASSET(weeklyArt.asset)}") center/cover no-repeat`
    : `linear-gradient(150deg,rgba(255,255,255,.3) 0%,${hexA(weekly.glowColor, 0.5)} 22%,${darken(weekly.glowColor, 0.42)} 60%,${darken(weekly.glowColor, 0.24)} 100%)`;

  const sections = [
    { key: "calmar", ...EDITORIAL_SECTIONS.find((s) => s.id === "calmar")! },
    { key: "vinculo", ...EDITORIAL_SECTIONS.find((s) => s.id === "vinculo")! },
    { key: "imaginacao", ...EDITORIAL_SECTIONS.find((s) => s.id === "imaginacao")! },
    { key: "divertidos", ...EDITORIAL_SECTIONS.find((s) => s.id === "divertidos")! },
  ].filter((s) => s.id);

  return (
    <div className="cine-root" style={{ height: "100%", position: "relative", fontFamily: "'Nunito',system-ui,sans-serif", background: "linear-gradient(180deg,#EAF3FB 0%,#DDEBF8 40%,#CFE2F3 75%,#C2D7ED 100%)" }}>
      <style>{CINE_KEYFRAMES}</style>

      {/* orbes de luz */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", background: "radial-gradient(45% 30% at 78% 26%,rgba(255,215,130,.18),transparent 70%),radial-gradient(42% 28% at 10% 55%,rgba(140,180,240,.16),transparent 70%),radial-gradient(50% 30% at 55% 90%,rgba(175,150,235,.12),transparent 70%)" }} />
      <div style={{ position: "absolute", top: -60, left: -80, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(150,195,245,.4),transparent 65%)", filter: "blur(28px)", animation: "cine-drift1 13s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "38%", left: -90, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,225,150,.3),transparent 65%)", filter: "blur(30px)", animation: "cine-drift2 17s ease-in-out 2s infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 90, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(175,150,235,.26),transparent 65%)", filter: "blur(32px)", animation: "cine-drift1 19s ease-in-out 4s infinite", pointerEvents: "none" }} />

      <div ref={scrollRef} onScroll={onScroll} className="cine-scroll" style={{ height: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)", scrollbarWidth: "none", position: "relative" }}>

        {/* ── HERO ── */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 414, backgroundImage: `url('${ASSET("cena-cinema.png")}')`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(46px) saturate(1.45)", opacity: 0.5, transform: "scale(1.22)", pointerEvents: "none" }} />
          <div ref={heroWrapRef} style={{ position: "relative", width: "100%", height: 414, willChange: "transform", WebkitMaskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", maskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", animation: "cine-heroIn .7s cubic-bezier(.22,1,.36,1) both" }}>
            <img src={ASSET("cena-cinema.png")} alt="Gui, o camaleão, pronto para a sessão de cinema" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 34%", animation: "cine-floaty 6s ease-in-out infinite", filter: "saturate(1.08) contrast(1.02)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg,rgba(234,243,251,.22) 0%,rgba(234,243,251,0) 20%,rgba(234,243,251,.22) 48%,rgba(234,243,251,.6) 72%,rgba(234,243,251,.34) 84%,rgba(234,243,251,.12) 94%,transparent 100%)" }} />
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: 236, pointerEvents: "none", background: "linear-gradient(180deg,rgba(255,235,180,.34) 0%,rgba(255,235,180,.1) 45%,transparent 75%)", filter: "blur(6px)", animation: "cine-raysway 7s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 52, left: "58%", width: 6, height: 6, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 10px 3px rgba(255,205,110,.85)", animation: "cine-twinkle 3.2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 140, left: "50%", width: 4, height: 4, borderRadius: 99, background: "#FFF", boxShadow: "0 0 8px 2px rgba(160,200,255,.8)", animation: "cine-sparklefloat 4.4s ease-in-out 1s infinite" }} />
          <div style={{ position: "absolute", top: 236, left: "70%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 9px 3px rgba(255,205,110,.7)", animation: "cine-sparklefloat 5.1s ease-in-out .4s infinite" }} />

          <button onClick={() => { haptic("light"); onBack(); }} className="active:scale-90" style={{ position: "absolute", top: 62, left: 16, width: 42, height: 42, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.65)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(50,80,130,.2),inset 0 1px 0 rgba(255,255,255,1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", zIndex: 6 }} aria-label="Voltar">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m6-6-6 6 6 6" stroke="#1B3050" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8, zIndex: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,.65)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(50,80,130,.2),inset 0 1px 0 rgba(255,255,255,1)", fontWeight: 900, fontSize: 13, color: "#1B3050" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5" stroke="#E0A62B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {pontos}
            </div>
          </div>
          <div style={{ padding: "14px 20px 2px", animation: "cine-cascade .6s cubic-bezier(.22,1,.36,1) .06s both", zIndex: 4, position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(255,255,255,.72)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,1),0 4px 12px rgba(50,80,130,.12)", fontWeight: 800, fontSize: 11.5, color: "#3A5578", marginBottom: 10 }}>
              {saudacao}, família!
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#39B58A"><path d="M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z" /></svg>
            </div>
            <h1 style={{ margin: "0 0 7px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 28, lineHeight: 1.14, color: "#12263F", letterSpacing: "-.3px" }}>Cinema em <span style={{ color: "#2E7ACC" }}>família</span>.</h1>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, color: "#4E6B8C", maxWidth: 280 }}>Um filme por semana, escolhido a dedo para a sua casa.</p>
          </div>
        </div>

        {/* ── FILME DA SEMANA ── */}
        <div style={{ padding: "8px 16px 0", position: "relative", zIndex: 5, animation: "cine-cascade .6s cubic-bezier(.22,1,.36,1) .16s both" }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, padding: "18px 16px 14px", background: featuredBg, border: "1px solid rgba(255,255,255,.55)", boxShadow: `0 18px 40px ${hexA(weekly.glowColor, 0.4)},0 0 30px ${hexA(weekly.glowColor, 0.25)},inset 0 1.5px 0 rgba(255,255,255,.6),inset 0 -12px 26px rgba(60,25,5,.35)` }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.22) 50%,transparent 100%)", animation: "cine-shine 6s ease-in-out infinite" }} />
            <div style={{ position: "absolute", top: 14, right: 16, animation: "cine-balloonfloat 4.5s ease-in-out infinite" }}>
              <svg width="46" height="62" viewBox="0 0 46 62" fill="none">
                <ellipse cx="23" cy="20" rx="16" ry="19" fill="url(#cine-balg)" />
                <ellipse cx="17" cy="13" rx="6" ry="8" fill="rgba(255,255,255,.45)" />
                <path d="M23 39l-3 4h6l-3-4Z" fill="#C22B4A" />
                <path d="M23 43c-2 6 3 8-1 17" stroke="rgba(255,240,220,.75)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <defs><radialGradient id="cine-balg" cx=".35" cy=".28" r="1"><stop offset="0" stopColor="#FF7E96" /><stop offset=".55" stopColor="#E8385E" /><stop offset="1" stopColor="#9E1637" /></radialGradient></defs>
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z" stroke="#FFD9A0" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.5px", color: "#FFD9A0" }}>FILME DA SEMANA</div>
            </div>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 24, color: "#FFF6EA", lineHeight: 1.15, marginBottom: 7, maxWidth: 240 }}>{weekly.titulo}</div>
            <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 12.5, color: "rgba(255,240,220,.85)", lineHeight: 1.5, marginBottom: 12, maxWidth: 250 }}>“{weekly.descricao}”</div>
            <div style={{ display: "flex", gap: 7, marginBottom: 13, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, background: "rgba(255,255,255,.16)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.4)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)", fontSize: 11, fontWeight: 800, color: "#FFF2E0" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#FFF2E0" strokeWidth="1.8" /><path d="M12 8v4.2l2.8 1.6" stroke="#FFF2E0" strokeWidth="1.8" strokeLinecap="round" /></svg>
                {weekly.duracao}
              </div>
              <div style={{ padding: "6px 11px", borderRadius: 999, background: "rgba(255,255,255,.16)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.4)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)", fontSize: 11, fontWeight: 800, color: "#FFF2E0" }}>{idadeLabel(weekly)}</div>
              {weekly.estudio && <div style={{ padding: "6px 11px", borderRadius: 999, background: "rgba(255,255,255,.16)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.4)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)", fontSize: 11, fontWeight: 800, color: "#FFF2E0" }}>{weekly.estudio}</div>}
            </div>
            <button onClick={() => open(weekly)} className="active:scale-[.97]" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 999, cursor: "pointer", background: "linear-gradient(155deg,rgba(255,255,255,.96),rgba(255,244,228,.85))", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 8px 20px rgba(60,25,5,.35),inset 0 1.5px 0 rgba(255,255,255,1)", fontFamily: "'Nunito',sans-serif", fontSize: 13.5, fontWeight: 900, color: "#7A4014", transition: "transform .2s" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 0v16m8-16v16M4 9.5h4m-4 5h4m8-5h4m-4 5h4" stroke="#7A4014" strokeWidth="1.8" strokeLinecap="round" /></svg>
              Ver detalhes
            </button>
          </div>
        </div>

        {/* ── EM ALTA HOJE ── */}
        <Section title="Em alta hoje" subtitle="As escolhas favoritas das famílias" emoji="✨" dot={SECTION_DOT.alta} movies={daily} onOpen={open} delay={0.24} />

        {/* ── SEÇÕES EDITORIAIS ── */}
        {sections.map((s, i) => (
          <Section
            key={s.id}
            title={s.title}
            subtitle={s.subtitle}
            emoji={s.icon}
            dot={SECTION_DOT[s.id] ?? SECTION_DOT.alta}
            movies={getMoviesBySection(s)}
            onOpen={open}
            delay={0.33 + i * 0.09}
          />
        ))}

        <div style={{ padding: "8px 20px 14px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#7A93B0" }}>Curadoria KIDZZ · Selecionada para sua família</div>
      </div>

      {/* ── DETALHE ── */}
      {active && <DetailSheet movie={active} onClose={() => setActive(null)} onMarcar={marcarSessao} />}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "absolute", bottom: 98, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 70 }}>
          <div style={{ padding: "10px 18px", borderRadius: 999, background: "rgba(18,38,63,.94)", color: "#EAF3FB", fontFamily: "'Nunito',sans-serif", fontSize: 12.5, fontWeight: 800, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 10px 24px rgba(18,38,63,.4)", animation: "cine-toastin .3s both" }}>{toast}</div>
        </div>
      )}
    </div>
  );
};

export default FamilyCinema;
