import { forwardRef } from "react";

interface Props {
  childName: string;
  monthName: string;
  year: number;
  questions: number;
  stories: number;
  maxStreak: number;
}

/**
 * 4:5 retrospective card (400x500).
 */
const ShareableRetroCard = forwardRef<HTMLDivElement, Props>(
  ({ childName, monthName, year, questions, stories, maxStreak }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "400px",
          height: "500px",
          background:
            "linear-gradient(160deg, #0d1f1a 0%, #1a3a2e 35%, #2d5a47 70%, #3d6b54 100%)",
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: "30px 26px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Forest glow accents */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(180,230,150,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,210,120,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            ✨ KIDZZ
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "1px",
            }}
          >
            RETROSPECTIVA
          </span>
        </div>

        {/* Center */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              margin: "0 0 4px 0",
              textTransform: "capitalize",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {monthName} {year}
          </h1>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              margin: "0 0 22px 0",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            com {childName} 💛
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            <Stat emoji="💬" value={questions} label="Perguntas" />
            <Stat emoji="📖" value={stories} label="Histórias" />
            <Stat emoji="🔥" value={maxStreak} label="Maior streak" />
          </div>

          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              margin: "22px 0 0 0",
              color: "rgba(255,255,255,0.9)",
              fontStyle: "italic",
              padding: "0 12px",
              lineHeight: 1.4,
            }}
          >
            "Nosso mês de descobertas em família" 🌿
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
            paddingTop: "10px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Cada pergunta vira memória 💛
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            kidzzapp.lovable.app
          </span>
        </div>
      </div>
    );
  }
);

const Stat = ({ emoji, value, label }: { emoji: string; value: number; label: string }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "16px",
      padding: "12px 6px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "20px", marginBottom: "2px" }}>{emoji}</div>
    <div style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1 }}>{value}</div>
    <div
      style={{
        fontSize: "8px",
        fontWeight: 800,
        marginTop: "4px",
        color: "rgba(255,255,255,0.6)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </div>
  </div>
);

ShareableRetroCard.displayName = "ShareableRetroCard";
export default ShareableRetroCard;
