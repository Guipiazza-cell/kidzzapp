/* ── ShareableMemoryCard ──
   Branded memory share card. Two formats:
   - "square" 1:1 (1080×1080) — Instagram / WhatsApp post
   - "story"  9:16 (1080×1920) — Stories / Reels / Status

   Uses inline styles to render reliably off-screen via html2canvas.
*/

import { forwardRef } from "react";
import cosmicImg from "@/assets/kidzz/cosmic.webp";

interface Props {
  childName: string;
  question: string;
  answer: string;
  format?: "square" | "story";
}

const ShareableMemoryCard = forwardRef<HTMLDivElement, Props>(
  ({ childName, question, answer, format = "square" }, ref) => {
    const isStory = format === "story";
    const W = isStory ? 540 : 540;          // capture width (scale 2x in viralShare)
    const H = isStory ? 960 : 540;          // 9:16 vs 1:1

    // Trim answer for visual balance (we want the question to shine)
    const trimmed =
      answer.length > (isStory ? 280 : 180)
        ? answer.slice(0, isStory ? 280 : 180).trim() + "…"
        : answer;

    return (
      <div
        ref={ref}
        style={{
          width: `${W}px`,
          height: `${H}px`,
          background:
            "linear-gradient(160deg, #0a1228 0%, #1b2348 35%, #2d1b4e 70%, #4a2070 100%)",
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
          padding: isStory ? "60px 44px" : "36px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cosmic glow */}
        <div
          style={{
            position: "absolute",
            top: isStory ? "10%" : "-10%",
            right: "-25%",
            width: "85%",
            height: "60%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(123,182,255,0.28) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-20%",
            width: "75%",
            height: "55%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(197,168,255,0.25) 0%, transparent 65%)",
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
              fontSize: "13px",
              fontWeight: 900,
              letterSpacing: "3px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            ✨ KIDZZ
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.78)",
              letterSpacing: "1.5px",
            }}
          >
            MOMENTO MÁGICO
          </span>
        </div>

        {/* Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: isStory ? "22px" : "14px",
            position: "relative",
            zIndex: 2,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <img
            src={cosmicImg}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: isStory ? "180px" : "120px",
              height: isStory ? "180px" : "120px",
              objectFit: "contain",
              filter:
                "drop-shadow(0 0 32px rgba(123,182,255,0.6)) drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
            }}
          />

          <div
            style={{
              padding: isStory ? "16px 20px" : "12px 16px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              maxWidth: isStory ? "440px" : "440px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "rgba(255,200,80,0.9)",
                letterSpacing: "2px",
                margin: "0 0 6px 0",
              }}
            >
              {childName.toUpperCase()} PERGUNTOU
            </p>
            <h1
              style={{
                fontSize: isStory ? "24px" : "19px",
                fontWeight: 900,
                lineHeight: 1.25,
                margin: 0,
                color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {question}
            </h1>
          </div>

          <p
            style={{
              fontSize: isStory ? "16px" : "13px",
              fontWeight: 600,
              margin: 0,
              color: "rgba(255,255,255,0.85)",
              maxWidth: isStory ? "440px" : "440px",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            “{trimmed}”
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
            paddingTop: "14px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Curiosidade que conecta família 💛
          </span>
          <span
            style={{
              fontSize: "11px",
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

ShareableMemoryCard.displayName = "ShareableMemoryCard";
export default ShareableMemoryCard;
