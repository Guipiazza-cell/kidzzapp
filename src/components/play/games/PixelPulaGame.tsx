import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { addXP } from "@/lib/habitLoop";

interface Obstacle {
  id: number;
  x: number;
  emoji: string;
  width: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
}

const OBSTACLE_EMOJIS = ["🍄", "🪨", "🌵", "🪵", "🌿"];
const GROUND_Y = 60; // px from bottom
const PIXEL_X = 60;  // fixed left position
const PIXEL_SIZE = 56;
const GRAVITY = 1.2;
const JUMP_VELOCITY = -16;
const TICK_MS = 30;

const PixelPulaGame = ({ onScore, onReaction }: Props) => {
  const [phase, setPhase] = useState<"intro" | "playing" | "gameover">("intro");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Physics state in refs (avoid re-renders every tick)
  const yRef = useRef(0);              // offset above ground (positive up)
  const vyRef = useRef(0);
  const groundedRef = useRef(true);
  const speedRef = useRef(6);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const tickRef = useRef(0);
  const idRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);

  // Visual state — updated each tick by setState
  const [pixelY, setPixelY] = useState(0);
  const [pixelRot, setPixelRot] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem("kidzz_pixel_pula_high") || "0", 10);
    setHighScore(Number.isFinite(stored) ? stored : 0);
  }, []);

  const jump = useCallback(() => {
    if (phase !== "playing") return;
    if (groundedRef.current) {
      vyRef.current = JUMP_VELOCITY;
      groundedRef.current = false;
      setShowHint(false);
    }
  }, [phase]);

  const startGame = () => {
    yRef.current = 0;
    vyRef.current = 0;
    groundedRef.current = true;
    speedRef.current = 6;
    obstaclesRef.current = [];
    starsRef.current = [];
    tickRef.current = 0;
    rotationRef.current = 0;
    setObstacles([]);
    setStars([]);
    setPixelY(0);
    setPixelRot(0);
    setScore(0);
    setIsNewRecord(false);
    setShowHint(true);
    setPhase("playing");
    setTimeout(() => setShowHint(false), 3500);
  };

  const endGame = useCallback(
    (finalScore: number) => {
      setPhase("gameover");
      const newRecord = finalScore > highScore;
      if (newRecord) {
        setHighScore(finalScore);
        localStorage.setItem("kidzz_pixel_pula_high", String(finalScore));
        setIsNewRecord(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: ["#A78BFA", "#FBBF24", "#34D399", "#fff"],
        });
        onReaction("happy");
      } else {
        onReaction("encourage");
      }
      // Convert score to XP
      const xpEarned = Math.floor(finalScore / 10);
      if (xpEarned > 0) addXP(xpEarned);
      onScore(Math.min(finalScore, 30));

      // Milestone confetti
      if (finalScore >= 300) {
        localStorage.setItem("kidzz_pixel_pula_milestone_300", "1");
      } else if (finalScore >= 150) {
        localStorage.setItem("kidzz_pixel_pula_milestone_150", "1");
      } else if (finalScore >= 50) {
        localStorage.setItem("kidzz_pixel_pula_milestone_50", "1");
      }
    },
    [highScore, onScore, onReaction]
  );

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return;
    const arenaWidth = arenaRef.current?.clientWidth || 360;

    const interval = setInterval(() => {
      tickRef.current += 1;

      // Physics
      vyRef.current += GRAVITY;
      yRef.current -= vyRef.current; // y is "height above ground" (positive up)
      if (yRef.current <= 0) {
        yRef.current = 0;
        vyRef.current = 0;
        groundedRef.current = true;
        rotationRef.current = 0;
      } else {
        rotationRef.current = Math.min(25, rotationRef.current + 1.5);
      }
      setPixelY(yRef.current);
      setPixelRot(rotationRef.current);

      // Move obstacles
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - speedRef.current }))
        .filter((o) => o.x > -80);

      // Move stars
      starsRef.current = starsRef.current
        .map((s) => ({ ...s, x: s.x - speedRef.current }))
        .filter((s) => s.x > -50);

      // Spawn obstacle
      const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
      const minGap = 220 + Math.random() * 180;
      if (!lastObs || arenaWidth - lastObs.x > minGap) {
        if (Math.random() < 0.04 + Math.min(0.06, tickRef.current / 8000)) {
          obstaclesRef.current.push({
            id: idRef.current++,
            x: arenaWidth + 20,
            emoji: OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)],
            width: 44,
          });
        }
      }

      // Spawn stars (rarer, in the air)
      if (Math.random() < 0.012) {
        starsRef.current.push({
          id: idRef.current++,
          x: arenaWidth + 20,
          y: 60 + Math.random() * 110, // height above ground
          collected: false,
        });
      }

      // Collision detection
      const pixelLeft = PIXEL_X + 8;
      const pixelRight = PIXEL_X + PIXEL_SIZE - 8;
      const pixelBottom = yRef.current; // height above ground
      const pixelTop = yRef.current + PIXEL_SIZE - 12;

      let hit = false;
      for (const o of obstaclesRef.current) {
        const oLeft = o.x + 6;
        const oRight = o.x + o.width - 6;
        const oTop = 38; // obstacles are ~44px tall, sitting on ground
        if (pixelRight > oLeft && pixelLeft < oRight && pixelBottom < oTop) {
          hit = true;
          break;
        }
      }

      // Star collection
      let starGain = 0;
      starsRef.current.forEach((s) => {
        if (s.collected) return;
        const sLeft = s.x;
        const sRight = s.x + 28;
        const sBottom = s.y;
        const sTop = s.y + 28;
        if (
          pixelRight > sLeft &&
          pixelLeft < sRight &&
          pixelTop > sBottom &&
          pixelBottom < sTop
        ) {
          s.collected = true;
          starGain += 5;
        }
      });
      if (starGain > 0) {
        confetti({
          particleCount: 12,
          spread: 30,
          origin: { y: 0.5 },
          colors: ["#FBBF24", "#fff"],
          scalar: 0.7,
        });
      }

      // Score & difficulty
      setScore((s) => {
        const next = s + 1 + starGain;
        // ramp speed every ~150 score
        const targetSpeed = 6 + Math.floor(next / 150) * 1.2;
        speedRef.current = Math.min(14, targetSpeed);
        return next;
      });

      setObstacles([...obstaclesRef.current]);
      setStars([...starsRef.current.filter((s) => !s.collected)]);
      setParallax((p) => (p - speedRef.current * 0.3) % 200);

      if (hit) {
        clearInterval(interval);
        setScore((s) => {
          endGame(s);
          return s;
        });
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase, endGame]);

  // Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (phase === "playing") jump();
        else if (phase === "intro") startGame();
        else if (phase === "gameover") startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, jump]);

  const handleArenaTap = () => {
    if (phase === "playing") jump();
  };

  return (
    <div className="w-full">
      {/* HUD */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-white/50 font-semibold">RECORDE</span>
          <div className="text-sm font-black text-yellow-300">🏆 {highScore}</div>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-white/50 font-semibold">SCORE</span>
          <div className="text-sm font-black text-white">{score}</div>
        </div>
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        onClick={handleArenaTap}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 select-none cursor-pointer"
        style={{
          height: 320,
          background:
            "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #4c1d95 75%, #5b21b6 100%)",
          touchAction: "manipulation",
        }}
      >
        {/* Moon */}
        <div className="absolute top-4 right-6 text-3xl opacity-90 drop-shadow-[0_0_12px_rgba(253,224,71,0.5)]">
          🌙
        </div>

        {/* Stars background */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`bg-star-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-70"
            style={{
              top: `${(i * 17) % 60}%`,
              left: `${(i * 31) % 100}%`,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        {/* Trees parallax (back layer) */}
        <div
          className="absolute bottom-[60px] left-0 right-0 h-20 pointer-events-none"
          style={{ transform: `translateX(${parallax * 0.5}px)` }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={`tree-${i}`}
              className="absolute bottom-0 text-2xl opacity-30"
              style={{ left: `${i * 120 + (parallax % 120)}px` }}
            >
              🌲
            </div>
          ))}
        </div>

        {/* Trees parallax (front layer) */}
        <div
          className="absolute bottom-[60px] left-0 right-0 h-24 pointer-events-none"
          style={{ transform: `translateX(${parallax}px)` }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={`tree2-${i}`}
              className="absolute bottom-0 text-3xl opacity-50"
              style={{ left: `${i * 180 + ((parallax * 0.6) % 180)}px` }}
            >
              🌳
            </div>
          ))}
        </div>

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: GROUND_Y,
            background:
              "linear-gradient(180deg, #4c1d95 0%, #2e1065 60%, #1e1b4b 100%)",
            borderTop: "2px solid rgba(167,139,250,0.4)",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {/* Ground texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 30px, rgba(255,255,255,0.08) 30px 32px)",
              transform: `translateX(${parallax * 1.2}px)`,
            }}
          />
        </div>

        {/* Pixel character */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: PIXEL_X,
            bottom: GROUND_Y + pixelY,
            width: PIXEL_SIZE,
            height: PIXEL_SIZE,
            transform: `rotate(${pixelRot}deg)`,
            transition: "transform 50ms linear",
            fontSize: 44,
            filter: "drop-shadow(0 4px 8px rgba(167,139,250,0.6))",
          }}
        >
          🦎
        </div>

        {/* Obstacles */}
        {obstacles.map((o) => (
          <div
            key={o.id}
            className="absolute flex items-end justify-center"
            style={{
              left: o.x,
              bottom: GROUND_Y,
              width: o.width,
              height: 44,
              fontSize: 36,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          >
            {o.emoji}
          </div>
        ))}

        {/* Stars to collect */}
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute flex items-center justify-center"
            style={{
              left: s.x,
              bottom: GROUND_Y + s.y,
              width: 28,
              height: 28,
              fontSize: 24,
              animation: "spinPulse 1.5s ease-in-out infinite",
              filter: "drop-shadow(0 0 8px rgba(253,224,71,0.8))",
            }}
          >
            ⭐
          </div>
        ))}

        {/* Hint */}
        <AnimatePresence>
          {phase === "playing" && showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full pointer-events-none"
            >
              <p className="text-white/90 text-xs font-bold">Toque para pular 👆</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro overlay */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-3 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)]"
              >
                🦎
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-1">Pixel Pula!</h2>
              <p className="text-xs text-white/60 text-center px-6 mb-4 max-w-[260px]">
                Toque para pular os obstáculos e coletar estrelas ⭐
              </p>
              <motion.button
                onClick={startGame}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
                  boxShadow: "0 6px 20px rgba(167,139,250,0.5)",
                }}
              >
                🚀 Começar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over overlay */}
        <AnimatePresence>
          {phase === "gameover" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220 }}
                className="text-5xl mb-2"
              >
                💥
              </motion.div>
              <h2 className="text-xl font-black text-white mb-1">Fim de jogo!</h2>
              <p className="text-3xl font-black text-yellow-300 mb-1">{score}</p>
              {isNewRecord && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-bold text-emerald-300 mb-3"
                >
                  🏆 NOVO RECORDE!
                </motion.p>
              )}
              {!isNewRecord && (
                <p className="text-[10px] text-white/50 mb-3">Recorde: {highScore}</p>
              )}
              <motion.button
                onClick={startGame}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
                  boxShadow: "0 6px 20px rgba(167,139,250,0.5)",
                }}
              >
                🔄 Jogar de novo
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-[10px] text-white/40 mt-2">
        XP ganho: {Math.floor(score / 10)} ✨ • Estrelas valem +5 pontos
      </p>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        @keyframes spinPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default PixelPulaGame;
