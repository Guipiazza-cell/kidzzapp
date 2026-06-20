import { Users, Share2 } from "lucide-react";
import { useDesafioSemana } from "@/hooks/useDesafioSemana";

export const DesafioCard = ({ childName = "" }: { childName?: string }) => {
  const { desafio, loading } = useDesafioSemana();
  if (loading || !desafio) return null;

  const share = async () => {
    const text = `Essa semana a família tá no desafio Kidzz: ${desafio.titulo}. ${desafio.descricao} ${desafio.hashtag}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: desafio.titulo, text, url: "https://kidzz.app" }); return; } catch {}
    }
    try { await navigator.clipboard?.writeText(text); } catch {}
  };

  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #E8F4D9 0%, #C8E0A5 100%)",
        border: "1.5px solid rgba(255,255,255,.85)",
        boxShadow: "0 20px 40px -16px rgba(40,80,30,.28)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute", top: -30, right: -20,
          fontSize: 140, opacity: 0.18, pointerEvents: "none",
        }}
      >
        {desafio.emoji}
      </div>

      <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#2F5E1F" }}>
        <Users size={13} /> Desafio da semana
      </div>
      <h3
        className="font-bora-display mt-1"
        style={{ fontSize: 19, color: "#2F5E1F", letterSpacing: "-0.01em", lineHeight: 1.15 }}
      >
        {desafio.emoji} {desafio.titulo}
      </h3>
      <p
        className="font-bora-body mt-1.5"
        style={{ fontSize: 13, color: "#3a2f23", lineHeight: 1.45 }}
      >
        {desafio.descricao}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 font-bold"
          style={{ background: "rgba(47,94,31,.12)", color: "#2F5E1F", fontSize: 11 }}
        >
          {desafio.hashtag}
        </span>
        <button
          type="button"
          onClick={share}
          className="ml-auto rounded-full px-4 py-2 font-bold text-white flex items-center gap-1.5 active:scale-95"
          style={{
            background: "#2F5E1F",
            boxShadow: "0 8px 18px -4px rgba(47,94,31,.55)",
            fontSize: 12.5,
          }}
        >
          <Share2 size={13} />
          Convidar amigos
        </button>
      </div>
    </div>
  );
};
