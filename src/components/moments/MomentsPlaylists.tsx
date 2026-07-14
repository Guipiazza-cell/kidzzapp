import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import {
  PLAYLISTS,
  getWeeklyPlaylist,
  getSpotifyEmbedUrl,
  getSpotifyOpenUrl,
  type KidzzPlaylist,
} from "@/lib/playlistsConfig";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";

/**
 * MomentsPlaylists — Tela "Momentos" (redesign v2 — floresta esmeralda).
 *
 * Porta fiel do mockup public/exemplos/Momentos v2.dc.html (estilos inline 1:1)
 * ligada aos dados reais do app:
 *  - Em destaque / Todas as playlists → PLAYLISTS (playlistsConfig)
 *  - Destaque da semana               → getWeeklyPlaylist()
 *  - Tocar                            → PlayerSheet com embed real do Spotify
 *  - Pontos                           → profile.points (useAuth)
 * A barra de navegação inferior é a BottomNav global (não duplicada aqui).
 */

interface Props {
  onBack: () => void;
}

const HERO_IMG = "/exemplos/assets/cena-momentos.png";
/* Rodapés dos cards de destaque (paleta floresta do design) */
const FOOT: [string, string][] = [
  ["#8A6420", "#5C3F0E"],
  ["#1F6B4C", "#0F3D2A"],
  ["#5A4390", "#3A2A64"],
  ["#20686E", "#123E44"],
];

/* ---------- Player Sheet (funcionalidade real preservada) ---------- */
const PlayerSheet = ({
  playlist,
  onClose,
}: {
  playlist: KidzzPlaylist;
  onClose: () => void;
}) => (
  <motion.div
    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    style={{ background: "rgba(6,18,12,0.62)", backdropFilter: "blur(10px)" }}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#122A1D 0%,#0B2016 100%)",
        border: "1px solid rgba(255,255,255,.14)",
        boxShadow: `0 30px 80px -20px ${playlist.glow}55, inset 0 1.5px 0 rgba(255,255,255,.22), inset 0 -10px 24px rgba(0,0,0,.22)`,
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-white min-w-0">
            <span className="text-2xl">{playlist.emoji}</span>
            <div className="min-w-0">
              <h3 style={{ fontFamily: "'Lora',serif" }} className="font-semibold text-base leading-tight truncate">{playlist.title}</h3>
              <p className="text-[12px] text-white/80 italic truncate">"{playlist.emotionalLine}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="active:scale-90 transition"
            aria-label="Fechar"
            style={{
              minWidth: 40,
              minHeight: 40,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#EFF5EA",
              background: "rgba(255,255,255,.13)",
              backdropFilter: "blur(16px) saturate(150%)",
              WebkitBackdropFilter: "blur(16px) saturate(150%)",
              border: "1px solid rgba(255,255,255,.32)",
              boxShadow: "0 6px 16px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.4)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden bg-black/40">
          <iframe
            title={`Playlist ${playlist.title}`}
            src={getSpotifyEmbedUrl(playlist.spotifyId)}
            width="100%"
            height={380}
            frameBorder={0}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0, display: "block", height: "clamp(232px, 52vh, 380px)" }}
          />
        </div>

        <a
          href={getSpotifyOpenUrl(playlist.spotifyId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition"
          style={{
            background: "radial-gradient(130% 130% at 30% 22%, #FFF6D8 0%, #F2C55C 45%, #C98F1E 100%)",
            color: "#3A2A08",
            border: "1px solid rgba(255,255,255,.55)",
            boxShadow: "0 6px 16px rgba(0,0,0,.4), inset 0 1px 1px rgba(255,255,255,.7), inset 0 -3px 6px rgba(140,90,10,.35)",
          }}
        >
          <ExternalLink size={15} /> Abrir no Spotify
        </a>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------- Card "Em destaque hoje" ---------- */
const FeatureCard = ({
  playlist,
  index,
  onOpen,
}: {
  playlist: KidzzPlaylist;
  index: number;
  onOpen: () => void;
}) => {
  const foot = FOOT[index % FOOT.length];
  return (
    <div
      style={{
        flex: "none",
        width: 172,
        borderRadius: 22,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 16px 34px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.35)",
        border: "1px solid rgba(255,255,255,.30)",
        animation: "mom-rise .45s both",
      }}
    >
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <div
          role="img"
          aria-label={playlist.title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("/exemplos/assets/mo-play-${(index % 4) + 1}.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "4px 11px",
            borderRadius: 999,
            background: "rgba(10,26,18,.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.35)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
            color: "#EFF5EA",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {playlist.approxTracks} músicas
        </div>
        {playlist.isNew && (
          <div
            style={{
              position: "absolute",
              top: 9,
              right: 9,
              padding: "3px 9px",
              borderRadius: 999,
              background: "radial-gradient(130% 130% at 30% 22%,#FFF3C4 0%,#F2C55C 45%,#C98F1E 100%)",
              color: "#4A3300",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".4px",
              boxShadow: "0 3px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.7)",
            }}
          >
            NOVO
          </div>
        )}
        <button
          onClick={onOpen}
          aria-label={`Tocar ${playlist.title}`}
          className="active:scale-90"
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 54,
            height: 54,
            borderRadius: 999,
            cursor: "pointer",
            background: "rgba(255,255,255,.24)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1.5px solid rgba(255,255,255,.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform .2s",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 3 }}>
            <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11-7.2c.6-.4.6-1.4 0-1.8l-11-7.2c-.7-.4-1.6.1-1.6.9Z" />
          </svg>
        </button>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 34,
            background: `linear-gradient(180deg, rgba(0,0,0,0), ${foot[0]})`,
          }}
        />
      </div>
      <button
        onClick={onOpen}
        className="text-left active:scale-[0.98]"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
          padding: "8px 12px 10px",
          background: `linear-gradient(180deg,${foot[0]},${foot[1]})`,
          border: "none",
          cursor: "pointer",
        }}
      >
        <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#FFF8EA", lineHeight: 1.2 }}>
          {playlist.emoji} {playlist.title}
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,248,234,.8)", lineHeight: 1.4, minHeight: 29 }}>
          "{playlist.emotionalLine}"
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 800, color: "rgba(255,248,234,.85)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" stroke="rgba(255,248,234,.85)" strokeWidth="1.8" />
            <path d="M12 8v4.2l2.8 1.6" stroke="rgba(255,248,234,.85)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {playlist.approxMinutes} min
        </div>
        </div>
      </button>
    </div>
  );
};

