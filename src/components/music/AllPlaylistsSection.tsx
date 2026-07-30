/**
 * Lista "Todas as playlists" (extraída de Momentos) + player Spotify.
 * Embutida no final da aba Música.
 */
import { useCallback, useState } from "react";
import { Clock, ExternalLink, Play, X } from "lucide-react";
import {
  PLAYLISTS,
  getSpotifyEmbedUrl,
  getSpotifyOpenUrl,
  type KidzzPlaylist,
  type PlaylistMood,
} from "@/lib/playlistsConfig";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import {
  FONT,
  SERIF,
  PAD,
  glassLightSoft as glassSoft,
  pillGlassLight as pillGlass,
  goldBtn,
  sectionWrap,
} from "@/lib/premiumUi";

const AS = "/exemplos/assets/momentos-v2";
const AV = "v3";
const asset = (n: string) => `${AS}/${n}?${AV}`;

const COVER_BY_MOOD: Partial<Record<PlaylistMood, string>> = {
  morning: asset("cover-morning.png"),
  sunday: asset("cover-afternoon.png"),
  sleep: asset("cover-night.png"),
  travel: asset("cover-travel.png"),
  bonding: asset("cover-bond.png"),
  calm: asset("cover-calm.png"),
};

const INK = "#1A2A18";
const INK2 = "#5A6B55";
const GOLD = "#C9A227";

const KEYFRAMES = `
@keyframes allpl-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes allpl-cascade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
`;

const coverOf = (p: KidzzPlaylist, i: number) =>
  COVER_BY_MOOD[p.mood] ?? `/exemplos/assets/v3-moment-${(i % 4) + 1}.png`;

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
        animation: "allpl-rise .35s cubic-bezier(.22,1,.36,1) both",
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

/** Bloco "Todas as playlists" — mesmo layout da aba Momentos. */
export const AllPlaylistsSection = () => {
  const [active, setActive] = useState<KidzzPlaylist | null>(null);

  const open = useCallback((p: KidzzPlaylist) => {
    haptic("light");
    sfx("click");
    setActive(p);
  }, []);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{ ...sectionWrap, marginTop: 8 }}>
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
            Todas as playlists
          </h2>
          <span style={{ fontSize: 11, fontWeight: 800, color: INK2 }}>{PLAYLISTS.length} playlists</span>
        </div>
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
                animation: `allpl-cascade .45s cubic-bezier(.22,1,.36,1) ${0.02 * i}s both`,
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
                <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} /> {p.approxTracks ?? 10} músicas · {p.approxMinutes ?? 30} min
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
        <p
          style={{
            margin: "14px 0 0",
            textAlign: "center",
            fontSize: 11.5,
            fontWeight: 800,
            color: "rgba(60,80,50,.45)",
            padding: `0 ${PAD}px 4px`,
          }}
        >
          Curadoria KIDZZ · Atualizada direto pelo Spotify
        </p>
      </div>
      {active && <PlayerSheet playlist={active} onClose={() => setActive(null)} />}
    </>
  );
};

export default AllPlaylistsSection;
