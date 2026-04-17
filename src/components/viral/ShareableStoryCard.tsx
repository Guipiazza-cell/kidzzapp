import { forwardRef } from "react";

interface Props {
  childName: string;
  title: string;
  emoji?: string;
}

/**
 * 4:5 visual card (400x500) used for capture via html2canvas.
 * Uses inline styles to ensure correct rendering off-screen.
 */
const ShareableStoryCard = forwardRef<HTMLDivElement, Props>(
  ({ childName, title, emoji = "📖" }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "400px",
          height: "500px",
          background:
            "linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 35%, #4a2070 70%, #6b2d8c 100%)",
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          borderRadius: "0",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,200,100,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(180,130,255,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
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
              fontSize: "11px",
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
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            HISTÓRIA EXCLUSIVA
          </span>
        </div>

        {/* Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "14px",
            position: "relative",
            zIndex: 2,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "84px",
              lineHeight: 1,
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
            }}
          >
            {emoji}
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 900,
              lineHeight: 1.2,
              margin: 0,
              padding: "0 8px",
              color: "#fff",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: 0,
              color: "rgba(255,255,255,0.85)",
              maxWidth: "300px",
              lineHeight: 1.4,
            }}
          >
            Uma história especial para {childName} 💛
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
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Crie histórias mágicas com seu filho
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

ShareableStoryCard.displayName = "ShareableStoryCard";
export default ShareableStoryCard;