/* ---------- Linha "Todas as playlists" ---------- */
const PlaylistRow = ({
  playlist,
  index,
  onOpen,
}: {
  playlist: KidzzPlaylist;
  index: number;
  onOpen: () => void;
}) => (
  <button
    onClick={onOpen}
    className="active:scale-[0.985]"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: 20,
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
      background: "linear-gradient(155deg,rgba(255,255,255,.16),rgba(120,200,160,.10) 50%,rgba(255,255,255,.05))",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      border: "1px solid rgba(255,255,255,.34)",
      boxShadow: "0 10px 24px rgba(0,0,0,.35),inset 0 1.5px 0 rgba(255,255,255,.45),inset 0 -8px 16px rgba(0,0,0,.10)",
      transition: "transform .2s",
      animation: "mom-rise .45s both",
    }}
  >
    <div
      role="img"
      aria-label={playlist.title}
      style={{
        flex: "none",
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundImage: `url("/exemplos/assets/mo-li-${(index % 4) + 1}.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 6px 14px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.35), inset 0 -4px 8px rgba(0,0,0,.2)",
      }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14.5, color: "#F1F6EA", lineHeight: 1.2 }}>
        {playlist.emoji} {playlist.title}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(220,235,218,.66)", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        "{playlist.emotionalLine}"
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(242,197,92,.85)" }}>
        {playlist.approxTracks} músicas • {playlist.approxMinutes} min
      </div>
    </div>
    <div
      style={{
        flex: "none",
        width: 36,
        height: 36,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(130% 130% at 30% 22%, #FFF6D8 0%, #F2C55C 45%, #C98F1E 100%)",
        boxShadow: "0 4px 12px rgba(0,0,0,.45), inset 0 1px 1px rgba(255,255,255,.7), inset 0 -3px 6px rgba(140,90,10,.35)",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#0E2418" style={{ marginLeft: 2 }}>
        <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11-7.2c.6-.4.6-1.4 0-1.8l-11-7.2c-.7-.4-1.6.1-1.6.9Z" />
      </svg>
    </div>
  </button>
);

/* ============================================================ */
const MomentsPlaylists = ({ onBack }: Props) => {
  const [active, setActive] = useState<KidzzPlaylist | null>(null);
  const { profile } = useAuth();
  const pontos = (profile as { points?: number } | null)?.points ?? 0;

  const weekly = getWeeklyPlaylist();
  const others = PLAYLISTS.filter((p) => p.id !== weekly.id);
  const destaques = [weekly, ...others];

  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  const open = (p: KidzzPlaylist) => {
    haptic("light");
    sfx("click");
    setActive(p);
  };

  const orb: CSSProperties = { position: "absolute", borderRadius: "50%", pointerEvents: "none" };

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        fontFamily: "'Nunito',system-ui,sans-serif",
        background: "linear-gradient(180deg,#163324 0%,#102A1D 40%,#0B2016 75%,#071810 100%)",
      }}
    >
      {/* keyframes locais (prefixo mom-) */}
      <style>{`
        @keyframes mom-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mom-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes mom-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
        @keyframes mom-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-16px) scale(1.15)}}
        @keyframes mom-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,26px) scale(1.18)}}
        @keyframes mom-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,-22px) scale(1.12)}}
        @keyframes mom-leafdrift{0%{transform:translate(0,-30px) rotate(0deg);opacity:0}12%{opacity:.7}88%{opacity:.6}100%{transform:translate(-46px,105vh) rotate(300deg);opacity:0}}
        @keyframes mom-firefly{0%,100%{opacity:.05;transform:translate(0,0)}30%{opacity:.85;transform:translate(9px,-13px)}60%{opacity:.25;transform:translate(-7px,-24px)}80%{opacity:.7;transform:translate(5px,-33px)}}
      `}</style>

      {/* atmosfera da floresta */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(45% 30% at 78% 26%,rgba(240,190,90,.13),transparent 70%),radial-gradient(42% 28% at 10% 55%,rgba(80,220,170,.09),transparent 70%),radial-gradient(50% 30% at 55% 90%,rgba(45,160,120,.12),transparent 70%)",
        }}
      />
      <div style={{ ...orb, top: -60, left: -80, width: 340, height: 340, background: "radial-gradient(circle,rgba(80,215,160,.22),transparent 65%)", filter: "blur(28px)", animation: "mom-drift1 13s ease-in-out infinite" }} />
      <div style={{ ...orb, top: "38%", left: -90, width: 300, height: 300, background: "radial-gradient(circle,rgba(240,190,90,.14),transparent 65%)", filter: "blur(30px)", animation: "mom-drift2 17s ease-in-out 2s infinite" }} />
      <div style={{ ...orb, bottom: 90, right: -100, width: 380, height: 380, background: "radial-gradient(circle,rgba(45,190,140,.20),transparent 65%)", filter: "blur(32px)", animation: "mom-drift1 19s ease-in-out 4s infinite" }} />
      {/* folhas e vaga-lumes */}
      <div style={{ position: "absolute", top: 0, left: "22%", pointerEvents: "none", animation: "mom-leafdrift 16s linear 1s infinite" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11" stroke="#7FE8C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", top: 0, left: "70%", pointerEvents: "none", animation: "mom-leafdrift 21s linear 7s infinite" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11" stroke="#9FE8C8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", top: "64%", left: "12%", width: 4, height: 4, borderRadius: 99, background: "#C9F2A6", boxShadow: "0 0 10px 3px rgba(190,240,150,.7)", pointerEvents: "none", animation: "mom-firefly 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "48%", left: "86%", width: 3.5, height: 3.5, borderRadius: 99, background: "#EFE9A8", boxShadow: "0 0 9px 3px rgba(235,225,150,.65)", pointerEvents: "none", animation: "mom-firefly 11s ease-in-out 3s infinite" }} />
      <div style={{ position: "absolute", top: "80%", left: "60%", width: 4, height: 4, borderRadius: 99, background: "#C9F2A6", boxShadow: "0 0 10px 3px rgba(190,240,150,.6)", pointerEvents: "none", animation: "mom-firefly 13s ease-in-out 6s infinite" }} />

      {/* scroller */}
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none",
          position: "relative",
        }}
      >
        {/* ── HERO ── */}
        <div style={{ position: "relative", height: 414 }}>
          {/* fundo desfocado */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 360,
              backgroundImage: `url("${HERO_IMG}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(46px) saturate(1.4)",
              opacity: 0.46,
              transform: "scale(1.2)",
              WebkitMaskImage: "linear-gradient(180deg,#000 42%,transparent 94%)",
              maskImage: "linear-gradient(180deg,#000 42%,transparent 94%)",
              pointerEvents: "none",
            }}
          />
          {/* imagem principal com máscara */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 360,
              WebkitMaskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)",
              maskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)",
            }}
          >
            <img
              src={HERO_IMG}
              alt="Gui, o camaleão, com fones de ouvido"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 32%", animation: "mom-floaty 6s ease-in-out infinite", filter: "saturate(1.08) contrast(1.02)" }}
            />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 360, pointerEvents: "none", background: "linear-gradient(180deg,rgba(12,30,21,.44) 0%,rgba(12,30,21,0) 20%,rgba(22,51,36,0) 40%,rgba(22,51,36,.5) 68%,rgba(22,51,36,.5) 82%,rgba(22,51,36,.18) 93%,transparent 100%)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "62%", height: 360, pointerEvents: "none", background: "linear-gradient(97deg,rgba(10,26,18,.72) 0%,rgba(10,26,18,.32) 32%,rgba(10,26,18,0) 60%)" }} />
          {/* sparkles */}
          <div style={{ position: "absolute", top: 44, left: "55%", width: 6, height: 6, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 10px 3px rgba(255,225,150,.75)", animation: "mom-twinkle 3.2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 120, left: "46%", width: 4, height: 4, borderRadius: 99, background: "#D6F5C0", boxShadow: "0 0 8px 2px rgba(200,245,170,.7)", animation: "mom-sparklefloat 4.4s ease-in-out 1s infinite" }} />
          <div style={{ position: "absolute", top: 230, left: "62%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 9px 3px rgba(255,225,150,.65)", animation: "mom-sparklefloat 5.1s ease-in-out .4s infinite" }} />

          {/* voltar */}
          <button
            onClick={() => { haptic("light"); onBack(); }}
            aria-label="Voltar"
            className="active:scale-90"
            style={{ position: "absolute", top: 62, left: 16, width: 42, height: 42, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.13)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,.32)", boxShadow: "0 6px 16px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s" }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m6-6-6 6 6 6" stroke="#EFF5EA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {/* pontos */}
          <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,.13)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,.32)", boxShadow: "0 6px 16px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.4)", fontWeight: 900, fontSize: 13, color: "#EFF5EA" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5" stroke="#F2C55C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {pontos}
            </div>
          </div>
          {/* título */}
          <div style={{ position: "absolute", left: 20, bottom: 10, width: 250, animation: "mom-rise .6s both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)", fontWeight: 800, fontSize: 12, color: "rgba(235,245,230,.9)", marginBottom: 11 }}>
              {saudacao}, família!
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#7FE8C0" style={{ verticalAlign: -2 }}><path d="M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z" /></svg>
            </div>
            <h1 style={{ margin: "0 0 9px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 31, lineHeight: 1.12, color: "#F1F6EA", letterSpacing: "-.2px", textShadow: "0 2px 14px rgba(0,0,0,.5)" }}>
              Momentos que <span style={{ color: "#F2C55C" }}>ficam</span> para sempre.
            </h1>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.45, color: "rgba(220,235,218,.78)", maxWidth: 230, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
              Playlists para cada fase, cada emoção e cada memória em família.
            </p>
          </div>
        </div>

        {/* ── EM DESTAQUE HOJE ── */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 20px 10px" }}>
            <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#F1F6EA" }}>Em destaque hoje</h2>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 12px", scrollbarWidth: "none" }}>
            {destaques.map((p, i) => (
              <FeatureCard key={p.id} playlist={p} index={i} onOpen={() => open(p)} />
            ))}
          </div>
        </div>

        {/* ── TODAS AS PLAYLISTS ── */}
        <div>
          <div style={{ padding: "14px 20px 10px" }}>
            <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#F1F6EA" }}>Todas as playlists</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "0 16px" }}>
            {PLAYLISTS.map((p, i) => (
              <PlaylistRow key={p.id} playlist={p} index={i} onOpen={() => open(p)} />
            ))}
          </div>
        </div>

        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "rgba(220,235,218,.5)", padding: "0 24px" }}>
          Curadoria KIDZZ · Atualizada direto pelo Spotify
        </p>
      </div>

      <AnimatePresence>
        {active && <PlayerSheet playlist={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default MomentsPlaylists;
