/**
 * MomentsPlaylists — redesign premium
 * Craft: Bora (camadas, sticky glass, coloredGlass, sheen, cascade)
 * Layout: print public/telas/momentos/ (tema claro dourado)
 * Dados: PLAYLISTS + Spotify embed real
 * Assets: momentos-v2 Hermes full-frame
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  X,
  Shield,
  Trophy,
  Sun,
  Heart,
  Rocket,
  Moon,
  Briefcase,
  Play,
  Clock,
} from "lucide-react";
import {
  PLAYLISTS,
  getWeeklyPlaylist,
  getSpotifyEmbedUrl,
  getSpotifyOpenUrl,
  type KidzzPlaylist,
  type PlaylistMood,
} from "@/lib/playlistsConfig";
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

const AS = "/exemplos/assets/momentos-v2";
const AV = "v1";
const asset = (n: string) => `${AS}/${n}?${AV}`;

/** Capas Hermes por mood (fallback: gradient) */
const COVER_BY_MOOD: Partial<Record<PlaylistMood, string>> = {
  morning: asset("cover-morning.png"),
  sunday: asset("cover-afternoon.png"),
  sleep: asset("cover-night.png"),
  travel: asset("cover-travel.png"),
  bonding: asset("cover-bond.png"),
  calm: asset("cover-calm.png"),
};

interface Props {
  onBack: () => void;
}

const INK = "#1A2A18";
const INK2 = "#5A6B55";
const GOLD = "#C9A227";
const EM = "#3E9A5E";

const KEYFRAMES = `
@keyframes mom2-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes mom2-cascade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes mom2-heroIn{from{opacity:0;transform:translateY(-8px) scale(1.03)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes mom2-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes mom2-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(22px,12px) scale(1.08)}}
@keyframes mom2-shine{0%{transform:translateX(-130%) skewX(-16deg)}60%,100%{transform:translateX(240%) skewX(-16deg)}}
@keyframes mom2-twinkle{0%,100%{opacity:.18;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
.mom2-screen::-webkit-scrollbar,.mom2-hscroll::-webkit-scrollbar{display:none}
[data-tab="momentos"] button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){[data-tab="momentos"] *{animation:none!important}}
`;

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
      animation: "mom2-shine 6s ease-in-out infinite",
      borderRadius: "inherit",
    }}
  />
);

const Gloss = ({
  colors,
  children,
  size = 36,
}: {
  colors: [string, string, string];
  children: ReactNode;
  size?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(130% 130% at 30% 22%, #fff 0%, ${colors[0]} 16%, ${colors[1]} 55%, ${colors[2]} 100%)`,
      boxShadow:
        "0 6px 14px rgba(40,60,40,.25), inset 0 2px 3px rgba(255,255,255,.72), inset 0 -5px 10px rgba(0,0,0,.16)",
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
      padding: "0 2px",
    }}
  >
    <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 18, color: INK, letterSpacing: "-0.3px" }}>
      {children}
    </h2>
    {right}
  </div>
);

/* Player Spotify preservado */
const PlayerSheet = ({ playlist, onClose }: { playlist: KidzzPlaylist; onClose: () => void }) => (
  <div
    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
    onClick={onClose}
    style={{ background: "rgba(10,20,14,0.55)", backdropFilter: "blur(12px)" }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        borderRadius: "24px 24px 0 0",
        overflow: "hidden",
        background: "linear-gradient(180deg,#1A2E20 0%,#0F1C14 100%)",
        border: "0.5px solid rgba(255,255,255,.2)",
        boxShadow: `0 24px 60px rgba(0,0,0,.45), 0 0 40px ${playlist.glow}33`,
        animation: "mom2-rise .35s cubic-bezier(.22,1,.36,1) both",
      }}
    >
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 26 }}>{playlist.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: "#F4F8F0", lineHeight: 1.2 }}>
                {playlist.title}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.7)", fontStyle: "italic" }}>
                “{playlist.emotionalLine}”
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="active:scale-90"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              ...pillGlass,
              background: "rgba(255,255,255,.12)",
              border: "0.5px solid rgba(255,255,255,.28)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#EFF5EA",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ borderRadius: 16, overflow: "hidden", background: "rgba(0,0,0,.35)" }}>
          <iframe
            title={`Playlist ${playlist.title}`}
            src={getSpotifyEmbedUrl(playlist.spotifyId)}
            width="100%"
            height={360}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0, display: "block", height: "clamp(220px, 48vh, 360px)" }}
          />
        </div>
        <a
          href={getSpotifyOpenUrl(playlist.spotifyId)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...goldBtn,
            marginTop: 14,
            width: "100%",
            textDecoration: "none",
            minHeight: 46,
          }}
        >
          <ExternalLink size={15} /> Abrir no Spotify
        </a>
      </div>
    </div>
  </div>
);

