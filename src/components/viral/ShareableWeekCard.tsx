import { forwardRef } from "react";

interface Props {
  childName: string;
  weekLabel: string;
  questions: number;
  stories: number;
  streak: number;
  minutes: number;
  topThemes: string[];
}

/**
 * 4:5 weekly summary card (400x500) — golden theme for "Conquistas da Semana".
 */
const ShareableWeekCard = forwardRef<HTMLDivElement, Props>(
  ({ childName, weekLabel, questions, stories, streak, minutes, topThemes }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "400px",
          height: "500px",
          background:
            "linear-gradient(155deg, #F4C430 0%, #E8A317 45%, #B8860B 100%)",
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
        {/* Glows */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-60px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-80px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,220,140,0.4) 0%, transparent 70%)",
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
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            ✨ KIDZZ
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 900,
              padding: "5px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.25)",
              color: "#fff",
              letterSpacing: "1px",
            }}
          >
            SEMANA
          </span>
        </div>

        {/* Center */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ fontSize: "56px", lineHeight: 1, marginBottom: "8px" }}>🦎</div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 900,
              margin: "0 0 4px 0",
              textShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            Semana de {childName}
          </h1>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              margin: "0 0 18px 0",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {weekLabel}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <Stat emoji="🔥" value={`${streak}d`} label="Streak" />
            <Stat emoji="❓" value={questions} label="Perguntas" />
            <Stat emoji="📚" value={stories} label="Histórias" />
            <Stat emoji="⏱️" value={`${minutes}min`} label="Aprendizado" />
          </div>

          {topThemes.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                justifyContent: "center",
              }}
            >
              {topThemes.slice(0, 3).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.25)",
                    color: "#fff",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
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
            borderTop: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>
            Cada pergunta vira memória 💛
          </span>
          <span style={{ fontSize: "10px", fontWeight: 900, color: "#fff" }}>
            kidzz.app
          </span>
        </div>
      </div>
    );
  }
);

const Stat = ({ emoji, value, label }: { emoji: string; value: number | string; label: string }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.22)",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: "16px",
      padding: "12px 8px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "22px", marginBottom: "2px" }}>{emoji}</div>
    <div style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1, color: "#fff" }}>{value}</div>
    <div
      style={{
        fontSize: "9px",
        fontWeight: 800,
        marginTop: "4px",
        color: "rgba(255,255,255,0.85)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </div>
  </div>
);

ShareableWeekCard.displayName = "ShareableWeekCard";
export default ShareableWeekCard;
