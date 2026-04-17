import { forwardRef } from "react";

interface Props {
  childName: string;
  achievementTitle: string;
  achievementEmoji: string;
  streakDays?: number;
  customMessage?: string;
}

/**
 * 1:1 square card (400x400) for achievements.
 */
const ShareableAchievementCard = forwardRef<HTMLDivElement, Props>(
  (
    { childName, achievementTitle, achievementEmoji, streakDays, customMessage },
    ref
  ) => {
    const message = customMessage || `${childName} está arrasando! 🌟`;

    return (
      <div
        ref={ref}
        style={{
          width: "400px",
          height: "400px",
          background:
            "linear-gradient(140deg, #0f1729 0%, #1e2a4a 40%, #2d1b4e 100%)",
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: "26px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,200,80,0.22) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Top */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
              background: "linear-gradient(90deg, #fbbf24, #f97316)",
              color: "#1a0b2e",
              letterSpacing: "1px",
            }}
          >
            NOVA CONQUISTA
          </span>
        </div>

        {/* Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "12px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: "92px",
              lineHeight: 1,
              filter:
                "drop-shadow(0 0 28px rgba(255,200,80,0.55)) drop-shadow(0 6px 16px rgba(0,0,0,0.4))",
            }}
          >
            {achievementEmoji}
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 900,
              lineHeight: 1.15,
              margin: 0,
              color: "#fff",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {achievementTitle}
          </h1>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              margin: 0,
              color: "rgba(255,255,255,0.85)",
              maxWidth: "320px",
            }}
          >
            {message}
          </p>
          {typeof streakDays === "number" && streakDays > 0 && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: 800,
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(249,115,22,0.2)",
                color: "#fdba74",
                border: "1px solid rgba(249,115,22,0.4)",
              }}
            >
              🔥 {streakDays} dias seguidos
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
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Curiosidade que conecta família 💛
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            kidzzapp.lovable.app
          </span>
        </div>
      </div>
    );
  }
);

ShareableAchievementCard.displayName = "ShareableAchievementCard";
export default ShareableAchievementCard;