type ChipId = "destaque" | "emocionar" | "aventura" | "acalmar" | "viagem";

const CHIPS: {
  id: ChipId;
  title: string;
  sub: string;
  Icon: typeof Sun;
  tint: [number, number, number];
  g: [string, string, string];
  moods?: PlaylistMood[];
  novo?: boolean;
}[] = [
  { id: "destaque", title: "Em destaque", sub: "Preferidas da família", Icon: Sun, tint: [230, 185, 90], g: ["#FFE9A8", "#F2B23B", "#C77E12"] },
  { id: "emocionar", title: "Para emocionar", sub: "Toca o coração", Icon: Heart, tint: [140, 200, 140], g: ["#C0EDA0", "#6FBE4F", "#3F8A32"], moods: ["bonding"] },
  { id: "aventura", title: "Aventura", sub: "Sonhar e explorar", Icon: Rocket, tint: [175, 140, 220], g: ["#D8C2FF", "#9A6CF0", "#6A3EC0"], moods: ["sunday", "morning"] },
  { id: "acalmar", title: "Para acalmar", sub: "Relaxar juntos", Icon: Moon, tint: [120, 160, 220], g: ["#A8D4FF", "#4E9BE8", "#2568B8"], moods: ["calm", "sleep"] },
  { id: "viagem", title: "Modo Viagem", sub: "Qualquer lugar", Icon: Briefcase, tint: [100, 180, 200], g: ["#A8E8F0", "#3DBFCE", "#1B7A88"], moods: ["travel"], novo: true },
];

