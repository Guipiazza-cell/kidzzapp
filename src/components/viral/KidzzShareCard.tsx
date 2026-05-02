import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";

export type AchievementCategory = "reading" | "music" | "routine" | "questions" | "streak" | "story" | "default";

interface Props {
  childName: string;
  title: string;
  subtitle?: string;
  emoji: string;
  category: AchievementCategory;
  streakDays?: number;
  shareUrl: string;
}

const GRADIENTS: Record<AchievementCategory, string> = {
  reading:   "linear-gradient(160deg, #0b2545 0%, #13315c 45%, #1e6091 100%)",
  music:     "linear-gradient(160deg, #3a1a05 0%, #7a3410 45%, #d97706 100%)",
  routine:   "linear-gradient(160deg, #052e1a 0%, #0e6b3c 50%, #16a34a 100%)",
  questions: "linear-gradient(160deg, #1a0b2e 0%, #4a2070 50%, #8b5cf6 100%)",
  streak:    "linear-gradient(160deg, #3a0b05 0%, #9a3412 45%, #f59e0b 100%)",
  story:     "linear-gradient(160deg, #1a0b2e 0%, #2d1b4e 45%, #6b2d8c 100%)",
  default:   "linear-gradient(160deg, #0f1729 0%, #1e2a4a 45%, #2d1b4e 100%)",
};

/**
 * Vertical 9:16 card (540x960 — captured at 2x = 1080x1920 by html2canvas).
 * Used for Instagram Stories + WhatsApp.
 */
const KidzzShareCard = forwardRef<HTMLDivElement, Props>(
  ({ childName, title, subtitle, emoji, category, streakDays, shareUrl }, ref) => {
    const [qr, setQr] = useState<string>("");

    useEffect(() => {
      QRCode.toDataURL(shareUrl, {
        margin: 1,
        width: 120,
        color: { dark: "#1a0b2e", light: "#ffffffff" },
      })
        .then(setQr)
        .catch(() => setQr(""));
    }, [shareUrl]);

    const message =
      subtitle ||
      (typeof streakDays === "number" && streakDays > 0
        ? `${streakDays} dias de aprendizado com o Kidzz!`
        : `${childName} acabou de conquistar algo incrível! 🌟`);

    return (
      <div
        ref={ref}
        style={{
          width: "540px",
          height: "960px",
          background: GRADIENTS[category] || GRADIENTS.default,
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: "44px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,220,140,0.22) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Grain dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        {/* TOP — brand */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "1px",
                color: "#ffffff",
              }}
            >
              KIDZZ
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.7)",
                marginTop: "2px",
              }}
            >
              CURIOSIDADE QUE CONECTA
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              letterSpacing: "1.5px",
            }}
          >
            ✨ NOVA CONQUISTA
          </span>
        </div>

        {/* CENTER — emoji + title */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "180px",
              lineHeight: 1,
              filter:
                "drop-shadow(0 0 36px rgba(255,200,80,0.55)) drop-shadow(0 12px 30px rgba(0,0,0,0.45))",
            }}
          >
            {emoji}
          </div>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              maxWidth: "440px",
              textShadow: "0 3px 10px rgba(0,0,0,0.45)",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
              color: "rgba(255,255,255,0.92)",
              maxWidth: "420px",
              lineHeight: 1.35,
            }}
          >
            <strong>{childName}</strong> {message}
          </p>
          {typeof streakDays === "number" && streakDays >= 3 && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "16px",
                fontWeight: 800,
                padding: "8px 18px",
                borderRadius: "999px",
                background: "rgba(249,115,22,0.25)",
                color: "#fed7aa",
                border: "1px solid rgba(249,115,22,0.5)",
              }}
            >
              🔥 {streakDays} dias seguidos
            </div>
          )}
        </div>

        {/* BOTTOM — QR + URL + watermark */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#fff" }}>
              kidzz.app
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Feito com Kidzz 🦎
            </span>
          </div>
          {qr && (
            <div
              style={{
                background: "#fff",
                padding: "8px",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={qr}
                alt=""
                style={{ width: "90px", height: "90px", display: "block" }}
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

KidzzShareCard.displayName = "KidzzShareCard";
export default KidzzShareCard;
