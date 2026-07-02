import { forwardRef } from "react";

type Props = {
  childName: string;
  titulo: string;
  emoji: string;
  telaMin: number;
  photoDataUrl?: string | null;
  hashtag?: string;
};

/** Cartão quadrado pra Stories/WhatsApp. Foco é a criação, não o rosto. */
export const ShareMomentCard = forwardRef<HTMLDivElement, Props>(function ShareMomentCard(
  { childName, titulo, emoji, telaMin, photoDataUrl, hashtag = "#MovimentoMenosTela" },
  ref,
) {
  const friendly = childName ? `${childName} e família` : "Família Kidzz";
  const phrase = "Hoje a gente brincou de verdade.";
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        position: "relative",
        background: "linear-gradient(165deg, #FFFDF6 0%, #FFE9C2 55%, #F4C58A 100%)",
        fontFamily: "'Nunito', system-ui, sans-serif",
        color: "#3a2f23",
        padding: 60,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top brand bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: 999,
              background: "linear-gradient(155deg, #F4A659, #E8821A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 38, fontWeight: 800,
              boxShadow: "0 10px 22px -4px rgba(232,130,26,.5)",
            }}
          >K</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em" }}>Kidzz</div>
            <div style={{ fontSize: 18, color: "#7a6a52" }}>kidzz.app</div>
          </div>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#2F5E1F", color: "#fff",
            padding: "12px 22px", borderRadius: 999,
            fontWeight: 700, fontSize: 24,
            boxShadow: "0 8px 18px -4px rgba(47,94,31,.45)",
          }}
        >
          🌿 {telaMin} min sem tela
        </div>
      </div>

      {/* Photo or emoji canvas */}
      <div
        style={{
          flex: 1,
          marginTop: 40,
          marginBottom: 40,
          borderRadius: 36,
          overflow: "hidden",
          background: "#fff",
          border: "6px solid rgba(255,255,255,.95)",
          boxShadow: "0 30px 60px -10px rgba(60,40,15,.25), inset 0 0 0 1px rgba(255,255,255,.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        {photoDataUrl ? (
          <img
            src={photoDataUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            crossOrigin="anonymous"
          />
        ) : (
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
              padding: 60,
            }}
          >
            <div style={{ fontSize: 220, lineHeight: 1 }}>{emoji}</div>
            <div style={{ fontSize: 36, color: "#5a4d3d", fontWeight: 700, textAlign: "center" }}>
              {titulo}
            </div>
          </div>
        )}
      </div>

      {/* Bottom block */}
      <div>
        <div style={{ fontSize: 30, fontWeight: 600, color: "#5a4d3d" }}>{friendly}</div>
        <div
          style={{
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: 56, fontWeight: 600, lineHeight: 1.05, color: "#2F5E1F",
            marginTop: 8, letterSpacing: "-0.02em",
          }}
        >
          {phrase}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 24, color: "#7a6a52", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <span>{hashtag}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{titulo}</span>
        </div>
      </div>
    </div>
  );
});