const MomentsPlaylists = ({ onBack }: Props) => {
  const [active, setActive] = useState<KidzzPlaylist | null>(null);
  const [chip, setChip] = useState<ChipId>("destaque");
  const { profile } = useAuth();
  const pontos = profile?.points ?? 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);

  const weekly = getWeeklyPlaylist();
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  const destaques = useMemo(() => {
    const others = PLAYLISTS.filter((p) => p.id !== weekly.id);
    return [weekly, ...others].slice(0, 6);
  }, [weekly]);

  const filtered = useMemo(() => {
    const cfg = CHIPS.find((c) => c.id === chip);
    if (!cfg?.moods) return PLAYLISTS;
    return PLAYLISTS.filter((p) => cfg.moods!.includes(p.mood));
  }, [chip]);

  const listTitle =
    chip === "destaque" ? "Em destaque hoje" : CHIPS.find((c) => c.id === chip)?.title ?? "Playlists";

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

  const open = useCallback((p: KidzzPlaylist) => {
    haptic("light");
    sfx("click");
    setActive(p);
  }, []);

  const coverOf = (p: KidzzPlaylist, i: number) =>
    COVER_BY_MOOD[p.mood] ??
    `/exemplos/assets/v3-moment-${(i % 4) + 1}.png`;

  return (
    <div
      data-tab="momentos"
      style={{
        height: "100%",
        position: "relative",
        fontFamily: FONT,
        background: "#D8E4C8",
        color: INK,
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Camadas — craft Bora, paleta dourada do print */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${asset("hero-gui.png")})`,
          backgroundSize: "cover",
          backgroundPosition: "70% 25%",
          filter: "brightness(.92) saturate(1.1) blur(1px)",
          transform: "scale(1.08)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(250,246,236,.55) 0%, rgba(240,236,220,.7) 28%, rgba(228,236,210,.88) 55%, rgba(216,228,200,.96) 78%, #D0E0C0 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(50% 32% at 78% 12%, rgba(255,210,100,.3), transparent 70%), radial-gradient(40% 28% at 12% 40%, rgba(160,200,120,.16), transparent 70%)",
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
          background: "radial-gradient(circle, rgba(255,200,90,.35), transparent 65%)",
          filter: "blur(30px)",
          animation: "mom2-drift 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {[
        { t: 90, l: "18%", d: "0s" },
        { t: 160, l: "68%", d: "1s" },
        { t: 250, l: "40%", d: "2s" },
        { t: 330, l: "80%", d: ".5s" },
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
            animation: `mom2-twinkle ${3 + i * 0.4}s ease-in-out ${p.d} infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <div
        ref={scrollRef}
        className="mom2-screen"
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
              "linear-gradient(180deg, rgba(245,242,230,.88) 0%, rgba(245,242,230,.4) 70%, transparent 100%)",
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
            <Shield size={14} color={EM} /> Pais
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
        <div style={{ position: "relative", padding: `4px ${PAD}px 12px`, minHeight: 232 }}>
          <div
            ref={heroArtRef}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "54%",
              height: 210,
              willChange: "transform",
              animation: "mom2-heroIn .75s cubic-bezier(.22,1,.36,1) both",
              pointerEvents: "none",
              borderRadius: `0 ${R.card}px ${R.card}px 0`,
              overflow: "hidden",
            }}
          >
            <img
              src={asset("hero-gui.png")}
              alt="Gui com fones de ouvido"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "55% 20%",
                maskImage:
                  "linear-gradient(100deg, transparent 0%, #000 22%, #000 82%, transparent 100%), linear-gradient(180deg, #000 55%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(100deg, transparent 0%, #000 22%, #000 82%, transparent 100%), linear-gradient(180deg, #000 55%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
                filter: "saturate(1.08) contrast(1.02)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/exemplos/assets/cena-momentos.png";
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: "18%",
                bottom: 30,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,210,100,.4), transparent 70%)",
                filter: "blur(8px)",
                animation: "mom2-floaty 6s ease-in-out infinite",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 3,
              maxWidth: "56%",
              paddingTop: 8,
              animation: "mom2-cascade .6s cubic-bezier(.22,1,.36,1) .05s both",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 800, color: INK2, marginBottom: 8 }}>
              {saudacao}, família!
            </div>
            <h1
              style={{
                margin: "0 0 8px",
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1.1,
                color: INK,
                letterSpacing: "-0.4px",
                textShadow: "0 1px 12px rgba(255,255,255,.5)",
              }}
            >
              Momentos que{" "}
              <span style={{ color: GOLD }}>ficam</span>
              <br />
              para sempre.
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
              Playlists para cada fase, cada emoção e cada memória em família.
            </p>
          </div>
        </div>

        {/* Chips de categoria */}
        <div style={{ marginBottom: GAP }}>
          <div
            className="mom2-hscroll"
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              padding: `2px ${PAD}px 4px`,
              scrollbarWidth: "none",
              animation: "mom2-cascade .55s cubic-bezier(.22,1,.36,1) .1s both",
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
                    width: 116,
                    minHeight: 108,
                    padding: "12px 10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: FONT,
                    ...coloredGlass(c.tint[0], c.tint[1], c.tint[2], on ? 0.52 : 0.34, on ? 0.2 : 0.12),
                    outline: on ? `2px solid rgba(${c.tint[0]},${c.tint[1]},${c.tint[2]},.5)` : "none",
                    outlineOffset: 1,
                  }}
                >
                  <Shine />
                  {c.novo && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background: "linear-gradient(180deg,#FFF3C4,#F2C55C)",
                        fontSize: 8.5,
                        fontWeight: 900,
                        color: "#4A3300",
                        zIndex: 2,
                      }}
                    >
                      NOVO
                    </span>
                  )}
                  <Gloss colors={c.g} size={34}>
                    <Icon size={15} color="#fff" strokeWidth={2} />
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
                      <ArrowRight size={11} color={INK} strokeWidth={2.4} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Em destaque / lista filtrada — cards horizontais */}
        <div style={{ marginBottom: GAP + 2 }}>
          <div style={{ padding: `0 ${PAD}px` }}>
            <SectionLabel
              right={
                <span style={{ fontSize: 11, fontWeight: 800, color: INK2 }}>
                  {chip === "destaque" ? destaques.length : filtered.length} playlists
                </span>
              }
            >
              {listTitle}
            </SectionLabel>
          </div>
          <div
            className="mom2-hscroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: `2px ${PAD}px 8px`,
              scrollbarWidth: "none",
              animation: "mom2-cascade .5s cubic-bezier(.22,1,.36,1) .14s both",
            }}
          >
            {(chip === "destaque" ? destaques : filtered).map((p, i) => {
              const cover = coverOf(p, i);
              return (
                <div
                  key={p.id}
                  style={{
                    flex: "none",
                    width: 156,
                    borderRadius: R.card,
                    overflow: "hidden",
                    ...glass,
                    boxShadow: "0 12px 28px rgba(40,50,30,.14), 0 1px 0 rgba(255,255,255,.9) inset",
                  }}
                >
                  <div
                    style={{
                      height: 118,
                      position: "relative",
                      background: `url("${cover}") center/cover no-repeat`,
                    }}
                  >
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
                        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
                      }}
                    >
                      {p.approxTracks ?? 10} músicas
                    </div>
                    <button
                      type="button"
                      onClick={() => open(p)}
                      aria-label={`Tocar ${p.title}`}
                      className="active:scale-90"
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "52%",
                        transform: "translate(-50%,-50%)",
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        border: "1.5px solid rgba(255,255,255,.85)",
                        background: "rgba(255,255,255,.28)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        boxShadow: "0 6px 16px rgba(0,0,0,.25)",
                      }}
                    >
                      <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                    </button>
                    <div
                      style={{
                        position: "absolute",
                        inset: "auto 0 0 0",
                        height: 40,
                        background: "linear-gradient(180deg,transparent,rgba(0,0,0,.45))",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => open(p)}
                    style={{
                      width: "100%",
                      padding: "10px 11px 11px",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >
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
                      {p.title}
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
                        marginBottom: 6,
                      }}
                    >
                      {p.description}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 800, color: INK2 }}>
                      <Clock size={11} /> {p.approxMinutes ?? 30} min
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Todas as playlists — lista */}
        <div style={sectionWrap}>
          <SectionLabel>Todas as playlists</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLAYLISTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => open(p)}
                className="active:scale-[0.985]"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 18,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: FONT,
                  ...glassSoft,
                  border: "0.5px solid rgba(255,255,255,.9)",
                  boxShadow: "0 6px 18px rgba(40,50,30,.1), 0 1px 0 rgba(255,255,255,.9) inset",
                  animation: `mom2-cascade .45s cubic-bezier(.22,1,.36,1) ${0.02 * i}s both`,
                }}
              >
                <div
                  style={{
                    flex: "none",
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: `url("${coverOf(p, i)}") center/cover`,
                    boxShadow: "0 4px 12px rgba(0,0,0,.15)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 20,
                    overflow: "hidden",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14.5, color: INK, lineHeight: 1.2 }}>
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: INK2,
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    “{p.emotionalLine}”
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, marginTop: 1 }}>
                    {p.approxTracks ?? 10} músicas · {p.approxMinutes ?? 30} min
                  </div>
                </div>
                <div
                  style={{
                    flex: "none",
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    ...goldBtn,
                    minHeight: 36,
                    padding: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: 11.5,
            fontWeight: 800,
            color: "rgba(60,80,50,.45)",
            padding: `0 ${PAD}px 20px`,
          }}
        >
          Curadoria KIDZZ · Atualizada direto pelo Spotify
        </p>
      </div>

      {active && <PlayerSheet playlist={active} onClose={() => setActive(null)} />}
    </div>
  );
};

export default MomentsPlaylists;
